"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SubCategoryController_1 = require("../../Controller/SubCategory/SubCategoryController");
const subCategoryPublicRouter = (0, express_1.Router)();
subCategoryPublicRouter.get("/get-all-sub-categories", SubCategoryController_1.getSubCategories);
subCategoryPublicRouter.get("/get-one-sub-category/:subCategoryId", SubCategoryController_1.getSubCategoryById);
exports.default = subCategoryPublicRouter;
