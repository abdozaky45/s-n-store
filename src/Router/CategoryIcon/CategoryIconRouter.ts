import { Router } from "express";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as CategoryIconController from "../../Controller/CategoryIcon/CategoryIconController";
import * as CategoryIconValidation from "../../Validation/CategoryIcon/CategoryIconValidation";

const categoryIconRouter = Router();

categoryIconRouter.post(
  "/",
  Validation(CategoryIconValidation.createCategoryIconValidation),
  CategoryIconController.createCategoryIcon
);
categoryIconRouter.get("/", CategoryIconController.getAllCategoryIcons);
categoryIconRouter.get(
  "/:key",
  Validation(CategoryIconValidation.categoryIconKeyValidation),
  CategoryIconController.getCategoryIconByKey
);
categoryIconRouter.put(
  "/:key",
  Validation(CategoryIconValidation.updateCategoryIconValidation),
  CategoryIconController.updateCategoryIcon
);
categoryIconRouter.delete(
  "/:key",
  Validation(CategoryIconValidation.categoryIconKeyValidation),
  CategoryIconController.deleteCategoryIcon
);

export default categoryIconRouter;
