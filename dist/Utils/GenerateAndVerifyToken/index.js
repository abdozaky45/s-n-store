"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = ({ payload = {}, signature = process.env.TOKEN_SIGNATURE, } = {}) => {
    const token = jsonwebtoken_1.default.sign(payload, signature, {
        expiresIn: "7d"
    });
    return token;
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = ({ payload = {}, signature = process.env.TOKEN_SIGNATURE, } = {}) => {
    const token = jsonwebtoken_1.default.sign(payload, signature, {
        expiresIn: '365d',
    });
    return token;
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = ({ token, signature = process.env.TOKEN_SIGNATURE, }) => {
    if (!signature) {
        throw new Error("Token signature is not defined");
    }
    if (!token) {
        throw new Error("Token must be provided");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, signature);
        return decoded;
    }
    catch (error) {
        throw new Error("Invalid token or expired");
    }
};
exports.verifyToken = verifyToken;
