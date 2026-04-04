import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import { extractMediaId, findCategoryById } from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import {
  createSubCategory,
  softDeleteSubCategory,
  findSubCategoryById,
  getAllSubCategories,
  prepareSubCategoryUpdates,
  findAllDeletedSubCategories,
  hardDeleteSubCategory,
  restoreSubCategory
} from "../../Service/SubCategory/SubCategoryService";
import { findGroupSizeById } from "../../Service/SizeCategory/SizeCategoryService";
export const CreateNewSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      groupSize,
      imageUrl,
      category
    } = req.body;
    const ExistingGroupSize = await findGroupSizeById(groupSize);
    if (!ExistingGroupSize) {
      throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
    }
    const mediaId = extractMediaId(imageUrl);
    const categoryExists = await findCategoryById(category);
    if (!categoryExists) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    const subCategory = await createSubCategory({
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
      name,
      imageUrl,
      category,
      groupSize
    } = req.body;
    if (groupSize) {
      const existingGroupSize = await findGroupSizeById(groupSize);
      if (!existingGroupSize) {
        throw new ApiError(400, ErrorMessages.GROUP_SIZE_NOT_FOUND);
      }
    }
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    if (category && !(await findCategoryById(category))) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    const updates = await prepareSubCategoryUpdates(subCategory,
      groupSize,
      name,
      category,
      imageUrl,
    );
    if (!updates) {
      return res.json(new ApiResponse(200, {}, SuccessMessage.NO_UPDATE_CATEGORY));
    }

    await subCategory.save();
    return res.json(new ApiResponse(200, { subCategory }, SuccessMessage.SUBCATEGORY_UPDATED));
  }
);
export const softDeleteOneSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    await softDeleteSubCategory(req.params._id as string);
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

    await restoreSubCategory(req.params._id as string);
    return res.json(new ApiResponse(200, {}, SuccessMessage.SUBCATEGORY_RESTORED));
  }
);
export const hardDeleteOneSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    await hardDeleteSubCategory(req.params._id as string);
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_DELETED_SUCCESS)
    );
  }
);
export const getSubCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategories = await getAllSubCategories();
    return res.json(new ApiResponse(200, { subCategories }));
  }
);
export const getSubCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.subCategoryId) {
      throw new ApiError(400, ErrorMessages.DATA_IS_REQUIRED);
    }
    const subCategory = await findSubCategoryById(req.params.subCategoryId as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { subCategory }));
  }
);
export const getAllDeletedSubCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategories = await findAllDeletedSubCategories();
    return res.json(new ApiResponse(200, { subCategories }));
  });
