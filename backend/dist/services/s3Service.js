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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.getFileFromS3 = exports.uploadToS3 = exports.deleteFilesFromS3 = exports.uploadFileToS3 = void 0;
const blob_1 = require("@vercel/blob");
const uploadFileToS3 = (userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const fileKey = `uploads/${userId}/${Date.now()}_${file.originalname}`;
    const blob = yield (0, blob_1.put)(fileKey, file.buffer, {
        access: "public",
        contentType: file.mimetype,
        addRandomSuffix: false,
    });
    return {
        fileUrl: blob.url,
        fileKey,
    };
});
exports.uploadFileToS3 = uploadFileToS3;
const deleteFilesFromS3 = (fileKeys) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletePromises = fileKeys.map((fileKey) => __awaiter(void 0, void 0, void 0, function* () {
            // Vercel Blob requires the full URL to delete
            // Construct URL from the key — stored fileKey is the pathname
            return (0, blob_1.del)(fileKey);
        }));
        yield Promise.all(deletePromises);
        console.log(`Successfully deleted ${fileKeys.length} files from Vercel Blob`);
    }
    catch (error) {
        console.error("Error deleting files from Vercel Blob:", error);
        throw error;
    }
});
exports.deleteFilesFromS3 = deleteFilesFromS3;
const uploadToS3 = (fileBuffer, fileKey, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blob = yield (0, blob_1.put)(fileKey, fileBuffer, {
            access: "public",
            contentType,
            addRandomSuffix: false,
        });
        return { url: blob.url, pathname: blob.pathname };
    }
    catch (error) {
        console.error("Error uploading to Vercel Blob:", error);
        return null;
    }
});
exports.uploadToS3 = uploadToS3;
const getFileFromS3 = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blobMetadata = yield (0, blob_1.head)(fileKey);
        if (!blobMetadata)
            return null;
        const response = yield fetch(fileKey);
        if (!response.ok)
            return null;
        const body = Buffer.from(yield response.arrayBuffer());
        return { body };
    }
    catch (error) {
        console.error("Error getting file from Vercel Blob:", error);
        return null;
    }
});
exports.getFileFromS3 = getFileFromS3;
const deleteFileFromS3 = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, blob_1.del)(fileKey);
        return true;
    }
    catch (error) {
        console.error("Error deleting file from Vercel Blob:", error);
        return false;
    }
});
exports.deleteFileFromS3 = deleteFileFromS3;
