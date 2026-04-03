"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemaForCategoryId = exports.updateCategoryValidation = exports.createCategoryValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.createCategoryValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required()
    }).required(),
    group: joi_1.default.string().required(),
    imageUrl: joi_1.default.string().required(),
}).required());
exports.updateCategoryValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
    name: joi_1.default.object({
        ar: joi_1.default.string().optional(),
        en: joi_1.default.string().optional(),
    }).optional(),
    group: joi_1.default.string().optional(),
    imageUrl: joi_1.default.string().optional(),
    isNewArrival: joi_1.default.boolean().optional(),
}).required());
exports.validationSchemaForCategoryId = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
}).required());
