import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import { checkAuthority } from "../../src/middleware/AuthenticationMiddleware";
import {
  createNewAccessTokenOrUpdate,
} from "../../src/Service/Authentication/AuthService";
import TokenModel from "../../src/Model/Token/TokenModel";
import { generateAccessToken } from "../../src/Utils/GenerateAndVerifyToken";
import ErrorMessages from "../../src/Utils/Error";

jest.mock("../../src/Utils/Nodemailer/SendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

// checkAuthority is wrapped by asyncHandler, which does not return the promise,
// so poll until the handler has produced an outcome (next() or a response).
const waitFor = async (
  cond: () => boolean | Promise<boolean>,
  timeout = 3000
): Promise<void> => {
  const start = Date.now();
  while (!(await cond()) && Date.now() - start < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

const buildRes = (): Response => {
  const res = {} as Record<string, jest.Mock>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as Response;
};

const buildReq = (overrides: Partial<Request> = {}): Request =>
  ({
    originalUrl: "/category",
    headers: {},
    body: {},
    ip: "1.2.3.4",
    ...overrides,
  } as unknown as Request);

describe("checkAuthority", () => {
  it("bypasses auth for /public routes", async () => {
    const req = buildReq({ originalUrl: "/public/products" });
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects a request with no Authorization header (401)", async () => {
    const req = buildReq();
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => (res.json as jest.Mock).mock.calls.length > 0);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: ErrorMessages.TOKEN_MISSING,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid token (401)", async () => {
    const req = buildReq({
      headers: { authorization: "Bearer not.a.real.token" } as any,
    });
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => (res.json as jest.Mock).mock.calls.length > 0);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      message: ErrorMessages.TOKEN_INVALID,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an expired token (401)", async () => {
    const expired = jwt.sign(
      { _id: new mongoose.Types.ObjectId().toString() },
      process.env.TOKEN_SIGNATURE as string,
      { expiresIn: -10 }
    );
    const req = buildReq({ headers: { authorization: `Bearer ${expired}` } as any });
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => (res.json as jest.Mock).mock.calls.length > 0);

    expect(res.status).toHaveBeenCalledWith(401);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      message: ErrorMessages.TOKEN_EXPIRED,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a valid token with no matching session (forwards ApiError 401)", async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = generateAccessToken({ payload: { _id: userId.toString() } });
    const req = buildReq({ headers: { authorization: `Bearer ${token}` } as any });
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe(ErrorMessages.USER_TOKEN_IS_INVALID);
  });

  it("accepts a valid token with a matching session and attaches currentUser", async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = generateAccessToken({ payload: { _id: userId.toString() } });
    await createNewAccessTokenOrUpdate(token, userId, "deviceA", "1.1.1.1");

    const req = buildReq({ headers: { authorization: `Bearer ${token}` } as any });
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body.currentUser).toBeDefined();
    expect(req.body.currentUser.token).toBe(token);
    expect(req.body.currentUser.userInfo._id).toBe(userId.toString());
  });

  it("refreshes lastUsedAt/ip for a stale session (throttled touch)", async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = generateAccessToken({ payload: { _id: userId.toString() } });
    await createNewAccessTokenOrUpdate(token, userId, "deviceA", "1.1.1.1");
    // Force the session to look stale so the throttle window has elapsed.
    await TokenModel.updateOne(
      { accessToken: token },
      { lastUsedAt: new Date(Date.now() - 10 * 60 * 1000) }
    );

    const req = buildReq({
      headers: { authorization: `Bearer ${token}` } as any,
      ip: "9.9.9.9",
    });
    const res = buildRes();
    const next = jest.fn();

    checkAuthority(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);
    // The touch is fire-and-forget; wait for the DB write to land.
    await waitFor(async () => {
      const doc = await TokenModel.findOne({ accessToken: token });
      return doc?.ip === "9.9.9.9";
    });

    const updated = await TokenModel.findOne({ accessToken: token });
    expect(updated!.ip).toBe("9.9.9.9");
    expect(updated!.lastUsedAt.getTime()).toBeGreaterThan(Date.now() - 60 * 1000);
  });
});
