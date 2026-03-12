import { Router } from "express";
import { getSubCategories, getSubCategoryById } from "../../Controller/SubCategory/SubCategoryController";
const subCategoryPublicRouter = Router();
subCategoryPublicRouter.get("/get-all-sub-categories",getSubCategories);
subCategoryPublicRouter.get("/get-one-sub-category/:subCategoryId",getSubCategoryById);
export default subCategoryPublicRouter;