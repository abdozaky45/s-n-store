"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageSliderValidation = exports.updateImageSliderValidation = exports.createImageSliderValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const baseSchema_1 = require("../baseSchema");
const DeviceType_1 = require("../../Utils/DeviceType");
exports.createImageSliderValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    images: joi_1.default.object({
        image1: joi_1.default.object({
            imageUrl: joi_1.default.string().required(),
            imageType: joi_1.default.string().valid(...DeviceType_1.DeviceTypeArr).required()
        }),
        image2: joi_1.default.object({
            imageUrl: joi_1.default.string().required(),
            imageType: joi_1.default.string().valid(...DeviceType_1.DeviceTypeArr).required()
        })
    }).required()
}));
exports.updateImageSliderValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    id: joi_1.default.string().required(),
    images: joi_1.default.object({
        image1: joi_1.default.object({
            imageUrl: joi_1.default.string().optional(),
            imageType: joi_1.default.string().valid(...DeviceType_1.DeviceTypeArr).optional()
        }),
        image2: joi_1.default.object({
            imageUrl: joi_1.default.string().optional(),
            imageType: joi_1.default.string().valid(...DeviceType_1.DeviceTypeArr).optional()
        })
    }).required()
}));
exports.deleteImageSliderValidation = baseSchema_1.baseSchema.concat(joi_1.default.object({
    id: joi_1.default.string().required()
}));
