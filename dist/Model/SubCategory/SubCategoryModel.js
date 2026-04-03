"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const SubCategorySchema = new mongoose_1.Schema({
    name: {
        ar: Schemas_1.RequiredString,
        en: Schemas_1.RequiredString,
    },
    groupSize: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.GroupSize, true),
    category: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.Category, true),
    image: Schemas_1.ImageSchema,
    createdBy: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.User, true),
    isDeleted: Schemas_1.NotRequiredBoolean
}, {
    id: false
});
SubCategorySchema.virtual(SchemaTypesReference_1.default.SizeCategory, {
    ref: SchemaTypesReference_1.default.SizeCategory,
    localField: SchemaTypesReference_1.default.GroupSize,
    foreignField: SchemaTypesReference_1.default.GroupSize,
    options: { sort: { order: 1 } },
});
const SubCategoryModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.SubCategory, SubCategorySchema);
exports.default = SubCategoryModel;
