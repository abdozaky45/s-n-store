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

// Env origins EXTEND the defaults instead of replacing them: a stale
// ALLOWED_ORIGINS value left on the server must never be able to lock the
// real storefront/dashboard domains out of their own API.
export const allowedOrigins = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])];

export const isAllowedOrigin = (origin: string) =>
    allowedOrigins.includes(origin) || LOCAL_ORIGIN_REGEX.test(origin);

// Public storefront base URL. The product share endpoint builds Open Graph
// preview pages that redirect real visitors here. Overridable via env, but
// defaults to the production storefront so previews work out of the box.
export const STOREFRONT_URL = (process.env.STOREFRONT_URL || "https://sn-lingerie.com")
    .trim()
    .replace(/\/+$/, "");

// Frontend route for a single product page, e.g. .../products/<id>.
export const getStorefrontProductUrl = (productId: string) =>
    `${STOREFRONT_URL}/products/${productId}`;

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
