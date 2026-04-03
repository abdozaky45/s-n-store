"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAllProductsValidation = exports.getUserProductsValidation = exports.getAdminProductsValidation = exports.getProductByIdValidation = exports.ProductIdValidationSchema = exports.updateProductValidation = exports.createProductValidation = void 0;
const baseSchema_1 = require("../baseSchema");
const joi_1 = __importDefault(require("joi"));
exports.createProductValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required(),
    }).required(),
    description: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required(),
    }).required(),
    price: joi_1.default.number().required(),
    wholesalePrice: joi_1.default.number().optional(),
    salePrice: joi_1.default.number().optional(),
    saleStartDate: joi_1.default.number().optional(),
    saleEndDate: joi_1.default.number().optional(),
    category: joi_1.default.string().required(),
    subCategory: joi_1.default.string().optional(),
    defaultImage: joi_1.default.string().required(),
    variants: joi_1.default.array().items(joi_1.default.object({
        size: joi_1.default.string().default("one size"),
        color: joi_1.default.string().required(),
        quantity: joi_1.default.number().min(0).required(),
    })).optional(),
    albumImages: joi_1.default.array().items(joi_1.default.string()).optional(),
    sizeChartImage: joi_1.default.string().optional(),
}).required());
exports.updateProductValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    productId: joi_1.default.string().required(),
    name: joi_1.default.object({
        ar: joi_1.default.string().optional(),
        en: joi_1.default.string().optional(),
    }).optional(),
    description: joi_1.default.object({
        ar: joi_1.default.string().optional(),
        en: joi_1.default.string().optional(),
    }).optional(),
    price: joi_1.default.number().optional(),
    wholesalePrice: joi_1.default.number().optional(),
    salePrice: joi_1.default.number().optional(),
    saleStartDate: joi_1.default.number().optional(),
    saleEndDate: joi_1.default.number().optional(),
    category: joi_1.default.string().optional(),
    subCategory: joi_1.default.string().optional(),
    defaultImage: joi_1.default.string().optional(),
    albumImages: joi_1.default.array().items(joi_1.default.string()).optional(),
    sizeChartImage: joi_1.default.string().optional(),
    isBestSeller: joi_1.default.boolean().optional(),
    isNewArrival: joi_1.default.boolean().optional(),
}).required());
exports.ProductIdValidationSchema = baseSchema_1.baseSchema.concat(joi_1.default.object({
    productId: joi_1.default.string().required(),
}).required());
exports.getProductByIdValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    productId: joi_1.default.string().required(),
}).required());
exports.getAdminProductsValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    category: joi_1.default.string().optional(),
    subCategory: joi_1.default.string().optional(),
    isSale: joi_1.default.boolean().optional(),
    isNewArrival: joi_1.default.boolean().optional(),
    isBestSeller: joi_1.default.boolean().optional(),
    isSoldOut: joi_1.default.boolean().optional(),
    isDeleted: joi_1.default.boolean().optional(),
    page: joi_1.default.number().optional(),
}));
exports.getUserProductsValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    page: joi_1.default.string().required(),
}).required());
exports.getUserAllProductsValidation = joi_1.default.object({
    category: joi_1.default.string().optional(),
    subCategory: joi_1.default.string().optional(),
    size: joi_1.default.string().optional(),
    isSale: joi_1.default.boolean().optional(),
    isNewArrival: joi_1.default.boolean().optional(),
    isBestSeller: joi_1.default.boolean().optional(),
    sort: joi_1.default.string().optional(),
    page: joi_1.default.string().required(),
}).required();
