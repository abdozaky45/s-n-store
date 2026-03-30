import { Types } from "mongoose";

export default interface IVariant {
  product: Types.ObjectId | string;
  size: string;
  color: Types.ObjectId | string;
  quantity: number;
}