"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSizeCategory = exports.updateSizeCategory = exports.findAllSizeCategories = exports.findSizeCategoriesByGroupId = exports.findSizeCategoryById = exports.createSizeCategory = exports.updateGroupSize = exports.findAllGroupSizes = exports.findGroupSizeById = exports.createGroupSize = void 0;
const GroupSize_1 = __importDefault(require("../../Model/GroupSize/GroupSize"));
const SizeCategoryModel_1 = __importDefault(require("../../Model/SizeCategory/SizeCategoryModel"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const createGroupSize = async (name) => {
    const groupSize = await GroupSize_1.default.create({ name });
    return groupSize;
};
exports.createGroupSize = createGroupSize;
const findGroupSizeById = async (_id) => {
    const groupSize = await GroupSize_1.default.findById(_id).select("-__v");
    return groupSize;
};
exports.findGroupSizeById = findGroupSizeById;
const findAllGroupSizes = async () => {
    const groupSizes = await GroupSize_1.default.find().select("-__v");
    return groupSizes;
};
exports.findAllGroupSizes = findAllGroupSizes;
const updateGroupSize = async (_id, name) => {
    const groupSize = await GroupSize_1.default.findByIdAndUpdate(_id, { name }, { new: true }).select("-__v");
    return groupSize;
};
exports.updateGroupSize = updateGroupSize;
const createSizeCategory = async (sizeCategoryData) => {
    const sizeCategory = await SizeCategoryModel_1.default.create(sizeCategoryData);
    return sizeCategory;
};
exports.createSizeCategory = createSizeCategory;
const findSizeCategoryById = async (_id) => {
    const sizeCategory = await SizeCategoryModel_1.default.findById(_id).select("-__v");
    return sizeCategory;
};
exports.findSizeCategoryById = findSizeCategoryById;
const findSizeCategoriesByGroupId = async (groupId) => {
    const sizeCategories = await SizeCategoryModel_1.default.find({ groupSize: groupId }).select("-__v");
    return sizeCategories;
};
exports.findSizeCategoriesByGroupId = findSizeCategoriesByGroupId;
const findAllSizeCategories = async () => {
    const sizeCategories = await SizeCategoryModel_1.default.find().select("-__v");
    return sizeCategories;
};
exports.findAllSizeCategories = findAllSizeCategories;
const updateSizeCategory = async (_id, sizeCategoryData) => {
    const sizeCategory = await SizeCategoryModel_1.default.findByIdAndUpdate(_id, sizeCategoryData, { new: true })
        .select("-__v")
        .populate(SchemaTypesReference_1.default.GroupSize, "-_id name");
    return sizeCategory;
};
exports.updateSizeCategory = updateSizeCategory;
const deleteSizeCategory = async (_id) => {
    const sizeCategory = await SizeCategoryModel_1.default.findByIdAndDelete(_id);
    return sizeCategory;
};
exports.deleteSizeCategory = deleteSizeCategory;
