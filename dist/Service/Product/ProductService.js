"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.findAllProductsByCategory = exports.updateStock = exports.retrieveProducts = exports.findProducts = exports.findProductByPriceRange = exports.findProductBySort = exports.findAllSaleProducts = exports.findAllProducts = exports.getProductsStock = exports.hardDeleteProduct = exports.restoreProduct = exports.softDeleteProduct = exports.getUserProductsByFilters = exports.getUserProductById = exports.getAdminProducts = exports.productSearch = exports.getAdminProductById = exports.prepareProductUpdates = exports.createProduct = exports.ratioCalculatePrice = void 0;
const ProductModel_1 = __importDefault(require("../../Model/Product/ProductModel"));
const CategoryService_1 = require("../Category/CategoryService");
const Schemas_1 = require("../../Utils/Schemas");
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const SortProduct_1 = require("../../Utils/SortProduct");
const mongoose_1 = __importDefault(require("mongoose"));
const OrderModel_1 = __importDefault(require("../../Model/Order/OrderModel"));
const OrderStatusType_1 = require("../../Utils/OrderStatusType");
const AuthModel_1 = __importDefault(require("../../Model/User/auth/AuthModel"));
const VariantModel_1 = __importDefault(require("../../Model/Variant/VariantModel"));
const AwsController_1 = require("../../Controller/Aws/AwsController");
const ratioCalculatePrice = (price, salePrice, saleStartDate, saleEndDate) => {
    if (!salePrice || salePrice === 0 || salePrice >= price) {
        return {
            isSale: false,
            saleStartDate: 0,
            saleEndDate: 0,
            finalPrice: price,
        };
    }
    return {
        isSale: true,
        finalPrice: salePrice,
        saleStartDate: saleStartDate ?? 0,
        saleEndDate: saleEndDate ?? 0,
    };
};
exports.ratioCalculatePrice = ratioCalculatePrice;
const createProduct = async (productData, session) => {
    const product = await ProductModel_1.default.create([productData], { session });
    return product[0];
};
exports.createProduct = createProduct;
const prepareProductUpdates = async (product, body) => {
    let hasUpdates = false;
    if (body.name) {
        product.name = {
            ar: body.name.ar ?? product.name.ar,
            en: body.name.en ?? product.name.en,
        };
        hasUpdates = true;
    }
    if (body.description) {
        product.description = {
            ar: body.description.ar ?? product.description.ar,
            en: body.description.en ?? product.description.en,
        };
        hasUpdates = true;
    }
    if (body.defaultImage) {
        product.defaultImage = {
            mediaUrl: body.defaultImage,
            mediaId: (0, CategoryService_1.extractMediaId)(body.defaultImage),
        };
        hasUpdates = true;
    }
    if (body.sizeChartImage) {
        product.sizeChartImage = {
            mediaUrl: body.sizeChartImage,
            mediaId: (0, CategoryService_1.extractMediaId)(body.sizeChartImage),
        };
        hasUpdates = true;
    }
    if (body.albumImages?.length) {
        product.albumImages = body.albumImages.map((url) => ({
            mediaUrl: url,
            mediaId: (0, CategoryService_1.extractMediaId)(url),
        }));
        hasUpdates = true;
    }
    const simpleFields = [
        "price", "salePrice", "wholesalePrice", "isSale",
        "saleStartDate", "saleEndDate", "category",
        "subCategory", "isNewArrival", "isBestSeller", "finalPrice"
    ];
    simpleFields.forEach((field) => {
        if (body[field] !== undefined && body[field] !== null) {
            product[field] = body[field];
            hasUpdates = true;
        }
    });
    return hasUpdates ? product : null;
};
exports.prepareProductUpdates = prepareProductUpdates;
const getAdminProductById = async (_id) => {
    const product = await ProductModel_1.default.findById(_id)
        .select("-createdBy -createdAt -isDeleted -__v")
        .populate({ path: SchemaTypesReference_1.default.Category, select: "-_id name" })
        .populate({ path: SchemaTypesReference_1.default.SubCategory, select: "-_id name" })
        .populate({ path: "variants", select: "-_id -__v", populate: { path: SchemaTypesReference_1.default.Color, select: "-_id -__v" } });
    return product;
};
exports.getAdminProductById = getAdminProductById;
const productSearch = async (querySearch) => {
    const products = await ProductModel_1.default.find({ isDeleted: false }).select("name _id");
    const fuse = new fuse_js_1.default(products, {
        keys: ["name.ar", "name.en"],
        threshold: 0.3,
    });
    const results = fuse.search(querySearch).map((result) => result.item);
    return results;
};
exports.productSearch = productSearch;
const getAdminProducts = async ({ category, subCategory, isSale, isNewArrival, isBestSeller, isSoldOut, isDeleted, page, }) => {
    const limit = 20;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);
    const query = {};
    query.isDeleted = isDeleted === true ? true : false;
    if (category)
        query.category = category;
    if (subCategory)
        query.subCategory = subCategory;
    if (isSale)
        query.isSale = true;
    if (isNewArrival)
        query.isNewArrival = true;
    if (isBestSeller)
        query.isBestSeller = true;
    if (isSoldOut)
        query.isSoldOut = true;
    const [products, totalItems] = await Promise.all([
        ProductModel_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-__v")
            .populate({ path: "category", select: "-__v" })
            .populate({ path: "subCategory", select: "-__v" }),
        ProductModel_1.default.countDocuments(query),
    ]);
    return {
        products,
        currentPage: page,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
    };
};
exports.getAdminProducts = getAdminProducts;
const getUserProductById = async (id) => {
    const product = await ProductModel_1.default.findOne({ _id: id, isDeleted: false })
        .select("-wholesalePrice -isDeleted -createdAt -createdBy -__v")
        .populate({ path: SchemaTypesReference_1.default.Category, select: "-_id name" })
        .populate({ path: SchemaTypesReference_1.default.SubCategory, select: "-_id name" })
        .populate({ path: "variants", select: "-_id -__v", populate: { path: SchemaTypesReference_1.default.Color, select: "-_id -__v" } });
    return product;
};
exports.getUserProductById = getUserProductById;
const getUserProductsByFilters = async ({ category, subCategory, size, isSale, isNewArrival, isBestSeller, sort, page, }) => {
    const limit = 20;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);
    const query = { isDeleted: false };
    if (category)
        query.category = category;
    if (subCategory)
        query.subCategory = subCategory;
    if (isSale)
        query.isSale = true;
    if (isNewArrival)
        query.isNewArrival = true;
    if (isBestSeller) {
        const hasBestSellers = await ProductModel_1.default.countDocuments({
            ...query,
            isBestSeller: true,
        });
        if (hasBestSellers > 0) {
            query.isBestSeller = true;
        }
    }
    if (size) {
        const variants = await VariantModel_1.default.find({ size }).distinct(SchemaTypesReference_1.default.Product);
        query._id = { $in: variants };
    }
    const sortOption = sort === SortProduct_1.sortProductEnum.priceLowToHigh ? { finalPrice: 1 } :
        sort === SortProduct_1.sortProductEnum.priceHighToLow ? { finalPrice: -1 } :
            { createdAt: -1 };
    const [products, totalItems] = await Promise.all([
        ProductModel_1.default.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .select("-wholesalePrice -isDeleted -__v")
            .populate({ path: "category", select: "-__v" })
            .populate({ path: "subCategory", select: "-__v" }),
        ProductModel_1.default.countDocuments(query),
    ]);
    return {
        products,
        currentPage: page,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
    };
};
exports.getUserProductsByFilters = getUserProductsByFilters;
const softDeleteProduct = async (_id) => {
    const product = await ProductModel_1.default.findByIdAndUpdate(_id, {
        isDeleted: true,
    });
    return product;
};
exports.softDeleteProduct = softDeleteProduct;
const restoreProduct = async (_id) => {
    return ProductModel_1.default.findByIdAndUpdate(_id, { isDeleted: false }, { new: true });
};
exports.restoreProduct = restoreProduct;
const hardDeleteProduct = async (_id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const product = await ProductModel_1.default.findById(_id)
            .select("defaultImage albumImages sizeChartImage");
        if (product) {
            await (0, AwsController_1.deleteProductImages)(product);
        }
        await VariantModel_1.default.deleteMany({ product: _id }, { session });
        await ProductModel_1.default.findByIdAndDelete(_id, { session });
        await session.commitTransaction();
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.hardDeleteProduct = hardDeleteProduct;
// edits
const getProductsStock = async (variantIds) => {
    const variants = await VariantModel_1.default.find({
        _id: { $in: variantIds },
    }).select("product size color quantity isSoldOut");
    return variants;
};
exports.getProductsStock = getProductsStock;
const findAllProducts = async (page) => {
    const products = await (0, Schemas_1.paginate)(ProductModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }), page, "categoryName image", SchemaTypesReference_1.default.Category);
    return products;
};
exports.findAllProducts = findAllProducts;
const findAllSaleProducts = async (page) => {
    const products = await (0, Schemas_1.paginate)(ProductModel_1.default.find({ isSale: true, isDeleted: false }).sort({
        createdAt: -1,
    }), page, "categoryName image", SchemaTypesReference_1.default.Category);
    return products;
};
exports.findAllSaleProducts = findAllSaleProducts;
const findProductBySort = async (sortBy, page) => {
    let sortCriteria = {};
    switch (sortBy) {
        case SortProduct_1.sortProductEnum.newest:
            sortCriteria = { createdAt: -1 };
            break;
        case SortProduct_1.sortProductEnum.priceLowToHigh:
            sortCriteria = { price: -1 };
            break;
        case SortProduct_1.sortProductEnum.priceHighToLow:
            sortCriteria = { price: 1 };
            break;
        default:
            sortCriteria = { createdAt: -1 };
            break;
    }
    const products = await (0, Schemas_1.paginate)(ProductModel_1.default.find({ isDeleted: false }).sort(sortCriteria), page, "categoryName image", SchemaTypesReference_1.default.Category);
    return products;
};
exports.findProductBySort = findProductBySort;
const findProductByPriceRange = async (priceRange, page) => {
    let priceCriteria = { isDeleted: false };
    switch (priceRange) {
        case SortProduct_1.sortProductEnum.priceUnder100:
            priceCriteria = {
                $and: [{ isDeleted: false }, { price: { $lte: 100 } }],
            };
            break;
        case SortProduct_1.sortProductEnum.priceBetween100and500:
            priceCriteria = {
                $and: [{ isDeleted: false }, { price: { $gte: 100, $lte: 500 } }],
            };
            break;
        case SortProduct_1.sortProductEnum.priceBetween500and1000:
            priceCriteria = {
                $and: [{ isDeleted: false }, { price: { $gte: 500, $lte: 1000 } }],
            };
            break;
        case SortProduct_1.sortProductEnum.priceAbove1000:
            priceCriteria = {
                $and: [{ isDeleted: false }, { price: { $gte: 1000 } }],
            };
            break;
        default:
            priceCriteria = { isDeleted: false };
            break;
    }
    const products = await (0, Schemas_1.paginate)(ProductModel_1.default.find(priceCriteria), page, "-_id categoryName image", SchemaTypesReference_1.default.Category);
    return products;
};
exports.findProductByPriceRange = findProductByPriceRange;
const findProducts = async (sort, priceRange, page) => {
    const perPage = 20;
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const skip = (currentPage - 1) * perPage;
    const pipeline = [];
    pipeline.push({ $match: { isDeleted: false } });
    pipeline.push({
        $addFields: {
            finalPrice: {
                $cond: {
                    if: { $gt: ["$salePrice", 0] },
                    then: "$salePrice",
                    else: "$price",
                },
            },
        },
    });
    if (priceRange) {
        let priceFilter = {};
        switch (priceRange) {
            case SortProduct_1.sortProductEnum.priceUnder100:
                priceFilter = { $lte: 100 };
                break;
            case SortProduct_1.sortProductEnum.priceBetween100and500:
                priceFilter = { $gte: 100, $lte: 500 };
                break;
            case SortProduct_1.sortProductEnum.priceBetween500and1000:
                priceFilter = { $gte: 500, $lte: 1000 };
                break;
            case SortProduct_1.sortProductEnum.priceAbove1000:
                priceFilter = { $gte: 1000 };
                break;
        }
        pipeline.push({ $match: { finalPrice: priceFilter } });
    }
    let sortCriteria = { createdAt: -1 };
    if (sort) {
        switch (sort) {
            case SortProduct_1.sortProductEnum.newest:
                sortCriteria = { createdAt: -1 };
                break;
            case SortProduct_1.sortProductEnum.priceLowToHigh:
                sortCriteria = { finalPrice: -1 };
                break;
            case SortProduct_1.sortProductEnum.priceHighToLow:
                sortCriteria = { finalPrice: 1 };
                break;
        }
    }
    pipeline.push({ $sort: sortCriteria });
    pipeline.push({
        $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
        },
    });
    pipeline.push({ $unwind: "$category" });
    pipeline.push({
        $facet: {
            data: [{ $skip: skip }, { $limit: perPage }],
            totalItems: [{ $count: "count" }],
        },
    });
    const result = await ProductModel_1.default.aggregate(pipeline).exec();
    const data = result[0].data;
    const totalItems = result[0].totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / perPage);
    return {
        data,
        totalItems,
        totalPages,
        currentPage,
    };
};
exports.findProducts = findProducts;
const retrieveProducts = async (productIds) => {
    const foundProducts = await ProductModel_1.default.find({
        _id: { $in: productIds },
        isDeleted: false,
    });
    return foundProducts;
};
exports.retrieveProducts = retrieveProducts;
const updateStock = async (orderProducts, productRecord, increaseStock) => {
    const bulkOperations = [];
    for (const orderProduct of orderProducts) {
        let productIdString;
        if (typeof orderProduct.productId === "string") {
            productIdString = orderProduct.productId;
        }
        else if ("_id" in orderProduct.productId) {
            productIdString = orderProduct.productId._id.toString();
        }
        else {
            console.error("Invalid productId type:", orderProduct.productId);
            continue;
        }
        const product = productRecord[productIdString];
        if (product && orderProduct.quantity !== undefined) {
            const quantityChange = increaseStock
                ? orderProduct.quantity
                : -orderProduct.quantity;
            if (increaseStock) {
                product.soldItems = (product.soldItems ?? 0) - quantityChange;
                product.availableItems = (product.availableItems ?? 0) + quantityChange;
            }
            else {
                product.soldItems = (product.soldItems ?? 0) + Math.abs(quantityChange);
                product.availableItems =
                    (product.availableItems ?? 0) - Math.abs(quantityChange);
            }
            if (product.availableItems <= 0) {
                product.isSoldOut = true;
            }
            else if (product.availableItems > 0 && increaseStock) {
                product.isSoldOut = false;
            }
            bulkOperations.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            soldItems: product.soldItems,
                            availableItems: product.availableItems,
                            isSoldOut: product.isSoldOut,
                        },
                    },
                },
            });
        }
        else {
            console.log("Skipping Product due to missing data.");
        }
    }
    if (bulkOperations.length > 0) {
        try {
            await ProductModel_1.default.bulkWrite(bulkOperations);
        }
        catch (error) {
            console.error("Error performing bulk update:", error);
        }
    }
    else {
        console.log("No operations to perform.");
    }
};
exports.updateStock = updateStock;
const findAllProductsByCategory = async (sort, priceRange, page, categoryId) => {
    if (!categoryId) {
        throw new Error("categoryId is required");
    }
    const perPage = 20;
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const skip = (currentPage - 1) * perPage;
    const pipeline = [];
    pipeline.push({
        $match: {
            isDeleted: false,
            category: new mongoose_1.default.Types.ObjectId(categoryId),
        },
    });
    pipeline.push({
        $addFields: {
            finalPrice: {
                $cond: {
                    if: { $gt: ["$salePrice", 0] },
                    then: "$salePrice",
                    else: "$price",
                },
            },
        },
    });
    if (priceRange) {
        let priceFilter = {};
        switch (priceRange) {
            case SortProduct_1.sortProductEnum.priceUnder100:
                priceFilter = { $lte: 100 };
                break;
            case SortProduct_1.sortProductEnum.priceBetween100and500:
                priceFilter = { $gte: 100, $lte: 500 };
                break;
            case SortProduct_1.sortProductEnum.priceBetween500and1000:
                priceFilter = { $gte: 500, $lte: 1000 };
                break;
            case SortProduct_1.sortProductEnum.priceAbove1000:
                priceFilter = { $gte: 1000 };
                break;
        }
        pipeline.push({ $match: { finalPrice: priceFilter } });
    }
    let sortCriteria = { createdAt: -1 };
    if (sort) {
        switch (sort) {
            case SortProduct_1.sortProductEnum.newest:
                sortCriteria = { createdAt: -1 };
                break;
            case SortProduct_1.sortProductEnum.priceLowToHigh:
                sortCriteria = { finalPrice: -1 };
                break;
            case SortProduct_1.sortProductEnum.priceHighToLow:
                sortCriteria = { finalPrice: 1 };
                break;
        }
    }
    pipeline.push({ $sort: sortCriteria });
    pipeline.push({
        $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
        },
    });
    pipeline.push({ $unwind: "$category" });
    pipeline.push({
        $facet: {
            data: [{ $skip: skip }, { $limit: perPage }],
            totalItems: [{ $count: "count" }],
        },
    });
    const result = await ProductModel_1.default.aggregate(pipeline).exec();
    const data = result[0].data;
    const totalItems = result[0].totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / perPage);
    return {
        data,
        totalItems,
        totalPages,
        currentPage,
    };
};
exports.findAllProductsByCategory = findAllProductsByCategory;
const getAnalytics = async () => {
    const totalRevenue = await OrderModel_1.default.aggregate([
        { $match: { status: OrderStatusType_1.orderStatusType.delivered } },
        { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalOrders = await OrderModel_1.default.countDocuments();
    const totalCustomers = await AuthModel_1.default.countDocuments();
    const totalProducts = await ProductModel_1.default.countDocuments();
    return {
        totalRevenue: totalRevenue[0]?.total ?? 0,
        totalOrders,
        totalCustomers,
        totalProducts,
    };
};
exports.getAnalytics = getAnalytics;
