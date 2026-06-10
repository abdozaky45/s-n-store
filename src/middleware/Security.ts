import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { allowedOrigins } from "../config";

// Browsers always send an Origin header on cross- and same-origin POST/PUT/
// PATCH/DELETE fetches, but NOT on same-origin GET — so these guards must only
// run for mutating methods or they break normal page loads.
const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

const isMutating = (req: Request) => MUTATING_METHODS.includes(req.method);

export function enforcePublicApiRestrictions(req: Request, res: Response, next: NextFunction) {
  if (!isMutating(req)) return next();

  const origin = req.get("origin") || req.get("referer");
  const allowed =
    !!origin &&
    allowedOrigins.some(
      // Origin is exact ("https://sn-lingerie.com"); Referer carries a path
      // ("https://sn-lingerie.com/checkout"). Require the "/" boundary so
      // "https://sn-lingerie.com.evil.com" can't pass a prefix check.
      (o) => origin === o || origin.startsWith(`${o}/`)
    );

  if (!allowed) {
    return res.status(403).json({ message: "Forbidden: unauthorized origin" });
  }

  next();
}

// Caps write traffic per IP on the public API to stop mass deletion /
// enumeration scripts. Generous enough that a real shopper never hits it.
export const publicMutationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isMutating(req),
  message: { message: "Too many requests, please try again later" },
  // app.ts sets `trust proxy: true` for the EB load balancer chain; the
  // library flags that as too permissive, but changing it would affect
  // existing per-session IP tracking, so silence just this validation.
  validate: { trustProxy: false },
});

export function blockScrapers(req: Request, res: Response, next: NextFunction) {
  if (!isMutating(req)) return next();

  const userAgent = req.get("User-Agent");

  if (!userAgent || userAgent.includes("Postman") || userAgent.includes("curl")) {
    return res.status(403).json({ message: "Forbidden: unauthorized tool" });
  }

  next();
}
