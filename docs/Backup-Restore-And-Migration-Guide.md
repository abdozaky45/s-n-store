# MongoDB Backup — Restore & Migration Guide

A practical runbook for restoring or moving the daily database backups. Three
situations are covered:

- **A. Restore drill** — prove a backup still works, touching nothing real.
- **B. Migrate** — move a backup into a *different* database (new cluster/provider).
- **C. Disaster recovery** — production DB is broken and must be rebuilt.

> The backup is a **standard `mongodump` archive** (`.gz`). It is portable — it
> restores into *any* MongoDB (Atlas, self-hosted, another provider, local). The
> only thing that changes between situations is the **target `--uri`**.

---

## Where the backups live

| | |
|---|---|
| Bucket | `snlingeri-db-backups` (private) |
| Region | `ap-northeast-1` (Tokyo) |
| Path | `mongo/backup-YYYY-MM-DD_HHMMSS.gz` (timestamp is **UTC**) |
| Retention | last **30 days** (older auto-deleted) |

---

## Prerequisites

- **AWS CLI** configured with credentials that can read the bucket
  (`aws configure`). Admin keys, or any user with `s3:GetObject`/`s3:ListBucket`
  on the backup bucket.
- **MongoDB Database Tools** (`mongorestore`) —
  https://www.mongodb.com/try/download/database-tools
- **Docker** — only for the restore *drill* (Situation A).

---

## List & download a backup (used by all situations)

```powershell
# See what backups exist
aws s3 ls s3://snlingeri-db-backups/mongo/

# Download a specific one
aws s3 cp s3://snlingeri-db-backups/mongo/backup-2026-06-08_043744.gz ./backup.gz
```

---

## A. Restore drill (safe test — nothing real is touched)

Use the helper script. It downloads the latest backup, restores it into a
throwaway Docker MongoDB, prints document counts, and cleans up.

```powershell
# verify the latest backup restores cleanly
.\scripts\restore-test.ps1

# OR leave it running to browse in MongoDB Compass (mongodb://localhost:27018)
.\scripts\restore-test.ps1 -Keep

# test a specific older backup
.\scripts\restore-test.ps1 -Key backup-2026-06-01_020000.gz
```

Run this **every couple of months** so you know recovery still works.

---

## B. Migrate — move a backup into a DIFFERENT database

For when you switch to a new Atlas cluster, a new provider, or split environments.

### Option 1 — helper script (recommended)

```powershell
# restore the latest backup into a new target (asks for confirmation first)
.\scripts\restore-to-target.ps1 -TargetUri "mongodb+srv://USER:PASS@new-cluster.mongodb.net/snlingeri"

# replace existing data in the target
.\scripts\restore-to-target.ps1 -TargetUri "mongodb+srv://USER:PASS@new-cluster.mongodb.net/snlingeri" -Drop

# restore under a DIFFERENT database name
.\scripts\restore-to-target.ps1 `
  -TargetUri "mongodb+srv://USER:PASS@new-cluster.mongodb.net/" `
  -NsFrom "snlingeri.*" -NsTo "my_new_db.*"

# a specific backup, skip the confirmation prompt
.\scripts\restore-to-target.ps1 -TargetUri "..." -Key backup-2026-06-01_020000.gz -Yes
```

### Option 2 — manual command

```powershell
aws s3 cp s3://snlingeri-db-backups/mongo/backup-2026-06-08_043744.gz ./backup.gz

mongorestore --uri="mongodb+srv://USER:PASS@new-cluster.mongodb.net/snlingeri" `
  --gzip --archive="./backup.gz"
```

### After migrating
1. Verify the data in the new database (counts, a few documents).
2. Update **`DB_URL`** in the app (`.env` locally, and the **Elastic Beanstalk
   environment** in production) to the new connection string.
3. Restart / redeploy the app.

---

## C. Disaster recovery — production DB is broken

1. **Do NOT panic and do NOT overwrite production yet.**
2. **Pick a known-good backup.** Not necessarily the newest — if the damage
   happened *before* the last backup ran, the newest backup is also damaged. Use
   the 30-day history to go back to *before* the incident:
   ```powershell
   aws s3 ls s3://snlingeri-db-backups/mongo/
   ```
3. **Restore into a NEW place first** (a fresh database name or a new cluster),
   not straight over production:
   ```powershell
   .\scripts\restore-to-target.ps1 `
     -TargetUri "mongodb+srv://USER:PASS@cluster.mongodb.net/" `
     -Key backup-2026-06-07_020000.gz `
     -NsFrom "snlingeri.*" -NsTo "snlingeri_recovered.*"
   ```
4. **Verify** the recovered data is good.
5. **Switch the app** to the recovered database (update `DB_URL`) and restart.

> Media note: product images live in the media bucket (`amzn-s3-snlangire`); the
> DB only stores their **keys/links**. Restoring the DB brings the links back; the
> images themselves are unaffected. Keep **Versioning** enabled on the media bucket
> for full protection.

---

## Gotchas

- **Network access** — if the target is a new Atlas cluster, add your IP under
  **Network Access** (or `0.0.0.0/0` temporarily) so `mongorestore` can connect.
  The connection is still protected by username/password.
- **Target credentials** — use the *target* cluster's user/password in the URI.
- **`--drop`** — only if you want to *replace* existing collections in the target.
- **Database name** — the archive carries the original name `snlingeri`; use
  `--nsFrom/--nsTo` to restore under a different name.
- **Versions** — `mongorestore` is broadly forward/backward compatible across
  modern MongoDB versions.
- **Timestamps** — backup filenames and S3 dates are **UTC**.

---

## Quick reference (cheat sheet)

```powershell
# list backups
aws s3 ls s3://snlingeri-db-backups/mongo/

# download one
aws s3 cp s3://snlingeri-db-backups/mongo/<file>.gz ./backup.gz

# safe drill (throwaway container)
.\scripts\restore-test.ps1                       # verify + clean up
.\scripts\restore-test.ps1 -Keep                 # browse in Compass

# migrate / recover to a real target
.\scripts\restore-to-target.ps1 -TargetUri "<uri>"           # latest backup
.\scripts\restore-to-target.ps1 -TargetUri "<uri>" -Drop     # replace data
.\scripts\restore-to-target.ps1 -TargetUri "<uri>" -Key <file>.gz

# manual restore
mongorestore --uri="<uri>" --gzip --archive="./backup.gz"
```

---

## The scripts

| Script | Purpose | Touches production? |
|---|---|---|
| [`scripts/restore-test.ps1`](../scripts/restore-test.ps1) | Restore drill into a throwaway Docker MongoDB | No — fully isolated |
| [`scripts/restore-to-target.ps1`](../scripts/restore-to-target.ps1) | Restore/migrate a backup into a real target DB you specify | Only the `-TargetUri` you pass |
