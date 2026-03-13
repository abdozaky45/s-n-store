import ISizeCategory from "../../Model/SizeCategory/ISizeCategoryModel";
import SizeCategoryModel from "../../Model/SizeCategory/SizeCategoryModel";
export const CreateSizeCategory = async (sizeCategoryData: ISizeCategory) => {
    const sizeCategory = await SizeCategoryModel.create(sizeCategoryData);
    return sizeCategory;
}
export const findSizeCategoryById = async (_id: string) => {
    const sizeCategory = await SizeCategoryModel.findById(_id).select("-__v");
    return sizeCategory;
}
export const findAllSizeCategories = async () => {
    const sizeCategories = await SizeCategoryModel.find().select("-__v");
    return sizeCategories;
}
export const updateSizeCategory = async (_id: string, sizeCategoryData: Partial<ISizeCategory>) => {
    const sizeCategory = await SizeCategoryModel.findByIdAndUpdate(_id, sizeCategoryData, { new: true }).select("-__v");
    return sizeCategory;
}
export const deleteSizeCategory = async (_id: string) => {
    const sizeCategory = await SizeCategoryModel.findByIdAndDelete(_id);
    return sizeCategory;
}