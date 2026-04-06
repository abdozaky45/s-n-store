import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ISizeCategory from "../../Model/SizeCategory/ISizeCategoryModel";
import * as SizeCategoryService from "../../Service/SizeCategory/SizeCategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import ErrorMessages from "../../Utils/Error";
import { checkGroupSizeExists, checkSizeCategoryExistsById } from "../../Shared/GroupSizeServiceShared";
export const createGroupSize = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as { name: string };
    const groupSize = await SizeCategoryService.createGroupSize(name);
    return res.status(201).json(new ApiResponse(201, { groupSize }, SuccessMessage.GROUP_SIZE_CREATED));
});
export const getGroupSizeById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const groupSize = await SizeCategoryService.getGroupSizeById(_id);
    if (!groupSize)
        throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, { groupSize }, SuccessMessage.SIZE_GROUP_FETCHED));
});
export const getAllGroupSizes = asyncHandler(async (req: Request, res: Response) => {
    const groupSizes = await SizeCategoryService.getAllGroupSizes();
    return res.status(200).json(new ApiResponse(200, { groupSizes }, SuccessMessage.SIZE_GROUP_FETCHED));
});
export const updateGroupSizeById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const { name } = req.body as { name: string };
    const groupSize = await SizeCategoryService.updateGroupSize(_id, name);
      if (!groupSize) throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, { groupSize }, SuccessMessage.GROUP_SIZE_UPDATED));
});
export const createSizeCategory = asyncHandler(async (req: Request, res: Response) => {
    const sizeCategoryData: ISizeCategory = req.body;
    const groupSize = await checkGroupSizeExists(sizeCategoryData.groupSize);
    if (!groupSize) throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    const sizeCategory = await SizeCategoryService.createSizeCategory(sizeCategoryData);
    return res.status(201).json(new ApiResponse(201, { sizeCategory }, SuccessMessage.SIZE_CATEGORY_CREATED));
});
export const getSizeCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const sizeCategory = await SizeCategoryService.getSizeCategoryById(_id);
    if (!sizeCategory)
        throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, { sizeCategory }, SuccessMessage.SIZE_CATEGORY_FETCHED));
});
export const getAllSizeCategories = asyncHandler(async (req: Request, res: Response) => {
    const sizeCategories = await SizeCategoryService.getAllSizeCategories();
    return res.status(200).json(new ApiResponse(200, { sizeCategories }, SuccessMessage.SIZE_CATEGORY_FETCHED));
});
export const getSizeCategoriesByGroupId = asyncHandler(async (req: Request, res: Response) => {
    const { groupId } = req.params as { groupId: string };
    const sizeCategories = await SizeCategoryService.getSizeCategoriesByGroupId(groupId);
    if (sizeCategories.length === 0) throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, { sizeCategories }, SuccessMessage.SIZE_CATEGORY_FETCHED));
});
export const updateSizeCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const sizeCategoryData: Partial<ISizeCategory> = req.body;
   if(sizeCategoryData.groupSize){
    const groupSize = await checkGroupSizeExists(sizeCategoryData.groupSize);
    if (!groupSize) throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
   }
    const sizeCategory = await checkSizeCategoryExistsById(_id);
    if (!sizeCategory) throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    const updatedSizeCategory = await SizeCategoryService.updateSizeCategory(_id, sizeCategoryData);
    return res.status(200).json(new ApiResponse(200, { sizeCategory: updatedSizeCategory }, SuccessMessage.SIZE_CATEGORY_UPDATED));
});
export const deleteSizeCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const sizeCategory = await SizeCategoryService.deleteSizeCategory(_id);
    if (!sizeCategory) throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, {}, SuccessMessage.SIZE_CATEGORY_DELETED_SUCCESS));
});