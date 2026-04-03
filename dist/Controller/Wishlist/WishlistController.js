"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWishlistProduct = exports.getAllUserWishlist = exports.deleteWishlist = exports.getUserWishlistById = exports.createWishlist = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const DateAndTime_1 = __importDefault(require("../../Utils/DateAndTime"));
const Error_1 = __importDefault(require("../../Utils/Error"));
const wishlistService = __importStar(require("../../Service/Wishlist/WishlistService"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const ProductService_1 = require("../../Service/Product/ProductService");
const CustomerService_1 = require("../../Service/User/CustomerService");
exports.createWishlist = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { productId, customer } = req.body;
    const checkCustomer = await (0, CustomerService_1.findCustomerById)(customer);
    if (!checkCustomer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CUSTOMER_NOT_FOUND);
    const Product = await (0, ProductService_1.getUserProductById)(productId);
    if (!Product)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.PRODUCT_NOT_FOUND);
    const ExistingWishlist = await wishlistService.getProductWishlist(productId, customer);
    if (ExistingWishlist)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.WISHLIST_ALREADY_EXISTS);
    const wishlist = await wishlistService.AddProductToFavorites(customer, productId, (0, DateAndTime_1.default)().valueOf());
    return res
        .status(200)
        .json(new ErrorHandling_1.ApiResponse(200, { wishlist }, SuccessMessages_1.default.ADD_PRODUCT_TO_WISHLIST));
});
exports.getUserWishlistById = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { _id } = req.params;
    const wishlist = await wishlistService.getWishlistById(_id);
    if (!wishlist)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.WISHLIST_NOT_FOUND);
    return res
        .status(200)
        .json(new ErrorHandling_1.ApiResponse(200, { wishlist }, ""));
});
exports.deleteWishlist = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { productId, customer } = req.params;
    const checkCustomer = await (0, CustomerService_1.findCustomerById)(customer);
    if (!checkCustomer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CUSTOMER_NOT_FOUND);
    if (!productId)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.DATA_IS_REQUIRED);
    const wishlist = await wishlistService.removeProductFromFavorites(customer, productId);
    if (!wishlist)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.WISHLIST_NOT_FOUND);
    return res
        .status(200)
        .json(new ErrorHandling_1.ApiResponse(200, { wishlist }, ""));
});
exports.getAllUserWishlist = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { customer } = req.params;
    const checkCustomer = await (0, CustomerService_1.findCustomerById)(customer);
    if (!checkCustomer)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.CUSTOMER_NOT_FOUND);
    const wishlist = await wishlistService.getUserWishlist(customer);
    if (!wishlist)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.WISHLIST_NOT_FOUND);
    return res
        .status(200)
        .json(new ErrorHandling_1.ApiResponse(200, { wishlist }, ""));
});
exports.getAllWishlistProduct = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const page = req.query.page;
    const pageNumber = Number(page);
    const wishlist = await wishlistService.getAllWishlist(pageNumber);
    if (!wishlist)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.WISHLIST_NOT_FOUND);
    return res
        .status(200)
        .json(new ErrorHandling_1.ApiResponse(200, { wishlist }, ""));
});
