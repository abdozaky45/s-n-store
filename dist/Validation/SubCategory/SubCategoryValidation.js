"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subCategoryIdValidationSchema = exports.updateSubCategoryValidation = exports.subCategoryValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.subCategoryValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required()
    }).required(),
    groupSize: joi_1.default.string().required(),
    category: joi_1.default.string().required(),
    imageUrl: joi_1.default.string().required(),
}).required());
exports.updateSubCategoryValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
    name: joi_1.default.object({
        ar: joi_1.default.string().optional(),
        en: joi_1.default.string().optional()
    }).optional(),
    groupSize: joi_1.default.string().optional(),
    category: joi_1.default.string().optional(),
    isNewArrival: joi_1.default.boolean().optional(),
    imageUrl: joi_1.default.string().optional(),
}).required());
exports.subCategoryIdValidationSchema = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
}).required());
