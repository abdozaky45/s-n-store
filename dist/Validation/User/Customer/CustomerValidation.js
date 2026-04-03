"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCustomerByIdValidation = exports.updateCustomerValidation = exports.addCustomerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addCustomerValidation = joi_1.default
    .object({
    phone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).required(),
})
    .required();
exports.updateCustomerValidation = joi_1.default
    .object({
    _id: joi_1.default.string().required(),
    phone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).optional(),
})
    .required();
exports.findCustomerByIdValidation = joi_1.default
    .object({
    _id: joi_1.default.string().required(),
})
    .required();
