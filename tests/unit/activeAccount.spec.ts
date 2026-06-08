import { Request, Response } from "express";
import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import { waitFor } from "../helpers/async";
import { activeAccount } from "../../src/Controller/Authentication/AuthController";
import AuthModel from "../../src/Model/User/auth/AuthModel";
import TokenModel from "../../src/Model/Token/TokenModel";
import { hashActiveCode } from "../../src/Utils/HashAndCompare";
import { UserTypeEnum } from "../../src/Utils/UserType";
import ErrorMessages from "../../src/Utils/Error";
import SuccessMessage from "../../src/Utils/SuccessMessages";

jest.mock("../../src/Utils/Nodemailer/SendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const buildRes = (): Response => {
  const res = {} as Record<string, jest.Mock>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as Response;
};

const buildReq = (body: Record<string, unknown>): Request =>
  ({
    body,
    headers: { "user-agent": "jest" },
    ip: "1.2.3.4",
  } as unknown as Request);

// Create an admin with a known, freshly-issued activation code.
const seedAdmin = async (code = "123456", ageMs = 0) => {
  const user = await AuthModel.create({
    email: "admin@test.com",
    role: UserTypeEnum.ADMIN,
    activeCode: await hashActiveCode(code),
    codeCreatedAt: Date.now() - ageMs,
  });
  return user;
};

describe("activeAccount", () => {
  it("activates an admin with the correct code and returns an access token", async () => {
    const admin = await seedAdmin("123456");
    const req = buildReq({ email: "admin@test.com", activeCode: "123456" });
    const res = buildRes();
    const next = jest.fn();

    activeAccount(req, res, next);
    await waitFor(() => (res.json as jest.Mock).mock.calls.length > 0);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.message).toBe(SuccessMessage.SUCCESS_ACCOUNT);
    expect(typeof body.data.accessToken).toBe("string");

    // A session was created for this admin...
    const session = await TokenModel.findOne({ user: admin._id });
    expect(session).not.toBeNull();
    expect(session!.accessToken).toBe(body.data.accessToken);
    expect(session!.ip).toBe("1.2.3.4");
    // ...and the one-time code was consumed.
    const updated = await AuthModel.findById(admin._id);
    expect(updated!.activeCode).toBeFalsy();
  });

  it("rejects a wrong code (400)", async () => {
    await seedAdmin("123456");
    const req = buildReq({ email: "admin@test.com", activeCode: "000000" });
    const res = buildRes();
    const next = jest.fn();

    activeAccount(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe(ErrorMessages.ACTIVE_CODE_NOT_MATCH);
    expect(await TokenModel.countDocuments()).toBe(0);
  });

  it("rejects an expired code (400)", async () => {
    // Code created 6 minutes ago (window is 5 minutes).
    await seedAdmin("123456", 6 * 60 * 1000);
    const req = buildReq({ email: "admin@test.com", activeCode: "123456" });
    const res = buildRes();
    const next = jest.fn();

    activeAccount(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe(ErrorMessages.ACTIVE_CODE_EXPIRED);
  });

  it("rejects a non-admin user (403)", async () => {
    await AuthModel.create({
      email: "user@test.com",
      role: UserTypeEnum.USER,
      activeCode: await hashActiveCode("123456"),
      codeCreatedAt: Date.now(),
    });
    const req = buildReq({ email: "user@test.com", activeCode: "123456" });
    const res = buildRes();
    const next = jest.fn();

    activeAccount(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe(ErrorMessages.NOT_PERMITTED);
  });

  it("rejects an unknown email (400)", async () => {
    const req = buildReq({ email: "ghost@test.com", activeCode: "123456" });
    const res = buildRes();
    const next = jest.fn();

    activeAccount(req, res, next);
    await waitFor(() => next.mock.calls.length > 0);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe(ErrorMessages.EMAIL_NOT_FOUND);
  });
});
