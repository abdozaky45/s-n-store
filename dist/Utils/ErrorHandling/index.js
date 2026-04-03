"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ApiResponse = exports.globalErrorHandling = exports.asyncHandler = void 0;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
const globalErrorHandling = (error, req, res, next) => {
    console.log({ error: error, stack: error.stack, message: error.message });
    return res.status(error.cause || 400).json({
        success: false,
        message: error.message,
        error: error.errors,
    });
};
exports.globalErrorHandling = globalErrorHandling;
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
exports.ApiResponse = ApiResponse;
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
    }
}
exports.ApiError = ApiError;
