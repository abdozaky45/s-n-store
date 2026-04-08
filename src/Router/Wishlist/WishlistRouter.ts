import {Router} from "express";
import * as wishlistController from "../../Controller/Wishlist/WishlistController";
import {Validation} from "../../middleware/ValidationMiddleware";
import * as wishlistValidation from "../../Validation/Wishlist/WishlistValidation";
const wishlistRouter = Router();
wishlistRouter.get("/", Validation(wishlistValidation.getAllWishlistValidation), wishlistController.getAllWishlistItems);
export default wishlistRouter;