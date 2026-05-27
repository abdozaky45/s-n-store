import WishListModel from "../../Model/Wishlist/WishlistModel";
import { Types } from "mongoose";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import CustomerInfoModel from "../../Model/User/Customer/CustomerInfoModel";

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
  return wishlist;
}
export const getAllWishlist = async (page: number) => {
  let limit = 20;
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const skip = limit * (page - 1);
  const totalItems = await WishListModel.countDocuments();
  const totalPages = Math.ceil(totalItems / limit);
  const products = await WishListModel.find({})
    .select("-_id")
    .populate({
      path: SchemaTypesReference.Product,
      select:
        "name defaultImage albumImages finalPrice",
      populate: {
        path: SchemaTypesReference.Category,
        select: "name image"
      }
    })
    .populate({
      path: SchemaTypesReference.Customer,
      select: "phone"
    })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  const customerIds = [
    ...new Set(
      products
        .map((p: any) => p.customer?._id?.toString())
        .filter(Boolean)
    ),
  ];
  const infos = await CustomerInfoModel.find({
    customer: { $in: customerIds },
    email: { $exists: true, $ne: null, $nin: ["", null] },
  })
    .select("customer email")
    .lean();
  const emailMap = new Map<string, string>();
  for (const info of infos as any[]) {
    const key = info.customer.toString();
    if (!emailMap.has(key) && info.email) emailMap.set(key, info.email);
  }
  const items = products.map((p: any) => ({
    ...p,
    customer: p.customer
      ? {
          _id: p.customer._id,
          phone: p.customer.phone ?? null,
          email: emailMap.get(p.customer._id.toString()) ?? null,
        }
      : null,
  }));
  return { totalItems, totalPages, currentPage: page, products: items };
};
