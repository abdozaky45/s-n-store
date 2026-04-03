"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDeletedSubCategories = exports.getSubCategoryById = exports.getSubCategories = exports.hardDeleteOneSubCategory = exports.restoreOneSubCategory = exports.softDeleteOneSubCategory = exports.updateSubCategory = exports.CreateNewSubCategory = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const CategoryService_1 = require("../../Service/Category/CategoryService");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const SubCategoryService_1 = require("../../Service/SubCategory/SubCategoryService");
exports.CreateNewSubCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name, groupSize, imageUrl, category } = req.body;
    const mediaId = (0, CategoryService_1.extractMediaId)(imageUrl);
    const categoryExists = await (0, CategoryService_1.findCategoryById)(category);
    if (!categoryExists) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    const subCategory = await (0, SubCategoryService_1.createSubCategory)({
        name,
        groupSize,
        category,
        mediaUrl: imageUrl,
        mediaId,
        createdBy: req.body.currentUser.userInfo._id,
    });
    return res.json(new ErrorHandling_1.ApiResponse(200, { subCategory }, SuccessMessages_1.default.SUBCATEGORY_CREATED));
});
exports.updateSubCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name, imageUrl, category, groupSize } = req.body;
    const subCategory = await (0, SubCategoryService_1.findSubCategoryById)(req.params._id);
    if (!subCategory) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SUBCATEGORY_NOT_FOUND);
    }
    if (category && !(await (0, CategoryService_1.findCategoryById)(category))) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    const updates = await (0, SubCategoryService_1.prepareSubCategoryUpdates)(subCategory, groupSize, name, category, imageUrl);
    if (!updates) {
        return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.NO_UPDATE_CATEGORY));
    }
    await subCategory.save();
    return res.json(new ErrorHandling_1.ApiResponse(200, { subCategory }, SuccessMessages_1.default.SUBCATEGORY_UPDATED));
});
exports.softDeleteOneSubCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const subCategory = await (0, SubCategoryService_1.findSubCategoryById)(req.params._id);
    if (!subCategory) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SUBCATEGORY_NOT_FOUND);
    }
    await (0, SubCategoryService_1.softDeleteSubCategory)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.SUBCATEGORY_DELETED_SUCCESS));
});
exports.restoreOneSubCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const subCategory = await (0, SubCategoryService_1.findSubCategoryById)(req.params._id);
    if (!subCategory)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SUBCATEGORY_NOT_FOUND);
    if (!subCategory.isDeleted)
        throw new ErrorHandling_1.ApiError(400, 'SubCategory is not deleted');
    await (0, SubCategoryService_1.restoreSubCategory)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.SUBCATEGORY_RESTORED));
});
exports.hardDeleteOneSubCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const subCategory = await (0, SubCategoryService_1.findSubCategoryById)(req.params._id);
    if (!subCategory) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SUBCATEGORY_NOT_FOUND);
    }
    await (0, SubCategoryService_1.hardDeleteSubCategory)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.CATEGORY_DELETED_SUCCESS));
});
exports.getSubCategories = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const subCategories = await (0, SubCategoryService_1.getAllSubCategories)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { subCategories }));
});
exports.getSubCategoryById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    if (!req.params.subCategoryId) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.DATA_IS_REQUIRED);
    }
    const subCategory = await (0, SubCategoryService_1.findSubCategoryById)(req.params.subCategoryId);
    if (!subCategory) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.SUBCATEGORY_NOT_FOUND);
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { subCategory }));
});
exports.getAllDeletedSubCategories = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const subCategories = await (0, SubCategoryService_1.findAllDeletedSubCategories)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { subCategories }));
});
