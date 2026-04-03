"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashActiveCode = hashActiveCode;
exports.compareActiveCode = compareActiveCode;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashActiveCode(code) {
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedCode = await bcrypt_1.default.hashSync(code, salt);
    return hashedCode;
}
async function compareActiveCode(code, hashedCode) {
    const isMatch = await bcrypt_1.default.compare(code, hashedCode);
    return isMatch;
}
