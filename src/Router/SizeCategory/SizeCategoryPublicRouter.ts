import { Router } from "express";
import * as SizeCategoryController from "../../Controller/SizeCategory/SizeCategoryController";
const SizeCategoryPublicRouter = Router();
SizeCategoryPublicRouter.get("/", SizeCategoryController.getAllSizeCategories);
export default SizeCategoryPublicRouter;
