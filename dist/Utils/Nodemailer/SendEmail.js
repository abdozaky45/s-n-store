"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async ({ from = process.env.EMAIL, to, subject, html, }) => {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });
    const info = await transporter.sendMail({
        from: `S&N Langire <${from}>`,
        to,
        subject,
        text: 'your login code',
        html,
    });
    return info.accepted.length < 1 ? false : true;
};
exports.sendEmail = sendEmail;
