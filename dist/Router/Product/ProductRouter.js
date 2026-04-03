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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductRouter = (0, express_1.Router)();
const ProductController = __importStar(require("../../Controller/Product/ProductController"));
const ValidationMiddleware_1 = require("../../middleware/ValidationMiddleware");
const ProductValidation = __importStar(require("../../Validation/Product/ProductValidation"));
ProductRouter.post("/create", (0, ValidationMiddleware_1.Validation)(ProductValidation.createProductValidation), ProductController.CreateProduct);
ProductRouter.patch("/update/:productId", (0, ValidationMiddleware_1.Validation)(ProductValidation.updateProductValidation), ProductController.updateProduct);
ProductRouter.patch("/soft-delete/:productId", (0, ValidationMiddleware_1.Validation)(ProductValidation.ProductIdValidationSchema), ProductController.softDeleteProductController);
ProductRouter.patch("/restore/:_id", (0, ValidationMiddleware_1.Validation)(ProductValidation.ProductIdValidationSchema), ProductController.restoreOneProduct);
ProductRouter.delete("/hard-delete/:productId", (0, ValidationMiddleware_1.Validation)(ProductValidation.ProductIdValidationSchema), ProductController.hardDeleteProductController);
ProductRouter.get("/get-one-product/:productId", (0, ValidationMiddleware_1.Validation)(ProductValidation.getProductByIdValidation), ProductController.findAdminProductById);
ProductRouter.get("/get-all-products", (0, ValidationMiddleware_1.Validation)(ProductValidation.getAdminProductsValidation), ProductController.getAdminProductsByFilters);
//ProductRouter.get("/get-analysis", ProductController.getAnalysis);
exports.default = ProductRouter;
