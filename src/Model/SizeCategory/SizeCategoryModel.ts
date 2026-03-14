import { Schema, model } from 'mongoose';
import ISizeCategory from './ISizeCategoryModel';
import { RequiredNumber, RequiredString } from '../../Utils/Schemas';
import SchemaTypesReference from '../../Utils/Schemas/SchemaTypesReference';
const SizeCategorySchema = new Schema<ISizeCategory>({
    sizeCategory: RequiredString,
    size: RequiredString,
    order: RequiredNumber
});
SizeCategorySchema.index({ size: 1, sizeCategory: 1 }, { unique: true });
const SizeCategoryModel = model(SchemaTypesReference.SizeCategory, SizeCategorySchema);
export default SizeCategoryModel;