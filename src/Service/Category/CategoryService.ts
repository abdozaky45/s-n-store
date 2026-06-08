import CategoryModel from "../../Model/Category/CategoryModel";
import mongoose, { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import ProductModel from "../../Model/Product/ProductModel";
import VariantModel from "../../Model/Variant/VariantModel";
import { collectProductMediaIds, deleteMediaByIds } from "../../Controller/Aws/AwsController";
import ICategory from "../../Model/Category/Icategory";
import { extractMediaId } from "../../Shared/MediaServiceShared";
export const createCategory = async ({
  name,
  groupSize,
  mediaUrl,
  mediaId,
  iconId,
  order,
  createdBy,
}: {
  name: { ar: string; en: string };
  groupSize: string | Types.ObjectId;
  mediaUrl: string;
  mediaId: string;
  iconId?: string;
  order?: number;
  createdBy: Types.ObjectId;
}) => {
  const category = await CategoryModel.create({
    name,
    groupSize,
    image: { mediaUrl, mediaId },
    ...(iconId ? { image_svg: iconId } : {}),
    ...(order !== undefined ? { order } : {}),
    createdBy,
  });
  return category;
};
export const getCategoryById = async (_id: string) => {
  const category = await CategoryModel.findById(_id)
    .select("-__v")
    .populate(SchemaTypesReference.SubCategory)
    .populate({
      path: SchemaTypesReference.SizeCategory,
      select: 'size order -_id',
    })
    .populate({
      path: 'image_svg',
      select: 'key svg -_id',
    });
  return category;
};

export const getCategoryByIdUser = async (_id: string) => {
  const category = await CategoryModel.findById(_id)
    .select("-__v -image_svg")
    .populate(SchemaTypesReference.SubCategory)
    .populate({
      path: SchemaTypesReference.SizeCategory,
      select: 'size order -_id',
    });
  return category;
};

export const prepareCategoryUpdates = async (
  category: ICategory&{_id: Types.ObjectId},
  groupSize?: string | Types.ObjectId,
  name?: { ar?: string; en?: string },
  imageUrl?: string,
  iconId?: string,
  order?: number,
) => {
  let updated = false;
  if (name && (name.ar || name.en)) {
    category.name = {
      ar: name.ar ?? category.name.ar,
      en: name.en ?? category.name.en,
    };
    updated = true;
  }
  if (groupSize && groupSize.toString() !== category.groupSize.toString()) {
    category.groupSize = groupSize;
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
  if (iconId && iconId !== category.image_svg?.toString()) {
    category.image_svg = iconId;
    updated = true;
  }
  if (order !== undefined && order !== category.order) {
    category.order = order;
    updated = true;
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
export const restoreCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await CategoryModel.findByIdAndUpdate(_id, { isDeleted: false }, { session });
    await SubCategoryModel.updateMany(
      { category: _id },
      { isDeleted: false },
      { session }
    );
    await ProductModel.updateMany(
      { category: _id },
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
export const getAllCategories = async () => {
  const categories =
    await CategoryModel.find({ isDeleted: false })
      .sort({ order: 1, createdAt: -1 })
      .select("name image image_svg groupSize order")
      .populate({
        path: SchemaTypesReference.SubCategory,
        select: "name image -category",
      })
      .populate({
        path: SchemaTypesReference.GroupSize,
        select: 'name',
      })
      .populate({
        path: 'image_svg',
        select: 'key svg',
      });
  return categories;
};
export const getDeletedCategoryList = async () => {
  const categories = await CategoryModel.find({ isDeleted: true }).sort({ createdAt: -1 }).populate(SchemaTypesReference.SubCategory).select("-isDeleted -__v");
  return categories;
};
export const hardDeleteCategory = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const mediaIds: string[] = [];
  try {
    const products = await ProductModel.find({ category: _id }).select("_id defaultImage albumImages sizeChartImage");
    const subCategories = await SubCategoryModel.find({ category: _id }).select("_id image");
    const category = await CategoryModel.findById(_id).select("image");
    // Collect S3 keys now; they're deleted only AFTER the DB commit below.
    if (category?.image?.mediaId) mediaIds.push(category.image.mediaId);
    for (const sub of subCategories) {
      if (sub.image?.mediaId) mediaIds.push(sub.image.mediaId);
    }
    for (const product of products) {
      mediaIds.push(...collectProductMediaIds(product));
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
  // DB is committed; remove the S3 media best-effort (orphans are swept later).
  await deleteMediaByIds(mediaIds);
};