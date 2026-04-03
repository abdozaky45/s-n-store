"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.checkAuthority = void 0;
const ErrorHandling_1 = require("../Utils/ErrorHandling");
const ErrorHandling_2 = require("../Utils/ErrorHandling");
const GenerateAndVerifyToken_1 = require("../Utils/GenerateAndVerifyToken");
const Error_1 = __importDefault(require("../Utils/Error"));
const AuthService_1 = require("../Service/Authentication/AuthService");
const checkAuthority = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    if (req.originalUrl.startsWith("/public")) {
        return next();
    }
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json(new ErrorHandling_1.ApiResponse(401, null, Error_1.default.Token_PAYLOAD_INVALID));
    }
    const token = authorization.split(" ")[1];
    let decoded;
    try {
        decoded = (0, GenerateAndVerifyToken_1.verifyToken)({ token });
    }
    catch (error) {
        return res.status(401).json(new ErrorHandling_1.ApiResponse(401, null, Error_1.default.Token_PAYLOAD_INVALID));
    }
    if (!decoded?._id) {
        throw new ErrorHandling_2.ApiError(401, Error_1.default.INVALID_PAYLOAD);
    }
    const user = await (0, AuthService_1.findUserByAccessTokenAndUserId)(decoded._id, token);
    if (!user || !(user.accessToken === token)) {
        throw new ErrorHandling_2.ApiError(401, Error_1.default.USER_TOKEN_IS_INVALID);
    }
    const currentUser = {
        userInfo: decoded,
        token,
    };
    if (!req.body)
        req.body = {};
    req.body.currentUser = currentUser;
    next();
});
exports.checkAuthority = checkAuthority;
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        const { currentUser } = req.body;
        if (!requiredRoles.includes(currentUser.userInfo.role)) {
            throw new ErrorHandling_2.ApiError(403, Error_1.default.ROLE_ERROR);
        }
        next();
    };
};
exports.checkRole = checkRole;
