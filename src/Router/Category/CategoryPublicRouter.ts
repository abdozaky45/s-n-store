import { Router } from "express";
import { getAllCategories, getCategoryByIdUser } from "../../Controller/Category/CategoryController";
const categoryPublicRouter = Router();
categoryPublicRouter.get("/get-all-categories", getAllCategories);
categoryPublicRouter.get("/get-one-category/:_id", getCategoryByIdUser);
export default categoryPublicRouter;