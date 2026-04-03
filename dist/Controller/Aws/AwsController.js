"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.deleteProductImages = exports.getPresignedURL = void 0;
const ErrorHandling_1 = require("../../Utils/ErrorHandling");
const Error_1 = __importDefault(require("../../Utils/Error"));
const presignedUrl_1 = __importDefault(require("../../Service/Aws/S3_Bucket/presignedUrl"));
exports.getPresignedURL = (0, ErrorHandling_1.asyncHandler)(async (req, res) => {
    const regionAws = process.env.AWS_REGION;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const files = Array.isArray(req.body.files)
        ? req.body.files
        : [req.body.files];
    if (!files || files.length === 0) {
        throw new ErrorHandling_1.ApiError(400, Error_1.default.NO_FILES_PROVIDED);
    }
    const aws_s3_service = new presignedUrl_1.default();
    const preSignedURLs = await Promise.all(files.map(async (file, index) => {
        const fileName = `${req.body.folder}/${req.body.currentUser.userInfo._id}_${Date.now()}_${index}`;
        const preSignedURL = await aws_s3_service.createPresignedUrlWithClient({
            region: regionAws,
            bucket: bucketName,
            key: file.fileName || fileName,
            contentType: file.contentType || "image/jpeg",
        });
        return {
            preSignedURL,
            mediaUrl: preSignedURL.split("?")[0],
        };
    }));
    return res.json(new ErrorHandling_1.ApiResponse(200, {
        preSignedURLs,
    }));
});
const deleteProductImages = async (product) => {
    const aws = new presignedUrl_1.default();
    const bucketName = process.env.AWS_BUCKET_NAME;
    const imageIds = [
        product.defaultImage?.mediaId,
        product.sizeChartImage?.mediaId,
        ...(product.albumImages?.map((img) => img.mediaId) || []),
    ].filter(Boolean);
    await Promise.all(imageIds.map((mediaId) => aws.deletePresignedUrl({ bucket: bucketName, key: mediaId })));
};
exports.deleteProductImages = deleteProductImages;
const deleteImage = async (mediaId) => {
    const aws = new presignedUrl_1.default();
    const bucketName = process.env.AWS_BUCKET_NAME;
    await aws.deletePresignedUrl({ bucket: bucketName, key: mediaId });
};
exports.deleteImage = deleteImage;
