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
import { deleteProductImages } from "../../Controller/Aws/AwsController";
import { extractMediaId } from "../../Shared/MediaServiceShared";
import { getVariantStock } from "../Variant/VariantService";
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
    "subCategory", "isNewArrival", "isBestSeller", "finalPrice"
  ];

  simpleFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== null) {
      (product as any)[field] = body[field];
      hasUpdates = true;
    }
  });

  return hasUpdates ? product : null;
};
export const getAdminProductById = async (_id: string) => {
  const product = await ProductModel.findById(_id)
    .select("-createdBy -createdAt -isDeleted -__v")
    .populate({ path: SchemaTypesReference.Category, select: "-_id name" })
    .populate({ path: SchemaTypesReference.SubCategory, select: "-_id name" })
    .populate({ path: "variants", select: "-__v", populate: { path: SchemaTypesReference.Color, select: "-_id -__v" } })

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
    .populate({ path: SchemaTypesReference.Category, select: "-_id name" })
    .populate({ path: SchemaTypesReference.SubCategory, select: "-_id name" })
    .populate({ path: "variants", select: "-_id -__v", populate: { path: SchemaTypesReference.Color, select: "-_id -__v" } })
  return product;
}
export const getAllProductsForUser = async ({
  category,
  subCategory,
  size,
  isSale,
  isNewArrival,
  isBestSeller,
  sort,
  page,
}: {
  category?: string;
  subCategory?: string;
  size?: string;
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
  if (size) {
    const variants = await VariantModel.find({ size }).distinct(SchemaTypesReference.Product);
    query._id = { $in: variants };
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
          path: "variants", select: "-_id color",
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
  try {
    const product = await ProductModel.findById(_id)
      .select("defaultImage albumImages sizeChartImage");
    if (product) {
      await deleteProductImages(product);
    }
    await VariantModel.deleteMany({ product: _id }, { session });
    await ProductModel.findByIdAndDelete(_id, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
  const totalRevenue = await OrderModel.aggregate([
    { $match: { status: orderStatusType.delivered } },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ]);
  const totalOrders = await OrderModel.countDocuments();
  const totalCustomers = await AuthModel.countDocuments();
  const totalProducts = await ProductModel.countDocuments();

  return {
    totalRevenue: totalRevenue[0]?.total ?? 0,
    totalOrders,
    totalCustomers,
    totalProducts,
  };
};
