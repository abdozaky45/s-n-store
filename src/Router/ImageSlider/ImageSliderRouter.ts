import { Router } from "express";
import * as ImageSliderController from "../../Controller/ImageSlider/ImageSliderController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as ImageSliderValidation from "../../Validation/ImageSlider/ImageSliderValidation";
const imageSliderRouter = Router();
imageSliderRouter.post("/create", Validation(ImageSliderValidation.createImageSliderValidation), ImageSliderController.createHeroSection);
imageSliderRouter.patch("/update/:id", Validation(ImageSliderValidation.updateImageSliderValidation), ImageSliderController.updateOneHeroSection);
imageSliderRouter.delete("/delete/:id", Validation(ImageSliderValidation.deleteImageSliderValidation), ImageSliderController.deleteHeroSection);
export default imageSliderRouter;
