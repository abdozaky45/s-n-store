import { Request, Response } from "express";
import { createColor, deleteColor, findColorById, getAllColors, updateColor } from "../../Service/Color/ColorService";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import SuccessMessage from "../../Utils/SuccessMessages";
import ErrorMessages from "../../Utils/Error";

export const createColorController = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, hex } = req.body;
        const color = await createColor({ name, hex });
        return res.status(201).json(new ApiResponse(201, { color }, SuccessMessage.COLOR_CREATED));
    }
);
export const updateColorController = asyncHandler(
    async (req: Request, res: Response) => {
    
        const { name, hex } = req.body;
        const color = await updateColor(req.params._id as string, { name, hex });
        if (!color) throw new ApiError(404, ErrorMessages.COLOR_NOT_FOUND);
        return res.json(new ApiResponse(200, { color }, SuccessMessage.COLOR_UPDATED));
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
        const { _id } = req.params as { _id: string };
        const color = await findColorById(_id);
        if (!color) throw new ApiError(404, ErrorMessages.COLOR_NOT_FOUND);
        return res.json(new ApiResponse(200, { color }, SuccessMessage.COLOR_FOUND));
    }
);

export const deleteColorController = asyncHandler(
    async (req: Request, res: Response) => {
        const { _id } = req.params as { _id: string };
        const color = await deleteColor(_id);
        if (!color) throw new ApiError(404, ErrorMessages.COLOR_NOT_FOUND);
        return res.json(new ApiResponse(200, {}, SuccessMessage.COLOR_DELETED));
    }
);