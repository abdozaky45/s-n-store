import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import {
  createCategory,
  softDeleteCategory,
  extractMediaId,
  findCategoryById,
  prepareCategoryUpdates,
  getAllCategories,
  findAllDeletedCategories,
  hardDeleteCategory,
  restoreCategory,
} from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { findGroupSizeById } from "../../Service/SizeCategory/SizeCategoryService";
export const CreateNewCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      groupSize,
      imageUrl
    } = req.body;
    const mediaId = extractMediaId(imageUrl);
    const existingGroupSize = await findGroupSizeById(groupSize);
    if (!existingGroupSize) {
      throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    }
    const category = await createCategory({
      name,
      groupSize,
      mediaUrl: imageUrl,
      mediaId,
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
    } = req.body;
    if (groupSize) {
      const existingGroupSize = await findGroupSizeById(groupSize);
      if (!existingGroupSize) {
        throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
      }
    }
    const updates = await prepareCategoryUpdates(Category,
      groupSize,
      name,
      imageUrl,

    );
    if (updates) {
      await Category.save();
      return res.json(
        new ApiResponse(
          200,
          { category: Category },
          SuccessMessage.CATEGORY_UPDATED
        )
      );
    }
    return res.json(
      new ApiResponse(
        200,
        {},
        SuccessMessage.NO_UPDATE_CATEGORY
      )
    );
  }
);
export const softDeleteOneCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const Category = await findCategoryById(req.params._id as string);
    if (!Category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    await softDeleteCategory(req.params._id as string);
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
    await restoreCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_RESTORED)
    );
  }
);
export const hardDeleteOneCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const Category = await findCategoryById(req.params._id as string);
    if (!Category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    await hardDeleteCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_DELETED_SUCCESS)
    );

  });
export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await getAllCategories();
    return res.json(new ApiResponse(200, { categories }));
  }
);
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params._id) {
      throw new ApiError(400, ErrorMessages.DATA_IS_REQUIRED);
    }
    const category = await findCategoryById(req.params._id as string);
    if (!category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { category }));
  }
);
export const getAllDeletedCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await findAllDeletedCategories();
    return res.json(new ApiResponse(200, { categories }));
  }
);
