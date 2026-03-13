import { Router } from "express";
import { getAllNewArrivalSubCategories, getSubCategories, getSubCategoryById } from "../../Controller/SubCategory/SubCategoryController";
const subCategoryPublicRouter = Router();
subCategoryPublicRouter.get("/get-all-sub-categories",getSubCategories);
subCategoryPublicRouter.get("/get-one-sub-category/:subCategoryId",getSubCategoryById);
subCategoryPublicRouter.get("/get-all-subcategories-new-arrival",getAllNewArrivalSubCategories);
export default subCategoryPublicRouter;