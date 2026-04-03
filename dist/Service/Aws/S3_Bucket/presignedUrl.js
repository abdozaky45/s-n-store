"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
class s3_service {
    constructor() {
        this.createPresignedUrlWithClient = async ({ bucket, key, contentType, }) => {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: contentType
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 360000 });
        };
        this.deletePresignedUrl = async ({ bucket, key, }) => {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            try {
                const data = await client.send(command);
                return data;
            }
            catch (error) {
                console.error("Error deleting file from S3:", error);
                throw new Error("Error deleting file from S3");
            }
        };
    }
}
exports.default = s3_service;
