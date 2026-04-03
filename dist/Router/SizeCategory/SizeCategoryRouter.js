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
const SizeCategoryController = __importStar(require("../../Controller/SizeCategory/SizeCategoryController"));
const ValidationMiddleware_1 = require("../../middleware/ValidationMiddleware");
const SizeCategoryValidation = __importStar(require("../../Validation/SizeCategory/SizeCategoryValidation"));
const SizeCategoryRouter = (0, express_1.Router)();
// Group Size Routes
SizeCategoryRouter.post("/group", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.createGroupSize), SizeCategoryController.createNewGroupSize);
SizeCategoryRouter.get("/group/:_id", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.getGroupSizeById), SizeCategoryController.getGroupSizeById);
SizeCategoryRouter.get("/group-all", SizeCategoryController.getAllGroupSizes);
SizeCategoryRouter.patch("/update-group/:_id", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.updateGroupSize), SizeCategoryController.updateGroupSizeById);
// Size Category Routes
SizeCategoryRouter.post("/size", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.createSizeCategory), SizeCategoryController.createNewSizeCategory);
SizeCategoryRouter.patch("/size/:_id", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.updateSizeCategory), SizeCategoryController.updateSizeCategoryById);
SizeCategoryRouter.delete("/size/:_id", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.deleteSizeCategoryById), SizeCategoryController.deleteSizeCategoryById);
SizeCategoryRouter.get("/all-size", SizeCategoryController.getAllSizeCategories);
SizeCategoryRouter.get("/one-size/:_id", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.getSizeCategoryById), SizeCategoryController.getSizeCategoryById);
SizeCategoryRouter.get("/all-sizes-by-group/:groupId", (0, ValidationMiddleware_1.Validation)(SizeCategoryValidation.getSizeCategoriesByGroupId), SizeCategoryController.getSizeCategoriesByGroupId);
exports.default = SizeCategoryRouter;
