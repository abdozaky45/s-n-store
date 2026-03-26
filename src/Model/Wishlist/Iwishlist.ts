import { Types } from "mongoose";
export interface Iwishlist {
  user: string;
  product: Types.ObjectId | string;
  createdAt: number;
}
