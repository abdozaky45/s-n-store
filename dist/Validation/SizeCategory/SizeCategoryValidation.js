"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSizeCategoryById = exports.getSizeCategoriesByGroupId = exports.getSizeCategoryById = exports.updateSizeCategory = exports.createSizeCategory = exports.getGroupSizeById = exports.updateGroupSize = exports.createGroupSize = void 0;
const baseSchema_1 = require("../baseSchema");
const joi_1 = __importDefault(require("joi"));
exports.createGroupSize = baseSchema_1.baseSchema.concat(joi_1.default.object({
    name: joi_1.default.string().required(),
}).required());
exports.updateGroupSize = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
    name: joi_1.default.string().required(),
}).required());
exports.getGroupSizeById = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
}));
exports.createSizeCategory = baseSchema_1.baseSchema.concat(joi_1.default.object({
    groupSize: joi_1.default.string().required(),
    size: joi_1.default.string().required(),
    order: joi_1.default.number().required()
}).required());
exports.updateSizeCategory = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
    groupSize: joi_1.default.string().optional(),
    size: joi_1.default.string().optional(),
    order: joi_1.default.number().optional()
}).required());
exports.getSizeCategoryById = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
}));
exports.getSizeCategoriesByGroupId = baseSchema_1.baseSchema.concat(joi_1.default.object({
    groupId: joi_1.default.string().required(),
}));
exports.deleteSizeCategoryById = baseSchema_1.baseSchema.concat(joi_1.default.object({
    _id: joi_1.default.string().required(),
}));
