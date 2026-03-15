import CategoryModel from "../../Model/Category/CategoryModel";
import { Types } from "mongoose";
import s3_service from "../Aws/S3_Bucket/presignedUrl";
import moment from "../../Utils/DateAndTime";
import ProductModel from "../../Model/Product/ProductModel";
export const createCategory = async ({
  categoryName,
  mediaUrl,
  mediaId,
  createdBy,
  createdAt,
}: {
  categoryName: { ar: string; en: string };
  mediaUrl: string;
  mediaId: string;
  createdBy: Types.ObjectId;
  createdAt: number;
}) => {
  const category = await CategoryModel.create({
    categoryName,
    isNewArrival: true,
    image: {
      mediaUrl,
      mediaId,
    },
    createdBy,
    createdAt,
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
  const category = await CategoryModel.findById(_id).populate("subCategory").select("-isDeleted -__v");
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
  categoryName?: { ar?: string; en?: string },
  imageUrl?: string,
  isNewArrival?: boolean
) => {
  let updated = false;
  if (categoryName && (categoryName.ar || categoryName.en)) {
    category.categoryName = {
      ar: categoryName.ar ?? category.categoryName.ar,
      en: categoryName.en ?? category.categoryName.en,
    };
    updated = true;
  }
  if (typeof isNewArrival === "boolean" && isNewArrival !== category.isNewArrival) {
    category.isNewArrival = isNewArrival;
    category.createdAt = moment().valueOf();
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
  const categories = await CategoryModel.find({ isDeleted: false }).populate("subCategory").select("-isDeleted -__v");
  return categories;
};
export const getNewArrivalCategories = async () => {
  const categories = await CategoryModel.find({ isDeleted: false, isNewArrival: true })
    .populate("subCategory")
    .select("-isDeleted -__v");
  return categories;
}
export const getAllSaleCategories = async (category: string, page?: number) => {
  let limit = 20;
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const skip = limit * (page - 1);
  const [categories, totalItems] = await Promise.all([
    ProductModel.find({ isDeleted: false, isSale: true, category })
      .populate({ path: "category", select: "-__v" })
      .skip(skip)
      .limit(limit)
      .select("-isDeleted -__v -wholesalePrice"),
    ProductModel.countDocuments({ isDeleted: false, isSale: true, category }),
  ]);

  return {
    categories,
    currentPage: page,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};
