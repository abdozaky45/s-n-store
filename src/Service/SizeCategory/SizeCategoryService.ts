import GroupSizeModel from "../../Model/GroupSize/GroupSize";
import ISizeCategory from "../../Model/SizeCategory/ISizeCategoryModel";
import SizeCategoryModel from "../../Model/SizeCategory/SizeCategoryModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import { getOrSet, invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

// A group's name is populated into the cached categories list, so a group-size
// write must also drop the category cache.
const bustGroupSizes = async () => {
    await invalidatePattern(CacheKeys.sizesPattern);
    await invalidatePattern(CacheKeys.categoriesPattern);
};
// Plain size categories are not embedded in any other cached list.
const bustSizeCategories = () => invalidatePattern(CacheKeys.sizesPattern);

export const createGroupSize = async (name: string) => {
    const groupSize = await GroupSizeModel.create({ name });
    await bustGroupSizes();
    return groupSize;
}
export const getGroupSizeById = async (_id: string | Types.ObjectId) => {
    const groupSize = await GroupSizeModel.findById(_id).select("-__v");
    return groupSize;
}
export const getAllGroupSizes = async () => {
    return getOrSet(
        CacheKeys.sizeGroupsAll,
        () => GroupSizeModel.find().sort({ createdAt: -1 }).select("-__v"),
        3600 // 60 min
    );
}
export const updateGroupSize = async (_id: string, name: string) => {
    const groupSize = await GroupSizeModel.findByIdAndUpdate(_id, { name }, { new: true }).select("-__v");
    await bustGroupSizes();
    return groupSize;
}
export const createSizeCategory = async (sizeCategoryData: ISizeCategory) => {
    const sizeCategory = await SizeCategoryModel.create(sizeCategoryData);
    await bustSizeCategories();
    return sizeCategory;
}
export const getSizeCategoryById = async (_id: string) => {
    const sizeCategory = await SizeCategoryModel.findById(_id).select("-__v");
    return sizeCategory;
}
export const getSizeCategoriesByGroupId = async (groupId: string) => {
    const sizeCategories = await SizeCategoryModel.find({ groupSize: groupId }).sort({ order: 1 }).select("-__v");
    return sizeCategories;
}
export const getAllSizeCategories = async () => {
    return getOrSet(
        CacheKeys.sizeCategoriesAll,
        () => SizeCategoryModel.find().sort({ order: 1 }).select("-__v"),
        3600 // 60 min
    );
}
export const updateSizeCategory = async (_id: string, sizeCategoryData: Partial<ISizeCategory>) => {
    const sizeCategory = await SizeCategoryModel.findByIdAndUpdate(_id, sizeCategoryData, { new: true })
        .select("-__v")
        .populate(SchemaTypesReference.GroupSize, "-_id name");
    await bustSizeCategories();
    return sizeCategory;
}
export const deleteSizeCategory = async (_id: string) => {
    const sizeCategory = await SizeCategoryModel.findByIdAndDelete(_id);
    await bustSizeCategories();
    return sizeCategory;
}
