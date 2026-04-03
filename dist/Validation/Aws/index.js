"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePresignedUrlValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
exports.deletePresignedUrlValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    fileName: joi_1.default.string().required(),
}).required());
