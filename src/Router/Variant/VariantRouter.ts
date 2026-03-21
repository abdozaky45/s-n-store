import { Router } from "express";
import * as VariantController from "../../Controller/Variant/VariantController";
import * as variantValidation from "../../Validation/Variant/VariantValidation";
import { Validation } from "../../middleware/ValidationMiddleware";
const VariantRouter = Router();
VariantRouter.post("/", Validation(variantValidation.createVariantValidation), VariantController.createVariantController);
VariantRouter.get("/product/:productId", Validation(variantValidation.getVariantsByProductValidation), VariantController.getVariantsByProductController);
VariantRouter.get("/:variantId", Validation(variantValidation.variantIdValidation), VariantController.getVariantByIdController);
VariantRouter.patch("/:variantId",  Validation(variantValidation.updateVariantQuantityValidation), VariantController.updateVariantQuantityController);
VariantRouter.delete("/:variantId", Validation(variantValidation.variantIdValidation), VariantController.deleteVariantController);
export default VariantRouter;

