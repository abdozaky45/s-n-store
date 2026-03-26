import CategoryModel from "../../Model/Category/CategoryModel";
import mongoose, { Types } from "mongoose";
import s3_service from "../Aws/S3_Bucket/presignedUrl";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import ProductModel from "../../Model/Product/ProductModel";
import VariantModel from "../../Model/Variant/VariantModel";
import { deleteImage, deleteProductImages } from "../../Controller/Aws/AwsController";
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
export const softDeleteCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await CategoryModel.findByIdAndUpdate(_id, { isDeleted: true }, { session });
    await SubCategoryModel.updateMany(
      { category: _id },
      { isDeleted: true },
      { session }
    );
    await ProductModel.updateMany(
      { category: _id },
      { isDeleted: true },
      { session }
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
export const getAllCategories = async () => {
  const categories = await CategoryModel.find({ isDeleted: false }).populate(SchemaTypesReference.SubCategory).select("-isDeleted -__v");
  return categories;
};
export const findAllDeletedCategories = async () => {
  const categories = await CategoryModel.find({ isDeleted: true }).populate(SchemaTypesReference.SubCategory).select("-isDeleted -__v");
  return categories;
};
export const hardDeleteCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const products = await ProductModel.find({ category: _id }).select("_id defaultImage albumImages sizeChartImage");
    const subCategories = await SubCategoryModel.find({ category: _id }).select("_id image");
    const category = await CategoryModel.findById(_id).select("image");
    if (category?.image?.mediaId) {
      await deleteImage(category.image.mediaId);
    }
    for (const sub of subCategories) {
      if (sub.image?.mediaId) {
         await deleteImage(sub.image.mediaId);
      }
    }
    for (const product of products) {
     await deleteProductImages(product);
    }
    const productIds = products.map((p) => p._id);
    await VariantModel.deleteMany({ product: { $in: productIds } }, { session });
    await ProductModel.deleteMany({ category: _id }, { session });
    await SubCategoryModel.deleteMany({ category: _id }, { session });
    await CategoryModel.findByIdAndDelete(_id, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};