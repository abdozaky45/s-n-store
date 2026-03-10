import { Types } from "mongoose";

export default interface Itoken {
  accessToken: string;
  userAgent: string;
  user: Types.ObjectId | string;
  createdAt: Date;
  expiresAt: Date;
}
