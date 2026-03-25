import { Router } from "express"
import * as SizeCategoryController from "../../Controller/SizeCategory/SizeCategoryController";
import { Validation } from '../../middleware/ValidationMiddleware';
import * as SizeCategoryValidation from "../../Validation/SizeCategory/SizeCategoryValidation";
const SizeCategoryRouter = Router();
SizeCategoryRouter.post("/create-group-size", Validation(SizeCategoryValidation.createGroupSize), SizeCategoryController.createNewGroupSize);
SizeCategoryRouter.get("/get-group-size/:_id", Validation(SizeCategoryValidation.getGroupSizeById), SizeCategoryController.getGroupSizeById);
SizeCategoryRouter.get("/get-all-group-sizes", SizeCategoryController.getAllGroupSizes);
SizeCategoryRouter.patch("/update-group-size/:_id", Validation(SizeCategoryValidation.updateGroupSize), SizeCategoryController.updateGroupSizeById);    
SizeCategoryRouter.post("/create", Validation(SizeCategoryValidation.createSizeCategory), SizeCategoryController.createNewSizeCategory);
SizeCategoryRouter.get("/get-one/:_id", Validation(SizeCategoryValidation.getSizeCategoryById), SizeCategoryController.getSizeCategoryById);
SizeCategoryRouter.get("/get-by-group-id/:groupId", Validation(SizeCategoryValidation.getSizeCategoriesByGroupId), SizeCategoryController.getSizeCategoriesByGroupId);
SizeCategoryRouter.patch("/update/:_id", Validation(SizeCategoryValidation.updateSizeCategory), SizeCategoryController.updateSizeCategoryById);
SizeCategoryRouter.delete("/delete/:_id", Validation(SizeCategoryValidation.deleteSizeCategoryById), SizeCategoryController.deleteSizeCategoryById);
SizeCategoryRouter.get("/get-all", SizeCategoryController.getAllSizeCategories);
export default SizeCategoryRouter;