import { Router } from "express";
import * as VariantController from "../../Controller/Variant/VariantController";
import * as variantValidation from "../../Validation/Variant/VariantValidation";
import { Validation } from "../../middleware/ValidationMiddleware";
const VariantRouter = Router();
// Many operations
VariantRouter.patch("/bulk", Validation(variantValidation.updateManyVariantsValidation), VariantController.updateManyVariants);
VariantRouter.delete("/bulk", Validation(variantValidation.deleteManyVariantsValidation), VariantController.deleteManyVariants);
// Single operations
VariantRouter.post("/", Validation(variantValidation.createVariantValidation), VariantController.createVariantController);
VariantRouter.get("/product/:productId", Validation(variantValidation.getVariantsByProductValidation), VariantController.getVariantsByProductController);
VariantRouter.get("/:variantId", Validation(variantValidation.variantIdValidation), VariantController.getVariantByIdController);
VariantRouter.patch("/:variantId", Validation(variantValidation.updateVariantQuantityValidation), VariantController.updateVariantQuantityController);
VariantRouter.delete("/:variantId", Validation(variantValidation.variantIdValidation), VariantController.deleteVariantController);
export default VariantRouter;

