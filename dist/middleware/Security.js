"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforcePublicApiRestrictions = enforcePublicApiRestrictions;
exports.blockScrapers = blockScrapers;
const allowedOrigins = process.env.MAIN_ORIGIN ? [process.env.MAIN_ORIGIN] : [];
function enforcePublicApiRestrictions(req, res, next) {
    const origin = req.get("origin") || req.get("referer");
    if (!origin || !allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return res.status(403).json({ message: "🚫 Forbidden: Unauthorized origin" });
    }
    next();
}
function blockScrapers(req, res, next) {
    const userAgent = req.get("User-Agent");
    if (!userAgent || userAgent.includes("Postman") || userAgent.includes("curl")) {
        return res.status(403).json({ message: "🚫 Forbidden: Unauthorized tool detected!" });
    }
    next();
}
