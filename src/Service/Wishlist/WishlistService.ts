import WishListModel from "../../Model/Wishlist/WishlistModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";

export const AddProductToFavorites = async (
  customer: string,
  product: string,
  createdAt: number
) => {
  const wishlist = await WishListModel.create({ customer, product, createdAt });
  return wishlist;
};
export const removeProductFromFavorites = async (
  customer: string,
  product: string
) => {
  const wishlist = await WishListModel.findOneAndDelete({ customer, product });
  return wishlist;
};
export const getUserWishlist = async (customer: string) => {
  const product = await WishListModel.find({ customer }).populate({
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
      path: SchemaTypesReference.User,
    })
    .populate({
      path: SchemaTypesReference.Product,
      select:
        "name defaultImage albumImages finalPrice",
      populate: {
        path: SchemaTypesReference.Category,
        select: "name image"
      }
    })
    .skip(skip)
    .limit(limit)
    .exec();
  return { totalItems, totalPages, currentPage: page, products };
};
export const getWishlistById = async (_id: string) => {
  const wishlist = await WishListModel.findById(
    _id
  ).populate({
    path: SchemaTypesReference.Product,
    select:
      "name defaultImage albumImages finalPrice",
  });
  return wishlist;
};
export const getProductWishlist = async (product: Types.ObjectId | string, customer: string) => {
  const wishlist = await WishListModel.findOne({
    customer,
    product
  });
  return wishlist;
}