import WishListModel from "../../Model/Wishlist/WishlistModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";

export const AddProductToFavorites = async (
  user: string,
  product: string,
  createdAt: number
) => {
  const wishlist = await WishListModel.create({ user, product, createdAt });
  return wishlist;
};
export const removeProductFromFavorites = async (
  user: string,
  product: string
) => {
  const wishlist = await WishListModel.findOneAndDelete({ user, product });
  return wishlist;
};
export const getUserWishlist = async (user: string) => {
  const product = await WishListModel.find({ user }).populate({
    path: SchemaTypesReference.Product,
    select:
      "name defaultImage albumImages finalPrice",
  });
  return product;
};
export const getAllWishlist = async (page: number) => {
  let limit = 20;
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const skip = limit * (page - 1);
  const totalItems = await WishListModel.countDocuments();
  const totalPages = Math.ceil(totalItems / limit);
  const products = await WishListModel.find({})
    .populate({
      path:SchemaTypesReference.User,
    })
    .populate({
      path: SchemaTypesReference.Product,
      select:
        "name defaultImage albumImages finalPrice",
     populate:{
      path:SchemaTypesReference.Category,
      select: "name image" 
     }
    })
    .skip(skip)
    .limit(limit)
    .exec();
  return { totalItems, totalPages, currentPage: page, products };
};
export const getWishlistById = async ( wishlistId: string,userId: string) => {
  const wishlist = await WishListModel.findOne({
    _id: wishlistId,
    user: userId,
  }).populate({
    path: SchemaTypesReference.Product,
    select:
      "name defaultImage albumImages finalPrice",
  });
  return wishlist;
};
export const getProductWishlist = async (product: Types.ObjectId | string, user: string) => {
  const wishlist = await WishListModel.findOne({
    user,
    product
  });
  return wishlist;
}