import { Router } from "express";
import { getSubCategories, getSubCategoryById } from "../../Controller/SubCategory/SubCategoryController";
import { Validation } from "../../middleware/ValidationMiddleware";
import { subCategoryIdUserValidationSchema } from "../../Validation/SubCategory/SubCategoryValidation";
const subCategoryPublicRouter = Router();
subCategoryPublicRouter.get("/get-all-sub-categories", getSubCategories);
subCategoryPublicRouter.get("/get-one-sub-category/:_id", Validation(subCategoryIdUserValidationSchema), getSubCategoryById);
export default subCategoryPublicRouter;