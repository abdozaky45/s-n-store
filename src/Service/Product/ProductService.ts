import ProductModel from "../../Model/Product/ProductModel";
import { paginate } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import Fuse from "fuse.js";
import { sortProductEnum } from "../../Utils/SortProduct";
import mongoose, { Types } from "mongoose";
import { IProduct, IUpdateProductBody } from "../../Model/Product/Iproduct";
import OrderModel from "../../Model/Order/OrderModel";
import { orderStatusType } from "../../Utils/OrderStatusType";
import AuthModel from "../../Model/User/auth/AuthModel";
import VariantModel from "../../Model/Variant/VariantModel";
import { collectProductMediaIds, deleteMediaByIds } from "../../Controller/Aws/AwsController";
import { extractMediaId } from "../../Shared/MediaServiceShared";
import { getVariantStock } from "../Variant/VariantService";
import CategoryModel from "../../Model/Category/CategoryModel";
import SubCategoryModel from "../../Model/SubCategory/SubCategoryModel";
import WishListModel from "../../Model/Wishlist/WishlistModel";
export const ratioCalculatePrice = (price: number, salePrice: number, saleStartDate: number, saleEndDate: number) => {
  if (!salePrice || salePrice === 0 || salePrice >= price) {
    return {
      isSale: false,
      saleStartDate: 0,
      saleEndDate: 0,
      finalPrice: price,
    };
  }
  return {
    isSale: true,
    finalPrice: salePrice,
    saleStartDate: saleStartDate ?? 0,
    saleEndDate: saleEndDate ?? 0,
  };
};
export const createProduct = async (productData: IProduct, session?: mongoose.ClientSession): Promise<mongoose.HydratedDocument<IProduct>> => {
  const product = await ProductModel.create([productData], { session });
  return product[0];
};
export const updateProduct = async (
  product: IProduct & mongoose.Document,
  body: IUpdateProductBody,
) => {
  let hasUpdates = false;
  if (body.name) {
    product.name = {
      ar: body.name.ar ?? product.name.ar,
      en: body.name.en ?? product.name.en,
    };
    hasUpdates = true;
  }
  if (body.description) {
    product.description = {
      ar: body.description.ar ?? product.description.ar,
      en: body.description.en ?? product.description.en,
    };
    hasUpdates = true;
  }
  if (body.defaultImage) {
    product.defaultImage = {
      mediaUrl: body.defaultImage,
      mediaId: extractMediaId(body.defaultImage),
    };
    hasUpdates = true;
  }
  if (body.sizeChartImage !== undefined) {
    if (body.sizeChartImage === null) {
      product.sizeChartImage = {
        mediaUrl: "",
        mediaId: "",
      };
    } else {
      product.sizeChartImage = {
        mediaUrl: body.sizeChartImage,
        mediaId: extractMediaId(body.sizeChartImage),
      };
    }

    hasUpdates = true;
  }

  if (body.albumImages?.length) {
    product.albumImages = body.albumImages.map((url: string) => ({
      mediaUrl: url,
      mediaId: extractMediaId(url),
    }));
    hasUpdates = true;
  }
  const simpleFields: (keyof IUpdateProductBody)[] = [
    "price", "salePrice", "wholesalePrice", "isSale",
    "saleStartDate", "saleEndDate", "category",
    "subCategory", "isNewArrival", "finalPrice"
  ];

  simpleFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== null) {
      (product as any)[field] = body[field];
      hasUpdates = true;
    }
  });

  // Manual bestSeller override: whenever the admin sets isBestSeller (true or
  // false), honor it and flag the product as manually controlled so the nightly
  // agenda skips it and never overrides the admin's decision.
  if (body.isBestSeller !== undefined && body.isBestSeller !== null) {
    product.isBestSeller = body.isBestSeller;
    product.bestSellerManual = true;
    hasUpdates = true;
  }

  return hasUpdates ? product : null;
};
export const getAdminProductById = async (_id: string) => {
  const product = await ProductModel.findById(_id)
    .select("-createdBy -createdAt -isDeleted -__v")
    .populate({ path: SchemaTypesReference.Category, select: "_id name" })
    .populate({ path: SchemaTypesReference.SubCategory, select: "_id name" })
    .populate({ path: "variants", select: "-__v", populate: { path: SchemaTypesReference.Color, select: "-__v" } })

  return product;
};
export const productSearch = async (querySearch: string) => {
  const products = await ProductModel.find({ isDeleted: false }).select("name _id");
  const fuse = new Fuse(products, {
    keys: ["name.ar", "name.en"],
    threshold: 0.3,
  });
  const results = fuse.search(querySearch).map((result) => result.item);
  return results;
};
export const getAllProductsForAdmin = async ({
  category,
  subCategory,
  isSale,
  isNewArrival,
  isBestSeller,
  isSoldOut,
  isDeleted,
  page,
}: {
  category?: string;
  subCategory?: string;
  isSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSoldOut?: boolean;
  isDeleted?: boolean;
  page?: number;
}) => {
  const limit = 20;
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const skip = limit * (page - 1);
  const query: any = {};
  query.isDeleted = isDeleted === true ? true : false;
  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (isSale) query.isSale = true;
  if (isNewArrival) query.isNewArrival = true;
  if (isBestSeller) query.isBestSeller = true;
  if (isSoldOut) query.isSoldOut = true;
  const [products, totalItems] = await Promise.all([
    ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .populate({ path: "category", select: "-__v" })
      .populate({ path: "subCategory", select: "-__v" }),
    ProductModel.countDocuments(query),
  ]);

  return {
    products,
    currentPage: page,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};
export const getUserProductById = async (id: string | Types.ObjectId) => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false })
    .select("-wholesalePrice -isDeleted -createdAt -createdBy -__v")
    .populate({ path: SchemaTypesReference.Category, select: "name" })
    .populate({ path: SchemaTypesReference.SubCategory, select: "name" })
    .populate({ path: "variants", select: "-__v", populate: { path: SchemaTypesReference.Color, select: "-__v" } })
  return product;
}
export const getAllProductsForUser = async ({
  category,
  subCategory,
  size,
  color,
  isSale,
  isNewArrival,
  isBestSeller,
  sort,
  page,
}: {
  category?: string;
  subCategory?: string;
  size?: string;
  color?: string;
  isSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  sort?: string;
  page?: number;
}) => {
  const limit = 20;
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const skip = limit * (page - 1);

  const query: any = { isDeleted: false };

  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (isSale) query.isSale = true;
  if (isNewArrival) query.isNewArrival = true;
  if (isBestSeller) {
    const hasBestSellers = await ProductModel.countDocuments({
      ...query,
      isBestSeller: true,
    });
    if (hasBestSellers > 0) {
      query.isBestSeller = true;
    }
  }
  if (size || color) {
    const variantFilter: any = {};
    if (size)  variantFilter.size  = size;
    if (color) variantFilter.color = color;
    const matchingProductIds = await VariantModel.find(variantFilter).distinct(SchemaTypesReference.Product);
    query._id = { $in: matchingProductIds };
  }
  const sortOption: any =
    sort === sortProductEnum.priceLowToHigh ? { finalPrice: 1 } :
      sort === sortProductEnum.priceHighToLow ? { finalPrice: -1 } :
        { createdAt: -1 };

  const [products, totalItems] = await Promise.all([
    ProductModel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-wholesalePrice -isDeleted -__v")
      .populate({ path: "category", select: "-__v" })
      .populate({ path: "subCategory", select: "-__v" })
      .populate(

        {
          path: "variants", select: "color size quantity",
          populate: { path: SchemaTypesReference.Color, select: "-_id -__v" }
        }),
    ProductModel.countDocuments(query),
  ]);

  return {
    products,
    currentPage: page,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};

/* ----------------------------- Home page feed ----------------------------- *
 * A diversified "newest first" feed for the storefront home page.
 * Goals: max 20 products, never more than 3 from the same category, prefer
 * different subcategories inside a category, and interleave categories so no
 * single category dominates. Deleted products and wholesale price are never
 * exposed (same guards as get-all-products).
 * --------------------------------------------------------------------------- */
const HOME_LIMIT = 20;
const HOME_MAX_PER_CATEGORY = 3;
// Newest-per-category pool pulled from the DB; larger than the cap so the
// in-memory step has room to diversify subcategories before trimming to 3.
const HOME_PER_CATEGORY_POOL = 8;

type HomeCandidate = {
  _id: Types.ObjectId;
  subCategory?: Types.ObjectId | null;
  createdAt: number;
};

// From one category's newest candidates, pick up to `max`, preferring distinct
// subcategories first, then filling the remaining slots by recency.
const pickWithSubcategoryDiversity = (
  items: HomeCandidate[],
  max: number
): Types.ObjectId[] => {
  const picked: Types.ObjectId[] = [];
  const pickedIds = new Set<string>();
  const usedSub = new Set<string>();
  // Pass 1 — newest-first, one product per distinct subcategory.
  for (const it of items) {
    if (picked.length >= max) break;
    const sub = it.subCategory ? it.subCategory.toString() : "__none__";
    if (!usedSub.has(sub)) {
      picked.push(it._id);
      pickedIds.add(it._id.toString());
      usedSub.add(sub);
    }
  }
  // Pass 2 — fill leftover slots by recency (subcategory may repeat now).
  for (const it of items) {
    if (picked.length >= max) break;
    if (!pickedIds.has(it._id.toString())) {
      picked.push(it._id);
      pickedIds.add(it._id.toString());
    }
  }
  return picked;
};

// Round-robin across categories (newest category first) to interleave results.
const interleaveByCategory = (
  buckets: { _id: Types.ObjectId; items: HomeCandidate[] }[]
): Types.ObjectId[] => {
  const sorted = [...buckets].sort(
    (a, b) => (b.items[0]?.createdAt ?? 0) - (a.items[0]?.createdAt ?? 0)
  );
  const perCategory = sorted.map((b) =>
    pickWithSubcategoryDiversity(b.items, HOME_MAX_PER_CATEGORY)
  );
  const result: Types.ObjectId[] = [];
  for (let round = 0; round < HOME_MAX_PER_CATEGORY && result.length < HOME_LIMIT; round++) {
    for (const picks of perCategory) {
      if (round < picks.length) {
        result.push(picks[round]);
        if (result.length >= HOME_LIMIT) break;
      }
    }
  }
  return result;
};

export const getHomeProducts = async ({ isSale }: { isSale: boolean }) => {
  // isSale is the single source of truth for "on sale".
  const match: Record<string, any> = {
    isDeleted: false,
    isSale: isSale ? true : { $ne: true },
  };

  // Step 1 — newest HOME_PER_CATEGORY_POOL products per category (ids only).
  const buckets = await ProductModel.aggregate<{
    _id: Types.ObjectId;
    items: HomeCandidate[];
  }>([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$category",
        items: {
          $push: { _id: "$_id", subCategory: "$subCategory", createdAt: "$createdAt" },
        },
      },
    },
    { $project: { items: { $slice: ["$items", HOME_PER_CATEGORY_POOL] } } },
  ]);

  // Step 2 — diversify + interleave in memory (bounded, tiny dataset).
  const orderedIds = interleaveByCategory(buckets);
  if (orderedIds.length === 0) {
    return { products: [], currentPage: 1, totalItems: 0, totalPages: 1 };
  }

  // Step 3 — fetch full docs with the SAME shape as get-all-products.
  // `isDeleted: false` is repeated as a second guard; wholesalePrice is stripped.
  const products = await ProductModel.find({ _id: { $in: orderedIds }, isDeleted: false })
    .select("-wholesalePrice -isDeleted -__v")
    .populate({ path: "category", select: "-__v" })
    .populate({ path: "subCategory", select: "-__v" })
    .populate({
      path: "variants",
      select: "color size quantity",
      populate: { path: SchemaTypesReference.Color, select: "-_id -__v" },
    });

  // Step 4 — restore the diversified order (find() does not preserve $in order).
  const byId = new Map(products.map((p) => [p._id.toString(), p]));
  const ordered = orderedIds
    .map((id) => byId.get(id.toString()))
    .filter((p): p is NonNullable<typeof p> => p != null);

  return {
    products: ordered,
    currentPage: 1,
    totalItems: ordered.length,
    totalPages: 1,
  };
};
export const softDeleteProduct = async (_id: string | Types.ObjectId) => {
  const product = await ProductModel.findByIdAndUpdate(_id, {
    isDeleted: true,
  });
  return product;
};
export const restoreProduct = async (_id: string) => {
  return ProductModel.findByIdAndUpdate(
    _id,
    { isDeleted: false },
    { new: true }
  );
};
export const hardDeleteProduct = async (_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let mediaIds: string[] = [];
  try {
    const product = await ProductModel.findById(_id)
      .select("defaultImage albumImages sizeChartImage");
    if (product) mediaIds = collectProductMediaIds(product);
    await VariantModel.deleteMany({ product: _id }, { session });
    await ProductModel.findByIdAndDelete(_id, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
  // DB (the source of truth) is committed; remove the S3 media best-effort.
  await deleteMediaByIds(mediaIds);
};
export const getProductsStock = async (variantIds: string[]) => {
 const variants = await getVariantStock(variantIds);
  const result: Record<string, number> = {};
  for (const variant of variants) {
    result[variant._id.toString()] = variant.quantity ?? 0;
  }
  return result;
};
export const getAnalytics = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7DaysDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    soldOutProducts,
    topSellingProducts,
    mostWishlistedProducts,
    productPriceStats,
    totalCategories,
    totalSubCategories,
    totalOrders,
    todaySalesResult,
    totalRevenueResult,
    averageOrderResult,
    ordersByStatusResult,
    last7DaysResult,
    totalCustomers,
  ] = await Promise.all([
    ProductModel.countDocuments({ isDeleted: false }),
    ProductModel.countDocuments({ isDeleted: false, isSoldOut: true }),
    ProductModel.find({ isDeleted: false })
      .sort({ soldItems: -1 })
      .limit(10)
      .select("name soldItems defaultImage finalPrice"),
    WishListModel.aggregate([
      { $group: { _id: "$product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { _id: 0, count: 1, product: { _id: 1, name: 1, defaultImage: 1, finalPrice: 1 } } },
    ]),
    ProductModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, totalFinalPrice: { $sum: "$finalPrice" }, totalWholesalePrice: { $sum: "$wholesalePrice" } } },
    ]),
    CategoryModel.countDocuments({ isDeleted: false }),
    SubCategoryModel.countDocuments({ isDeleted: false }),
    OrderModel.countDocuments(),
    OrderModel.aggregate([
      { $match: { createdAt: { $gte: startOfToday }, status: { $ne: orderStatusType.cancelled } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
    ]),
    OrderModel.aggregate([
      { $match: { status: orderStatusType.delivered } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    OrderModel.aggregate([
      { $match: { status: { $ne: orderStatusType.cancelled } } },
      { $group: { _id: null, avg: { $avg: "$totalAmount" } } },
    ]),
    OrderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    OrderModel.aggregate([
      { $match: { createdAt: { $gte: last7DaysDate }, status: { $ne: orderStatusType.cancelled } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    AuthModel.countDocuments(),
  ]);

  const ordersByStatus = ordersByStatusResult.reduce((acc: Record<string, number>, item: any) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    products: {
      total: totalProducts,
      soldOut: soldOutProducts,
      topSelling: topSellingProducts,
      mostWishlisted: mostWishlistedProducts,
      totalFinalPrice: productPriceStats[0]?.totalFinalPrice ?? 0,
      totalWholesalePrice: productPriceStats[0]?.totalWholesalePrice ?? 0,
    },
    categories: {
      total: totalCategories,
      subCategories: totalSubCategories,
    },
    orders: {
      total: totalOrders,
      todaySales: todaySalesResult[0]?.total ?? 0,
      todayOrders: todaySalesResult[0]?.orders ?? 0,
      totalRevenue: totalRevenueResult[0]?.total ?? 0,
      averageOrderValue: Math.round(averageOrderResult[0]?.avg ?? 0),
      byStatus: ordersByStatus,
      last7Days: last7DaysResult,
    },
    customers: {
      total: totalCustomers,
    },
  };
};
