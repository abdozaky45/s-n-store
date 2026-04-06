import {Schema, model } from "mongoose";
import ICustomer from "./ICustomerModel";
import { RequiredUniqueString } from "../../../Utils/Schemas";
import SchemaTypesReference from "../../../Utils/Schemas/SchemaTypesReference";
const customerSchema = new Schema<ICustomer>({
    phone:RequiredUniqueString
}, {id: false});
const CustomerModel = model(SchemaTypesReference.Customer, customerSchema);
export default CustomerModel;