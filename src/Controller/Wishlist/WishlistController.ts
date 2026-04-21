import { Request, Response, NextFunction } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import moment from "../../Utils/DateAndTime";
import ErrorMessages from "../../Utils/Error";
import * as wishlistService from "../../Service/Wishlist/WishlistService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { getCustomerById } from "../../Service/User/CustomerService";
import { checkProductExists } from "../../Shared/ProductServiceShared";
export const addProductToWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId,customer } = req.body;
    const checkCustomer = await getCustomerById(customer);
    if (!checkCustomer) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    const Product = await checkProductExists(productId);
    if (!Product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);
    const ExistingWishlist = await wishlistService.getProductWishlist(customer, productId);
    if (ExistingWishlist) throw new ApiError(404, ErrorMessages.WISHLIST_ALREADY_EXISTS);
      const wishlist = await wishlistService.AddProductToWishlist(
        customer,
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
export const getUserWishlistById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {productId} = req.params as { productId: string};
    const wishlist = await  wishlistService.getWishlistById(productId);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, SuccessMessage.WISHLIST_FOUND));
  }
);
export const deleteWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {productId} = req.params as { productId: string; customer: string };
    const wishlist = await wishlistService.deleteFavoriteProduct(productId);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, SuccessMessage.WISHLIST_DELETED));
  }
);
export const getAllUserWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {customer} = req.params as { customer: string };
    const checkCustomer = await getCustomerById(customer);
    if (!checkCustomer) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    const wishlist = await wishlistService.getUserWishlist(customer);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, SuccessMessage.WISHLIST_FOUND));
  }
);
export const getAllWishlistItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page;    
    const pageNumber = Number(page);
    const wishlist = await wishlistService.getAllWishlist(pageNumber);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, SuccessMessage.WISHLIST_FOUND));
  }
);
