"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllImageSlider = exports.deleteImageSlider = exports.findMediaId = exports.updateHeroSection = exports.createImageSlider = void 0;
const ImageSliderModel_1 = __importDefault(require("../../Model/ImageSlider/ImageSliderModel"));
const createImageSlider = async (imageSliderData) => {
    const imageSlider = await ImageSliderModel_1.default.create(imageSliderData);
    return imageSlider;
};
exports.createImageSlider = createImageSlider;
const updateHeroSection = async (imageSliderData, id) => {
    const updatedHeroSection = await ImageSliderModel_1.default.findByIdAndUpdate(id, imageSliderData, { new: true, runValidators: true });
    return updatedHeroSection;
};
exports.updateHeroSection = updateHeroSection;
const findMediaId = async (_id) => {
    const imageSlider = await ImageSliderModel_1.default.findById(_id);
    return imageSlider;
};
exports.findMediaId = findMediaId;
const deleteImageSlider = async (_id) => {
    const imageSlider = await ImageSliderModel_1.default.deleteOne({ _id });
    return imageSlider;
};
exports.deleteImageSlider = deleteImageSlider;
const getAllImageSlider = async () => {
    const imageSlider = await ImageSliderModel_1.default.find();
    return imageSlider;
};
exports.getAllImageSlider = getAllImageSlider;
