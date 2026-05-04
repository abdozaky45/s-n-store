import CategoryIconModel from "../../Model/CategoryIcon/CategoryIconModel";
import ICategoryIcon from "../../Model/CategoryIcon/ICategoryIcon";

export const createCategoryIcon = async (data: ICategoryIcon) => {
  const icon = await CategoryIconModel.create(data);
  return icon;
};

export const getAllCategoryIcons = async () => {
  return CategoryIconModel.find().select("-__v");
};

export const getActiveCategoryIcons = async () => {
  return CategoryIconModel.find({ isActive: true }).select("-__v");
};

export const getCategoryIconByKey = async (key: string) => {
  return CategoryIconModel.findOne({ key }).select("-__v");
};

export const getActiveCategoryIconByKey = async (key: string) => {
  return CategoryIconModel.findOne({ key, isActive: true }).select("-__v");
};

export const updateCategoryIconByKey = async (
  key: string,
  updates: Partial<Pick<ICategoryIcon, "svg" | "isActive">>
) => {
  return CategoryIconModel.findOneAndUpdate({ key }, updates, { new: true }).select("-__v");
};

export const deleteCategoryIconByKey = async (key: string) => {
  return CategoryIconModel.findOneAndDelete({ key });
};

export const categoryIconKeyExists = async (key: string) => {
  return CategoryIconModel.exists({ key });
};
