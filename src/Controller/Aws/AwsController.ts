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
        return {
          preSignedURL,
          mediaUrl: preSignedURL.split("?")[0],
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
export const deleteProductImages = async (product: any) => {
  const aws = new s3_service();
  const bucketName = process.env.AWS_BUCKET_NAME!;
  const imageIds = [
    product.defaultImage?.mediaId,
    product.sizeChartImage?.mediaId,
    ...(product.albumImages?.map((img: any) => img.mediaId) || []),
  ].filter(Boolean);

  await Promise.all(
    imageIds.map((mediaId) =>
      aws.deletePresignedUrl({ bucket: bucketName, key: mediaId })
    )
  );
};
export const deleteImage = async (mediaId: string) => {
  const aws = new s3_service();
  const bucketName = process.env.AWS_BUCKET_NAME!;
  await aws.deletePresignedUrl({ bucket: bucketName, key: mediaId });
};