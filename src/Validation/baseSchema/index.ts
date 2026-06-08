import joi from "joi";

export const baseSchema = joi.object({
  currentUser: joi
    .object({
      userInfo: joi.object({
        _id: joi.string().required(),
        role: joi.string().required(),
        email: joi.string().email().required(),
        iat: joi.number().required(),
        exp: joi.number().required(),
        // jti: unique token id added by generateAccessToken. This object is the
        // decoded (server-verified) JWT injected by the auth middleware, so allow
        // standard token claims through — otherwise every admin endpoint 400s for
        // any client holding a newer token. unknown(true) keeps it future-proof
        // for further standard claims (nbf, aud, ...) without re-breaking.
        jti: joi.string().optional(),
      }).unknown(true).required(),
      token: joi.string().required(),
    })
    .required(),
});
