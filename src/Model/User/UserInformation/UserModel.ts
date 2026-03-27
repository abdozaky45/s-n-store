import { Types, Schema, model } from "mongoose";
import Iuser from "./Iuser";
import {
  EnumStringRequired,
  NotRequiredBoolean,
  NotRequiredString,
  RefType,
  RequiredDefaultStringCity,
  RequiredString,
} from "../../../Utils/Schemas";
import SchemaTypesReference from "../../../Utils/Schemas/SchemaTypesReference";
const userSchema = new Schema<Iuser>({
  country: RequiredDefaultStringCity,
  firstName: RequiredString,
  lastName: RequiredString,
  address: RequiredString,
  apartmentSuite: NotRequiredString,
  shipping: RefType(SchemaTypesReference.Shipping, true),
  postalCode: NotRequiredString,
  primaryPhone: { type: String, required: true, unique: true },
  secondaryPhone: NotRequiredString,
}, {_id: true});
const UserModel = model(SchemaTypesReference.UserInformation, userSchema);
export default UserModel;
