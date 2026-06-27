import ColorModel from "../../Model/Color/ColorModel";
import IColor from "../../Model/Color/IColorModel";
import { getOrSet, invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

// A color's name/hex is embedded in every product's populated variants, so a
// color write must also drop the product caches — otherwise a renamed color
// would stay stale inside cached product listings until their TTL.
const bustColors = async () => {
  await invalidatePattern(CacheKeys.colorsPattern);
  await invalidatePattern(CacheKeys.productsPattern);
};

export const createColor = async (colorData: IColor) => {
  const color = await ColorModel.create(colorData);
  await bustColors();
  return color;
};
export const updateColor = async (_id: string, colorData: Partial<IColor>) => {
  const color = await ColorModel.findByIdAndUpdate(_id, colorData, { new: true }).select("-__v");
  await bustColors();
  return color;
};
export const getColorById = async (_id: string) => {
  const color = await ColorModel.findById(_id).select("-__v");
  return color;
};

export const getAllColors = async () => {
  // Ascending so colors display in insertion order (basics first, then the rest).
  return getOrSet(
    CacheKeys.colorsAll,
    () => ColorModel.find().sort({ createdAt: 1 }).select("-__v"),
    3600 // 60 min
  );
};

export const deleteColor = async (_id: string) => {
  const color = await ColorModel.findByIdAndDelete(_id);
  await bustColors();
  return color;
};
