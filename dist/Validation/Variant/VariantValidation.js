"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantsByProductValidation = exports.variantIdValidation = exports.updateVariantQuantityValidation = exports.createVariantValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.createVariantValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    productId: joi_1.default.string().required(),
    size: joi_1.default.string().required(),
    color: joi_1.default.string().required(),
    quantity: joi_1.default.number().min(0).required(),
}).required());
exports.updateVariantQuantityValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    quantity: joi_1.default.number().min(0).required(),
    productId: joi_1.default.string().required(),
}).required());
exports.variantIdValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    variantId: joi_1.default.string().required(),
}).required());
exports.getVariantsByProductValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    productId: joi_1.default.string().required(),
}).required());
