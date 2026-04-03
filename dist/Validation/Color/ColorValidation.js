"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorIdValidationSchema = exports.updateColorValidation = exports.createColorValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.createColorValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required()
    }).required(),
    hex: joi_1.default.string().required()
})).required();
exports.updateColorValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
    name: joi_1.default.object({
        ar: joi_1.default.string().required(),
        en: joi_1.default.string().required()
    }).optional(),
    hex: joi_1.default.string().optional()
}));
exports.colorIdValidationSchema = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required()
}));
