import GroupSizeModel from "../../Model/GroupSize/GroupSize";
import ISizeCategory from "../../Model/SizeCategory/ISizeCategoryModel";
import SizeCategoryModel from "../../Model/SizeCategory/SizeCategoryModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
export const createGroupSize = async (name: string) => {
    const groupSize = await GroupSizeModel.create({ name });
    return groupSize;
}
export const findGroupSizeById = async (_id: string | Types.ObjectId) => {
    const groupSize = await GroupSizeModel.findById(_id).select("-__v");
    return groupSize;
}
export const findAllGroupSizes = async () => {
    const groupSizes = await GroupSizeModel.find().select("-__v");
    return groupSizes;
}
export const updateGroupSize = async (_id: string, name: string) => {
    const groupSize = await GroupSizeModel.findByIdAndUpdate(_id, { name }, { new: true }).select("-__v");
    return groupSize;
}
export const createSizeCategory = async (sizeCategoryData: ISizeCategory) => {
    const sizeCategory = await SizeCategoryModel.create(sizeCategoryData);
    return sizeCategory;
}
export const findSizeCategoryById = async (_id: string) => {
    const sizeCategory = await SizeCategoryModel.findById(_id).select("-__v");
    return sizeCategory;
}
export const findSizeCategoriesByGroupId = async (groupId: string) => {
    const sizeCategories = await SizeCategoryModel.find({ groupSize: groupId }).select("-__v");
    return sizeCategories;
}
export const findAllSizeCategories = async () => {
    const sizeCategories = await SizeCategoryModel.find().select("-__v");
    return sizeCategories;
}
export const updateSizeCategory = async (_id: string, sizeCategoryData: Partial<ISizeCategory>) => {
    const sizeCategory = await SizeCategoryModel.findByIdAndUpdate(_id, sizeCategoryData, { new: true })
        .select("-__v")
        .populate(SchemaTypesReference.GroupSize, "-_id name");
    return sizeCategory;
}
export const deleteSizeCategory = async (_id: string) => {
    const sizeCategory = await SizeCategoryModel.findByIdAndDelete(_id);
    return sizeCategory;
}