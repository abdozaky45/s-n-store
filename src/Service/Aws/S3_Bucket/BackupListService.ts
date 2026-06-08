import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

// The DB backups live in their OWN bucket, in a different region from the media
// bucket (see .github/workflows/backup.yml). Defaults match that workflow, but
// can be overridden via env without code changes.
const BACKUP_BUCKET = process.env.BACKUP_BUCKET || "snlingeri-db-backups";
const BACKUP_REGION = process.env.BACKUP_REGION || "ap-northeast-1";
const BACKUP_PREFIX = process.env.BACKUP_PREFIX || "mongo/";

// Dedicated client pinned to the backup bucket's region (the app's default S3
// client targets the media bucket's region). Same credentials — the app's IAM
// user is granted read-only (ListBucket/GetObject) on the backup bucket.
const backupClient = new S3Client({
  region: BACKUP_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface BackupItem {
  key: string;
  fileName: string;
  createdAt: Date;
  sizeBytes: number;
}

// List every backup object in the bucket, newest first. Paginates so it stays
// correct past 1000 objects (lifecycle caps us at ~30, but be safe).
export const listBackups = async (): Promise<BackupItem[]> => {
  const items: BackupItem[] = [];
  let ContinuationToken: string | undefined;
  do {
    const out = await backupClient.send(
      new ListObjectsV2Command({
        Bucket: BACKUP_BUCKET,
        Prefix: BACKUP_PREFIX,
        ContinuationToken,
      })
    );
    for (const obj of out.Contents || []) {
      if (!obj.Key || obj.Key.endsWith("/")) continue;
      items.push({
        key: obj.Key,
        fileName: obj.Key.replace(BACKUP_PREFIX, ""),
        createdAt: obj.LastModified || new Date(0),
        sizeBytes: obj.Size || 0,
      });
    }
    ContinuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (ContinuationToken);

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const BACKUP_CONFIG = {
  bucket: BACKUP_BUCKET,
  region: BACKUP_REGION,
  prefix: BACKUP_PREFIX,
};
