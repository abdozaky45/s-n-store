import { Types } from "mongoose";
export default interface ISizeCategory {
    groupSize: Types.ObjectId | string;
    size:string;
    order: number;
}