import {Router} from "express"; 
import * as ImageSliderController from "../../Controller/ImageSlider/ImageSliderController";
import { Validation } from "../../middleware/ValidationMiddleware";
import { imageSliderIdUserValidation } from "../../Validation/ImageSlider/ImageSliderValidation";
const PublicImageSliderRouter = Router();
PublicImageSliderRouter.get("/all",ImageSliderController.getAllImageSliderSection);
PublicImageSliderRouter.get("/:_id",Validation(imageSliderIdUserValidation),ImageSliderController.getImageSliderById);
export default PublicImageSliderRouter;