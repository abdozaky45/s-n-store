import ProductModel from "../../Model/Product/ProductModel";
import { extractMediaId } from "../Category/CategoryService";
import { paginate } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";
import Fuse from "fuse.js";
import { sortProductEnum } from "../../Utils/SortProduct";
import mongoose, { Types } from "mongoose";
import { ProductOrder } from "../../Model/Order/Iorder";
import { IProduct, IUpdateProductBody } from "../../Model/Product/Iproduct";
import OrderModel from "../../Model/Order/OrderModel";
import { orderStatusType } from "../../Utils/OrderStatusType";
import AuthModel from "../../Model/User/auth/AuthModel";
import VariantModel from "../../Model/Variant/VariantModel";
import { deleteProductImages } from "../../Controller/Aws/AwsController";
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
export const prepareProductUpdates = async (
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
  if (body.sizeChartImage) {
    product.sizeChartImage = {
      mediaUrl: body.sizeChartImage,
      mediaId: extractMediaId(body.sizeChartImage),
    };
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
    .populate({ path: "variants", select: "-_id -__v", populate: { path: SchemaTypesReference.Color, select: "-_id -__v" } })

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
export const getAdminProducts = async ({
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
export const getUserProductsByFilters = async ({
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
export const softDeleteProduct = async (_id: string | Types.ObjectId) => {
  const product = await ProductModel.findByIdAndUpdate(_id, {
    isDeleted: true,
  });
  return product;
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
// edits
export const getProductsStock = async (variantIds: string[]) => {
  const variants = await VariantModel.find({
    _id: { $in: variantIds },
  }).select("product size color quantity isSoldOut");
  return variants;
};












export const findAllProducts = async (page: number) => {
  const products = await paginate(
    ProductModel.find({ isDeleted: false }).sort({ createdAt: -1 }),
    page,
    "categoryName image",
    SchemaTypesReference.Category
  );
  return products;
};
export const findAllSaleProducts = async (page: number) => {
  const products = await paginate(
    ProductModel.find({ isSale: true, isDeleted: false }).sort({
      createdAt: -1,
    }),
    page,
    "categoryName image",
    SchemaTypesReference.Category
  );
  return products;
};
export const findProductBySort = async (sortBy: string, page: number) => {
  let sortCriteria = {};
  switch (sortBy) {
    case sortProductEnum.newest:
      sortCriteria = { createdAt: -1 };
      break;
    case sortProductEnum.priceLowToHigh:
      sortCriteria = { price: -1 };
      break;
    case sortProductEnum.priceHighToLow:
      sortCriteria = { price: 1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }
  const products = await paginate(
    ProductModel.find({ isDeleted: false }).sort(sortCriteria),
    page,
    "categoryName image",
    SchemaTypesReference.Category
  );
  return products;
};
export const findProductByPriceRange = async (
  priceRange: string,
  page: number
) => {
  let priceCriteria: any = { isDeleted: false };
  switch (priceRange) {
    case sortProductEnum.priceUnder100:
      priceCriteria = {
        $and: [{ isDeleted: false }, { price: { $lte: 100 } }],
      };
      break;
    case sortProductEnum.priceBetween100and500:
      priceCriteria = {
        $and: [{ isDeleted: false }, { price: { $gte: 100, $lte: 500 } }],
      };
      break;
    case sortProductEnum.priceBetween500and1000:
      priceCriteria = {
        $and: [{ isDeleted: false }, { price: { $gte: 500, $lte: 1000 } }],
      };
      break;
    case sortProductEnum.priceAbove1000:
      priceCriteria = {
        $and: [{ isDeleted: false }, { price: { $gte: 1000 } }],
      };
      break;
    default:
      priceCriteria = { isDeleted: false };
      break;
  }
  const products = await paginate(
    ProductModel.find(priceCriteria),
    page,
    "-_id categoryName image",
    SchemaTypesReference.Category
  );
  return products;
};

export const findProducts = async (
  sort: string,
  priceRange: string,
  page: number
) => {
  const perPage = 20;
  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
  const skip = (currentPage - 1) * perPage;

  const pipeline: any[] = [];

  pipeline.push({ $match: { isDeleted: false } });

  pipeline.push({
    $addFields: {
      finalPrice: {
        $cond: {
          if: { $gt: ["$salePrice", 0] },
          then: "$salePrice",
          else: "$price",
        },
      },
    },
  });

  if (priceRange) {
    let priceFilter = {};
    switch (priceRange) {
      case sortProductEnum.priceUnder100:
        priceFilter = { $lte: 100 };
        break;
      case sortProductEnum.priceBetween100and500:
        priceFilter = { $gte: 100, $lte: 500 };
        break;
      case sortProductEnum.priceBetween500and1000:
        priceFilter = { $gte: 500, $lte: 1000 };
        break;
      case sortProductEnum.priceAbove1000:
        priceFilter = { $gte: 1000 };
        break;
    }
    pipeline.push({ $match: { finalPrice: priceFilter } });
  }

  let sortCriteria: any = { createdAt: -1 };

  if (sort) {
    switch (sort) {
      case sortProductEnum.newest:
        sortCriteria = { createdAt: -1 };
        break;
      case sortProductEnum.priceLowToHigh:
        sortCriteria = { finalPrice: -1 };
        break;
      case sortProductEnum.priceHighToLow:
        sortCriteria = { finalPrice: 1 };
        break;
    }
  }
  pipeline.push({ $sort: sortCriteria });

  pipeline.push({
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category",
    },
  });
  pipeline.push({ $unwind: "$category" });
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: perPage }],
      totalItems: [{ $count: "count" }],
    },
  });
  const result = await ProductModel.aggregate(pipeline).exec();
  const data = result[0].data;
  const totalItems = result[0].totalItems[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
  };
};
export const retrieveProducts = async (productIds: any) => {
  const foundProducts = await ProductModel.find({
    _id: { $in: productIds },
    isDeleted: false,
  });
  return foundProducts;
};
export const updateStock = async (
  orderProducts: ProductOrder[],
  productRecord: Record<string, IProduct & { _id: Types.ObjectId }> | any,
  increaseStock: boolean
) => {
  const bulkOperations: any[] = [];
  for (const orderProduct of orderProducts) {
    let productIdString: string;

    if (typeof orderProduct.productId === "string") {
      productIdString = orderProduct.productId;
    } else if ("_id" in orderProduct.productId) {
      productIdString = orderProduct.productId._id.toString();
    } else {
      console.error("Invalid productId type:", orderProduct.productId);
      continue;
    }
    const product = productRecord[productIdString];
    if (product && orderProduct.quantity !== undefined) {
      const quantityChange = increaseStock
        ? orderProduct.quantity
        : -orderProduct.quantity;

      if (increaseStock) {
        product.soldItems = (product.soldItems ?? 0) - quantityChange;
        product.availableItems = (product.availableItems ?? 0) + quantityChange;
      } else {
        product.soldItems = (product.soldItems ?? 0) + Math.abs(quantityChange);
        product.availableItems =
          (product.availableItems ?? 0) - Math.abs(quantityChange);
      }
      if (product.availableItems <= 0) {
        product.isSoldOut = true;
      } else if (product.availableItems > 0 && increaseStock) {
        product.isSoldOut = false;
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              soldItems: product.soldItems,
              availableItems: product.availableItems,
              isSoldOut: product.isSoldOut,
            },
          },
        },
      });
    } else {
      console.log("Skipping Product due to missing data.");
    }
  }

  if (bulkOperations.length > 0) {
    try {
      await ProductModel.bulkWrite(bulkOperations);
    } catch (error) {
      console.error("Error performing bulk update:", error);
    }
  } else {
    console.log("No operations to perform.");
  }
};
export const findAllProductsByCategory = async (
  sort: string,
  priceRange: string,
  page: number,
  categoryId: string | Types.ObjectId
) => {
  if (!categoryId) {
    throw new Error("categoryId is required");
  }

  const perPage = 20;
  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
  const skip = (currentPage - 1) * perPage;

  const pipeline: any[] = [];

  pipeline.push({
    $match: {
      isDeleted: false,
      category: new mongoose.Types.ObjectId(categoryId),
    },
  });

  pipeline.push({
    $addFields: {
      finalPrice: {
        $cond: {
          if: { $gt: ["$salePrice", 0] },
          then: "$salePrice",
          else: "$price",
        },
      },
    },
  });

  if (priceRange) {
    let priceFilter = {};
    switch (priceRange) {
      case sortProductEnum.priceUnder100:
        priceFilter = { $lte: 100 };
        break;
      case sortProductEnum.priceBetween100and500:
        priceFilter = { $gte: 100, $lte: 500 };
        break;
      case sortProductEnum.priceBetween500and1000:
        priceFilter = { $gte: 500, $lte: 1000 };
        break;
      case sortProductEnum.priceAbove1000:
        priceFilter = { $gte: 1000 };
        break;
    }
    pipeline.push({ $match: { finalPrice: priceFilter } });
  }

  let sortCriteria: any = { createdAt: -1 };

  if (sort) {
    switch (sort) {
      case sortProductEnum.newest:
        sortCriteria = { createdAt: -1 };
        break;
      case sortProductEnum.priceLowToHigh:
        sortCriteria = { finalPrice: -1 };
        break;
      case sortProductEnum.priceHighToLow:
        sortCriteria = { finalPrice: 1 };
        break;
    }
  }
  pipeline.push({ $sort: sortCriteria });

  pipeline.push({
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category",
    },
  });
  pipeline.push({ $unwind: "$category" });
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: perPage }],
      totalItems: [{ $count: "count" }],
    },
  });

  const result = await ProductModel.aggregate(pipeline).exec();
  const data = result[0].data;
  const totalItems = result[0].totalItems[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
  };
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

