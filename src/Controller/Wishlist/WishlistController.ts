import { Request, Response, NextFunction } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import moment from "../../Utils/DateAndTime";
import ErrorMessages from "../../Utils/Error";
import * as wishlistService from "../../Service/Wishlist/WishlistService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { getUserProductById } from "../../Service/Product/ProductService";
import { findCustomerById } from "../../Service/User/CustomerService";
export const createWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId,customer } = req.body;
    const checkCustomer = await findCustomerById(customer);
    if (!checkCustomer) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    const Product = await getUserProductById(productId);
    if (!Product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);
    const ExistingWishlist = await wishlistService.getProductWishlist(productId, customer);
    if (ExistingWishlist) throw new ApiError(404, ErrorMessages.WISHLIST_ALREADY_EXISTS);
      const wishlist = await wishlistService.AddProductToFavorites(
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
    const {_id} = req.params as { _id: string};
    const wishlist = await  wishlistService.getWishlistById(_id);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist },""));
  }
);
export const deleteWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {productId ,customer} = req.params as { productId: string; customer: string };
    const checkCustomer = await findCustomerById(customer);
    if (!checkCustomer) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    if (!productId) throw new ApiError(404, ErrorMessages.DATA_IS_REQUIRED);
    const wishlist = await wishlistService.removeProductFromFavorites(customer, productId);
    if (!wishlist) throw new ApiError(404, ErrorMessages.WISHLIST_NOT_FOUND);
    return res
      .status(200)
      .json(new ApiResponse(200, { wishlist }, ""));
  }
);
export const getAllUserWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {customer} = req.params as { customer: string };
    const checkCustomer = await findCustomerById(customer);
    if (!checkCustomer) throw new ApiError(404, ErrorMessages.CUSTOMER_NOT_FOUND);
    const wishlist = await wishlistService.getUserWishlist(customer);
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
