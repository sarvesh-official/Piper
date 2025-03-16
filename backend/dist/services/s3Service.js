"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.getFileFromS3 = exports.uploadToS3 = exports.deleteFilesFromS3 = exports.uploadFileToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});
const bucketName = process.env.S3_BUCKET_NAME || "";
const uploadFileToS3 = (userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const fileKey = `uploads/${userId}/${Date.now()}_${file.originalname}`;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    yield s3.upload(params).promise();
    return {
        fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
        fileKey,
    };
});
exports.uploadFileToS3 = uploadFileToS3;
const deleteFilesFromS3 = (fileKeys) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletePromises = fileKeys.map((fileKey) => __awaiter(void 0, void 0, void 0, function* () {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucketName,
                Key: fileKey
            });
            return s3Client.send(command);
        }));
        yield Promise.all(deletePromises);
        console.log(`Successfully deleted ${fileKeys.length} files from S3`);
    }
    catch (error) {
        console.error("Error deleting files from S3:", error);
        throw error;
    }
});
exports.deleteFilesFromS3 = deleteFilesFromS3;
const uploadToS3 = (fileBuffer, fileKey, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    if (!bucketName) {
        console.error('AWS bucket name is not defined');
        return null;
    }
    try {
        const params = {
            Bucket: bucketName,
            Key: fileKey,
            Body: fileBuffer,
            ContentType: contentType,
        };
        return yield s3.upload(params).promise();
    }
    catch (error) {
        console.error('Error uploading to S3:', error);
        return null;
    }
});
exports.uploadToS3 = uploadToS3;
const getFileFromS3 = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    if (!bucketName) {
        console.error('AWS bucket name is not defined');
        return null;
    }
    try {
        const params = {
            Bucket: bucketName,
            Key: fileKey
        };
        return yield s3.getObject(params).promise();
    }
    catch (error) {
        console.error('Error getting file from S3:', error);
        return null;
    }
});
exports.getFileFromS3 = getFileFromS3;
const deleteFileFromS3 = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    if (!bucketName) {
        console.error('AWS bucket name is not defined');
        return false;
    }
    try {
        const params = {
            Bucket: bucketName,
            Key: fileKey
        };
        yield s3.deleteObject(params).promise();
        return true;
    }
    catch (error) {
        console.error('Error deleting file from S3:', error);
        return false;
    }
});
exports.deleteFileFromS3 = deleteFileFromS3;
