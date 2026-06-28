import { Router } from "express";
const ProductPublicRouter = Router();
import * as ProductController from "../../Controller/Product/ProductController";
import { Validation } from "../../middleware/ValidationMiddleware";
import * as ProductValidation from "../../Validation/Product/ProductValidation";
ProductPublicRouter.get("/search", Validation(ProductValidation.UserProductSearchSchema), ProductController.SearchProducts);
ProductPublicRouter.get("/get-one-product/:productId", Validation(ProductValidation.getUserProductByIdValidation), ProductController.getUserProductById);
// Open Graph share preview (HTML) for WhatsApp/Messenger/Facebook link previews.
ProductPublicRouter.get("/share/:productId", Validation(ProductValidation.getProductShareValidation), ProductController.getProductSharePreview);
ProductPublicRouter.get("/get-all-products", Validation(ProductValidation.getUserAllProductsValidation), ProductController.getAllProductsForUser);
ProductPublicRouter.get("/home-products", ProductController.getHomeProducts);
ProductPublicRouter.get("/home-sale-products", ProductController.getHomeSaleProducts);
ProductPublicRouter.post("/stock", Validation(ProductValidation.getStockValidation), ProductController.getStockForProducts);
export default ProductPublicRouter;