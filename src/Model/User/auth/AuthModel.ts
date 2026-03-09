import { model, Schema } from "mongoose";
import {
  EnumStringRole,
  NotRequiredString,
  NotRequiredTimeStamp,
  NotRequiredUniqueEmail,
} from "../../../Utils/Schemas";
import { userType } from "../../../Utils/UserType";
import SchemaTypesReference from "../../../Utils/Schemas/SchemaTypesReference";
import IUserAuthentication from "./IUserAuthentication";
const userSchema = new Schema<IUserAuthentication>({
  email: NotRequiredUniqueEmail,
  activeCode:NotRequiredString,
  role: EnumStringRole(userType),
  codeCreatedAt: NotRequiredTimeStamp,
});
const AuthModel = model(SchemaTypesReference.User, userSchema);
export default AuthModel;
