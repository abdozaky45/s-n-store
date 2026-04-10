import {Schema, model } from "mongoose";
import ICustomerInfo from "./ICustomerInfoModel";
import {
  NotRequiredString,
  NotRequiredUniqueEmail,
  RefType,
  RequiredDefaultStringCity,
  RequiredString,
} from "../../../Utils/Schemas";
import SchemaTypesReference from "../../../Utils/Schemas/SchemaTypesReference";
const customerInfoSchema = new Schema<ICustomerInfo>({
  customer: RefType(SchemaTypesReference.Customer, true),
  country: RequiredDefaultStringCity,
  firstName: RequiredString,
  lastName: RequiredString,
  address: RequiredString,
  apartmentSuite: NotRequiredString,
  shipping: RefType(SchemaTypesReference.Shipping, true),
  postalCode: NotRequiredString,
  additionalPhone: NotRequiredString,
  email:NotRequiredUniqueEmail
}, {_id: true});
const CustomerInfoModel = model(SchemaTypesReference.CustomerInfo, customerInfoSchema);
export default CustomerInfoModel;
