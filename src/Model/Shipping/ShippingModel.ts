import { Schema, model } from "mongoose"
import { RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import IShipping from "./Ishipping";
const ShippingSchema = new Schema<IShipping>({
    name:{ar:RequiredString, en:RequiredString},
    cost: RequiredNumber,
});
const ShippingModel = model(SchemaTypesReference.Shipping, ShippingSchema)
export default ShippingModel;