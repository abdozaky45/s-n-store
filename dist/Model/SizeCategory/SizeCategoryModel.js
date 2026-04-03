"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const SizeCategorySchema = new mongoose_1.Schema({
    groupSize: (0, Schemas_1.RefType)(SchemaTypesReference_1.default.GroupSize, true),
    size: Schemas_1.RequiredString,
    order: Schemas_1.RequiredNumber
});
SizeCategorySchema.index({ groupSize: 1, size: 1, order: 1 }, { unique: true });
const SizeCategoryModel = (0, mongoose_1.model)(SchemaTypesReference_1.default.SizeCategory, SizeCategorySchema);
exports.default = SizeCategoryModel;
