# API Contract

This is the single source of truth for every endpoint the Nest.js API exposes. Web and mobile are built independently against this file — if a shape changes, update this file first, then update the API, then update both clients.

Base URL (dev): `http://localhost:3001`
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
{ "success": true, "data": { "accessToken": "string", "user": { "id": "uuid", "name": "string", "email": "string", "baseCurrency": "RWF" } } }
```
`name` is required — validated as non-empty, max 100 characters. Refresh token set as httpOnly cookie. Not authenticated.

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
    "categoryBreakdown": [
      { "category": "entertainment", "amount": 45.00, "percentage": 31.5 }
    ],
    "upcomingRenewals": [
      { "id": "uuid", "name": "Netflix", "amount": 15.99, "currency": "USD", "nextRenewalDate": "2026-07-25" }
    ]
  }
}
```
Amounts in `totalMonthlySpend`, `totalYearlySpend`, and `categoryBreakdown` are converted to `baseCurrency`. `upcomingRenewals` amounts stay in original currency.

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
{ "name": "string (optional)", "baseCurrency": "string (ISO 4217, optional)" }
```
Response: updated user object.
Note: `monthlySpendLimit` field exists on the user but has no v1 endpoint to set it — UI shows it as disabled/"Coming in v2".

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