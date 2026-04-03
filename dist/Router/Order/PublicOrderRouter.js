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
const express_1 = require("express");
const OrderController_1 = __importDefault(require("../../Controller/Order/OrderController"));
const orderValidation = __importStar(require("../../Validation/Order/OrderValidation"));
const ValidationMiddleware_1 = require("../../middleware/ValidationMiddleware");
const PublicOrderRouter = (0, express_1.Router)();
PublicOrderRouter.post("/", (0, ValidationMiddleware_1.Validation)(orderValidation.createOrderValidation), OrderController_1.default.createOrderController);
PublicOrderRouter.get("/track/customer/:customerId", (0, ValidationMiddleware_1.Validation)(orderValidation.customerIdValidation), OrderController_1.default.trackOrdersByCustomerIdController);
PublicOrderRouter.get("/track/:orderNumber", (0, ValidationMiddleware_1.Validation)(orderValidation.orderNumberValidation), OrderController_1.default.trackOrderByOrderNumberController);
PublicOrderRouter.get("/user/:customerId", (0, ValidationMiddleware_1.Validation)(orderValidation.getUserOrdersValidation), OrderController_1.default.getUserOrdersController);
PublicOrderRouter.patch("/cancel/:orderId", (0, ValidationMiddleware_1.Validation)(orderValidation.orderIdValidation), OrderController_1.default.cancelOrderController);
exports.default = PublicOrderRouter;
