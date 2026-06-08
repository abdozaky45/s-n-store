import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db";
import {
  createNewAccessTokenOrUpdate,
  updateSessionLastUsed,
  findUserByAccessTokenAndUserId,
  MAX_SESSIONS_PER_USER,
} from "../../src/Service/Authentication/AuthService";
import TokenModel from "../../src/Model/Token/TokenModel";

// Avoid creating a real nodemailer transporter when the service module loads.
jest.mock("../../src/Utils/Nodemailer/SendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe("createNewAccessTokenOrUpdate (multi-session)", () => {
  it("creates a session document for the device", async () => {
    const userId = new mongoose.Types.ObjectId();

    await createNewAccessTokenOrUpdate("tokenA", userId, "deviceA", "1.1.1.1");

    const sessions = await TokenModel.find({ user: userId });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].accessToken).toBe("tokenA");
    expect(sessions[0].userAgent).toBe("deviceA");
    expect(sessions[0].ip).toBe("1.1.1.1");
    expect(sessions[0].lastUsedAt).toBeInstanceOf(Date);
  });

  it("keeps the first device logged in when a second device logs in", async () => {
    const userId = new mongoose.Types.ObjectId();

    await createNewAccessTokenOrUpdate("tokenA", userId, "deviceA", "1.1.1.1");
    await createNewAccessTokenOrUpdate("tokenB", userId, "deviceB", "2.2.2.2");

    const sessions = await TokenModel.find({ user: userId });
    expect(sessions).toHaveLength(2);
    expect(sessions.map((s) => s.accessToken).sort()).toEqual(["tokenA", "tokenB"]);
  });

  it("evicts the least-recently-used session when exceeding the device cap", async () => {
    const userId = new mongoose.Types.ObjectId();

    await createNewAccessTokenOrUpdate("tokenA", userId, "deviceA", "1.1.1.1");
    await createNewAccessTokenOrUpdate("tokenB", userId, "deviceB", "2.2.2.2");
    // Make A the oldest-used and B more recent, so A is the LRU victim.
    await TokenModel.updateOne(
      { accessToken: "tokenA" },
      { lastUsedAt: new Date(Date.now() - 100_000) }
    );
    await TokenModel.updateOne(
      { accessToken: "tokenB" },
      { lastUsedAt: new Date(Date.now() - 50_000) }
    );

    // Third device logs in -> exceeds the cap of 2.
    await createNewAccessTokenOrUpdate("tokenC", userId, "deviceC", "3.3.3.3");

    const sessions = await TokenModel.find({ user: userId });
    expect(sessions).toHaveLength(MAX_SESSIONS_PER_USER);
    expect(sessions.map((s) => s.accessToken).sort()).toEqual(["tokenB", "tokenC"]);
  });

  it("scopes the device cap per user (one user's logins don't affect another)", async () => {
    const userX = new mongoose.Types.ObjectId();
    const userY = new mongoose.Types.ObjectId();

    await createNewAccessTokenOrUpdate("x1", userX, "dev", "1.1.1.1");
    await createNewAccessTokenOrUpdate("x2", userX, "dev", "1.1.1.1");
    await createNewAccessTokenOrUpdate("x3", userX, "dev", "1.1.1.1");
    await createNewAccessTokenOrUpdate("y1", userY, "dev", "9.9.9.9");

    expect(await TokenModel.countDocuments({ user: userX })).toBe(MAX_SESSIONS_PER_USER);
    expect(await TokenModel.countDocuments({ user: userY })).toBe(1);
  });
});

describe("updateSessionLastUsed", () => {
  it("refreshes lastUsedAt and ip for an existing session", async () => {
    const userId = new mongoose.Types.ObjectId();
    await createNewAccessTokenOrUpdate("tokenA", userId, "deviceA", "1.1.1.1");
    const session = await TokenModel.findOne({ accessToken: "tokenA" });
    await TokenModel.updateOne(
      { accessToken: "tokenA" },
      { lastUsedAt: new Date(Date.now() - 100_000) }
    );

    await updateSessionLastUsed(session!._id, "5.5.5.5");

    const updated = await TokenModel.findOne({ accessToken: "tokenA" });
    expect(updated!.ip).toBe("5.5.5.5");
    expect(updated!.lastUsedAt.getTime()).toBeGreaterThan(Date.now() - 100_000);
  });
});

describe("findUserByAccessTokenAndUserId", () => {
  it("resolves the right session when a user has multiple sessions", async () => {
    const userId = new mongoose.Types.ObjectId();
    await createNewAccessTokenOrUpdate("tokenA", userId, "deviceA", "1.1.1.1");
    await createNewAccessTokenOrUpdate("tokenB", userId, "deviceB", "2.2.2.2");

    const found = await findUserByAccessTokenAndUserId(userId, "tokenB");
    expect(found).not.toBeNull();
    expect(found!.accessToken).toBe("tokenB");
  });

  it("returns null for a token that doesn't belong to the user", async () => {
    const userId = new mongoose.Types.ObjectId();
    await createNewAccessTokenOrUpdate("tokenA", userId, "deviceA", "1.1.1.1");

    const found = await findUserByAccessTokenAndUserId(userId, "nope");
    expect(found).toBeNull();
  });
});
