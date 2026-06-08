import { Request, Response } from "express";
import { ApiResponse, ApiError, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import s3_service from "../../Service/Aws/S3_Bucket/presignedUrl";
import { ALLOWED_IMAGE_TYPES, AllowedImageType } from "../../Utils/AllowedMediaTypes";
export const getPresignedURL = asyncHandler(
  async (req: Request, res: Response) => {
    const regionAws = process.env.AWS_REGION!;
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const files = Array.isArray(req.body.files)
      ? req.body.files
      : [req.body.files];
    if (!files || files.length === 0) {
      throw new ApiError(400, ErrorMessages.NO_FILES_PROVIDED);
    }
    const aws_s3_service = new s3_service();
    const preSignedURLs = await Promise.all(
      files.map(async (file: {contentType: AllowedImageType, fileName?:string}, index: number) => {
        if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.contentType)) {
          throw new ApiError(400, ErrorMessages.INVALID_FILE_TYPE);
        }
        const fileName = `${req.body.folder}/${
          req.body.currentUser.userInfo._id
        }_${Date.now()}_${index}`;
        const preSignedURL = await aws_s3_service.createPresignedUrlWithClient({
          region: regionAws,
          bucket: bucketName,
          key: file.fileName || fileName,
          contentType: file.contentType,
        });
        // Upload still targets S3 directly (preSignedURL). The stored read URL
        // (mediaUrl) points at CloudFront when CDN_BASE_URL is set — same key/path,
        // only the host changes. Unset CDN_BASE_URL => identical S3 URL as before.
        const s3Url = preSignedURL.split("?")[0];
        const cdnBase = process.env.CDN_BASE_URL?.replace(/\/+$/, "");
        const mediaUrl = cdnBase
          ? s3Url.replace(/^https?:\/\/[^/]+/, cdnBase)
          : s3Url;
        return {
          preSignedURL,
          mediaUrl,
        };
      })
    );

    return res.json(
      new ApiResponse(200, {
        preSignedURLs,
      })
    );
  }
);
// Collect the S3 object keys (mediaIds) attached to a product document.
export const collectProductMediaIds = (product: any): string[] =>
  [
    product.defaultImage?.mediaId,
    product.sizeChartImage?.mediaId,
    ...(product.albumImages?.map((img: any) => img.mediaId) || []),
  ].filter(Boolean);

// Best-effort S3 cleanup. Meant to run AFTER the DB delete has committed, so a
// failure here only leaves an orphaned object (swept by cleanupOrphanS3Images),
// never a DB record pointing at an already-deleted image.
export const deleteMediaByIds = async (mediaIds: string[]) => {
  const keys = mediaIds.filter(Boolean);
  if (!keys.length) return;
  const aws = new s3_service();
  const bucketName = process.env.AWS_BUCKET_NAME!;
  await Promise.allSettled(
    keys.map((key) => aws.deletePresignedUrl({ bucket: bucketName, key }))
  );
};
export const deleteImage = async (mediaId: string) => {
  const aws = new s3_service();
  const bucketName = process.env.AWS_BUCKET_NAME!;
  await aws.deletePresignedUrl({ bucket: bucketName, key: mediaId });
};