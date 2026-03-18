import { Router } from "express";

const ProductPublicRouter = Router();
import * as ProductController from "../../Controller/Product/ProductController";
ProductPublicRouter.get("/search-product",ProductController.SearchProducts);
ProductPublicRouter.get("/get-one-product/:productId", ProductController.findUserProductById);
ProductPublicRouter.get("/get-all-product",ProductController.findUserAllProductsByFilters);
ProductPublicRouter.post("/products-stock",ProductController.findProductsStock);














// ProductPublicRouter.get("/get-all-sale",ProductController.getAllSaleProducts);
// ProductPublicRouter.get("/sort-by",ProductController.sortProduct);
// ProductPublicRouter.get("/sort-by-price",ProductController.sortProductByPrice);
// ProductPublicRouter.get("/get-category/:categoryId", ProductController.getAllProductsByCategoryId);
// ProductPublicRouter.get("/",ProductController.sortProductByRangeAndPrice);
export default ProductPublicRouter;