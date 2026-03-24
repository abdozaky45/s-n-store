import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import {
  createCategory,
  deleteCategory,
  extractMediaId,
  findCategoryById,
  prepareCategoryUpdates,
  getAllCategories,
} from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
export const CreateNewCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      categoryNameAr,
      categoryNameEn,
      imageUrl
    } = req.body;
    const mediaId =  extractMediaId(imageUrl);
    const category = await createCategory({
      name: {
        ar: categoryNameAr,
        en: categoryNameEn,
      },
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
      categoryNameAr,
      categoryNameEn,
      imageUrl,
    } = req.body;
    const updates = await prepareCategoryUpdates(Category,
      {
        ar: categoryNameAr,
        en: categoryNameEn,
      },
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
        { },
        SuccessMessage.NO_UPDATE_CATEGORY
      )
    );
  }
);
export const deleteOneCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const Category = await findCategoryById(req.params._id as string);
    if (!Category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    const result = await deleteCategory(req.params._id as string);
    if (!result) {
      throw new ApiError(
        404,
        ErrorMessages.SUBCATEGORY_NOT_FOUND_OR_ALREADY_DELETED
      );
    }
    return res.json(
      new ApiResponse(200, {}, SuccessMessage.CATEGORY_DELETED_SUCCESS)
    );
  }
);
export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await getAllCategories();
    return res.json(new ApiResponse(200, { categories }));
  }
);
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    if(!req.params.categoryId) {
      throw new ApiError(400, ErrorMessages.DATA_IS_REQUIRED);
    }
  const category = await findCategoryById(req.params.categoryId as string);
    if (!category) {
      throw new ApiError(404, ErrorMessages.CATEGORY_NOT_FOUND);
    }
    return res.json(new ApiResponse(200, { category }));
  }
);
