import { Router } from "express";
import { findAllSaleCategories, getAllNewArrivalCategories, getCategories, getCategoryById } from "../../Controller/Category/CategoryController";
const categoryPublicRouter = Router();
categoryPublicRouter.get("/get-all-categories",getCategories);
categoryPublicRouter.get("/get-one-category/:categoryId",getCategoryById);
categoryPublicRouter.get("/get-all-categories-new-arrival",getAllNewArrivalCategories);
categoryPublicRouter.get("/get-all-categories-sale/:categoryId",findAllSaleCategories);
export default categoryPublicRouter;