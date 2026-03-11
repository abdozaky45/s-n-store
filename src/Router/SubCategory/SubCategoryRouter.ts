import { Router } from "express";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as SubCategoryController from "../../Controller/SubCategory/SubCategoryController";
import * as SubCategoryValidation from "../../Validation/SubCategory/SubCategoryValidation";
const subCategoryRouter = Router();
subCategoryRouter.post("/create", Validation(SubCategoryValidation.subCategoryValidation), SubCategoryController.CreateNewSubCategory);
subCategoryRouter.patch("/update/:_id", Validation(SubCategoryValidation.updateSubCategoryValidation), SubCategoryController.updateSubCategory);
subCategoryRouter.delete("/delete/:_id", Validation(SubCategoryValidation.deleteSubCategoryValidation), SubCategoryController.deleteOneSubCategory);
export default subCategoryRouter;
