# Prompt — Wire the Backup History API into the Admin Panel

> Paste this whole file into a Claude session opened in the **admin-panel / frontend** repo.
> It is a self-contained brief. **Frontend only — do not change the backend.**

---

## Goal

Build an admin-panel screen that shows **MongoDB backup history and health** by
consuming the existing backend endpoint `GET /backup/admin/all`.

Backups run automatically every day. Admins need to see, at a glance:
1. Is the backup system healthy (did today's backup land)?
2. The full history of backups (date + size), newest first.

---

## Context (already done on the backend — for your understanding only)

- Daily backups upload a compressed MongoDB dump to a private S3 bucket.
- The endpoint reads the bucket **directly** — the bucket is the source of truth.
  A **missing day in the sequence means that day's backup failed/did not land.**
- There is **no** separate "backup logs" collection. Do not expect one.

---

## API contract

| | |
|---|---|
| Method & path | `GET {API_BASE}/backup/admin/all` |
| Auth | `Authorization: Bearer <admin access token>` — same as every other admin endpoint (admin role required) |
| Use existing config | Take the base URL and auth token from however the panel already calls admin APIs. **Do not hardcode.** |

### Success — `200`

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": {
    "summary": {
      "bucket": "snlingeri-db-backups",
      "region": "ap-northeast-1",
      "total": 12,
      "latestAt": "2026-06-08T04:38:00.000Z",
      "latestSize": "40.3 KB",
      "hoursSinceLatest": 3.1,
      "healthy": true
    },
    "backups": [
      {
        "fileName": "backup-2026-06-08_043744.gz",
        "key": "mongo/backup-2026-06-08_043744.gz",
        "createdAt": "2026-06-08T04:38:00.000Z",
        "sizeBytes": 41296,
        "size": "40.3 KB"
      }
    ]
  }
}
```

### Field meanings

| Field | Meaning |
|---|---|
| `summary.total` | Number of backups currently retained (rolling 30-day window). |
| `summary.latestAt` | ISO-8601 **UTC** timestamp of the newest backup (`null` if none). |
| `summary.latestSize` | Human-readable size of the newest backup. |
| `summary.hoursSinceLatest` | Hours since the newest backup (`null` if none). |
| `summary.healthy` | `true` when the newest backup is **< 26h** old. Drive the status badge from this. |
| `backups[]` | All backups, **already sorted newest-first**. |
| `backups[].createdAt` | ISO-8601 **UTC**. Use for display + sorting + missing-day detection. |
| `backups[].size` | Pre-formatted human size (e.g. `"40.3 KB"`). |

### Errors (standard envelope)

- `401` — missing/invalid token → `{ "success": false, "message": "...", "error": ... }`
- `403` — authenticated but not admin.

Handle these the same way the panel handles other admin-endpoint auth errors.

---

## Backup filename convention (for date logic)

`backup-YYYY-MM-DD_HHMMSS.gz` — the date/time is **UTC**. Prefer `createdAt`
(ISO) for anything date-related; only fall back to parsing the filename if needed.

---

## UI requirements

1. **Health badge** (top of the screen), driven by `summary.healthy`:
   - `true` → green, e.g. "Backups healthy".
   - `false` (or `hoursSinceLatest` is `null`/`> 26`) → red, e.g. "Backup overdue — check the system".
2. **Summary line**: "Last backup: {relative time} ago · {latestSize} · {total} kept".
3. **History table**, newest first: columns **Date** · **Size** · (optional) **File**.
   - Render `createdAt` in the **user's local timezone** plus a relative "x hours/days ago".
4. **Missing-day highlighting**: walk the daily sequence; if a calendar day (UTC)
   between the oldest and newest backup has **no** backup, show that gap as a red
   "Missing — backup failed" row or marker.
5. **States**: loading skeleton/spinner, error state (with retry), and empty state
   ("No backups found yet") when `total === 0`.
6. **Manual refresh** button that re-fetches the endpoint.

---

## Implementation guidance

- **Detect and match the existing frontend stack and conventions** (router,
  data-fetching layer, design system / component library, auth-token handling).
  Reuse existing table, card, badge, and page-layout components — do not introduce
  a new UI pattern.
- Add a **"Backups"** entry to the admin navigation/sidebar, placed near other
  system/settings items.
- Centralize the API call in the panel's existing API/service layer (same place as
  other admin calls), not inline in the component.
- Type the response with the interfaces below.

### TypeScript types (ready to paste)

```ts
export interface BackupItem {
  fileName: string;   // "backup-2026-06-08_043744.gz"
  key: string;        // "mongo/backup-2026-06-08_043744.gz"
  createdAt: string;  // ISO-8601 UTC
  sizeBytes: number;
  size: string;       // "40.3 KB"
}

export interface BackupSummary {
  bucket: string;
  region: string;
  total: number;
  latestAt: string | null;        // ISO-8601 UTC
  latestSize: string | null;
  hoursSinceLatest: number | null;
  healthy: boolean;               // true when newest backup < 26h old
}

export interface BackupHistoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    summary: BackupSummary;
    backups: BackupItem[];        // newest first
  };
}
```

---

## Acceptance criteria

- [ ] New admin route/page reachable from the sidebar ("Backups").
- [ ] Calls `GET /backup/admin/all` with the admin token via the existing API layer.
- [ ] Green/red health badge driven by `summary.healthy`.
- [ ] Summary line with last-backup relative time, size, and total.
- [ ] History table, newest first, dates in local tz + relative time.
- [ ] Missing-day gaps flagged in red.
- [ ] Loading, error (with retry), and empty states implemented.
- [ ] Manual refresh works.
- [ ] Response typed; no hardcoded base URL or token.
- [ ] Matches the existing panel's styling and component conventions.

---

## Notes / edge cases

- All server timestamps are **UTC** — convert for display; don't show raw UTC.
- `backups` is already sorted newest-first; don't assume you must re-sort, but be safe.
- `total` is capped by a 30-day retention policy, so the list stays small.
- This endpoint is **read-only**; there are no create/delete actions to build.
