"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewActiveCodeWithEmail = exports.activeAccount = exports.registerWithEmail = void 0;
const AuthService_1 = require("../../Service/Authentication/AuthService");
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const HashAndCompare_1 = require("../../Utils/HashAndCompare");
const DateAndTime_1 = __importDefault(require("../../Utils/DateAndTime"));
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const WelcomeEmailTemplate_1 = require("../../Utils/Nodemailer/WelcomeEmailTemplate");
const SendEmail_1 = require("../../Utils/Nodemailer/SendEmail");
const UserType_1 = require("../../Utils/UserType");
const GenerateAndVerifyToken_1 = require("../../Utils/GenerateAndVerifyToken");
exports.registerWithEmail = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    let user = await (0, AuthService_1.findUserByEmail)(email);
    if (!user) {
        user = await (0, AuthService_1.createUserAccount)(email);
        (0, SendEmail_1.sendEmail)({
            to: email,
            subject: "Welcome to S&N LANGIRE",
            html: (0, WelcomeEmailTemplate_1.SendWelcomeEmail)(),
        });
        return res.status(201).json(new ErrorHandling_1.ApiResponse(201, null, SuccessMessages_1.default.USER_CREATED));
    }
    if (user.role === UserType_1.UserTypeEnum.ADMIN) {
        const activeCode = (0, AuthService_1.generateSixDigitCode)();
        const hashCode = await (0, HashAndCompare_1.hashActiveCode)(activeCode);
        user.activeCode = hashCode;
        user.codeCreatedAt = (0, DateAndTime_1.default)().valueOf();
        await user.save();
        (0, AuthService_1.sendActivationEmail)(email, activeCode);
        return res
            .status(200)
            .json(new ErrorHandling_1.ApiResponse(200, { email }, SuccessMessages_1.default.EMAIL_SENT));
    }
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, null, SuccessMessages_1.default.WELCOME_EMAIL_SENT));
});
exports.activeAccount = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { email, activeCode } = req.body;
    const user = await (0, AuthService_1.findUserByEmail)(email);
    if (!user) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.EMAIL_NOT_FOUND);
    }
    if (user.role !== UserType_1.UserTypeEnum.ADMIN) {
        throw new ErrorHandling_1.ApiError(403, Error_1.default.NOT_PERMITTED);
    }
    const currentTime = (0, DateAndTime_1.default)().valueOf();
    const createdAt = user.codeCreatedAt;
    if (currentTime - createdAt > 5 * 60 * 1000) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.ACTIVE_CODE_EXPIRED);
    }
    const isMatch = await (0, HashAndCompare_1.compareActiveCode)(activeCode, user.activeCode);
    if (!isMatch) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.ACTIVE_CODE_NOT_MATCH);
    }
    const updateUser = await (0, AuthService_1.updateUserAndDeleteActiveCode)(email);
    const accessToken = (0, GenerateAndVerifyToken_1.generateAccessToken)({
        payload: {
            _id: updateUser?._id,
            role: updateUser?.role,
            email: updateUser?.email,
        },
    });
    const agent = req.headers["user-agent"] || "unknown";
    await (0, AuthService_1.createNewAccessTokenOrUpdate)(accessToken, updateUser._id, agent);
    return res
        .status(200)
        .json(new ErrorHandling_1.ApiResponse(200, { accessToken }, SuccessMessages_1.default.SUCCESS_ACCOUNT));
});
exports.sendNewActiveCodeWithEmail = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const { email } = req.body;
    const user = await (0, AuthService_1.findUserByEmail)(email);
    if (!user) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.EMAIL_NOT_FOUND);
    }
    if (user.role !== UserType_1.UserTypeEnum.ADMIN) {
        throw new ErrorHandling_1.ApiError(403, Error_1.default.NOT_PERMITTED);
    }
    const activeCode = (0, AuthService_1.generateSixDigitCode)();
    const hashCode = await (0, HashAndCompare_1.hashActiveCode)(activeCode);
    user.codeCreatedAt = (0, DateAndTime_1.default)().valueOf();
    user.activeCode = hashCode;
    await user.save();
    (0, AuthService_1.sendActivationEmail)(email, activeCode);
    return res.status(200).json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.EMAIL_SENT));
});
