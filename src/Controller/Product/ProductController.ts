import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import {
  extractMediaId,
  findCategoryById,
} from "../../Service/Category/CategoryService";
import moment from "../../Utils/DateAndTime";
import {
  createProduct,
  deleteOneProduct,
  findAllProducts,
  findAllProductsByCategory,
  findAllSaleProducts,
  findProductById,
  findProductByPriceRange,
  findProductBySoldOut,
  findProductBySort,
  findProducts,
  getAnalytics,
  getAvailableItems,
  prepareProductUpdates,
  productSearch,
  ratioCalculatePrice,
} from "../../Service/Product/ProductService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { getProductWishlist } from "../../Service/Wishlist/WishlistService";
import { IProduct, IUpdateProductBody } from "../../Model/Product/Iproduct";
import { findSubCategoryById } from "../../Service/SubCategory/SubCategoryService";
export const CreateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      productNameAr,
      productNameEn,
      productDescriptionAr,
      productDescriptionEn,
      wholesalePrice,
      price,
      salePrice,
      saleStartDate,
      saleEndDate,
      category,
      subCategory,
      defaultImage,
      albumImages,
      sizeChartImage,
      sizeVariants
    } = req.body;
    const checkCategory = await findCategoryById(category);
    if (!checkCategory) throw new ApiError(400, ErrorMessages.CATEGORY_NOT_FOUND);
    const checkSubCategory = subCategory ? await findSubCategoryById(subCategory) : null;
    if (subCategory && !checkSubCategory) throw new ApiError(400, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    const processedAlbumImages =
      albumImages?.map((image: any) => {
        return {
          mediaUrl: image,
          mediaId: extractMediaId(image),
        };
      }) || [];
    const finalPrices = ratioCalculatePrice(price, salePrice, saleStartDate, saleEndDate);
    const productData: IProduct = {
      productName: { ar: productNameAr, en: productNameEn },
      productDescription: { ar: productDescriptionAr, en: productDescriptionEn },
      wholesalePrice,
      price,
      salePrice,
      finalPrice: finalPrices.finalPrice,
      saleStartDate: finalPrices?.saleStartDate,
      saleEndDate: finalPrices?.saleEndDate,
      isSale: finalPrices?.isSale,
      category: checkCategory._id,
      subCategory: checkSubCategory?._id,
      defaultImage: { mediaUrl: defaultImage, mediaId: extractMediaId(defaultImage) },
      albumImages: processedAlbumImages,
      sizeChartImage: { mediaUrl: sizeChartImage, mediaId: extractMediaId(sizeChartImage) },
      sizeVariants,
      createdBy: req.body.currentUser!.userInfo._id,
      createdAt: moment().valueOf(),
    };
    const product = await createProduct(productData);
    return res
      .status(201)
      .json(new ApiResponse(201, { product }, SuccessMessage.PRODUCT_CREATED));
  }
);
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    const product = await findProductById(productId);
    if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    const checkCategory = req.body.category
      ? await findCategoryById(req.body.category)
      : null;
    if (req.body.category && !checkCategory) {
      throw new ApiError(400, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    const checkSubCategory = req.body.subCategory
      ? await findSubCategoryById(req.body.subCategory)
      : null;
    if (req.body.subCategory && !checkSubCategory) {
      throw new ApiError(400, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }

    const finalPrices = ratioCalculatePrice(
      req.body.price ?? product.price,
      req.body.salePrice ?? product.salePrice!,
      req.body.saleStartDate,
      req.body.saleEndDate,
    );

    const body: IUpdateProductBody = {
      ...req.body,
      subCategory: checkSubCategory?._id.toString(),
      isSale: finalPrices.isSale,
      saleStartDate: finalPrices.saleStartDate,
      saleEndDate: finalPrices.saleEndDate,
      finalPrice: finalPrices.finalPrice,
    };

    const updates = await prepareProductUpdates(product, body);

    if (!updates) {
      return res.json(new ApiResponse(200, {}, SuccessMessage.PRODUCT_NOT_UPDATED));
    }

    await product.save();
    return res.json(new ApiResponse(200, { product }, SuccessMessage.PRODUCT_UPDATED));
  }
);
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const product = await findProductById(productId);
    if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    await deleteOneProduct(productId);
    return res.json(new ApiResponse(200, {}, SuccessMessage.PRODUCT_DELETED));
  }
);
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const { user } = req.query;
    const product = await findProductById(productId);
    if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    let liked = false;
    if (user) {
      const wishlistEntry = await getProductWishlist(productId, user as string);
      liked = wishlistEntry ? true : false;
    }
    return res.json(new ApiResponse(200, { product, liked }, ""));
  }
);
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { page } = req.query;
    const pageNumber = Number(page);
    const products = await findAllProducts(pageNumber);
    return res.json(new ApiResponse(200, { products }, ""));
  }
);
export const getAllSaleProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { page } = req.query;
    const pageNumber = Number(page);
    const products = await findAllSaleProducts(pageNumber);
    return res.json(new ApiResponse(200, { products }, ""));
  }
);
export const SearchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { searchQuery } = req.query;
    const products = await productSearch(searchQuery as string);
    return res.json(new ApiResponse(200, { products }, "Success"));
  }
);
export const sortProduct = asyncHandler(async (req: Request, res: Response) => {
  const { page, sort } = req.query;
  const pageNumber = Number(page);
  const products = await findProductBySort(sort as string, pageNumber);
  return res.json(new ApiResponse(200, { products }, "Success"));
});
export const sortProductByPrice = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, sort } = req.query;
    const pageNumber = Number(page);
    const products = await findProductByPriceRange(sort as string, pageNumber);
    return res.json(new ApiResponse(200, { products }, "Success"));
  }
);
export const sortProductByRangeAndPrice = asyncHandler(async (req: Request, res: Response) => {
  const { page, sort, priceRange } = req.query;
  const pageNumber = Number(page);
  const products = await findProducts(sort as string, priceRange as string, pageNumber);
  return res.json(new ApiResponse(200, { products }, "Success"));
});
export const getProductBySoldOut = asyncHandler(async (req: Request, res: Response) => {
  const { page } = req.query;
  const pageNumber = Number(page);
  const products = await findProductBySoldOut(pageNumber);
  return res.json(new ApiResponse(200, { products }, "Success"));
});
export const getAllProductsByCategoryId = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params as { categoryId: string };
  const { sort, priceRange, page } = req.query;
  const pageNumber = Number(page);
  const checkCategory = await findCategoryById(categoryId);
  if (!checkCategory) throw new ApiError(400, ErrorMessages.CATEGORY_NOT_FOUND);
  const products = await findAllProductsByCategory(sort as string, priceRange as string, pageNumber, categoryId);
  return res.json(new ApiResponse(200, { products }, ""));
});
export const getAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const analysis = await getAnalytics();
  return res.json(new ApiResponse(200, { analysis }, "Success"));
});
export const getProductsAndAvailableItems = asyncHandler(async (req: Request, res: Response) => {
  // const products = req.body.products;
  // const result = await getAvailableItems(products);
  // const response: Record<string, number> = {};
  // result.forEach(product => {
  //   response[product._id.toString()] = product.availableItems;
  // });
  // return res.json(response);
});
