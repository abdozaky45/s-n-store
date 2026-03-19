import { Schema, model } from "mongoose";
import { RefType, RequiredNumber, RequiredString } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import IVariant from "./IVariantModel";
const VariantSchema = new Schema<IVariant>({
  product: RefType(SchemaTypesReference.Product, true),
  size: RequiredString,
  color: RefType(SchemaTypesReference.Color, true),
  quantity: RequiredNumber,
});
VariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
const VariantModel = model(SchemaTypesReference.Variant, VariantSchema);
export default VariantModel;