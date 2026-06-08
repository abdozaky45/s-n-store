import { Router } from "express";
import { getBackupsController } from "../../Controller/Backup/BackupController";

const BackupRouter = Router();

// Backup history + health for the admin panel (read-only, sourced from S3).
BackupRouter.get("/admin/all", getBackupsController);

export default BackupRouter;
