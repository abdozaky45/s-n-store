import {
  createNewAccessTokenOrUpdate,
  createUserAccount,
  findUserByEmail,
  generateSixDigitCode,
  sendActivationEmail,
  updateUserAndDeleteActiveCode,
} from "../../Service/Authentication/AuthService";
import { ApiError, ApiResponse, asyncHandler } from "../../Utils/ErrorHandling";
import { Request, Response, NextFunction } from "express";
import { compareActiveCode, hashActiveCode } from "../../Utils/HashAndCompare";
import moment from "../../Utils/DateAndTime";
import ErrorMessages from "../../Utils/Error";
import SuccessMessage from "../../Utils/SuccessMessages";
import { SendWelcomeEmail } from "../../Utils/Nodemailer/WelcomeEmailTemplate";
import { sendEmail } from "../../Utils/Nodemailer/SendEmail";
import { UserTypeEnum } from "../../Utils/UserType";
import { generateAccessToken } from "../../Utils/GenerateAndVerifyToken";
export const registerWithEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email.toLowerCase();
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUserAccount(email);
      sendEmail({
        to: email,
        subject: "Welcome to S&N LANGIRE",
        html: SendWelcomeEmail(),
      });
      return res.status(201).json(
        new ApiResponse(201, null, SuccessMessage.USER_CREATED_AR)
      );
    }
    if (user.role === UserTypeEnum.ADMIN) {
      const activeCode = generateSixDigitCode();
      const hashCode = await hashActiveCode(activeCode);
      user.activeCode = hashCode;
      user.codeCreatedAt = moment().valueOf();
      await user.save();
      sendActivationEmail(email, activeCode);
      return res
        .status(200)
        .json(new ApiResponse(200, { email }, SuccessMessage.EMAIL_SENT_AR))
    }
    return res.status(200).json(
      new ApiResponse(200, null, SuccessMessage.WELCOME_EMAIL_SENT_AR)
    );
  }
);
export const activeAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, activeCode } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      throw new ApiError(400, ErrorMessages.EMAIL_NOT_FOUND);
    }
    if (user.role !== UserTypeEnum.ADMIN) {
      throw new ApiError(403, ErrorMessages.NOT_AUTHORIZED_AR);
    }
    const currentTime = moment().valueOf();
    const createdAt = user.codeCreatedAt!;
    if (currentTime - createdAt > 10 * 60 * 1000) {
      throw new ApiError(400, ErrorMessages.ACTIVE_CODE_EXPIRED);
    }
    const isMatch = await compareActiveCode(activeCode, user.activeCode!);
    if (!isMatch) {
      throw new ApiError(400, ErrorMessages.ACTIVE_CODE_NOT_MATCH);
    }
    const updateUser = await updateUserAndDeleteActiveCode(email);
    const accessToken = generateAccessToken({
      payload: {
        _id: updateUser?._id,
        role: updateUser?.role,
        email: updateUser?.email,
      },
    });
    const agent = req.headers["user-agent"] || "unknown";
    await createNewAccessTokenOrUpdate(
      accessToken,
      updateUser!._id,
      agent
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, { accessToken }, SuccessMessage.SUCCESS_ACCOUNT)
      );
  }
);
export const sendNewActiveCodeWithEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      throw new ApiError(400, ErrorMessages.EMAIL_NOT_FOUND);
    }
    if (user.role !== UserTypeEnum.ADMIN) {
      throw new ApiError(403, ErrorMessages.NOT_AUTHORIZED_AR);
    }
    const activeCode = generateSixDigitCode();
    const hashCode = await hashActiveCode(activeCode);
    user.codeCreatedAt = moment().valueOf();
    user.activeCode = hashCode;
    await user.save();
    sendActivationEmail(email, activeCode)
    return res.status(200).json(
      new ApiResponse(200, {}, SuccessMessage.EMAIL_SENT)
    );
  }
);


