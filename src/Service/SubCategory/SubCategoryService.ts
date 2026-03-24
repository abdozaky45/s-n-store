import { Types } from "mongoose";
import { extractMediaId } from "../Category/CategoryService";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import ISubCategory from "../../Model/SubCategory/ISubcategory";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
export const createSubCategory = async ({
  name,
  category,
  mediaUrl,
  mediaId,
  createdBy,
}: {
  name: { ar: string; en: string };
  category: Types.ObjectId | string;
  mediaUrl: string;
  mediaId: string;
  createdBy: Types.ObjectId;
}) => {
  const SubCategory = await SubCategoryModel.create({
    name,
    category,
    image: {
      mediaUrl,
      mediaId,
    },
    createdBy,
  });
  return SubCategory;
};
export const findSubCategoryById = async (_id: string) => {
  const subCategory = await SubCategoryModel.findById(_id).populate(SchemaTypesReference.Category).select("-isDeleted -__v");
  return subCategory;
};
export const prepareSubCategoryUpdates = async (
  subCategory: ISubCategory,
  name?: { ar?: string; en?: string },
  category?: Types.ObjectId | string,
  imageUrl?: string,
) => {
  let updated = false;
  if (category && category.toString() !== subCategory.category.toString()) {
    subCategory.category = category;
    updated = true;
  }
  if (name && (name.ar || name.en)) {
    subCategory.name = {
      ar: name.ar ?? subCategory.name.ar,
      en: name.en ?? subCategory.name.en,
    };
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
  const subCategory = await SubCategoryModel.findByIdAndUpdate(_id, { isDeleted: true });
  return subCategory;
};
export const getAllSubCategories = async () => {
  const subCategories = await SubCategoryModel.find({ isDeleted: false }).populate(SchemaTypesReference.Category).select("-isDeleted -__v");
  return subCategories;
};
