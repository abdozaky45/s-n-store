"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUserValidation = exports.updateUser = exports.createUser = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../../baseSchema");
exports.createUser = baseSchema_1.baseSchema.concat(joi_1.default
    .object({
    firstName: joi_1.default.string().min(2).max(50).required(),
    lastName: joi_1.default.string().min(2).max(50).required(),
    address: joi_1.default.string().min(1).max(500).required(),
    apartmentSuite: joi_1.default.string().min(1).max(500).allow("").optional(),
    shipping: joi_1.default.string().required(),
    postalCode: joi_1.default.string().min(3).max(6).allow("").optional(),
    primaryPhone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).required(),
    secondaryPhone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),
})
    .required());
exports.updateUser = baseSchema_1.baseSchema.concat(joi_1.default
    .object({
    userId: joi_1.default.string().required(),
    firstName: joi_1.default.string().min(2).max(50).optional(),
    lastName: joi_1.default.string().min(2).max(50).optional(),
    address: joi_1.default.string().min(1).max(500).optional(),
    apartmentSuite: joi_1.default.string().min(1).max(500).optional().allow(""),
    shipping: joi_1.default.string().optional(),
    postalCode: joi_1.default.string().min(3).max(6).optional().allow(""),
    primaryPhone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).optional(),
    secondaryPhone: joi_1.default.string().pattern(/^(\+?2)?01[0-25]\d{8}$/).allow("").optional(),
})
    .required());
exports.CustomUserValidation = baseSchema_1.baseSchema.concat(joi_1.default
    .object({
    userId: joi_1.default.string().required(),
})
    .required());
