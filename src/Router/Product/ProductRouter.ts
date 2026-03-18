import { Router } from "express";
const ProductRouter = Router();
import * as ProductController from "../../Controller/Product/ProductController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as ProductValidation from "../../Validation/Product/ProductValidation";
ProductRouter.post("/create", Validation(ProductValidation.createProductValidation), ProductController.CreateProduct);
ProductRouter.patch("/update/:productId", Validation(ProductValidation.updateProductValidation), ProductController.updateProduct);
ProductRouter.delete("/delete/:productId", Validation(ProductValidation.deleteProductValidation), ProductController.deleteProduct);
ProductRouter.get("/get-one-product/:productId", Validation(ProductValidation.getProductByIdValidation), ProductController.findAdminProductById);
ProductRouter.get("/get-all-products", Validation(ProductValidation.getAdminProductsValidation), ProductController.getAdminProductsByFilters);
ProductRouter.get("/sold-out", Validation(ProductValidation.getSoldOutProductsValidation), ProductController.findSoldOutProducts);
//ProductRouter.get("/get-analysis", ProductController.getAnalysis);

export default ProductRouter;