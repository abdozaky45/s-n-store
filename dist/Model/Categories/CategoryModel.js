"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const CategorySchema = new mongoose_1.Schema({
    categoryName: {
        ar: Schemas_1.RequiredString,
        en: Schemas_1.RequiredString,
    },
    isNewArrival: Schemas_1.RequiredBooleanDefaultTrue,
    image: Schemas_1.ImageSchema,
    createdBy: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.User, true),
    createdAt: Schemas_1.RequiredNumber,
    isDeleted: Schemas_1.NotRequiredBoolean
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
CategorySchema.virtual(SchemaTypesReference_1.default.SubCategory, {
    ref: SchemaTypesReference_1.default.SubCategory,
    localField: "_id",
    foreignField: SchemaTypesReference_1.default.Category,
});
const CategoryModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.Category, CategorySchema);
exports.default = CategoryModel;
