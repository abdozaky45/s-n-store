import { Schema, model } from "mongoose";
import Itoken from "./Itoken";
import {
  createdAtTokenModel,
  expiresAtTokenModel,
  NotRequiredString,
  RefType,
  RequiredString,
} from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
const TokenSchema = new Schema<Itoken>({
  accessToken: RequiredString,
  user: RefType(SchemaTypesReference.User, true),
  userAgent: RequiredString,
  ip: NotRequiredString,
  lastUsedAt: { type: Date, default: () => new Date() },
  createdAt: createdAtTokenModel,
  expiresAt: expiresAtTokenModel,
});
const TokenModel = model(SchemaTypesReference.Token, TokenSchema);
export default TokenModel;
