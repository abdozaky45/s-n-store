import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import ErrorMessages from "../../Utils/Error";
import moment from "../../Utils/DateAndTime";
import { extractMediaId } from "../../Service/Category/CategoryService";
import SuccessMessage from "../../Utils/SuccessMessages";
import { createSubCategory, deleteSubCategory, findSubCategoryById, getAllSubCategories, prepareSubCategoryUpdates } from "../../Service/SubCategory/SubCategoryService";
export const CreateNewSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      subCategoryNameAr,
      subCategoryNameEn,
      imageUrl,
      category
    } = req.body;

    const mediaId = extractMediaId(imageUrl);
    const subCategory = await createSubCategory({
      subCategoryName: {
        ar: subCategoryNameAr,
        en: subCategoryNameEn,
      },
      category,
      mediaUrl: imageUrl,
      mediaId,
      createdBy: req.body.currentUser.userInfo._id,
      createdAt: moment().valueOf(),
    });
    return res.json(
      new ApiResponse(200, { subCategory }, SuccessMessage.SUBCATEGORY_CREATED)
    );
  }
);
export const updateSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
     const {
      subCategoryNameAr,
      subCategoryNameEn,
      imageUrl,
      category
    } = req.body;
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
   
    const updates = await prepareSubCategoryUpdates(subCategory ,
      {
        ar: subCategoryNameAr,
        en: subCategoryNameEn,
      },
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
export const deleteOneSubCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const subCategory = await findSubCategoryById(req.params._id as string);
    if (!subCategory) {
      throw new ApiError(404, ErrorMessages.SUBCATEGORY_NOT_FOUND);
    }
    const result = await deleteSubCategory(req.params._id as string);
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
