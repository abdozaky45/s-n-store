"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalysis = exports.findProductsStock = exports.findUserProductById = exports.findUserAllProductsByFilters = exports.getAdminProductsByFilters = exports.findAdminProductById = exports.SearchProducts = exports.hardDeleteProductController = exports.restoreOneProduct = exports.softDeleteProductController = exports.updateProduct = exports.CreateProduct = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const CategoryService_1 = require("../../Service/Category/CategoryService");
const DateAndTime_1 = __importDefault(require("../../Utils/DateAndTime"));
const ProductService_1 = require("../../Service/Product/ProductService");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const SubCategoryService_1 = require("../../Service/SubCategory/SubCategoryService");
const VariantService_1 = require("../../Service/Variant/VariantService");
const mongoose_1 = __importDefault(require("mongoose"));
exports.CreateProduct = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name, description, wholesalePrice, price, salePrice, saleStartDate, saleEndDate, category, subCategory, defaultImage, albumImages, sizeChartImage, variants, } = req.body;
    const checkCategory = await (0, CategoryService_1.findCategoryById)(category);
    if (!checkCategory)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.CATEGORY_NOT_FOUND);
    const checkSubCategory = subCategory ? await (0, SubCategoryService_1.findSubCategoryById)(subCategory) : null;
    if (subCategory && !checkSubCategory)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.SUBCATEGORY_NOT_FOUND);
    const processedAlbumImages = albumImages?.map((image) => {
        return {
            mediaUrl: image,
            mediaId: (0, CategoryService_1.extractMediaId)(image),
        };
    }) || [];
    const finalPrices = (0, ProductService_1.ratioCalculatePrice)(price, salePrice, saleStartDate, saleEndDate);
    const productData = {
        name: { ar: name.ar, en: name.en },
        description: { ar: description.ar, en: description.en },
        wholesalePrice,
        price,
        salePrice,
        finalPrice: finalPrices.finalPrice,
        saleStartDate: finalPrices?.saleStartDate,
        saleEndDate: finalPrices?.saleEndDate,
        isSale: finalPrices?.isSale,
        isNewArrival: true,
        category: checkCategory._id,
        subCategory: checkSubCategory?._id,
        defaultImage: { mediaUrl: defaultImage, mediaId: (0, CategoryService_1.extractMediaId)(defaultImage) },
        albumImages: processedAlbumImages,
        sizeChartImage: { mediaUrl: sizeChartImage, mediaId: (0, CategoryService_1.extractMediaId)(sizeChartImage) },
        createdBy: req.body.currentUser.userInfo._id,
        createdAt: (0, DateAndTime_1.default)().valueOf(),
    };
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const product = await (0, ProductService_1.createProduct)(productData, session);
        if (variants.length) {
            const variantsToCreate = variants.map((variant) => ({
                product: product._id,
                size: variant.size,
                color: variant.color,
                quantity: variant.quantity,
            }));
            await (0, VariantService_1.createManyVariants)(variantsToCreate, session);
            await session.commitTransaction();
            return res
                .status(201)
                .json(new ErrorHandling_1.ApiResponse(201, { product }, SuccessMessages_1.default.PRODUCT_CREATED));
        }
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.updateProduct = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const product = await (0, ProductService_1.getAdminProductById)(productId);
    if (!product)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.PRODUCT_NOT_FOUND);
    const checkCategory = req.body.category
        ? await (0, CategoryService_1.findCategoryById)(req.body.category)
        : null;
    if (req.body.category && !checkCategory) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.CATEGORY_NOT_FOUND);
    }
    const checkSubCategory = req.body.subCategory
        ? await (0, SubCategoryService_1.findSubCategoryById)(req.body.subCategory)
        : null;
    if (req.body.subCategory && !checkSubCategory) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.SUBCATEGORY_NOT_FOUND);
    }
    const finalPrices = (0, ProductService_1.ratioCalculatePrice)(req.body.price ?? product.price, req.body.salePrice ?? product.salePrice, req.body.saleStartDate, req.body.saleEndDate);
    const body = {
        ...req.body,
        subCategory: checkSubCategory?._id.toString(),
        isSale: finalPrices.isSale,
        saleStartDate: finalPrices.saleStartDate,
        saleEndDate: finalPrices.saleEndDate,
        finalPrice: finalPrices.finalPrice,
    };
    const updates = await (0, ProductService_1.prepareProductUpdates)(product, body);
    if (!updates) {
        return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.PRODUCT_NOT_UPDATED));
    }
    await product.save();
    return res.json(new ErrorHandling_1.ApiResponse(200, { product }, SuccessMessages_1.default.PRODUCT_UPDATED));
});
exports.softDeleteProductController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const product = await (0, ProductService_1.getAdminProductById)(productId);
    if (!product)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.PRODUCT_NOT_FOUND);
    await (0, ProductService_1.softDeleteProduct)(productId);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.PRODUCT_DELETED));
});
exports.restoreOneProduct = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const product = await (0, ProductService_1.getAdminProductById)(req.params._id);
    if (!product)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.PRODUCT_NOT_FOUND);
    if (!product.isDeleted)
        throw new ErrorHandling_1.ApiError(400, 'Product is not deleted');
    await (0, ProductService_1.restoreProduct)(req.params._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.PRODUCT_RESTORED));
});
exports.hardDeleteProductController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const product = await (0, ProductService_1.getAdminProductById)(productId);
    if (!product)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.PRODUCT_NOT_FOUND);
    await (0, ProductService_1.hardDeleteProduct)(productId);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.PRODUCT_DELETED));
});
exports.SearchProducts = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { searchQuery } = req.query;
    const products = await (0, ProductService_1.productSearch)(searchQuery);
    return res.json(new ErrorHandling_1.ApiResponse(200, { products }, "Success"));
});
exports.findAdminProductById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const product = await (0, ProductService_1.getAdminProductById)(productId);
    if (!product)
        throw new ErrorHandling_1.ApiError(400, Error_1.default.PRODUCT_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, { product }, SuccessMessages_1.default.PRODUCT_FOUND));
});
exports.getAdminProductsByFilters = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { category, subCategory, isSale, isNewArrival, isBestSeller, isSoldOut, isDeleted, page, } = req.query;
    const products = await (0, ProductService_1.getAdminProducts)({
        category: category,
        subCategory: subCategory,
        isSale: isSale === "true",
        isNewArrival: isNewArrival === "true",
        isBestSeller: isBestSeller === "true",
        isSoldOut: isSoldOut === "true",
        isDeleted: isDeleted === "true",
        page: Number(page),
    });
    return res.json(new ErrorHandling_1.ApiResponse(200, products, SuccessMessages_1.default.PRODUCT_FOUND));
});
exports.findUserAllProductsByFilters = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { category, subCategory, size, isSale, isNewArrival, isBestSeller, sort, page, } = req.query;
    const products = await (0, ProductService_1.getUserProductsByFilters)({
        category: category,
        subCategory: subCategory,
        size: size,
        isSale: isSale === "true",
        isNewArrival: isNewArrival === "true",
        isBestSeller: isBestSeller === "true",
        sort: sort,
        page: Number(page),
    });
    return res.json(new ErrorHandling_1.ApiResponse(200, products, SuccessMessages_1.default.PRODUCT_FOUND));
});
exports.findUserProductById = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const { user } = req.query;
    const product = await (0, ProductService_1.getUserProductById)(productId);
    // if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    // let liked = false;
    // if (user) {
    //   const wishlistEntry = await getProductWishlist(productId, user as string);
    //   liked = wishlistEntry ? true : false;
    // }
    return res.json(new ErrorHandling_1.ApiResponse(200, { product }, SuccessMessages_1.default.PRODUCT_FOUND));
});
exports.findProductsStock = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { variantIds } = req.body;
    const products = await (0, ProductService_1.getProductsStock)(variantIds);
    return res.json(new ErrorHandling_1.ApiResponse(200, { products }, SuccessMessages_1.default.PRODUCT_FOUND));
});
exports.getAnalysis = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const analysis = await (0, ProductService_1.getAnalytics)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { analysis }, "Success"));
});
