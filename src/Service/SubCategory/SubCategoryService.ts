import { Types } from "mongoose";
import { extractMediaId } from "../Category/CategoryService";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import ISubCategory from "../../Model/SubCategory/ISubcategory";
import moment from "../../Utils/DateAndTime";
export const createSubCategory = async ({
  subCategoryName,
  category,
  mediaUrl,
  mediaId,
  createdBy,
  createdAt,
}: {
  subCategoryName: { ar: string; en: string };
  category: Types.ObjectId | string;
  mediaUrl: string;
  mediaId: string;
  createdBy: Types.ObjectId;
  createdAt: number;
}) => {
  const SubCategory = await SubCategoryModel.create({
    subCategoryName,
    category,
    isNewArrival: true,
    image: {
      mediaUrl,
      mediaId,
    },
    createdBy,
    createdAt,
  });
  return SubCategory;
};
export const findSubCategoryById = async (_id: string) => {
  const subCategory = await SubCategoryModel.findById(_id).populate("category").select("-isDeleted -__v");
  return subCategory;
};
export const prepareSubCategoryUpdates = async (
  subCategory: ISubCategory,
  subCategoryName?: { ar?: string; en?: string },
  category?: Types.ObjectId | string,
  imageUrl?: string,
  isNewArrival?: boolean
) => {
  let updated = false;
  if (category && category.toString() !== subCategory.category.toString()) {
    subCategory.category = category;
    updated = true;
  }
  if (subCategoryName && (subCategoryName.ar || subCategoryName.en)) {
    subCategory.subCategoryName = {
      ar: subCategoryName.ar ?? subCategory.subCategoryName.ar,
      en: subCategoryName.en ?? subCategory.subCategoryName.en,
    };
    updated = true;
  }
    if (typeof isNewArrival === "boolean" && isNewArrival !== subCategory.isNewArrival) {
    subCategory.isNewArrival = isNewArrival;
    subCategory.createdAt = moment().valueOf();
    updated = true;
    }
  if (imageUrl && imageUrl !== subCategory.image.mediaUrl) {
    const mediaId = extractMediaId(imageUrl);
    if (mediaId !== subCategory.image.mediaId) {
    subCategory.image.mediaUrl = imageUrl;
    subCategory.image.mediaId = mediaId;
    updated = true;
    }
  }
  return updated ? subCategory : null;
};
export const deleteSubCategory = async (_id: string) => {
  const subCategory = await SubCategoryModel.findByIdAndUpdate(_id , {isDeleted:true});
  return subCategory;
};
export const getAllSubCategories = async () => {
  const subCategories = await SubCategoryModel.find({isDeleted:false}).populate("category").select("-isDeleted -__v");
  return subCategories;
};
export const getNewArrivalSubCategories = async () => {
  const subCategories = await SubCategoryModel.find({ isDeleted: false, isNewArrival: true })
    .populate("category")
    .select("-isDeleted -__v");
  return subCategories;
}
