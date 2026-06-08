import request from "supertest";
import { Application } from "express";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import { buildTestApp } from "../helpers/app";
import AuthModel from "../../src/Model/User/auth/AuthModel";
import TokenModel from "../../src/Model/Token/TokenModel";
import { hashActiveCode } from "../../src/Utils/HashAndCompare";
import { UserTypeEnum } from "../../src/Utils/UserType";
import * as AuthService from "../../src/Service/Authentication/AuthService";
import SuccessMessage from "../../src/Utils/SuccessMessages";
import ErrorMessages from "../../src/Utils/Error";

// No real emails during e2e.
jest.mock("../../src/Utils/Nodemailer/SendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

let app: Application;
const ADMIN_EMAIL = "admin@test.com";
const FIXED_CODE = "123456";

beforeAll(async () => {
  await connectTestDB();
  app = buildTestApp();
});
afterEach(clearTestDB);
afterAll(closeTestDB);

const seedAdmin = () =>
  AuthModel.create({ email: ADMIN_EMAIL, role: UserTypeEnum.ADMIN });

// Re-issue a known one-time code for an existing user, then activate via the
// real endpoint to obtain a fresh session/token (simulates a device login).
const loginDevice = async (email: string, userAgent: string): Promise<string> => {
  await AuthModel.updateOne(
    { email },
    { activeCode: await hashActiveCode(FIXED_CODE), codeCreatedAt: Date.now() }
  );
  const res = await request(app)
    .post("/authentication/active-account")
    .set("User-Agent", userAgent)
    .send({ email, activeCode: FIXED_CODE });
  expect(res.status).toBe(200);
  return res.body.data.accessToken as string;
};

describe("auth e2e", () => {
  it("completes the admin login flow (request code -> activate) and the token works on a protected route", async () => {
    await seedAdmin();
    // Make the emailed code deterministic so the test can use it.
    const codeSpy = jest
      .spyOn(AuthService, "generateSixDigitCode")
      .mockReturnValue(FIXED_CODE);

    const requestCode = await request(app)
      .post("/authentication/register-email")
      .send({ email: ADMIN_EMAIL });
    expect(requestCode.status).toBe(200);
    expect(requestCode.body.message).toBe(SuccessMessage.EMAIL_SENT);

    const activate = await request(app)
      .post("/authentication/active-account")
      .send({ email: ADMIN_EMAIL, activeCode: FIXED_CODE });
    expect(activate.status).toBe(200);
    const token = activate.body.data.accessToken;
    expect(typeof token).toBe("string");

    const protectedOk = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(protectedOk.status).toBe(200);
    expect(protectedOk.body).toEqual({ ok: true });

    codeSpy.mockRestore();
  });

  it("rejects a protected route with no/invalid token (401)", async () => {
    const noToken = await request(app).get("/protected");
    expect(noToken.status).toBe(401);

    const badToken = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer garbage.token");
    expect(badToken.status).toBe(401);
  });

  it("returns 400 on validation error (missing activeCode)", async () => {
    const res = await request(app)
      .post("/authentication/active-account")
      .send({ email: ADMIN_EMAIL });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation Error!");
  });

  it("returns 400 for a wrong activation code", async () => {
    await seedAdmin();
    await AuthModel.updateOne(
      { email: ADMIN_EMAIL },
      { activeCode: await hashActiveCode(FIXED_CODE), codeCreatedAt: Date.now() }
    );
    const res = await request(app)
      .post("/authentication/active-account")
      .send({ email: ADMIN_EMAIL, activeCode: "000000" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ErrorMessages.ACTIVE_CODE_NOT_MATCH);
  });

  it("allows two devices and evicts the least-recently-used on the third", async () => {
    await seedAdmin();

    // Each token carries a unique jti, so device tokens are distinct even when
    // logins happen back-to-back.
    const tokenA = await loginDevice(ADMIN_EMAIL, "device-A");
    const tokenB = await loginDevice(ADMIN_EMAIL, "device-B");

    // Both devices are active.
    expect((await request(app).get("/protected").set("Authorization", `Bearer ${tokenA}`)).status).toBe(200);
    expect((await request(app).get("/protected").set("Authorization", `Bearer ${tokenB}`)).status).toBe(200);
    expect(await TokenModel.countDocuments()).toBe(2);

    // Third device logs in -> exceeds the 2-device cap.
    const tokenC = await loginDevice(ADMIN_EMAIL, "device-C");
    expect(await TokenModel.countDocuments()).toBe(2);

    // Device A (least-recently-used) is kicked out; B and C still work.
    expect((await request(app).get("/protected").set("Authorization", `Bearer ${tokenA}`)).status).toBe(401);
    expect((await request(app).get("/protected").set("Authorization", `Bearer ${tokenB}`)).status).toBe(200);
    expect((await request(app).get("/protected").set("Authorization", `Bearer ${tokenC}`)).status).toBe(200);
  });
});
