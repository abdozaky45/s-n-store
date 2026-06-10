import {Schema, model } from "mongoose";
import ICustomerInfo from "./ICustomerInfoModel";
import {
  NotRequiredEmail,
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
  email:NotRequiredEmail,
  // Soft delete: hard-deleting breaks populate on orders that reference this
  // address, so deletes only flag the doc and listings filter it out.
  isDeleted: { type: Boolean, default: false },
  // Immutable per-order copy created at checkout so the order keeps the
  // address as it was; hidden from the customer's address list.
  isOrderSnapshot: { type: Boolean, default: false },
}, {_id: true});
const CustomerInfoModel = model(SchemaTypesReference.CustomerInfo, customerInfoSchema);
export default CustomerInfoModel;
