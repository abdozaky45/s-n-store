"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserTokens = exports.getAllUserInformation = exports.deleteUserInformation = exports.getAllUserInformationRelatedToUser = exports.findUserInformationById = exports.updateUserInformation = exports.createUser = void 0;
const TokenModel_1 = __importDefault(require("../../Model/Token/TokenModel"));
const UserModel_1 = __importDefault(require("../../Model/User/UserInformation/UserModel"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const createUser = async (userData) => {
    const user = await UserModel_1.default.create(userData);
    return user;
};
exports.createUser = createUser;
const updateUserInformation = async (_id, userData) => {
    const updatedUser = await UserModel_1.default.findByIdAndUpdate(_id, { $set: userData }, { new: true });
    return updatedUser;
};
exports.updateUserInformation = updateUserInformation;
const findUserInformationById = async (id) => {
    const user = await UserModel_1.default.findById(id).populate(SchemaTypesReference_1.default.Shipping).select("-isDeleted");
    return user;
};
exports.findUserInformationById = findUserInformationById;
const getAllUserInformationRelatedToUser = async (user) => {
    const users = await UserModel_1.default.find({ user, isDeleted: false }).populate(SchemaTypesReference_1.default.Shipping).select("-isDeleted");
    return users;
};
exports.getAllUserInformationRelatedToUser = getAllUserInformationRelatedToUser;
const deleteUserInformation = async (_id) => {
    const deletedUser = await UserModel_1.default.findByIdAndUpdate(_id, { isDeleted: true }, { new: true });
    return deletedUser;
};
exports.deleteUserInformation = deleteUserInformation;
const getAllUserInformation = async () => {
    const users = await UserModel_1.default.find({ isDeleted: false }).populate(SchemaTypesReference_1.default.Shipping).select("-isDeleted");
    return users;
};
exports.getAllUserInformation = getAllUserInformation;
const deleteUserTokens = async (user, accessToken) => {
    const tokens = await TokenModel_1.default.findOneAndDelete({ user, accessToken });
    return tokens;
};
exports.deleteUserTokens = deleteUserTokens;
