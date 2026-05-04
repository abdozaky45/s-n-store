import { Router } from "express";
import * as CategoryIconController from "../../Controller/CategoryIcon/CategoryIconController";

const categoryIconPublicRouter = Router();

categoryIconPublicRouter.get("/", CategoryIconController.getActiveCategoryIcons);
categoryIconPublicRouter.get("/:key", CategoryIconController.getActiveCategoryIconByKey);

export default categoryIconPublicRouter;
