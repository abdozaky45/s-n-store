"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteColor = exports.getAllColors = exports.findColorById = exports.updateColor = exports.createColor = void 0;
const ColorModel_1 = __importDefault(require("../../Model/Color/ColorModel"));
const createColor = async (colorData) => {
    const color = await ColorModel_1.default.create(colorData);
    return color;
};
exports.createColor = createColor;
const updateColor = async (_id, colorData) => {
    const color = await ColorModel_1.default.findByIdAndUpdate(_id, colorData, { new: true }).select("-__v");
    return color;
};
exports.updateColor = updateColor;
const findColorById = async (_id) => {
    const color = await ColorModel_1.default.findById(_id).select("-__v");
    return color;
};
exports.findColorById = findColorById;
const getAllColors = async () => {
    const colors = await ColorModel_1.default.find().select("-__v");
    return colors;
};
exports.getAllColors = getAllColors;
const deleteColor = async (_id) => {
    const color = await ColorModel_1.default.findByIdAndDelete(_id);
    return color;
};
exports.deleteColor = deleteColor;
