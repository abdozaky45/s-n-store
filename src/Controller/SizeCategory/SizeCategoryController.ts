import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ISizeCategory from "../../Model/SizeCategory/ISizeCategoryModel";
import { CreateSizeCategory, deleteSizeCategory, findAllSizeCategories, findSizeCategoryById, updateSizeCategory } from "../../Service/SizeCategory/SizeCategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import ErrorMessages from "../../Utils/Error";

export const createNewSizeCategory = asyncHandler(async (req: Request, res: Response) => {
    const sizeCategoryData: ISizeCategory = req.body;
    const sizeCategory = await CreateSizeCategory(sizeCategoryData);
    return res.status(201).json(new ApiResponse(201, { sizeCategory }, SuccessMessage.SIZE_CATEGORY_CREATED));
});
export const getSizeCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const sizeCategory = await findSizeCategoryById(id);
    if (!sizeCategory)
        throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, { sizeCategory }, SuccessMessage.SIZE_CATEGORY_FETCHED));
});
export const getAllSizeCategories = asyncHandler(async (req: Request, res: Response) => {
    const sizeCategories = await findAllSizeCategories();
    return res.status(200).json(new ApiResponse(200, { sizeCategories }, SuccessMessage.SIZE_CATEGORY_FETCHED));
});
export const updateSizeCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const sizeCategoryData: Partial<ISizeCategory> = req.body;
    const sizeCategory = await findSizeCategoryById(_id);
    if (!sizeCategory) throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    const updatedSizeCategory = await updateSizeCategory(_id, sizeCategoryData);
    return res.status(200).json(new ApiResponse(200, { sizeCategory: updatedSizeCategory }, SuccessMessage.SIZE_CATEGORY_UPDATED));
});
export const deleteSizeCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params as { _id: string };
    const sizeCategory = await deleteSizeCategory(_id);
    if (!sizeCategory) throw new ApiError(400, ErrorMessages.SIZE_CATEGORY_NOT_FOUND);
    return res.status(200).json(new ApiResponse(200, {}, SuccessMessage.SIZE_CATEGORY_DELETED_SUCCESS));
});


