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
  getUserProductById,
  getSoldOutProducts,
  getAdminProducts,
  getUserProductsByFilters,
  getAnalytics,
  prepareProductUpdates,
  productSearch,
  ratioCalculatePrice,
  getAdminProductById,
  getProductsStock,
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
      isNewArrival:true,
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

    const product = await getAdminProductById(productId);
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
    const product = await getAdminProductById(productId);
    if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    await deleteOneProduct(productId);
    return res.json(new ApiResponse(200, {}, SuccessMessage.PRODUCT_DELETED));
  }
);
export const SearchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { searchQuery } = req.query;
    const products = await productSearch(searchQuery as string);
    return res.json(new ApiResponse(200, { products }, "Success"));
  }
);
export const findAdminProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const product = await getAdminProductById(productId);
    if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    return res.json(new ApiResponse(200, { product },SuccessMessage.PRODUCT_FOUND));
  }
);
export const getAdminProductsByFilters = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      category,
      subCategory,
      isSale,
      isNewArrival,
      isBestSeller,
      isSoldOut,
      isDeleted,
      page,
    } = req.query;

    const products = await getAdminProducts({
      category: category as string,
      subCategory: subCategory as string,
      isSale: isSale === "true",
      isNewArrival: isNewArrival === "true",
      isBestSeller: isBestSeller === "true",
      isSoldOut: isSoldOut === "true",
      isDeleted: isDeleted === "true",
      page: Number(page),
    });

    return res.json(new ApiResponse(200, products, SuccessMessage.PRODUCT_FOUND));
  }
);
export const findUserAllProductsByFilters = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      category,
      subCategory,
      size,
      isSale,
      isNewArrival,
      isBestSeller,
      sort,
      page,
    } = req.query;

    const products = await getUserProductsByFilters({
      category: category as string,
      subCategory: subCategory as string,
      size: size as string,
      isSale: isSale === "true",
      isNewArrival: isNewArrival === "true",
      isBestSeller: isBestSeller === "true",
      sort: sort as string,
      page: Number(page),
    });

    return res.json(new ApiResponse(200, products, SuccessMessage.PRODUCT_FOUND));
  }
);
export const findUserProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const { user } = req.query;
    const product = await getUserProductById(productId);
    if (!product) throw new ApiError(400, ErrorMessages.PRODUCT_NOT_FOUND);
    let liked = false;
    if (user) {
      const wishlistEntry = await getProductWishlist(productId, user as string);
      liked = wishlistEntry ? true : false;
    }
    return res.json(new ApiResponse(200, { product, liked }, ""));
  }
);
export const findProductsStock = asyncHandler(
  async (req: Request, res: Response) => {
    const { productIds } = req.body;
    const products = await getProductsStock(productIds);
    return res.json(new ApiResponse(200, { products }, SuccessMessage.PRODUCT_FOUND));
  }
);
export const findSoldOutProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page } = req.query;
  const pageNumber = Number(page);
  const products = await getSoldOutProducts(pageNumber);
  return res.json(new ApiResponse(200, { products }, "Success"));
});
export const getAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const analysis = await getAnalytics();
  return res.json(new ApiResponse(200, { analysis }, "Success"));
});
