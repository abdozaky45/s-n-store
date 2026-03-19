import ColorModel from "../../Model/Color/ColorModel";
import IColor from "../../Model/Color/IColorModel";

export const createColor = async (colorData: IColor) => {
  const color = await ColorModel.create(colorData);
  return color;
};

export const findColorById = async (_id: string) => {
  const color = await ColorModel.findById(_id).select("-__v");
  return color;
};

export const getAllColors = async () => {
  const colors = await ColorModel.find().select("-__v");
  return colors;
};

export const deleteColor = async (_id: string) => {
  const color = await ColorModel.findByIdAndDelete(_id);
  return color;
};