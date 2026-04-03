"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCustomerByPhone = exports.findCustomerById = exports.updateCustomer = exports.identifyCustomer = void 0;
const CustomerModel_1 = __importDefault(require("../../Model/User/Customer/CustomerModel"));
const identifyCustomer = async (customerData) => {
    let customer = await CustomerModel_1.default.findOne({ phone: customerData.phone });
    if (!customer) {
        customer = await CustomerModel_1.default.create(customerData);
    }
    return customer;
};
exports.identifyCustomer = identifyCustomer;
const updateCustomer = async (_id, customerData) => {
    const customer = await CustomerModel_1.default.findByIdAndUpdate(_id, customerData, { new: true });
    return customer;
};
exports.updateCustomer = updateCustomer;
const findCustomerById = async (_id) => {
    const customer = await CustomerModel_1.default.findById(_id);
    return customer;
};
exports.findCustomerById = findCustomerById;
const findCustomerByPhone = async (phone) => {
    const customer = await CustomerModel_1.default.findOne({ phone });
    return customer;
};
exports.findCustomerByPhone = findCustomerByPhone;
