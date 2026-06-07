import { Request, Response, NextFunction } from "express";
import { ApiResponse, asyncHandler } from "../Utils/ErrorHandling";
import { ApiError } from "../Utils/ErrorHandling";
import { verifyToken, TokenError, TokenErrorCode } from "../Utils/GenerateAndVerifyToken";
import ErrorMessages from "../Utils/Error";
import {
  findUserByAccessTokenAndUserId,
  updateSessionLastUsed,
} from "../Service/Authentication/AuthService";

// Refresh a session's activity stamp at most once per window to avoid a DB
// write on every authenticated request.
const SESSION_TOUCH_THROTTLE_MS = 5 * 60 * 1000;

const checkAuthority = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/public")) {
      return next();
    }
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json(new ApiResponse(401, null, ErrorMessages.TOKEN_MISSING));
    }
    const token = authorization.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken({ token });
    } catch (error) {
      if (error instanceof TokenError) {
        const status = error.code === TokenErrorCode.TOKEN_SIGNATURE_MISSING ? 500 : 401;
        return res.status(status).json(new ApiResponse(status, null, error.message));
      }
      return res.status(401).json(new ApiResponse(401, null, ErrorMessages.TOKEN_INVALID));
    }
    if (!decoded?._id) {
      throw new ApiError(401, ErrorMessages.INVALID_PAYLOAD);
    }
    const session = await findUserByAccessTokenAndUserId(decoded._id, token);
    if (!session || !(session.accessToken === token)) {
      throw new ApiError(401, ErrorMessages.USER_TOKEN_IS_INVALID);
    }
    const lastUsed = session.lastUsedAt
      ? new Date(session.lastUsedAt).getTime()
      : 0;
    if (Date.now() - lastUsed > SESSION_TOUCH_THROTTLE_MS) {
      // Fire-and-forget: don't block the request on this bookkeeping write.
      updateSessionLastUsed(session._id, req.ip ?? "unknown").catch(() => {});
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
