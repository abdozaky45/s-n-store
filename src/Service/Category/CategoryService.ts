import CategoryModel from "../../Model/Category/CategoryModel";
import { Types } from "mongoose";
import s3_service from "../Aws/S3_Bucket/presignedUrl";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
export const createCategory = async ({
  name,
  mediaUrl,
  mediaId,
  createdBy,
}: {
  name: { ar: string; en: string };
  mediaUrl: string;
  mediaId: string;
  createdBy: Types.ObjectId;
}) => {
  const category = await CategoryModel.create({
    name,
    image: {
      mediaUrl,
      mediaId,
    },
    createdBy,
  });
  return category;
};
export const extractMediaId = (imageUrl: string) => {
  if (!imageUrl.includes("amazonaws.com/")) {
    return "Invalid image url";
  }
  const mediaId = imageUrl.split("amazonaws.com/")[1];
  return mediaId;
};
export const findCategoryById = async (_id: string) => {
  const category = await CategoryModel.findById(_id).populate(SchemaTypesReference.SubCategory).select("-isDeleted -__v");
  return category;
};
export const deletePresignedURL = async (fileName: string) => {
  const aws_s3_service = new s3_service();
  const deleteImage = await aws_s3_service.deletePresignedUrl({
    bucket: process.env.AWS_BUCKET_NAME!,
    key: fileName as string,
  });
  return deleteImage;
};
export const prepareCategoryUpdates = async (
  category: any,
  name?: { ar?: string; en?: string },
  imageUrl?: string,
) => {
  let updated = false;
  if (name && (name.ar || name.en)) {
    category.name = {
      ar: name.ar ?? category.name.ar,
      en: name.en ?? category.name.en,
    };
    updated = true;
  }
  if (imageUrl && imageUrl !== category.image.mediaUrl) {
    const mediaId = extractMediaId(imageUrl);
    if (mediaId !== category.image.mediaId) {
      category.image.mediaUrl = imageUrl;
      category.image.mediaId = mediaId;
      updated = true;
    }
  }
  return updated ? category : null;
};
export const deleteCategory = async (_id: string) => {
  const category = await CategoryModel.findByIdAndUpdate(_id, { isDeleted: true });
  return category;
};
export const getAllCategories = async () => {
  const categories = await CategoryModel.find({ isDeleted: false }).populate(SchemaTypesReference.SubCategory).select("-isDeleted -__v");
  return categories;
};

