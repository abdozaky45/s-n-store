import IImageSlider from "../../Model/ImageSlider/IImageSliderModel";
import ImageSliderModel from "../../Model/ImageSlider/ImageSliderModel";
import { Types } from "mongoose";
import { getOrSet, invalidatePattern, CacheKeys } from "../../Utils/Cache/cache";

// Drop the cached slider list immediately after any write so the next read
// rebuilds it from the DB — no stale banners are ever served.
const bustSlider = () => invalidatePattern(CacheKeys.sliderPattern);

export const createImageSlider = async (imageSliderData: IImageSlider) => {
    const imageSlider = await ImageSliderModel.create(imageSliderData);
    await bustSlider();
    return imageSlider;
}
export const updateImageSlider = async (imageSliderData: Partial<IImageSlider>, id: Types.ObjectId | string) => {
    const updatedHeroSection = await ImageSliderModel.findByIdAndUpdate(
        id,
        imageSliderData,
        { new: true, runValidators: true }
    );
    await bustSlider();
    return updatedHeroSection;
}
export const getImageSliderById = async (_id: string) => {
    const imageSlider = await ImageSliderModel.findById(_id);
    return imageSlider;
}
export const deleteImageSlider = async (_id: string) => {
    const imageSlider = await ImageSliderModel.deleteOne({ _id });
    await bustSlider();
    return imageSlider;
}
export const getAllImageSliders = async () => {
    return getOrSet(
        CacheKeys.sliderAll,
        () => ImageSliderModel.find().sort({ createdAt: -1 }),
        1800 // 30 min
    );
}
