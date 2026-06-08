import { baseSchema } from "../../src/Validation/baseSchema";
import {
  generateAccessToken,
  verifyToken,
} from "../../src/Utils/GenerateAndVerifyToken";

// Regression guard: the auth middleware puts the *decoded* access token on
// req.body.currentUser.userInfo, and every admin endpoint validates it through
// baseSchema. Any standard claim the token carries (e.g. the jti) must pass, or
// all admin endpoints 400 with a validation error (this exact bug hit mobile
// clients that had been issued newer, jti-bearing tokens).
describe("baseSchema vs the real auth-injected currentUser", () => {
  it("accepts a decoded access token that carries a jti", () => {
    const token = generateAccessToken({
      payload: { _id: "u1", role: "admin", email: "admin@test.com" },
    });
    const decoded = verifyToken({ token });

    // Sanity: the token really does carry a jti now.
    expect(decoded).toHaveProperty("jti");

    const { error } = baseSchema.validate({
      currentUser: { userInfo: decoded, token },
    });
    expect(error).toBeUndefined();
  });

  it("tolerates further standard JWT claims on userInfo", () => {
    const { error } = baseSchema.validate({
      currentUser: {
        userInfo: {
          _id: "u1",
          role: "admin",
          email: "admin@test.com",
          iat: 1,
          exp: 2,
          jti: "abc",
          nbf: 1,
        },
        token: "t",
      },
    });
    expect(error).toBeUndefined();
  });

  it("still rejects userInfo that is missing a required claim", () => {
    const { error } = baseSchema.validate({
      currentUser: {
        userInfo: { role: "admin", email: "admin@test.com", iat: 1, exp: 2 },
        token: "t",
      },
    });
    expect(error).toBeDefined();
  });
});
