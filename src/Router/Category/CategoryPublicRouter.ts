import { Router } from "express";
import {getCategories, getCategoryById } from "../../Controller/Category/CategoryController";
const categoryPublicRouter = Router();
categoryPublicRouter.get("/get-all-categories",getCategories);
categoryPublicRouter.get("/get-one-category/:_id",getCategoryById);
export default categoryPublicRouter;