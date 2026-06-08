import express, { Application } from "express";
import authenticationRouter from "../../src/Router/Authentication/AuthRouter";
import { checkAuthority } from "../../src/middleware/AuthenticationMiddleware";
import { globalErrorHandling } from "../../src/Utils/ErrorHandling";

/**
 * Builds an Express app from the real auth pieces (router + middleware + error
 * handler) plus a tiny protected route, so e2e tests exercise the auth module
 * over HTTP without dragging in unrelated routers/infra.
 */
export const buildTestApp = (): Application => {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json());
  app.use("/authentication", authenticationRouter);
  app.use(checkAuthority);
  app.get("/protected", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(globalErrorHandling);
  return app;
};
