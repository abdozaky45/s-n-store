import { Router } from "express";
import { getSubCategoryById } from "../../Controller/SubCategory/SubCategoryController";
import { getAllSubCategories } from "../../Service/SubCategory/SubCategoryService";
const subCategoryPublicRouter = Router();
subCategoryPublicRouter.get("/get-all-sub-categories",getAllSubCategories);
subCategoryPublicRouter.get("/get-one-sub-category/:subCategoryId",getSubCategoryById);
export default subCategoryPublicRouter;