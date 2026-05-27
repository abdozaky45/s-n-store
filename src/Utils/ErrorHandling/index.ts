import { Request, Response, NextFunction } from "express";
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
export const globalErrorHandling = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log({ error: error, stack: error.stack, message: error.message });

  let statusCode: number = error.statusCode || error.cause || 500;
  let message: string = error.message;
  let errors: any = error.errors;

  if (error?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0];
    message = field
      ? `Duplicate value for field: ${field}`
      : "Duplicate value";
    errors = undefined;
  } else if (error?.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(error.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (error?.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field: ${error.path}`;
    errors = undefined;
  } else if (!(error instanceof ApiError)) {
    statusCode = error.statusCode || 500;
    if (statusCode >= 500) message = "Internal server error";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errors,
  });
};

export class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: T, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: any[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
  }
}
