import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import { extractMediaId } from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import * as SubCategoryService from "../../Service/SubCategory/SubCategoryService";
import { checkGroupSizeExists } from "../../Shared/GroupSizeShared";
import { checkCategoryExists } from "../../Shared/CategoryShared";
import { checkSubCategoryExists, findSubCategoryById } from "../../Shared/SubCategoryShared";
export const CreateSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      groupSize,
      imageUrl,
      category
    } = req.body;
    const ExistingGroupSize = await checkGroupSizeExists(groupSize);
    if (!ExistingGroupSize) {
      throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    }
    const mediaId = extractMediaId(imageUrl);
    const categoryExists = await checkCategoryExists(category);
    if (!categoryExists) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    const subCategory = await SubCategoryService.createSubCategory({
      name,
      groupSize,
      category,
      mediaUrl: imageUrl,
      mediaId,
      createdBy: req.body.currentUser.userInfo._id,
    });
    return res.json(
      new ApiResponse(200, { subCategory }, SuccessMessage.SUBCATEGORY_CREATED)
    );
  }
);
export const updateSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      groupSize,
      name,
      imageUrl,
      category
    } = req.body;
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    if (category && !(await checkCategoryExists(category))) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    if (groupSize) {
      const existingGroupSize = await checkGroupSizeExists(groupSize);
      if (!existingGroupSize) {
        throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
      }
    }
    const updates = await SubCategoryService.prepareSubCategoryUpdates(subCategory,
      groupSize,
      name,
      category,
      imageUrl,
    );
    if (!updates) {
      return res.json(new ApiResponse(200, {}, SuccessMessage.NO_UPDATE_CATEGORY));
    }
    await subCategory.save();
    return res.json(new ApiResponse(200, { updates }, SuccessMessage.SUBCATEGORY_UPDATED));
  }
);
export const softDeleteOneSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await checkSubCategoryExists(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    await SubCategoryService.softDeleteSubCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.SUBCATEGORY_DELETED_SUCCESS)
    );
  }
);
export const restoreOneSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    if (!subCategory.isDeleted) throw new ApiError(400, 'SubCategory is not deleted');
    await SubCategoryService.restoreSubCategory(req.params._id as string);
    return res.json(new ApiResponse(200, {}, SuccessMessage.SUBCATEGORY_RESTORED));
  }
);
export const hardDeleteOneSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await checkSubCategoryExists(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    await SubCategoryService.hardDeleteSubCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.SUBCATEGORY_DELETED_SUCCESS)
    );
  }
);
export const getSubCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategories = await SubCategoryService.getAllSubCategories();
    return res.json(new ApiResponse(200, { subCategories }));
  }
);
export const getSubCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await SubCategoryService.getSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { subCategory }));
  }
);
export const getAllDeletedSubCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategories = await SubCategoryService.findAllDeletedSubCategories();
    return res.json(new ApiResponse(200, { subCategories }));
  });
