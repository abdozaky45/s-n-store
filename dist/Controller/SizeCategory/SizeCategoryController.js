"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSizeCategoryById = exports.updateSizeCategoryById = exports.getSizeCategoriesByGroupId = exports.getAllSizeCategories = exports.getSizeCategoryById = exports.createNewSizeCategory = exports.updateGroupSizeById = exports.getAllGroupSizes = exports.getGroupSizeById = exports.createNewGroupSize = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const SizeCategoryService_1 = require("../../Service/SizeCategory/SizeCategoryService");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const Error_1 = __importDefault(require("../../Utils/Error"));
exports.createNewGroupSize = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name } = req.body;
    const groupSize = await (0, SizeCategoryService_1.createGroupSize)(name);
    return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { groupSize }, SuccessMessages_1.default.GROUP_SIZE_CREATED));
});
exports.getGroupSizeById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const groupSize = await (0, SizeCategoryService_1.findGroupSizeById)(_id);
    if (!groupSize)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.GROUP_SIZE_NOT_FOUND);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { groupSize }, SuccessMessages_1.default.SIZE_GROUP_FETCHED));
});
exports.getAllGroupSizes = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const groupSizes = await (0, SizeCategoryService_1.findAllGroupSizes)();
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { groupSizes }, SuccessMessages_1.default.SIZE_GROUP_FETCHED));
});
exports.updateGroupSizeById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const { name } = req.body;
    const groupSize = await (0, SizeCategoryService_1.findGroupSizeById)(_id);
    if (!groupSize)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.GROUP_SIZE_NOT_FOUND);
    const updatedGroupSize = await (0, SizeCategoryService_1.updateGroupSize)(_id, name);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { groupSize: updatedGroupSize }, SuccessMessages_1.default.GROUP_SIZE_UPDATED));
});
exports.createNewSizeCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const sizeCategoryData = req.body;
    const groupSize = await (0, SizeCategoryService_1.findGroupSizeById)(sizeCategoryData.groupSize);
    if (!groupSize)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.GROUP_SIZE_NOT_FOUND);
    const sizeCategory = await (0, SizeCategoryService_1.createSizeCategory)(sizeCategoryData);
    return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { sizeCategory }, SuccessMessages_1.default.SIZE_CATEGORY_CREATED));
});
exports.getSizeCategoryById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const sizeCategory = await (0, SizeCategoryService_1.findSizeCategoryById)(_id);
    if (!sizeCategory)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { sizeCategory }, SuccessMessages_1.default.SIZE_CATEGORY_FETCHED));
});
exports.getAllSizeCategories = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const sizeCategories = await (0, SizeCategoryService_1.findAllSizeCategories)();
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { sizeCategories }, SuccessMessages_1.default.SIZE_CATEGORY_FETCHED));
});
exports.getSizeCategoriesByGroupId = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { groupId } = req.params;
    const sizeCategories = await (0, SizeCategoryService_1.findSizeCategoriesByGroupId)(groupId);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { sizeCategories }, SuccessMessages_1.default.SIZE_CATEGORY_FETCHED));
});
exports.updateSizeCategoryById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const sizeCategoryData = req.body;
    if (sizeCategoryData.groupSize) {
        const groupSize = await (0, SizeCategoryService_1.findGroupSizeById)(sizeCategoryData.groupSize);
        if (!groupSize)
            throw new ErrorHandling_1.ApiError(400, Error_1.default.GROUP_SIZE_NOT_FOUND);
    }
    const sizeCategory = await (0, SizeCategoryService_1.findSizeCategoryById)(_id);
    if (!sizeCategory)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.SIZE_CATEGORY_NOT_FOUND);
    const updatedSizeCategory = await (0, SizeCategoryService_1.updateSizeCategory)(_id, sizeCategoryData);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, { sizeCategory: updatedSizeCategory }, SuccessMessages_1.default.SIZE_CATEGORY_UPDATED));
});
exports.deleteSizeCategoryById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const sizeCategory = await (0, SizeCategoryService_1.deleteSizeCategory)(_id);
    if (!sizeCategory)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.SIZE_CATEGORY_DELETED_SUCCESS));
});
