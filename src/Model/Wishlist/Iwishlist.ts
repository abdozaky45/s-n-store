import { Types } from "mongoose";
export interface Iwishlist {
  customer: string | Types.ObjectId;
  product: Types.ObjectId | string;
  createdAt: number;
}
