import { Router } from "express";
import {getAllCategories, getCategoryById } from "../../Controller/Category/CategoryController";
const categoryPublicRouter = Router();
categoryPublicRouter.get("/get-all-categories",getAllCategories);
categoryPublicRouter.get("/get-one-category/:_id",getCategoryById);
export default categoryPublicRouter;