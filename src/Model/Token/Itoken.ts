import { Types } from "mongoose";

export default interface Itoken {
  accessToken: string;
  userAgent: string;
  user: Types.ObjectId | string;
  ip: string;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt: Date;
}
