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
} from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
export const CreateNewCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
     name,
      imageUrl
    } = req.body;
    console.log(req.body.currentUser);
    const mediaId = extractMediaId(imageUrl);
    const category = await createCategory({
      name,
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
      name,
      imageUrl,
    } = req.body;
    const updates = await prepareCategoryUpdates(Category,
     name,
      imageUrl
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
    if (!req.params.categoryId) {
      throw new ApiError(400, ErrorMessages.DATA_IS_REQUIRED);
    }
    const category = await findCategoryById(req.params.categoryId as string);
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
