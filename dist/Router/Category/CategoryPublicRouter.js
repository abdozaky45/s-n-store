"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../../Controller/Category/CategoryController");
const categoryPublicRouter = (0, express_1.Router)();
categoryPublicRouter.get("/get-all-categories", CategoryController_1.getCategories);
categoryPublicRouter.get("/get-one-category/:categoryId", CategoryController_1.getCategoryById);
exports.default = categoryPublicRouter;
