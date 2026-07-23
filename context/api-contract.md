# API Contract

This is the single source of truth for every endpoint the Nest.js API exposes. Web and mobile are built independently against this file — if a shape changes, update this file first, then update the API, then update both clients.

Base URL (dev): `http://localhost:8000`
All authenticated routes require `Authorization: Bearer {accessToken}` unless noted.
All responses follow the shape defined in `code-standards.md` — `{ success: boolean, data?: T, error?: string }`.

---

## Auth

### `POST /auth/register`

Request:
```json
{ "name": "string", "email": "string", "password": "string" }
```
Response:
```json
{ "success": true, "data": { "accessToken": "string", "refreshToken": "string", "user": { "id": "uuid", "name": "string", "email": "string", "baseCurrency": "RWF" } } }
```
`name` is required — validated as non-empty, max 100 characters. Refresh token set as httpOnly cookie AND returned in the body — web ignores the body copy (relies on the cookie, never persists it in JS-reachable storage per `code-standards.md`), mobile has no cookies so the body copy is its only delivery mechanism and gets stored in `expo-secure-store`. Not authenticated.

### `POST /auth/login`

Request:
```json
{ "email": "string", "password": "string" }
```
Response: same shape as register.
Not authenticated.

### `POST /auth/refresh`

No body — reads refresh token from httpOnly cookie (web) or request body (mobile, since no cookies).
Mobile request body:
```json
{ "refreshToken": "string" }
```
Response:
```json
{ "success": true, "data": { "accessToken": "string" } }
```

### `POST /auth/logout`

Clears refresh token cookie (web) / invalidates token (mobile). Authenticated.
Response: `{ "success": true }`

---

## Subscriptions

### `GET /subscriptions`

Query params: `status` (`active` | `cancelled` | omit for all), `search` (string, matches name), `page`, `limit`

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Netflix",
        "cost": 15.99,
        "currency": "USD",
        "billingCycle": "monthly",
        "customIntervalDays": null,
        "category": "entertainment",
        "status": "active",
        "startDate": "2026-01-01",
        "nextRenewalDate": "2026-08-01"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

### `GET /subscriptions/:id`

Response: single subscription object as above, plus:
```json
{ "paymentHistory": [{ "id": "uuid", "amount": 15.99, "currency": "USD", "paidAt": "2026-07-01" }] }
```

### `POST /subscriptions`

Request:
```json
{
  "name": "string",
  "cost": "number",
  "currency": "string (ISO 4217)",
  "billingCycle": "weekly | monthly | yearly | custom",
  "customIntervalDays": "number | null — required if billingCycle is custom",
  "category": "entertainment | software | fitness | utilities | other",
  "startDate": "YYYY-MM-DD"
}
```
`nextRenewalDate` calculated server-side — never accepted from the client.
Response: created subscription object.

### `PATCH /subscriptions/:id`

Request: any subset of the create fields.
If `billingCycle` or `startDate` changes, `nextRenewalDate` is recalculated server-side.
Response: updated subscription object.

### `PATCH /subscriptions/:id/cancel`

No body. Sets `status` to `cancelled`. Cancelled subscriptions are excluded from the renewal job and dashboard totals but remain visible in the list with a `cancelled` filter.
Response: updated subscription object.

### `DELETE /subscriptions/:id`

Hard delete. Only allowed if the subscription has no `payment_history` rows — otherwise returns an error asking the user to cancel instead. This preserves historical spend data integrity.
Response: `{ "success": true }`

---

## Dashboard

### `GET /dashboard/summary`

Response:
```json
{
  "success": true,
  "data": {
    "totalMonthlySpend": 142.50,
    "totalYearlySpend": 1710.00,
    "baseCurrency": "RWF",
    "activeSubscriptionsCount": 5,
    "categoryBreakdown": [
      { "category": "entertainment", "amount": 45.00, "percentage": 31.5 }
    ],
    "upcomingRenewals": [
      { "id": "uuid", "name": "Netflix", "amount": 15.99, "currency": "USD", "nextRenewalDate": "2026-07-25" }
    ],
    "spendLimit": 200.00,
    "currentMonthSpend": 156.20,
    "percentageUsed": 78.1,
    "isOverLimit": false
  }
}
```
Amounts in `totalMonthlySpend`, `totalYearlySpend`, and `categoryBreakdown` are converted to `baseCurrency`. `upcomingRenewals` amounts stay in original currency. `activeSubscriptionsCount` is the count of `status = 'active'` subscriptions (drives the "Active Subscriptions" stat card in `ui-rules.md`) — `upcomingRenewals.length` covers the "Upcoming Renewals" stat card, so no separate count field is needed for that one.

`spendLimit` mirrors `users.monthly_spend_limit` (`null` if the user hasn't set one — denominated in `baseCurrency`, same as the limit itself). `currentMonthSpend` is the sum of `payment_history` rows with `paid_at` in the current calendar month, converted to `baseCurrency` — this is actual money paid so far this month, distinct from `totalMonthlySpend`'s forward-looking projection off active subscriptions' billing cycles. `percentageUsed` is `round(currentMonthSpend / spendLimit * 100, 1)`, `null` when `spendLimit` is `null`. `isOverLimit` is `currentMonthSpend > spendLimit`, always `false` when `spendLimit` is `null`.

### `GET /dashboard/spend-trend`

Query params: `months` (default 6)

Response:
```json
{
  "success": true,
  "data": {
    "baseCurrency": "RWF",
    "points": [
      { "month": "2026-02", "amount": 120000 },
      { "month": "2026-03", "amount": 135000 }
    ]
  }
}
```
Built from `payment_history`, converted to base currency at time of query using latest cached rate.

---

## Settings

### `GET /users/me`

Response:
```json
{ "success": true, "data": { "id": "uuid", "name": "string", "email": "string", "baseCurrency": "RWF", "monthlySpendLimit": null } }
```

### `PATCH /users/me`

Request:
```json
{ "name": "string (optional)", "baseCurrency": "string (ISO 4217, optional)", "monthlySpendLimit": "number | null (optional)" }
```
Response: updated user object.
`monthlySpendLimit` accepts a non-negative number to set the limit, or `null` to clear it; omitting the field leaves it unchanged. Denominated in `baseCurrency` — no separate currency field.

---

## Notifications

### `GET /notifications/preferences`

Response:
```json
{ "success": true, "data": { "renewalRemindersEnabled": false, "spendLimitAlertsEnabled": false } }
```
Lazily creates a default preferences row (both flags `false`) on first access — no row is created at registration.

### `PATCH /notifications/preferences`

Request:
```json
{ "renewalRemindersEnabled": "boolean (optional)", "spendLimitAlertsEnabled": "boolean (optional)" }
```
Response: updated preferences object, same shape as `GET`.

### `POST /notifications/push-token`

Request:
```json
{ "pushToken": "string" }
```
Stores the Expo push token for the current user, overwriting any previously stored token. Response: `{ "success": true }`.

---

## Error Responses

All errors follow:
```json
{ "success": false, "error": "Human readable message" }
```

| Status | Meaning                                  |
| ------ | ------------------------------------------ |
| 400    | Validation failed — DTO shape invalid      |
| 401    | Missing or invalid access token            |
| 403    | Valid token, action not permitted          |
| 404    | Resource not found or not owned by user    |
| 500    | Unexpected server error — generic message only, never expose internals |

---

## Client Type Mirror

Both `apps/web/types/index.ts` and `apps/mobile/lib/types.ts` must mirror these shapes exactly. When this contract changes, update both files in the same session — never let one client drift from this document.