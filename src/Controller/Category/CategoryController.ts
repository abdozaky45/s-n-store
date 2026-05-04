import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import * as CategoryService from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { checkGroupSizeExists } from "../../Shared/GroupSizeServiceShared";
import { checkCategoryExists, findCategoryById } from "../../Shared/CategoryServiceShared";
import { extractMediaId } from "../../Shared/MediaServiceShared";
export const CreateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      groupSize,
      imageUrl,
      iconId,
    } = req.body;
    const mediaId = extractMediaId(imageUrl);
    const existingGroupSize = await checkGroupSizeExists(groupSize);
    if (!existingGroupSize) {
      throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    }
    const category = await CategoryService.createCategory({
      name,
      groupSize,
      mediaUrl: imageUrl,
      mediaId,
      ...(iconId ? { iconId } : {}),
      createdBy: req.body.currentUser.userInfo._id,
    });
    return res.json(
      new ApiResponse(200, { category }, SuccessMessage.CATEGORY_CREATED)
    );
  }
);
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const Category = await findCategoryById(req.params._id as string);
    if (!Category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    const {
      groupSize,
      name,
      imageUrl,
      iconId,
    } = req.body;
    if (groupSize) {
      const existingGroupSize = await checkGroupSizeExists(groupSize);
      if (!existingGroupSize) {
        throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
      }
    }
    const updates = await CategoryService.prepareCategoryUpdates(Category,
      groupSize,
      name,
      imageUrl,
      iconId,
    );
    if (!updates) {
      return res.json(
        new ApiResponse(
          200,
          {},
          SuccessMessage.NO_UPDATE_CATEGORY
        )
      );
    }

    await Category.save();
    return res.json(
      new ApiResponse(
        200,
        {updates},
        SuccessMessage.CATEGORY_UPDATED
      )
    );
  }

);
export const softDeleteOneCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const Category = await checkCategoryExists(req.params._id as string);
    if (!Category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    await CategoryService.softDeleteCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_DELETED_SUCCESS)
    );
  }
);
export const restoreOneCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await findCategoryById(req.params._id as string);
    if (!category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    if (!category.isDeleted) {
      throw new ApiError(400, 'Category is not deleted');
    }
    await CategoryService.restoreCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_RESTORED)
    );
  }
);
export const hardDeleteOneCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const Category = await checkCategoryExists(req.params._id as string);
    if (!Category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    await CategoryService.hardDeleteCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_DELETED_SUCCESS)
    );

  });
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories();
    return res.json(new ApiResponse(200, { categories }));
  }
);
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params._id) {
      throw new ApiError(400, ErrorMessages.DATA_IS_REQUIRED);
    }
    const category = await CategoryService.getCategoryById(req.params._id as string);
    if (!category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { category }));
  }
);
export const getCategoryByIdUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params._id) {
      throw new ApiError(400, ErrorMessages.DATA_IS_REQUIRED);
    }
    const category = await CategoryService.getCategoryByIdUser(req.params._id as string);
    if (!category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { category }));
  }
);
export const getAllDeletedCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await CategoryService.getDeletedCategoryList();
    return res.json(new ApiResponse(200, { categories }));
  }
);
