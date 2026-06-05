# S3 Orphan Image Cleanup

Maintenance scripts that find and delete images sitting in the S3 bucket that no
database document references anymore (e.g. a category/product/slider image that
was replaced — the app overwrites the DB field but never deletes the old S3
object). Over time these "orphans" pile up and cost storage.

Two scripts work together:

| Script | Purpose | Writes anything? |
|---|---|---|
| `src/Scripts/cleanupOrphanS3Images.ts` | Lists the bucket, compares with the DB, reports/deletes orphans | Deletes S3 objects **only** with `--delete` |
| `src/Scripts/verifyOrphanS3Keys.ts` | Independent double-check that sampled orphan keys really aren't referenced | Read-only |

---

## Recommended workflow (every time)

Always go dry-run → verify → delete. Never jump straight to `--delete`.

```bash
# 1) Dry-run — read-only, writes a report file, deletes nothing
npx ts-node src/Scripts/cleanupOrphanS3Images.ts

# 2) Independent verification on a sample from the report (read-only)
npx ts-node src/Scripts/verifyOrphanS3Keys.ts

# 3) Only if both look right — actually delete
npx ts-node src/Scripts/cleanupOrphanS3Images.ts --delete
```

### What to check after the dry-run

It prints three numbers:

```
Referenced keys in DB: X
Objects in bucket:     Y
Orphans to delete:     Z
```

- `Z` should be a **sane fraction** of `Y` (old replaced images). A handful up to
  maybe ~25% is normal.
- ⚠️ **If `Z` is close to `Y` (it wants to delete most of the bucket) — STOP.**
  Something is wrong (wrong DB, or a new image field the script doesn't know
  about). Investigate before deleting.
- The dry-run writes the full orphan list to `orphan-s3-keys-<timestamp>.txt` in
  the project root. Keep the file from the `--delete` run as a record — S3
  deletion is permanent unless the bucket has versioning.

### What the verify script confirms

- A **positive control**: a key we know IS used must come back referenced. This
  proves the search works, so "not referenced" is trustworthy.
- A sample of ~2 keys per folder (Category/, Product/, …) — all should report
  `✅ orphan`. If any says `⚠️ REFERENCED`, **do not delete**.

---

## Options

| Flag | Default | Meaning |
|---|---|---|
| `--delete` | off (dry-run) | Actually delete the orphans |
| `--min-age-hours=N` | `24` | Protect objects newer than N hours (guards in-flight uploads whose DB record isn't saved yet) |
| `--prefix=Folder/` | whole bucket | Limit the scan/cleanup to one folder |

```bash
# extra-safe first run
npx ts-node src/Scripts/cleanupOrphanS3Images.ts --min-age-hours=48
# clean only one folder
npx ts-node src/Scripts/cleanupOrphanS3Images.ts --prefix=Product/ --delete
```

---

## Built-in safety layers

1. **Dry-run by default** — nothing is deleted without `--delete`.
2. **Empty-DB guard** — if the DB returns 0 referenced keys (e.g. bad
   connection), it aborts instead of treating the whole bucket as orphaned.
3. **Age protection** — objects newer than `--min-age-hours` are skipped.
4. **Soft-deleted docs count** — reads via the native driver (no query
   middleware), so images on soft-deleted documents are still considered "used".
5. **Report on disk** — the orphan list is written out before anything is deleted.

---

## ⚠️ CRITICAL: keep the scripts in sync with the schema

The cleanup is only as safe as its list of image fields. It builds the "used"
set from these collections/fields **only**:

| Collection | Image field(s) |
|---|---|
| products | `defaultImage`, `albumImages[]`, `sizeChartImage` |
| categories | `image` |
| subcategories | `image` |
| offers | `image` |
| socialreviews | `image` |
| imagesliders | `images.image1`, `images.image2` |
| orders | `payment.transactions[].receiptImage` |

> If you ever add a new model or field that stores an S3 image, you **must** add
> it to `collectUsedKeys()` in `cleanupOrphanS3Images.ts` **and** `findUsage()`
> in `verifyOrphanS3Keys.ts`. Forgetting this means the new images look like
> orphans and get **permanently deleted**. This is the single most important
> thing to remember about these scripts.

(Note: `Category.image_svg` points to the `CategoryIcon` collection, whose SVG is
stored inline in MongoDB — not on S3 — so it is intentionally not part of the
cleanup.)

---

## Should this run automatically on a schedule?

**No — do not schedule the `--delete` step.** Keep the actual deletion manual.

Why: every safety net here except the age guard is a *human reviewing the
numbers*. The biggest risk (a new image field that isn't in the script yet) is
**not** caught by any automated guard — those images would simply look orphaned.
On a nightly auto-`--delete` schedule, that turns a forgotten code change into
silent, permanent data loss.

Recommended cadence instead:

- Run the **manual workflow above every 1–3 months**, or whenever bucket storage
  grows noticeably. Orphans accumulate slowly, so this is plenty.
- If you want automation, schedule the **dry-run only** (no `--delete`) to
  produce the report / log the orphan count, and still trigger the real deletion
  by hand after a glance at the numbers.

In short: automate *visibility*, never *destruction*.
