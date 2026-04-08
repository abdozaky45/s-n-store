import WishListModel from "../../Model/Wishlist/WishlistModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";

export const AddProductToWishlist = async (
  customer: string,
  product: string,
  createdAt: number
) => {
  const wishlist = await WishListModel.create({ customer, product, createdAt });
  return wishlist;
};
export const deleteFavoriteProduct = async (
  product: string
) => {
  const wishlist = await WishListModel.findByIdAndDelete(product);
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
export const getProductWishlist = async (customer: string | Types.ObjectId, product: string | Types.ObjectId) => {
  const wishlist = await WishListModel.findOne({
    customer,
    product
  });
  console.log("wishlist entry:", wishlist);
  return wishlist;
}
export const getAllWishlist = async (page: number) => {
  let limit = 20;
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const skip = limit * (page - 1);
  const totalItems = await WishListModel.countDocuments();
  const totalPages = Math.ceil(totalItems / limit);
  const products = await WishListModel.find({}).select("-_id -customer")
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
