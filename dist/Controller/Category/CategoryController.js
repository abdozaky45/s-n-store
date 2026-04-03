"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDeletedCategories = exports.getCategoryById = exports.getCategories = exports.hardDeleteOneCategory = exports.restoreOneCategory = exports.softDeleteOneCategory = exports.updateCategory = exports.CreateNewCategory = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const CategoryService_1 = require("../../Service/Category/CategoryService");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
exports.CreateNewCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name, groupSize, imageUrl } = req.body;
    const mediaId = (0, CategoryService_1.extractMediaId)(imageUrl);
    const category = await (0, CategoryService_1.createCategory)({
        name,
        groupSize,
        mediaUrl: imageUrl,
        mediaId,
        createdBy: req.body.currentUser.userInfo._id,
    });
    return res.json(new ErrorHandling_1.ApiResponse(200, { category }, SuccessMessages_1.default.CATEGORY_CREATED));
});
exports.updateCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const Category = await (0, CategoryService_1.findCategoryById)(req.params._id);
    if (!Category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    const { name, imageUrl, groupSize } = req.body;
    const updates = await (0, CategoryService_1.prepareCategoryUpdates)(Category, name, imageUrl, groupSize);
    if (updates) {
        await Category.save();
        return res.json(new ErrorHandling_1.ApiResponse(200, { category: Category }, SuccessMessages_1.default.CATEGORY_UPDATED));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.NO_UPDATE_CATEGORY));
});
exports.softDeleteOneCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const Category = await (0, CategoryService_1.findCategoryById)(req.params._id);
    if (!Category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    await (0, CategoryService_1.softDeleteCategory)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.CATEGORY_DELETED_SUCCESS));
});
exports.restoreOneCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const category = await (0, CategoryService_1.findCategoryById)(req.params._id);
    if (!category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    if (!category.isDeleted) {
        throw new ErrorHandling_1.ApiError(400, 'Category is not deleted');
    }
    await (0, CategoryService_1.restoreCategory)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.CATEGORY_RESTORED));
});
exports.hardDeleteOneCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const Category = await (0, CategoryService_1.findCategoryById)(req.params._id);
    if (!Category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    await (0, CategoryService_1.hardDeleteCategory)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.CATEGORY_DELETED_SUCCESS));
});
exports.getCategories = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const categories = await (0, CategoryService_1.getAllCategories)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { categories }));
});
exports.getCategoryById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    if (!req.params.categoryId) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.DATA_IS_REQUIRED);
    }
    const category = await (0, CategoryService_1.findCategoryById)(req.params.categoryId);
    if (!category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { category }));
});
exports.getAllDeletedCategories = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const categories = await (0, CategoryService_1.findAllDeletedCategories)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { categories }));
});
