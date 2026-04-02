import {Router} from "express";
import * as ColorController from "../../Controller/Color/ColorController";
const PublicColorRouter = Router();
PublicColorRouter.get("/", ColorController.getAllColorsController);
PublicColorRouter.get("/:_id", ColorController.findColorByIdController);
export default PublicColorRouter;