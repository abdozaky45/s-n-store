import IImageSlider from "../../Model/ImageSlider/IImageSliderModel";
import ImageSliderModel from "../../Model/ImageSlider/ImageSliderModel";
import { Types } from "mongoose";
export const createImageSlider = async (imageSliderData: IImageSlider) => {
    const imageSlider = await ImageSliderModel.create(imageSliderData);
    return imageSlider;
}
export const updateImageSlider = async (imageSliderData: Partial<IImageSlider>, id: Types.ObjectId | string) => {
    const updatedHeroSection = await ImageSliderModel.findByIdAndUpdate(
        id,
        imageSliderData,
        { new: true, runValidators: true }
    );
    return updatedHeroSection;
}
export const getImageSliderById = async (_id: string) => {
    const imageSlider = await ImageSliderModel.findById(_id);
    return imageSlider;
}
export const deleteImageSlider = async (_id: string) => {
    const imageSlider = await ImageSliderModel.deleteOne({ _id });
    return imageSlider;
}
export const getAllImageSliders = async () => {
    const imageSlider = await ImageSliderModel.find();
    return imageSlider;
}   