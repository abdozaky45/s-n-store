import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as CategoryIconService from "../../Service/CategoryIcon/CategoryIconService";

export const createCategoryIcon = asyncHandler(async (req: Request, res: Response) => {
  const { key, svg, isActive } = req.body;
  const exists = await CategoryIconService.categoryIconKeyExists(key);
  if (exists) throw new ApiError(409, ErrorMessages.CATEGORY_ICON_KEY_EXISTS);
  const icon = await CategoryIconService.createCategoryIcon({ key, svg, isActive: isActive ?? true });
  return res.status(201).json(new ApiResponse(201, { icon }, SuccessMessage.CATEGORY_ICON_CREATED));
});

export const getAllCategoryIcons = asyncHandler(async (_req: Request, res: Response) => {
  const icons = await CategoryIconService.getAllCategoryIcons();
  return res.json(new ApiResponse(200, { icons }));
});

export const getCategoryIconByKey = asyncHandler(async (req: Request, res: Response) => {
  const icon = await CategoryIconService.getCategoryIconByKey(req.params.key as string);
  if (!icon) throw new ApiError(404, ErrorMessages.CATEGORY_ICON_NOT_FOUND);
  return res.json(new ApiResponse(200, { icon }));
});

export const updateCategoryIcon = asyncHandler(async (req: Request, res: Response) => {
  const { svg, isActive } = req.body;
  const icon = await CategoryIconService.updateCategoryIconByKey(req.params.key as string, { svg, isActive });
  if (!icon) throw new ApiError(404, ErrorMessages.CATEGORY_ICON_NOT_FOUND);
  return res.json(new ApiResponse(200, { icon }, SuccessMessage.CATEGORY_ICON_UPDATED));
});

export const deleteCategoryIcon = asyncHandler(async (req: Request, res: Response) => {
  const icon = await CategoryIconService.deleteCategoryIconByKey(req.params.key as string);
  if (!icon) throw new ApiError(404, ErrorMessages.CATEGORY_ICON_NOT_FOUND);
  return res.json(new ApiResponse(200, {}, SuccessMessage.CATEGORY_ICON_DELETED));
});

export const getActiveCategoryIcons = asyncHandler(async (_req: Request, res: Response) => {
  const icons = await CategoryIconService.getActiveCategoryIcons();
  return res.json(new ApiResponse(200, { icons }));
});

export const getActiveCategoryIconByKey = asyncHandler(async (req: Request, res: Response) => {
  const icon = await CategoryIconService.getActiveCategoryIconByKey(req.params.key as string);
  if (!icon) throw new ApiError(404, ErrorMessages.CATEGORY_ICON_NOT_FOUND);
  return res.json(new ApiResponse(200, { icon }));
});
