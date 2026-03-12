import { Router } from "express";
import { getAllNewArrivalCategories, getCategories, getCategoryById } from "../../Controller/Category/CategoryController";
const categoryPublicRouter = Router();
categoryPublicRouter.get("/get-all-categories",getCategories);
categoryPublicRouter.get("/get-one-category/:categoryId",getCategoryById);
categoryPublicRouter.get("/categories-new-arrival",getAllNewArrivalCategories );
export default categoryPublicRouter;