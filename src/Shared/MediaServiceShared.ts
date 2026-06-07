import s3_service from "../Service/Aws/S3_Bucket/presignedUrl";

export const extractMediaId = (imageUrl: string) => {
  if (typeof imageUrl !== "string" || !imageUrl) {
    return "Invalid image url";
  }
  // The mediaId is the S3 object key = the URL path after the host. Extracting
  // it from the path (not from "amazonaws.com/") keeps this working for both raw
  // S3 URLs and CloudFront URLs, since the key is identical on either host.
  const match = imageUrl.match(/^https?:\/\/[^/]+\/(.+)$/);
  if (!match) {
    return "Invalid image url";
  }
  return match[1].split("?")[0];
};
export const deletePresignedURL = async (fileName: string) => {
  const aws_s3_service = new s3_service();
  const deleteImage = await aws_s3_service.deletePresignedUrl({
    bucket: process.env.AWS_BUCKET_NAME!,
    key: fileName as string,
  });
  return deleteImage;
};