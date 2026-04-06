import mongoose, { Types } from "mongoose";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import ISubCategory from "../../Model/SubCategory/ISubcategory";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import ProductModel from "../../Model/Product/ProductModel";
import VariantModel from "../../Model/Variant/VariantModel";
import { deleteImage, deleteProductImages } from "../../Controller/Aws/AwsController";
import { extractMediaId } from "../../Shared/MediaServiceShared";
export const createSubCategory = async ({
  name,
  groupSize,
  category,
  mediaUrl,
  mediaId,
  createdBy,
}: {
  name: { ar: string; en: string };
  groupSize: string | Types.ObjectId;
  category: Types.ObjectId | string;
  mediaUrl: string;
  mediaId: string;
  createdBy: Types.ObjectId;
}) => {
  const SubCategory = await SubCategoryModel.create({
    name,
    groupSize,
    category,
    image: {
      mediaUrl,
      mediaId,
    },
    createdBy,
  });
  return SubCategory;
};
export const getSubCategoryById = async (_id: string) => {
  return SubCategoryModel.findById(_id)
    .populate(SchemaTypesReference.Category)
    .populate({
      path: SchemaTypesReference.SizeCategory,
      select: 'size order -_id',
    })
    .select('-__v');
};
export const prepareSubCategoryUpdates = async (
  subCategory: ISubCategory,
  groupSize?: string | Types.ObjectId,
  name?: { ar?: string; en?: string },
  category?: Types.ObjectId | string,
  imageUrl?: string,
) => {
  let updated = false;
  if (category && category.toString() !== subCategory.category.toString()) {
    subCategory.category = category;
    updated = true;
  }
  if (groupSize && groupSize.toString() !== subCategory.groupSize.toString()) {
    subCategory.groupSize = groupSize;
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
export const softDeleteSubCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await SubCategoryModel.findByIdAndUpdate(_id, { isDeleted: true }, { session });
    await ProductModel.updateMany(
      { subCategory: _id },
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
export const getAllSubCategories = async () => {
  const subCategories = await SubCategoryModel.find({ isDeleted: false })
  .select("-isDeleted -__v")
  .populate({
    path: SchemaTypesReference.Category,
    select: "name image",
  });
  return subCategories;
};
export const findAllDeletedSubCategories = async () => {
  const subCategories = await SubCategoryModel.find({ isDeleted: true }).populate(SchemaTypesReference.Category).select("-isDeleted -__v");
  return subCategories;
}
export const restoreSubCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await SubCategoryModel.findByIdAndUpdate(_id, { isDeleted: false }, { session });
    await ProductModel.updateMany(
      { subCategory: _id },
      { isDeleted: false },
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
export const hardDeleteSubCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const products = await ProductModel.find({ subCategory: _id })
      .select("_id defaultImage albumImages sizeChartImage");
    const subCategory = await SubCategoryModel.findById(_id).select("image");
    if (subCategory?.image?.mediaId) {
      await deleteImage(subCategory.image.mediaId);
    }
    for (const product of products) {
      await deleteProductImages(product);
    }
    const productIds = products.map((p) => p._id);
    await VariantModel.deleteMany({ product: { $in: productIds } }, { session });
    await ProductModel.deleteMany({ subCategory: _id }, { session });
    await SubCategoryModel.findByIdAndDelete(_id, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
