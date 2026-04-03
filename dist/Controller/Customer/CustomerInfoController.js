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
exports.getCutsomerInfoById = exports.getAllCutsomerInfoByCustomerId = exports.deleteCustomerInfo = exports.updateCustomerInfo = exports.addCustomerInfo = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const userService = __importStar(require("../../Service/User/CustomerInfoService"));
const CustomerService_1 = require("../../Service/User/CustomerService");
exports.addCustomerInfo = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const userData = {
        customer: req.body.customer,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        apartmentSuite: req.body.apartmentSuite,
        shipping: req.body.shipping,
        postalCode: req.body.postalCode,
        additionalPhone: req.body.additionalPhone,
    };
    const result = await userService.createCutsomerInfo(userData);
    const user = await userService.findCutsomerInfoById(result._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, { user }, SuccessMessages_1.default.USER_CREATED));
});
exports.updateCustomerInfo = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const checkUser = await userService.findCutsomerInfoById(req.params._id);
    if (!checkUser) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    const userData = {
        customer: req.body.customer,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        apartmentSuite: req.body.apartmentSuite,
        shipping: req.body.shipping,
        postalCode: req.body.postalCode,
        additionalPhone: req.body.additionalPhone
    };
    const result = await userService.updateCutsomerInfo(checkUser._id, userData);
    const user = await userService.findCutsomerInfoById(result._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, { user }, SuccessMessages_1.default.USER_UPDATED));
});
exports.deleteCustomerInfo = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const user = await userService.deleteCutsomerInfo(req.params.customer);
    if (!user) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.USER_DELETED));
});
exports.getAllCutsomerInfoByCustomerId = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const checkUser = await (0, CustomerService_1.findCustomerById)(req.params.customer);
    if (!checkUser) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    const users = await userService.findCutsomerInfoByCustomerId(checkUser._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, { users }, SuccessMessages_1.default.USER_FOUND));
});
exports.getCutsomerInfoById = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const user = await userService.findCutsomerInfoById(req.params._id);
    if (!user) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { user }, SuccessMessages_1.default.USER_FOUND));
});
