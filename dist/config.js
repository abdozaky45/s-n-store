"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorsOptions = getCorsOptions;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
console.log("Allowed originss: ", allowedOrigins);
function getCorsOptions() {
    return {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    };
}
