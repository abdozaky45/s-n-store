import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as VariantService from "../../Service/Variant/VariantService";
import { getAdminProductById } from "../../Service/Product/ProductService";
import { checkProductExists } from "../../Shared/ProductServiceShared";

export const createVariantController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, size, color, quantity } = req.body;
    const product = await getAdminProductById(productId);
    if (!product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);
    const variant = await VariantService.createVariant({ product: productId, size, color, quantity });
    return res.status(201).json(new ApiResponse(201, { variant }, SuccessMessage.VARIANT_CREATED));
  }
);
export const updateManyVariants = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, variants } = req.body;

    const product = await checkProductExists(productId);
    if (!product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);

    const result = await VariantService.updateManyVariants(productId, variants);
    if (result.matchedCount === 0) {
      throw new ApiError(404, ErrorMessages.VARIANTS_NOT_MATCHED);
    }
    return res.json(new ApiResponse(200, { result }, SuccessMessage.VARIANT_UPDATED));
  }
);
export const deleteManyVariants = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, variantIds } = req.body;
    const product = await checkProductExists(productId);
    if (!product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);
    const result = await VariantService.deleteManyVariants(productId, variantIds);
    if (result.deletedCount === 0) {
      throw new ApiError(404, ErrorMessages.VARIANTS_NOT_MATCHED);
    }
    return res.json(new ApiResponse(200, { result }, SuccessMessage.VARIANT_DELETED));
  }
);
export const getVariantsByProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const variants = await VariantService.getVariantsByProduct(productId);
    return res.json(new ApiResponse(200, { variants }, SuccessMessage.VARIANT_FOUND));
  }
);
export const getVariantByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const variant = await VariantService.getVariantById(variantId);
    if (!variant) throw new ApiError(404, ErrorMessages.VARIANT_NOT_FOUND);
    return res.json(new ApiResponse(200, { variant }, SuccessMessage.VARIANT_FOUND));
  }
);
export const updateVariantQuantityController = asyncHandler(
  async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const { quantity, productId } = req.body;
    const variant = await VariantService.getVariantById(variantId);
    if (!variant) throw new ApiError(404, ErrorMessages.VARIANT_NOT_FOUND);
    const updated = await VariantService.updateVariantQuantity(variantId, quantity, productId);
    return res.json(new ApiResponse(200, { variant: updated }, SuccessMessage.VARIANT_UPDATED));
  }
);
export const deleteVariantController = asyncHandler(
  async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const { productId } = req.body;
    const variant = await VariantService.getVariantById(variantId);
    if (!variant) throw new ApiError(404, ErrorMessages.VARIANT_NOT_FOUND);
    await VariantService.deleteVariant(variantId, productId);
    return res.json(new ApiResponse(200, {}, SuccessMessage.VARIANT_DELETED));
  }
);