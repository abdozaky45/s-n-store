import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Origins allowed to call the API from a browser. Can be overridden/extended
// via the ALLOWED_ORIGINS env var (comma-separated). Origin headers never have
// a trailing slash, so normalize whatever we get.
const DEFAULT_ALLOWED_ORIGINS = [
    "https://sn-lingerie.com",
    "https://www.sn-lingerie.com",
    "https://dashboard.sn-lingerie.com",
];

// Local dev servers (Vite auto-increments ports when 5173/5174 are busy, and
// some setups use 127.0.0.1), so accept any localhost port instead of pinning.
const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const envOrigins = (process.env.ALLOWED_ORIGINS?.split(",") || [])
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

export const allowedOrigins = envOrigins.length > 0 ? envOrigins : DEFAULT_ALLOWED_ORIGINS;

export const isAllowedOrigin = (origin: string) =>
    allowedOrigins.includes(origin) || LOCAL_ORIGIN_REGEX.test(origin);

export function getCorsOptions(): cors.CorsOptions {
    return {
        // Requests without an Origin header (same-origin navigations, curl,
        // health checks) are allowed here — CORS only governs browsers, and
        // mutating endpoints are additionally guarded by Security.ts.
        origin: (origin, callback) => {
            callback(null, !origin || isAllowedOrigin(origin));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    };
}
