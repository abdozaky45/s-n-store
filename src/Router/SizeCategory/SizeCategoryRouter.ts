import { Router } from "express"
import * as SizeCategoryController from "../../Controller/SizeCategory/SizeCategoryController";
import { Validation } from '../../middleware/ValidationMiddleware';
import * as SizeCategoryValidation from "../../Validation/SizeCategory/SizeCategoryValidation";
const SizeCategoryRouter = Router();
// Group Size Routes
SizeCategoryRouter.get("/group-all", SizeCategoryController.getAllGroupSizes);
SizeCategoryRouter.post("/group", Validation(SizeCategoryValidation.createGroupSize), SizeCategoryController.createGroupSize);
SizeCategoryRouter.get("/group/:_id", Validation(SizeCategoryValidation.getGroupSizeById), SizeCategoryController.getGroupSizeById);
SizeCategoryRouter.patch("/update-group/:_id", Validation(SizeCategoryValidation.updateGroupSize), SizeCategoryController.updateGroupSizeById);
// Size Category Routes
SizeCategoryRouter.get("/all-size", SizeCategoryController.getAllSizeCategories);
SizeCategoryRouter.get("/all-sizes-by-group/:groupId", Validation(SizeCategoryValidation.getSizeCategoriesByGroupId), SizeCategoryController.getSizeCategoriesByGroupId);
SizeCategoryRouter.post("/size", Validation(SizeCategoryValidation.createSizeCategory), SizeCategoryController.createSizeCategory);
SizeCategoryRouter.get("/one-size/:_id", Validation(SizeCategoryValidation.getSizeCategoryById), SizeCategoryController.getSizeCategoryById);
SizeCategoryRouter.patch("/size/:_id", Validation(SizeCategoryValidation.updateSizeCategory), SizeCategoryController.updateSizeCategoryById);
SizeCategoryRouter.delete("/size/:_id", Validation(SizeCategoryValidation.deleteSizeCategoryById), SizeCategoryController.deleteSizeCategoryById);
export default SizeCategoryRouter;