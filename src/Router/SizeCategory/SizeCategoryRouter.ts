import { Router } from "express"
import * as SizeCategoryController from "../../Controller/SizeCategory/SizeCategoryController";
import { Validation } from '../../middleware/ValidationMiddleware';
import * as SizeCategoryValidation from "../../Validation/SizeCategory/SizeCategoryValidation";
const SizeCategoryRouter = Router();
SizeCategoryRouter.post("/create", Validation(SizeCategoryValidation.createSizeCategory), SizeCategoryController.createNewSizeCategory);
SizeCategoryRouter.get("/get-one/:_id", Validation(SizeCategoryValidation.getSizeCategoryById), SizeCategoryController.getSizeCategoryById);
SizeCategoryRouter.get("/get-by-name/:name", Validation(SizeCategoryValidation.getSizeCategoriesByName), SizeCategoryController.getSizeCategoriesByName);
SizeCategoryRouter.patch("/update/:_id", Validation(SizeCategoryValidation.updateSizeCategory), SizeCategoryController.updateSizeCategoryById);
SizeCategoryRouter.delete("/delete/:_id", Validation(SizeCategoryValidation.deleteSizeCategoryById), SizeCategoryController.deleteSizeCategoryById);
SizeCategoryRouter.get("/get-all", SizeCategoryController.getAllSizeCategories);
export default SizeCategoryRouter;