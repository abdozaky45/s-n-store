import { nanoid } from "nanoid";
import { sendEmail } from "../../Utils/Nodemailer/SendEmail";
import AuthModel from "../../Model/User/auth/AuthModel";
import { activeCodeTemplate } from "../../Utils/Nodemailer/SendCodeTemplate";
import { StatusEnum } from "../../Utils/StatusType";
import TokenModel from "../../Model/Token/TokenModel";
import { Types } from "mongoose";
export function generateSixDigitCode() {
  let code = nanoid(6);
  code = code.replace(/[^0-9]/g, "");
  while (code.length < 6) {
    code = nanoid(6).replace(/[^0-9]/g, "");
  }
  return code;
}
export const sendActivationEmail = async (
  email: string,
  activeCode: string
): Promise<boolean> => {
  try {
    const isSent = await sendEmail({
      to: email,
      subject: "Your Activation Code",
      html: activeCodeTemplate(activeCode),
    });
    return isSent;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
export const findUserByEmail = async (email: string) => {
  const user = await AuthModel.findOne({ email });
  return user;
};
export const findUserByPhone = async (phone: string) => {
  const user = await AuthModel.findOne({ phone });
  return user;
};
export const findUserById = async (_id: Types.ObjectId) => {
  const user = await AuthModel.findById(_id);
  return user;
};
export const createUserAccount = async (email: string) => {
  const user = await AuthModel.create({
    email,
  });
  return user;
}
export const updateUserAndDeleteActiveCode = async (searchKey: string) => {
  const user = await AuthModel.findOneAndUpdate(
   {$or:[{ email :searchKey}, { phone:searchKey }]},
    {
      isConfirmed: true,
      status: StatusEnum.Online,
      $unset: { activeCode: 1, codeCreatedAt: 1 },
    }
  );
  return user;
};
// Max concurrent sessions (devices) allowed per user, e.g. mobile + laptop.
export const MAX_SESSIONS_PER_USER = 2;

export const createNewAccessTokenOrUpdate = async (
  accessToken: string,
  user: Types.ObjectId,
  userAgent: string,
  ip: string
) => {
  // Create a fresh session for this device. Unlike before, this does NOT wipe
  // the user's other devices — existing sessions stay logged in.
  const token = await TokenModel.create({
    accessToken,
    user,
    userAgent,
    ip,
    lastUsedAt: new Date(),
  });
  // Enforce the per-user device cap: keep the most-recently-used sessions and
  // evict the rest (e.g. an old/forgotten device when a 3rd one logs in).
  const sessions = await TokenModel.find({ user }).sort({ lastUsedAt: -1 });
  if (sessions.length > MAX_SESSIONS_PER_USER) {
    const staleIds = sessions
      .slice(MAX_SESSIONS_PER_USER)
      .map((session) => session._id);
    await TokenModel.deleteMany({ _id: { $in: staleIds } });
  }
  return token;
};

// Refresh a session's activity stamp (and last-seen IP) so the device-cap
// eviction keeps the device that's actually in use.
export const updateSessionLastUsed = async (
  tokenId: Types.ObjectId,
  ip: string
) => {
  await TokenModel.updateOne(
    { _id: tokenId },
    { lastUsedAt: new Date(), ip }
  );
};
export const findRefreshToken = async (refreshToken: string) => {
  const token = await TokenModel.findOne({
    refreshToken,
  });
  return token;
};
export const SaveAccessToken = async (
  _id: Types.ObjectId,
  accessToken: string
) => {
  const token = await TokenModel.findByIdAndUpdate({ _id }, { accessToken });
  return token;
};
export const findOneUserById = async (id: Types.ObjectId) => {
  const user = await AuthModel.findById(id);
  return user;
};
export const findUserByAccessTokenAndUserId = async (
  user: Types.ObjectId,
  accessToken: string
) => {
  const token = await TokenModel.findOne({
    user,
    accessToken,
  });
  return token;
};
