"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.getCategories = exports.deleteOneCategory = exports.updateCategory = exports.CreateNewCategory = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const DateAndTime_1 = __importDefault(require("../../Utils/DateAndTime"));
const CategoryService_1 = require("../../Service/Category/CategoryService");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
exports.CreateNewCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { categoryNameAr, categoryNameEn, imageUrl } = req.body;
    const mediaId = (0, CategoryService_1.extractMediaId)(imageUrl);
    const category = await (0, CategoryService_1.createCategory)({
        categoryName: {
            ar: categoryNameAr,
            en: categoryNameEn,
        },
        mediaUrl: imageUrl,
        mediaId,
        createdBy: req.body.currentUser.userInfo._id,
        createdAt: (0, DateAndTime_1.default)().valueOf(),
    });
    return res.json(new ErrorHandling_1.ApiResponse(200, { category }, SuccessMessages_1.default.CATEGORY_CREATED));
});
exports.updateCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const Category = await (0, CategoryService_1.findCategoryById)(req.params._id);
    if (!Category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    const { categoryNameAr, categoryNameEn, imageUrl, } = req.body;
    const updates = await (0, CategoryService_1.prepareCategoryUpdates)(Category, {
        ar: categoryNameAr,
        en: categoryNameEn,
    }, imageUrl);
    if (updates) {
        await Category.save();
        return res.json(new ErrorHandling_1.ApiResponse(200, { category: Category }, SuccessMessages_1.default.CATEGORY_UPDATED));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.NO_UPDATE_CATEGORY));
});
exports.deleteOneCategory = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const Category = await (0, CategoryService_1.findCategoryById)(req.params._id);
    if (!Category) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND);
    }
    const result = await (0, CategoryService_1.deleteCategory)(req.params._id);
    if (!result) {
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CATEGORY_NOT_FOUND_OR_EALREADY_DELETED);
    }
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
