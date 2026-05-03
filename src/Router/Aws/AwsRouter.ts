import { Router } from "express";
import * as AwsController from "../../Controller/Aws/AwsController";
import { Validation } from "../../middleware/ValidationMiddleware";
import { deletePresignedUrlValidation, getPresignedUrlValidation } from "../../Validation/Aws";
const AwsRouter = Router();
AwsRouter.post("/get-presigned-url", Validation(getPresignedUrlValidation), AwsController.getPresignedURL);
AwsRouter.delete("/delete-presigned-url", Validation(deletePresignedUrlValidation), AwsController.deleteImage);
export default AwsRouter;
