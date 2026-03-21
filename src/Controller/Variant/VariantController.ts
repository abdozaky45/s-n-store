import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariantQuantity,
  deleteVariant,
} from "../../Service/Variant/VariantService";
import { getAdminProductById } from "../../Service/Product/ProductService";

export const createVariantController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, size, color, quantity } = req.body;
    const product = await getAdminProductById(productId);
    if (!product) throw new ApiError(404, ErrorMessages.PRODUCT_NOT_FOUND);
    const variant = await createVariant({ product: productId, size, color, quantity });
    return res.status(201).json(new ApiResponse(201, { variant }, SuccessMessage.VARIANT_CREATED));
  }
);

export const getVariantsByProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const variants = await getVariantsByProduct(productId);
    return res.json(new ApiResponse(200, { variants }, SuccessMessage.VARIANT_FOUND));
  }
);

export const getVariantByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const variant = await getVariantById(variantId);
    if (!variant) throw new ApiError(404, ErrorMessages.VARIANT_NOT_FOUND);
    return res.json(new ApiResponse(200, { variant }, SuccessMessage.VARIANT_FOUND));
  }
);

export const updateVariantQuantityController = asyncHandler(
  async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const { quantity, productId } = req.body;
    const variant = await getVariantById(variantId);
    if (!variant) throw new ApiError(404, ErrorMessages.VARIANT_NOT_FOUND);
    const updated = await updateVariantQuantity(variantId, quantity, productId);
    return res.json(new ApiResponse(200, { variant: updated }, SuccessMessage.VARIANT_UPDATED));
  }
);

export const deleteVariantController = asyncHandler(
  async (req: Request, res: Response) => {
    const { variantId } = req.params as { variantId: string };
    const { productId } = req.body;
    const variant = await getVariantById(variantId);
    if (!variant) throw new ApiError(404, ErrorMessages.VARIANT_NOT_FOUND);
    await deleteVariant(variantId, productId);
    return res.json(new ApiResponse(200, {}, SuccessMessage.VARIANT_DELETED));
  }
);