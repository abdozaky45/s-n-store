import { Request, Response } from "express";
import { ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import {
  listBackups,
  BACKUP_CONFIG,
} from "../../Service/Aws/S3_Bucket/BackupListService";

const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
};

// Admin: backup history + health, read straight from the S3 bucket (the bucket
// is the source of truth — a missing day means that day's backup did not land).
export const getBackupsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const items = await listBackups();
    const backups = items.map((b) => ({
      fileName: b.fileName,
      key: b.key,
      createdAt: b.createdAt,
      sizeBytes: b.sizeBytes,
      size: humanSize(b.sizeBytes),
    }));

    const latest = backups[0] || null;
    const hoursSinceLatest = latest
      ? (Date.now() - new Date(latest.createdAt).getTime()) / 3_600_000
      : null;
    // Backups run daily, so a healthy system has a backup < 26h old.
    const healthy = hoursSinceLatest !== null && hoursSinceLatest < 26;

    const summary = {
      bucket: BACKUP_CONFIG.bucket,
      region: BACKUP_CONFIG.region,
      total: backups.length,
      latestAt: latest ? latest.createdAt : null,
      latestSize: latest ? latest.size : null,
      hoursSinceLatest:
        hoursSinceLatest !== null ? Number(hoursSinceLatest.toFixed(1)) : null,
      healthy,
    };

    return res.json(new ApiResponse(200, { summary, backups }));
  }
);
