import { Request, Response, NextFunction } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import moment from "../../Utils/DateAndTime";
import ErrorMessages from "../../Utils/Error";
import * as wishlistService from "../../Service/Wishlist/WishlistService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { getUserProductById } from "../../Service/Product/ProductService";
export const createWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId,userId } = req.body;
    const Product = await getUserProductById(productId);
    if (!Product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);
    const ExistingWishlist = await wishlistService.getProductWishlist(productId, userId);
    if (ExistingWishlist) throw new ApiError(404, ErrorMessages.WISHLIST_ALREADY_EXISTS);
      const wishlist = await wishlistService.AddProductToFavorites(
        userId,
        productId,
        moment().valueOf()
      );
      return res
        .status(200)
        .json(
          new ApiResponse(200, { wishlist }, SuccessMessage.ADD_PRODUCT_TO_WISHLIST)
        );
    }
);
export const getWishlistByUserId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {wishlistId,userId} = req.params as { wishlistId: string; userId: string };
    const wishlist = await  wishlistService.getWishlistById(wishlistId,userId);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist },""));
  }
);
export const deleteWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {productId ,userId} = req.params as { productId: string; userId: string };
    if (!productId) throw new ApiError(404, ErrorMessages.DATA_IS_REQUIRED);
    const wishlist = await wishlistService.removeProductFromFavorites(userId, productId);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, ""));
  }
);
export const getAllUserWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.params as { userId: string };
    const wishlist = await wishlistService.getUserWishlist(userId);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, ""));
  }
);
export const getAllWishlistProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page;    
    const pageNumber = Number(page);
    const wishlist = await wishlistService.getAllWishlist(pageNumber);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, ""));
  }
);
