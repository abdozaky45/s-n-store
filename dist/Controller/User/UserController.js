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
exports.getUserInformationById = exports.getAllUserInformation = exports.deleteUserInformation = exports.updateUserInformation = exports.addUserInformation = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const userService = __importStar(require("../../Service/User/AuthService"));
exports.addUserInformation = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const userId = req.body.currentUser.userInfo._id;
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        apartmentSuite: req.body.apartmentSuite,
        shipping: req.body.shipping,
        postalCode: req.body.postalCode,
        primaryPhone: req.body.primaryPhone,
        secondaryPhone: req.body.secondaryPhone,
        user: userId
    };
    const result = await userService.createUser(userData);
    const user = await userService.findUserInformationById(result._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, { user }, SuccessMessages_1.default.USER_CREATED));
});
exports.updateUserInformation = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { _id } = req.body.currentUser.userInfo;
    const { userId } = req.params;
    const checkUser = await userService.findUserInformationById(userId);
    if (!checkUser) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    if (_id.toString() !== checkUser.user.toString()) {
        throw new ErrorHandling_1.ApiError(403, Error_1.default.UNAUTHORIZED_ACCESS);
    }
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        apartmentSuite: req.body.apartmentSuite,
        shipping: req.body.shipping,
        postalCode: req.body.postalCode,
        primaryPhone: req.body.primaryPhone,
        secondaryPhone: req.body.secondaryPhone,
        user: _id
    };
    const result = await userService.updateUserInformation(userId, userData);
    const user = await userService.findUserInformationById(result._id);
    return res.json(new ErrorHandling_1.ApiResponse(200, { user }, SuccessMessages_1.default.USER_UPDATED));
});
exports.deleteUserInformation = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { _id } = req.body.currentUser.userInfo;
    const { userId } = req.params;
    const checkUser = await userService.findUserInformationById(userId);
    if (!checkUser) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    if (_id.toString() !== checkUser.user.toString()) {
        throw new ErrorHandling_1.ApiError(403, Error_1.default.UNAUTHORIZED_ACCESS);
    }
    const user = await userService.deleteUserInformation(userId);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.USER_DELETED));
});
exports.getAllUserInformation = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const users = await userService.getAllUserInformation();
    return res.json(new ErrorHandling_1.ApiResponse(200, { users }, SuccessMessages_1.default.USER_FOUND));
});
exports.getUserInformationById = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { _id } = req.body.currentUser.userInfo;
    const user = await userService.getAllUserInformationRelatedToUser(_id);
    if (!user) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.USER_NOT_FOUND));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { user }, SuccessMessages_1.default.USER_FOUND));
});
