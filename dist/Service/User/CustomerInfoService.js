"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfPrimaryPhoneExists = exports.findCutsomerInfoByCustomerId = exports.findCutsomerInfoById = exports.deleteCutsomerInfo = exports.updateCutsomerInfo = exports.createCutsomerInfo = void 0;
const CustomerInfoModel_1 = __importDefault(require("../../Model/User/Customer/CustomerInfoModel"));
const SchemaTypesReference_1 = __importDefault(require("../../Utils/Schemas/SchemaTypesReference"));
const createCutsomerInfo = async (userData) => {
    const user = await CustomerInfoModel_1.default.create(userData);
    return user;
};
exports.createCutsomerInfo = createCutsomerInfo;
const updateCutsomerInfo = async (_id, userData) => {
    const updatedUser = await CustomerInfoModel_1.default.findByIdAndUpdate(_id, { $set: userData }, { new: true });
    return updatedUser;
};
exports.updateCutsomerInfo = updateCutsomerInfo;
const deleteCutsomerInfo = async (customer) => {
    const deletedUser = await CustomerInfoModel_1.default.findOneAndDelete({ customer });
    return deletedUser;
};
exports.deleteCutsomerInfo = deleteCutsomerInfo;
const findCutsomerInfoById = async (_id) => {
    const user = await CustomerInfoModel_1.default.findById(_id).populate(SchemaTypesReference_1.default.Shipping);
    return user;
};
exports.findCutsomerInfoById = findCutsomerInfoById;
const findCutsomerInfoByCustomerId = async (customer) => {
    const users = await CustomerInfoModel_1.default.find({ customer }).populate(SchemaTypesReference_1.default.Shipping);
    return users;
};
exports.findCutsomerInfoByCustomerId = findCutsomerInfoByCustomerId;
const checkIfPrimaryPhoneExists = async (customer) => {
    const user = await CustomerInfoModel_1.default.findOne({ customer });
    return user;
};
exports.checkIfPrimaryPhoneExists = checkIfPrimaryPhoneExists;
