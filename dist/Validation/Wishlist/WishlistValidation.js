"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUSerWishlistValidation = exports.getWishlistByIdValidation = exports.wishlistValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.wishlistValidationSchema = joi_1.default.object({
    customer: joi_1.default.string().required(),
    productId: joi_1.default.string().required(),
}).required();
exports.getWishlistByIdValidation = joi_1.default.object({
    _id: joi_1.default.string().required(),
}).required();
exports.getAllUSerWishlistValidation = joi_1.default.object({
    customer: joi_1.default.string().required(),
}).required();
