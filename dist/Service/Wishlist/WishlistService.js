"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductWishlist = exports.getWishlistById = exports.getAllWishlist = exports.getUserWishlist = exports.removeProductFromFavorites = exports.AddProductToFavorites = void 0;
const WishlistModel_1 = __importDefault(require("../../Model/Wishlist/WishlistModel"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const AddProductToFavorites = async (customer, product, createdAt) => {
    const wishlist = await WishlistModel_1.default.create({ customer, product, createdAt });
    return wishlist;
};
exports.AddProductToFavorites = AddProductToFavorites;
const removeProductFromFavorites = async (customer, product) => {
    const wishlist = await WishlistModel_1.default.findOneAndDelete({ customer, product });
    return wishlist;
};
exports.removeProductFromFavorites = removeProductFromFavorites;
const getUserWishlist = async (customer) => {
    const product = await WishlistModel_1.default.find({ customer }).populate({
        path: SchemaTypesReference_1.default.Product,
        select: "name defaultImage albumImages finalPrice",
    });
    return product;
};
exports.getUserWishlist = getUserWishlist;
const getAllWishlist = async (page) => {
    let limit = 20;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = limit * (page - 1);
    const totalItems = await WishlistModel_1.default.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    const products = await WishlistModel_1.default.find({})
        .populate({
        path: SchemaTypesReference_1.default.User,
    })
        .populate({
        path: SchemaTypesReference_1.default.Product,
        select: "name defaultImage albumImages finalPrice",
        populate: {
            path: SchemaTypesReference_1.default.Category,
            select: "name image"
        }
    })
        .skip(skip)
        .limit(limit)
        .exec();
    return { totalItems, totalPages, currentPage: page, products };
};
exports.getAllWishlist = getAllWishlist;
const getWishlistById = async (_id) => {
    const wishlist = await WishlistModel_1.default.findById(_id).populate({
        path: SchemaTypesReference_1.default.Product,
        select: "name defaultImage albumImages finalPrice",
    });
    return wishlist;
};
exports.getWishlistById = getWishlistById;
const getProductWishlist = async (product, customer) => {
    const wishlist = await WishlistModel_1.default.findOne({
        customer,
        product
    });
    return wishlist;
};
exports.getProductWishlist = getProductWishlist;
