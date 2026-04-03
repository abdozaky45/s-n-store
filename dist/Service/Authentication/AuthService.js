"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByAccessTokenAndUserId = exports.findOneUserById = exports.SaveAccessToken = exports.findRefreshToken = exports.createNewAccessTokenOrUpdate = exports.updateUserAndDeleteActiveCode = exports.createUserAccount = exports.findUserById = exports.findUserByPhone = exports.findUserByEmail = exports.sendActivationEmail = void 0;
exports.generateSixDigitCode = generateSixDigitCode;
const nanoid_1 = require("nanoid");
const SendEmail_1 = require("../../Utils/Nodemailer/SendEmail");
const AuthModel_1 = __importDefault(require("../../Model/User/auth/AuthModel"));
const SendCodeTemplate_1 = require("../../Utils/Nodemailer/SendCodeTemplate");
const StatusType_1 = require("../../Utils/StatusType");
const TokenModel_1 = __importDefault(require("../../Model/Token/TokenModel"));
function generateSixDigitCode() {
    let code = (0, nanoid_1.nanoid)(6);
    code = code.replace(/[^0-9]/g, "");
    while (code.length < 6) {
        code = (0, nanoid_1.nanoid)(6).replace(/[^0-9]/g, "");
    }
    return code;
}
const sendActivationEmail = async (email, activeCode) => {
    try {
        const isSent = await (0, SendEmail_1.sendEmail)({
            to: email,
            subject: "Your Activation Code",
            html: (0, SendCodeTemplate_1.activeCodeTemplate)(activeCode),
        });
        return isSent;
    }
    catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
exports.sendActivationEmail = sendActivationEmail;
const findUserByEmail = async (email) => {
    const user = await AuthModel_1.default.findOne({ email });
    return user;
};
exports.findUserByEmail = findUserByEmail;
const findUserByPhone = async (phone) => {
    const user = await AuthModel_1.default.findOne({ phone });
    return user;
};
exports.findUserByPhone = findUserByPhone;
const findUserById = async (_id) => {
    const user = await AuthModel_1.default.findById(_id);
    return user;
};
exports.findUserById = findUserById;
const createUserAccount = async (email) => {
    const user = await AuthModel_1.default.create({
        email,
    });
    return user;
};
exports.createUserAccount = createUserAccount;
const updateUserAndDeleteActiveCode = async (searchKey) => {
    const user = await AuthModel_1.default.findOneAndUpdate({ $or: [{ email: searchKey }, { phone: searchKey }] }, {
        isConfirmed: true,
        status: StatusType_1.StatusEnum.Online,
        $unset: { activeCode: 1, codeCreatedAt: 1 },
    });
    return user;
};
exports.updateUserAndDeleteActiveCode = updateUserAndDeleteActiveCode;
const createNewAccessTokenOrUpdate = async (accessToken, user, userAgent) => {
    const token = await TokenModel_1.default.findOneAndUpdate({ user }, { accessToken, userAgent }, { upsert: true, new: true });
    return token;
};
exports.createNewAccessTokenOrUpdate = createNewAccessTokenOrUpdate;
const findRefreshToken = async (refreshToken) => {
    const token = await TokenModel_1.default.findOne({
        refreshToken,
    });
    return token;
};
exports.findRefreshToken = findRefreshToken;
const SaveAccessToken = async (_id, accessToken) => {
    const token = await TokenModel_1.default.findByIdAndUpdate({ _id }, { accessToken });
    return token;
};
exports.SaveAccessToken = SaveAccessToken;
const findOneUserById = async (id) => {
    const user = await AuthModel_1.default.findById(id);
    return user;
};
exports.findOneUserById = findOneUserById;
const findUserByAccessTokenAndUserId = async (user, accessToken) => {
    const token = await TokenModel_1.default.findOne({
        user,
        accessToken,
    });
    return token;
};
exports.findUserByAccessTokenAndUserId = findUserByAccessTokenAndUserId;
