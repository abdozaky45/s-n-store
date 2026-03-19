import { Request, Response } from "express";
import { createColor, deleteColor, findColorById, getAllColors } from "../../Service/Color/ColorService";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import SuccessMessage from "../../Utils/SuccessMessages";
import ErrorMessages from "../../Utils/Error";

export const createColorController = asyncHandler(
    async (req: Request, res: Response) => {
        const { colorAr, colorEn, hex } = req.body;
        const color = await createColor({ name: { ar: colorAr, en: colorEn }, hex });
        return res.status(201).json(new ApiResponse(201, { color }, SuccessMessage.COLOR_CREATED));
    }
);
export const getAllColorsController = asyncHandler(
    async (req: Request, res: Response) => {
        const colors = await getAllColors();
        return res.json(new ApiResponse(200, { colors }, SuccessMessage.COLOR_FOUND));
    }
);
export const findColorByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const { colorId } = req.params as { colorId: string };
        const color = await findColorById(colorId);
        if (!color) throw new ApiError(404, ErrorMessages.COLOR_NOT_FOUND);
        return res.json(new ApiResponse(200, { color }, SuccessMessage.COLOR_FOUND));
    }
);

export const deleteColorController = asyncHandler(
    async (req: Request, res: Response) => {
        const { colorId } = req.params as { colorId: string };
        const color = await deleteColor(colorId);
        if (!color) throw new ApiError(404, ErrorMessages.COLOR_NOT_FOUND);
        return res.json(new ApiResponse(200, {}, SuccessMessage.COLOR_DELETED));
    }
);