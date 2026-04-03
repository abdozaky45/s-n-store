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
exports.findCustomerById = exports.updateCustomer = exports.identifyCustomer = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const CustomerService = __importStar(require("../../Service/User/CustomerService"));
exports.identifyCustomer = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const customerData = {
        phone: req.body.phone,
    };
    const customer = await CustomerService.identifyCustomer(customerData);
    return res.json(new ErrorHandling_1.ApiResponse(200, { customer }, SuccessMessages_1.default.CUSTOMER_IDENTIFIED));
});
exports.updateCustomer = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const customerData = {
        phone: req.body.phone,
    };
    const customer = await CustomerService.updateCustomer(req.params._id, customerData);
    if (!customer) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.CUSTOMER_NOT_FOUND));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { customer }, SuccessMessages_1.default.CUSTOMER_UPDATED));
});
exports.findCustomerById = (0, ErrorHandling_1.asyncHandler)(async (req, res, next) => {
    const customer = await CustomerService.findCustomerById(req.params._id);
    if (!customer) {
        return next(new ErrorHandling_1.ApiError(404, Error_1.default.CUSTOMER_NOT_FOUND));
    }
    return res.json(new ErrorHandling_1.ApiResponse(200, { customer }, SuccessMessages_1.default.CUSTOMER_FOUND));
});
