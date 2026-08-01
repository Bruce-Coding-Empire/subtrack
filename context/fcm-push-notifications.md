# Setting up push notifications with Expo + FCM v1

How SubTrack wired up Android/iOS push notifications. Reuse this checklist for
any Expo (React Native) app + a separate API backend.

## Architecture

We do **not** talk to Firebase directly from the client or server. We use
Expo's push service as the middleman:

```
Mobile app --getExpoPushTokenAsync()--> Expo push token
Mobile app --POST /notifications/push-token--> API stores token
API cron job --expo-server-sdk--> Expo push service --FCM v1--> Android device
                                                     --APNs----> iOS device
```

- The app only ever calls `expo-notifications`. It never touches the Firebase
  SDK or an FCM server key directly.
- The API only ever calls `expo-server-sdk`. It never needs `firebase-admin`
  or any Firebase credential.
- Firebase is still required for **Android only**, because Expo's push
  service relays Android messages through FCM under the hood. Without a
  Firebase Android app registered, token retrieval fails on-device with:
  ```
  E_REGISTRATION_FAILED: Default FirebaseApp is not initialized
  ```
  This is the single most common gotcha — the failure looks like a bug in
  your code but it's actually just missing Firebase config.

## Packages

Mobile:
- `expo-notifications`
- `expo-dev-client` (needed to test real push — see below)
- `expo-constants`, `expo-secure-store` (to read the EAS project id and dedupe tokens client-side)

API:
- `expo-server-sdk`

## Step 1 — Client: request permission and register the token

Write a helper that runs once the user is authenticated:

```ts
// lib/notifications.ts
async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function registerForPushNotificationsAsync() {
  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.error('Missing EAS projectId — cannot fetch push token');
    return;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  // Dedupe client-side so we don't spam the API on every app load.
  const last = await SecureStore.getItemAsync('lastRegisteredPushToken');
  if (token === last) return;

  await api.post('/notifications/push-token', { pushToken: token });
  await SecureStore.setItemAsync('lastRegisteredPushToken', token);
}
```

Call it from an effect that fires when auth state becomes `true`.

Also dedupe **server-side** too (no-op the update if the incoming token
equals the stored one) — don't rely on the client to always get this right.

## Step 2 — API: store tokens and preferences

A small module with:
- `notification_preferences` table: `userId`, per-alert-type booleans,
  `pushToken` (nullable).
- `POST /notifications/push-token` — upsert the token (guarded by auth).
- `GET`/`PATCH /notifications/preferences` — toggle alert types.

## Step 3 — API: send notifications with `expo-server-sdk`

```ts
import { Expo } from 'expo-server-sdk';

const expo = new Expo();
const messages = recipients
  .filter((r) => Expo.isExpoPushToken(r.pushToken))
  .map((r) => ({ to: r.pushToken, sound: 'default', title, body, data }));

for (const chunk of expo.chunkPushNotifications(messages)) {
  const tickets = await expo.sendPushNotificationsAsync(chunk);
  tickets.forEach((t) => {
    if (t.status !== 'ok') console.error('push failed', t);
  });
}
```

Wire this into a cron job (`@nestjs/schedule` `@Cron(...)` or equivalent).
If your host sleeps on idle (e.g. Render free tier), don't rely on
in-process cron alone — expose an authenticated HTTP trigger endpoint
(`x-job-key` header checked against a server-only secret) and hit it from
an external scheduler (e.g. a GitHub Actions workflow on a cron schedule).

## Step 4 — Realize Expo Go can't test real push (Android, SDK ≥53)

Expo Go dropped remote push support on Android from SDK 53 onward. You need
a real dev build:

```bash
npx expo install expo-dev-client
eas init          # writes extra.eas.projectId into app.json
```

Add `eas.json` with at least a `development` build profile
(`developmentClient: true, distribution: internal`).

Set `android.package` (e.g. `com.yourorg.yourapp`) in `app.json` **before**
linking Firebase — it must match exactly across `app.json`,
`google-services.json`, and the build.

Update your dev scripts to build/launch the dev client locally instead of
Expo Go:
```json
"android": "expo run:android",
"ios": "expo run:ios"
```

## Step 5 — Firebase: register the Android app (fixes `E_REGISTRATION_FAILED`)

1. In the [Firebase console](https://console.firebase.google.com/), create
   or select a project.
2. Add an Android app using the **exact** `android.package` value from
   `app.json`.
3. Download `google-services.json` and place it at the root of your Expo
   app (e.g. `apps/mobile/google-services.json`).
4. In `app.json`, add:
   ```json
   { "expo": { "android": { "googleServicesFile": "./google-services.json" } } }
   ```
5. **Commit `google-services.json`.** It only contains public client
   identifiers (project id, app id, an Android API key restricted to your
   package/cert by Google) — it's meant to be committed, not a secret.
6. Do **not** hand-edit `android/` Gradle files. That folder is generated by
   `expo prebuild`/EAS build and is gitignored — any manual edit is lost on
   rebuild. `expo-notifications` already bundles `firebase-messaging`
   natively, and Expo's config plugin adds the
   `com.google.gms:google-services` classpath/plugin automatically at
   prebuild time because `googleServicesFile` is set. No extra Firebase SDK
   dependency needed.
7. In Firebase console → Project Settings → Service Accounts, generate a new
   **FCM v1 private key** (a service-account JSON). Upload it to EAS as the
   Android push credential:
   ```bash
   eas credentials
   # Android -> Push Notifications: Google Service Account -> upload the JSON
   ```
   This is the actual secret. **Never commit it.** Add a gitignore rule so
   nothing matching it is accidentally tracked, e.g.:
   ```
   *-firebase-adminsdk-*.json
   google-service-account*.json
   ```
   Your API server never needs this key — only Expo's push service uses it,
   server-side, to call FCM v1 on your behalf.
8. Build a fresh dev/production build. Config-only changes
   (`app.json`/`google-services.json`) do **not** apply to an
   already-installed build — native config only takes effect on a new
   native build.

## iOS notes

iOS needs an APNs key configured via `eas credentials` (Apple push
notification key, uploaded to EAS) instead of Firebase — same idea, Expo
relays through APNs instead of FCM. Not detailed here since SubTrack has
only wired up Android so far.

## Quick troubleshooting reference

| Symptom | Cause |
|---|---|
| `E_REGISTRATION_FAILED: Default FirebaseApp is not initialized` | No `google-services.json` / `googleServicesFile` configured, or app wasn't rebuilt after adding it |
| Token fetch silently returns nothing in Expo Go on Android | Expo Go (SDK ≥53) doesn't support remote push on Android — use a dev client build |
| `projectId` missing error | `eas init` wasn't run, or `extra.eas.projectId` missing from `app.json` |
| Push token valid but message never arrives | Token failed `Expo.isExpoPushToken()` filtering, or FCM v1 service-account key was never uploaded to EAS |
| Works in dev build, not in production build | New native build wasn't triggered after Firebase/eas.json changes |
