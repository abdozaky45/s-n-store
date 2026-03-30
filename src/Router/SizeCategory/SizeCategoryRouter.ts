import { Router } from "express"
import * as SizeCategoryController from "../../Controller/SizeCategory/SizeCategoryController";
import { Validation } from '../../middleware/ValidationMiddleware';
import * as SizeCategoryValidation from "../../Validation/SizeCategory/SizeCategoryValidation";
const SizeCategoryRouter = Router();
// Group Size Routes
SizeCategoryRouter.post("/group", Validation(SizeCategoryValidation.createGroupSize), SizeCategoryController.createNewGroupSize);
SizeCategoryRouter.get("/group/:_id", Validation(SizeCategoryValidation.getGroupSizeById), SizeCategoryController.getGroupSizeById);
SizeCategoryRouter.get("/group-all", SizeCategoryController.getAllGroupSizes);
SizeCategoryRouter.patch("/update-group/:_id", Validation(SizeCategoryValidation.updateGroupSize), SizeCategoryController.updateGroupSizeById);    
// Size Category Routes
SizeCategoryRouter.post("/size", Validation(SizeCategoryValidation.createSizeCategory), SizeCategoryController.createNewSizeCategory);
SizeCategoryRouter.patch("/size/:_id", Validation(SizeCategoryValidation.updateSizeCategory), SizeCategoryController.updateSizeCategoryById);
SizeCategoryRouter.delete("/size/:_id", Validation(SizeCategoryValidation.deleteSizeCategoryById), SizeCategoryController.deleteSizeCategoryById);
SizeCategoryRouter.get("/all-size", SizeCategoryController.getAllSizeCategories);
SizeCategoryRouter.get("/one-size/:_id", Validation(SizeCategoryValidation.getSizeCategoryById), SizeCategoryController.getSizeCategoryById);
SizeCategoryRouter.get("/all-sizes-by-group/:groupId", Validation(SizeCategoryValidation.getSizeCategoriesByGroupId), SizeCategoryController.getSizeCategoriesByGroupId);
export default SizeCategoryRouter;