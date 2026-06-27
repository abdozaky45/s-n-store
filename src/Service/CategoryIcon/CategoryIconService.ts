import CategoryIconModel from "../../Model/CategoryIcon/CategoryIconModel";
import ICategoryIcon from "../../Model/CategoryIcon/ICategoryIcon";
import { getOrSet, invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

// Icons are populated into the cached categories list (image_svg -> key/svg),
// so an icon write must also drop the category cache to avoid stale icons.
const bustCategoryIcons = async () => {
  await invalidatePattern(CacheKeys.categoryIconsPattern);
  await invalidatePattern(CacheKeys.categoriesPattern);
};

export const createCategoryIcon = async (data: ICategoryIcon) => {
  const icon = await CategoryIconModel.create(data);
  await bustCategoryIcons();
  return icon;
};

export const getAllCategoryIcons = async () => {
  return getOrSet(
    CacheKeys.categoryIconsAll,
    () => CategoryIconModel.find().sort({ createdAt: -1 }).select("-__v"),
    3600 // 60 min
  );
};

export const getActiveCategoryIcons = async () => {
  return getOrSet(
    CacheKeys.categoryIconsActive,
    () => CategoryIconModel.find({ isActive: true }).sort({ createdAt: -1 }).select("-__v"),
    3600 // 60 min
  );
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
  const icon = await CategoryIconModel.findOneAndUpdate({ key }, updates, { new: true }).select("-__v");
  await bustCategoryIcons();
  return icon;
};

export const deleteCategoryIconByKey = async (key: string) => {
  const icon = await CategoryIconModel.findOneAndDelete({ key });
  await bustCategoryIcons();
  return icon;
};

export const categoryIconKeyExists = async (key: string) => {
  return CategoryIconModel.exists({ key });
};
