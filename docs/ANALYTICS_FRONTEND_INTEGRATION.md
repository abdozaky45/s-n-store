# GA4 Analytics — Frontend / Dashboard Integration Spec

> **For:** Claude Code working in the **frontend dashboard** repo (لوحة التحكم).
> **Goal:** Build the "Analytics / الإحصائيات" section that consumes the backend's
> GA4 endpoints and renders KPIs, charts and tables.
>
> This document is self-contained: you do **not** need to read the backend code.
> Everything you need (auth, URLs, exact response shapes, examples) is here.

---

## 1. Context

The backend (Express + TypeScript, deployed on AWS Elastic Beanstalk) exposes
three **read-only** endpoints that proxy Google Analytics 4 (GA4) Data API for
property `541574599`. They power the admin dashboard's analytics view.

All three endpoints:

- Are **admin-only** → require a valid **ADMIN** access token.
- Accept the same two query params: `startDate` and `endDate`.
- Return a consistent envelope (see §4).

---

## 2. Authentication

Every request must send the admin access token in the `Authorization` header:

```
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

- This is the **same token** the dashboard already uses for other admin calls
  (product/order management, etc.). **Reuse the existing auth/token logic** —
  do not build a new login flow.
- If the token is missing/expired → `401`. If the user is not an admin → `403`.

> The token is obtained via the existing passwordless flow
> (`POST /authentication/register-email` → `POST /authentication/active-account`
> returns `{ data: { accessToken } }`). The dashboard already handles this; just
> attach the stored token to the analytics requests.

---

## 3. Base URL

| Environment | Base URL |
|-------------|----------|
| Local dev   | `http://localhost:4000` |
| Production  | the same API base the dashboard already targets for admin calls (e.g. the value behind your `VITE_API_URL` / `API_BASE_URL` env var) |

> ⚠️ There is **no `/api` prefix**. Routes are mounted at the root, e.g.
> `GET {BASE_URL}/analytics/overview`.
>
> CORS: the API already allows the dashboard origin
> (`https://dashboard.sn-lingerie.com`) with `credentials: true`.

---

## 4. Response envelope (all endpoints)

Every successful response is wrapped in this standard shape:

```json
{
  "statusCode": 200,
  "data": {
    "startDate": "7daysAgo",
    "endDate": "today",
    "rows": [ /* endpoint-specific rows, see below */ ]
  },
  "message": "Success",
  "success": true
}
```

→ **The data you render is always `response.data.rows`.**
`response.data.startDate` / `endDate` echo back the resolved range.

### Error shape

On failure (GA API/network/auth/quota error) the endpoint returns **HTTP 500**:

```json
{
  "success": false,
  "message": "Failed to fetch GA4 overview",
  "error": "<underlying GA error message>"
}
```

Handle this per-widget: show an inline error/retry on the affected card, not a
full-page crash. Also handle `401`/`403` by redirecting to login as the rest of
the dashboard does.

---

## 5. Query parameters (shared by all 3 endpoints)

| Param | Required | Default | Format |
|-------|----------|---------|--------|
| `startDate` | no | `7daysAgo` | ISO `YYYY-MM-DD` **or** GA relative keyword |
| `endDate`   | no | `today`    | ISO `YYYY-MM-DD` **or** GA relative keyword |

Accepted GA relative keywords include: `today`, `yesterday`, `NdaysAgo`
(e.g. `7daysAgo`, `30daysAgo`, `90daysAgo`).

**Suggested UI:** a date-range picker with quick presets
→ Last 7 days (`7daysAgo`→`today`), Last 30 days (`30daysAgo`→`today`),
Last 90 days, and a custom range (emit ISO dates).

---

## 6. Endpoints

### 6.1 Overview — daily KPIs

```
GET {BASE_URL}/analytics/overview?startDate=7daysAgo&endDate=today
```

`rows` is an array of **one object per day**, sorted ascending by date.
Real example response (from the live API):

```json
{
  "statusCode": 200,
  "data": {
    "startDate": "7daysAgo",
    "endDate": "today",
    "rows": [
      {
        "date": "2026-06-13",
        "activeUsers": 3,
        "sessions": 3,
        "screenPageViews": 9,
        "newUsers": 3,
        "averageSessionDuration": 116.12697166666668
      }
    ]
  },
  "message": "Success",
  "success": true
}
```

> Note: `averageSessionDuration` comes back as a float of seconds
> (e.g. `116.127` ≈ `1m 56s`) — round/format before display.

| Field | Type | Meaning |
|-------|------|---------|
| `date` | string | Day in ISO `YYYY-MM-DD` |
| `activeUsers` | number | Active users that day |
| `sessions` | number | Sessions that day |
| `screenPageViews` | number | Page/screen views that day |
| `newUsers` | number | First-time users that day |
| `averageSessionDuration` | number | Avg session length in **seconds** (format as `mm:ss` or `Xm Ys`) |

**Render as:**
- **Summary cards (totals for the range):** sum `activeUsers`, `sessions`,
  `screenPageViews`, `newUsers` across rows; for `averageSessionDuration` show
  the average of the daily values.
- **Line/area chart:** x-axis = `date`, series = `activeUsers` / `sessions` /
  `screenPageViews` (let the user toggle metrics).

---

### 6.2 Top Pages

```
GET {BASE_URL}/analytics/top-pages?startDate=7daysAgo&endDate=today
```

`rows` = most-visited pages, busiest first (max 20).
Real example response (from the live API):

```json
{
  "statusCode": 200,
  "data": {
    "startDate": "7daysAgo",
    "endDate": "today",
    "rows": [
      { "pagePath": "/", "screenPageViews": 5 },
      { "pagePath": "/products/6a2213c7b29fc873ee9f67f3", "screenPageViews": 4 }
    ]
  },
  "message": "Success",
  "success": true
}
```

> `pagePath` for product pages looks like `/products/<productId>` — you can map
> the id back to a product name/link using the dashboard's existing product data.

| Field | Type | Meaning |
|-------|------|---------|
| `pagePath` | string | URL path of the page |
| `screenPageViews` | number | Views for that page over the range |

**Render as:** a ranked table or horizontal bar chart (`pagePath` vs
`screenPageViews`). Consider linking `pagePath` to the live storefront URL.

---

### 6.3 Traffic Sources

```
GET {BASE_URL}/analytics/traffic-sources?startDate=7daysAgo&endDate=today
```

`rows` = where sessions came from, largest first (max 20).
Real example response (from the live API):

```json
{
  "statusCode": 200,
  "data": {
    "startDate": "7daysAgo",
    "endDate": "today",
    "rows": [
      { "source": "(direct)", "sessions": 3 },
      { "source": "(not set)", "sessions": 2 }
    ]
  },
  "message": "Success",
  "success": true
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `source` | string | Session source (`google`, `(direct)`, `(not set)`, `instagram`, …) |
| `sessions` | number | Sessions from that source over the range |

> GA4 returns special buckets like `(direct)` (no referrer) and `(not set)`
> (source unknown) — display them as-is; don't filter them out.

**Render as:** a pie/donut chart (share of sessions) or a ranked table.

---

## 7. Example client code

### Fetch (with the existing token)

```ts
async function getOverview(token: string, startDate = "7daysAgo", endDate = "today") {
  const res = await fetch(
    `${BASE_URL}/analytics/overview?startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Analytics overview failed: ${res.status}`);
  const json = await res.json();
  return json.data.rows; // array of daily KPI rows
}
```

### Axios instance (reuse the dashboard's configured client)

```ts
// Assuming `api` is the shared axios instance with the auth interceptor already set.
const params = { startDate: "30daysAgo", endDate: "today" };

const [overview, topPages, sources] = await Promise.all([
  api.get("/analytics/overview", { params }),
  api.get("/analytics/top-pages", { params }),
  api.get("/analytics/traffic-sources", { params }),
]);

const overviewRows = overview.data.data.rows;     // note: axios .data → envelope → .data.rows
const topPagesRows = topPages.data.data.rows;
const sourceRows   = sources.data.data.rows;
```

> Note the double `.data`: axios puts the body in `response.data`, and our
> envelope nests the payload under `data`. So rows = `response.data.data.rows`.

---

## 8. Suggested dashboard layout

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics            [ Last 7 days ▼ ]  [ custom range 📅 ]   │
├───────────────┬───────────────┬───────────────┬───────────────┤
│ Active Users  │   Sessions    │  Page Views   │  New Users     │  ← summary cards (from /overview)
│   2,841       │    3,610      │   12,400      │   1,902        │
├───────────────┴───────────────┴───────────────┴───────────────┤
│  Trend (line chart)  — activeUsers / sessions / pageViews/day  │  ← /overview rows
├───────────────────────────────┬────────────────────────────────┤
│  Top Pages (table/bar)        │  Traffic Sources (donut)        │  ← /top-pages , /traffic-sources
└───────────────────────────────┴────────────────────────────────┘
```

### Implementation notes
- Fire the 3 requests in parallel on mount and on range change.
- Cache by range to avoid refetching when the user toggles back.
- Show a skeleton/loading state per widget; per-widget error fallback (§4).
- `averageSessionDuration` is in **seconds** → format before display.
- Numbers can be large → format with thousands separators / `Intl.NumberFormat`.
- Empty range → `rows: []`; render an "no data for this range" empty state.

---

## 9. Quick reference

| Endpoint | Path | Row fields |
|----------|------|------------|
| Overview | `GET /analytics/overview` | `date, activeUsers, sessions, screenPageViews, newUsers, averageSessionDuration` |
| Top Pages | `GET /analytics/top-pages` | `pagePath, screenPageViews` |
| Traffic Sources | `GET /analytics/traffic-sources` | `source, sessions` |

- Auth: `Authorization: Bearer <admin token>` (reuse existing).
- Query: `?startDate=&endDate=` (default `7daysAgo`→`today`).
- Payload: always `response.data.rows`.
- Errors: `500` with `{ success:false, message, error }`; `401/403` for auth.
