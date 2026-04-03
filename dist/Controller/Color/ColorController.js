"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteColorController = exports.findColorByIdController = exports.getAllColorsController = exports.updateColorController = exports.createColorController = void 0;
const ColorService_1 = require("../../Service/Color/ColorService");
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const SuccessMessages_1 = __importDefault(require("../../Utils/SuccessMessages"));
const Error_1 = __importDefault(require("../../Utils/Error"));
exports.createColorController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name, hex } = req.body;
    const color = await (0, ColorService_1.createColor)({ name, hex });
    return res.status(201).json(new ErrorHandling_1.ApiResponse(201, { color }, SuccessMessages_1.default.COLOR_CREATED));
});
exports.updateColorController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { name, hex } = req.body;
    const color = await (0, ColorService_1.updateColor)(req.params._id, { name, hex });
    if (!color)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.COLOR_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, { color }, SuccessMessages_1.default.COLOR_UPDATED));
});
exports.getAllColorsController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const colors = await (0, ColorService_1.getAllColors)();
    return res.json(new ErrorHandling_1.ApiResponse(200, { colors }, SuccessMessages_1.default.COLOR_FOUND));
});
exports.findColorByIdController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const color = await (0, ColorService_1.findColorById)(_id);
    if (!color)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.COLOR_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, { color }, SuccessMessages_1.default.COLOR_FOUND));
});
exports.deleteColorController = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const { _id } = req.params;
    const color = await (0, ColorService_1.deleteColor)(_id);
    if (!color)
        throw new ErrorHandling_1.ApiError(404, Error_1.default.COLOR_NOT_FOUND);
    return res.json(new ErrorHandling_1.ApiResponse(200, {}, SuccessMessages_1.default.COLOR_DELETED));
});
