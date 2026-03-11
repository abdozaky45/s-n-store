import { Request, Response, NextFunction } from "express";
import { ApiResponse, asyncHandler } from "../Utils/ErrorHandling";
import { ApiError } from "../Utils/ErrorHandling";
import { verifyToken } from "../Utils/GenerateAndVerifyToken";
import ErrorMessages from "../Utils/Error";
import { findUserByAccessTokenAndUserId } from "../Service/Authentication/AuthService";
const checkAuthority = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/public")) {
      return next();
    }
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json(new ApiResponse(401, null, ErrorMessages.Token_PAYLOAD_INVALID));
    }
    const token = authorization.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken({ token });
    } catch (error) {
      return res.status(401).json(new ApiResponse(401, null, ErrorMessages.Token_PAYLOAD_INVALID));
    }
    if (!decoded?._id) {
      throw new ApiError(401, ErrorMessages.INVALID_PAYLOAD);
    }
    const user = await findUserByAccessTokenAndUserId(decoded._id, token);
    if (!user || !(user.accessToken === token)) {
      throw new ApiError(401, ErrorMessages.USER_TOKEN_IS_INVALID);
    }
    const currentUser = {
      userInfo: decoded,
      token,
    };
    if (!req.body) req.body = {};
    req.body.currentUser = currentUser;
    next();
  }
);
const checkRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req.body;
    if (!requiredRoles.includes(currentUser.userInfo.role)) {
      throw new ApiError(403, ErrorMessages.ROLE_ERROR);
    }
    next();
  };
};
export { checkAuthority, checkRole };
