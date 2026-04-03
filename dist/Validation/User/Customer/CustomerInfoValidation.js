"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerIdValidationSchema = exports.getCustomerInfoByCustomerId = exports.updateCustomerInfo = exports.addCustomerInfoValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addCustomerInfoValidation = joi_1.default
    .object({
    customer: joi_1.default.string().required(),
    firstName: joi_1.default.string().min(2).max(50).required(),
    lastName: joi_1.default.string().min(2).max(50).required(),
    address: joi_1.default.string().min(1).max(500).required(),
    apartmentSuite: joi_1.default.string().min(1).max(500).allow("").optional(),
    shipping: joi_1.default.string().required(),
    postalCode: joi_1.default.string().min(3).max(6).allow("").optional(),
    secondaryPhone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),
})
    .required();
exports.updateCustomerInfo = joi_1.default
    .object({
    _id: joi_1.default.string().required(),
    customer: joi_1.default.string().optional(),
    firstName: joi_1.default.string().min(2).max(50).optional(),
    lastName: joi_1.default.string().min(2).max(50).optional(),
    address: joi_1.default.string().min(1).max(500).optional(),
    apartmentSuite: joi_1.default.string().min(1).max(500).optional().allow(""),
    shipping: joi_1.default.string().optional(),
    postalCode: joi_1.default.string().min(3).max(6).optional().allow(""),
    secondaryPhone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),
})
    .required();
exports.getCustomerInfoByCustomerId = joi_1.default
    .object({
    customer: joi_1.default.string().required(),
})
    .required();
exports.customerIdValidationSchema = joi_1.default
    .object({
    _id: joi_1.default.string().required(),
})
    .required();
