import { Router } from "express";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as SubCategoryController from "../../Controller/SubCategory/SubCategoryController";
import * as SubCategoryValidation from "../../Validation/SubCategory/SubCategoryValidation";
const subCategoryRouter = Router();
subCategoryRouter.post(
    "/create",
    Validation(SubCategoryValidation.subCategoryValidation),
    SubCategoryController.CreateSubCategory
);
subCategoryRouter.patch(
    "/update/:_id",
    Validation(SubCategoryValidation.updateSubCategoryValidation),
    SubCategoryController.updateSubCategory
);
subCategoryRouter.patch(
    "/soft-delete/:_id",
    Validation(SubCategoryValidation.subCategoryIdAdminValidationSchema),
    SubCategoryController.softDeleteOneSubCategory
);
subCategoryRouter.patch(
    "/restore/:_id",
    Validation(SubCategoryValidation.subCategoryIdAdminValidationSchema),
    SubCategoryController.restoreOneSubCategory
);
subCategoryRouter.delete(
    "/hard-delete/:_id",
    Validation(SubCategoryValidation.subCategoryIdAdminValidationSchema),
    SubCategoryController.hardDeleteOneSubCategory
);
subCategoryRouter.get(
    "/all-deleted-sub-categories",
    SubCategoryController.getAllDeletedSubCategories
);
subCategoryRouter.get(
    "/get-all-sub-categories",
    SubCategoryController.getSubCategories
);
subCategoryRouter.get(
    "/get-one-sub-category/:_id",
    Validation(SubCategoryValidation.subCategoryIdAdminValidationSchema),
    SubCategoryController.getSubCategoryById
);
export default subCategoryRouter;
