"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeAccount = exports.AuthValidationEmail = void 0;
const joi_1 = __importDefault(require("joi"));
exports.AuthValidationEmail = joi_1.default.object({
    email: joi_1.default
        .string()
        .email({
        tlds: { allow: false },
    })
        .required()
        .messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
}).required();
exports.activeAccount = joi_1.default.object({
    email: joi_1.default
        .string()
        .email({
        tlds: { allow: false },
    })
        .required()
        .messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
    activeCode: joi_1.default.string().required()
}).required();
