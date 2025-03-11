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
exports.uploadFilesAndExtractText = void 0;
const s3Service_1 = require("../services/s3Service");
const chatModel_1 = __importDefault(require("../model/chatModel"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const uploadFilesAndExtractText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const files = req.files;
        const chatName = files.map(f => f.originalname).join(", ").substring(0, 50) || "New Chat";
        if (!userId || !files || files.length === 0 || files.length > 3) {
            res.status(400).json({ error: "Invalid request. Upload 1 to 3 files only." });
            return;
        }
        const processedFiles = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            // Extract text for embeddings (not sent to frontend)
            const extractedText = yield extractTextFromFile(file.buffer, file.mimetype);
            // Upload file to S3
            const { fileKey, fileUrl } = yield (0, s3Service_1.uploadFileToS3)(userId, file);
            return { fileName: file.originalname, fileUrl, fileKey, extractedText };
        })));
        // Create a new chat entry in the database
        const chat = new chatModel_1.default({
            chatName,
            userId,
            files: processedFiles.map(({ fileName, fileUrl, fileKey }) => ({
                fileName,
                fileUrl,
                fileKey,
            })),
            extractedTexts: processedFiles.map(({ extractedText }) => extractedText),
            createdAt: new Date(),
        });
        yield chat.save();
        res.json({
            chatId: chat.chatId,
            uploaded: processedFiles.map(({ fileName, fileUrl, fileKey }) => ({
                fileName,
                fileUrl,
                fileKey,
            })),
            extractedTexts: processedFiles.map(({ extractedText }) => extractedText),
        });
    }
    catch (error) {
        console.error("Error processing files:", error);
        res.status(500).json({ error: "Failed to upload files and create chat" });
    }
});
exports.uploadFilesAndExtractText = uploadFilesAndExtractText;
// Function to extract text based on file type
const extractTextFromFile = (fileBuffer, mimeType) => __awaiter(void 0, void 0, void 0, function* () {
    if (mimeType === "application/pdf") {
        const pdfData = yield (0, pdf_parse_1.default)(fileBuffer);
        return pdfData.text;
    }
    else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const docxData = yield mammoth_1.default.extractRawText({ buffer: fileBuffer });
        return docxData.value;
    }
    else if (mimeType === "text/csv") {
        return yield extractTextFromCSV(fileBuffer);
    }
    else if (mimeType === "text/plain") {
        return fileBuffer.toString("utf-8");
    }
    else {
        throw new Error("Unsupported file type");
    }
});
// Function to extract text from CSV
const extractTextFromCSV = (fileBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        let textData = "";
        const lines = fileBuffer.toString("utf-8").split("\n");
        lines.forEach((line) => {
            textData += line + "\n";
        });
        resolve(textData);
    });
});
