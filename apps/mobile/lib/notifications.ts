import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { apiFetch } from "@/lib/api-client";

const LAST_REGISTERED_TOKEN_KEY = "lastRegisteredPushToken";

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function registerForPushNotificationsAsync(): Promise<void> {
  try {
    await ensureAndroidChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    const finalStatus =
      existingStatus === "granted"
        ? existingStatus
        : (await Notifications.requestPermissionsAsync()).status;
    if (finalStatus !== "granted") {
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.error("[registerForPushNotificationsAsync] no EAS project id configured");
      return;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    const lastRegisteredToken = await SecureStore.getItemAsync(LAST_REGISTERED_TOKEN_KEY);
    if (pushToken === lastRegisteredToken) {
      return;
    }

    const result = await apiFetch("/notifications/push-token", {
      method: "POST",
      body: JSON.stringify({ pushToken }),
    });
    if (result.success) {
      await SecureStore.setItemAsync(LAST_REGISTERED_TOKEN_KEY, pushToken);
    }
  } catch (error) {
    console.error("[registerForPushNotificationsAsync]", error);
  }
}
