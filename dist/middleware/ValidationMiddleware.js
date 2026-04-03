"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const Validation = (joiValidation) => {
    return (req, res, next) => {
        const AllMethodData = { ...req.body, ...req.params, ...req.query };
        const validationResult = joiValidation.validate(AllMethodData, {
            abortEarly: false,
        });
        if (validationResult.error) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "Validation Error!",
                errors: validationResult.error.details,
            });
        }
        return next();
    };
};
exports.Validation = Validation;
