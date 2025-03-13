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
exports.uploadFilesAndExtractText = exports.handleMulterError = void 0;
const s3Service_1 = require("../services/s3Service");
const chatModel_1 = __importDefault(require("../model/chatModel"));
const embeddingService_1 = require("../services/embeddingService");
const fileProcessor_1 = require("../utils/fileProcessor");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const multer_1 = __importDefault(require("multer"));
// Add a middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                error: "File size exceeds the limit of 5 MB"
            });
            return;
        }
        res.status(400).json({
            error: `Upload error: ${err.message}`
        });
        return;
    }
    else if (err) {
        // An unknown error occurred
        res.status(500).json({
            error: `Unknown error: ${err.message}`
        });
        return;
    }
    next();
};
exports.handleMulterError = handleMulterError;
const uploadFilesAndExtractText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const files = req.files;
        if (!userId || !files || files.length === 0 || files.length > 3) {
            res
                .status(400)
                .json({ error: "Invalid request. Upload 1 to 3 files only." });
            return;
        }
        const chatName = files.map((f) => f.originalname).join(", ").substring(0, 50) || "New Chat";
        const processedFiles = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const extractedText = yield extractTextFromFile(file.buffer, file.mimetype);
            const { fileKey, fileUrl } = yield (0, s3Service_1.uploadFileToS3)(userId, file);
            return { fileName: file.originalname, fileUrl, fileKey, extractedText };
        })));
        // Create a new chat entry with extracted text stored in the file objects
        const chat = new chatModel_1.default({
            chatName,
            userId,
            files: processedFiles.map(({ fileName, fileUrl, fileKey, extractedText }) => {
                var _a;
                return ({
                    userId,
                    fileName,
                    fileUrl,
                    fileKey,
                    extractedText, // Include extracted text directly in the file objects
                    fileType: ((_a = files.find(f => f.originalname === fileName)) === null || _a === void 0 ? void 0 : _a.mimetype) || 'unknown',
                });
            }),
            createdAt: new Date(),
        });
        yield chat.save();
        console.log(`Chat created with ${processedFiles.length} files, each with extracted text`);
        // Store embeddings and update MongoDB
        yield Promise.all(processedFiles.map((_a, index_1) => __awaiter(void 0, [_a, index_1], void 0, function* ({ extractedText, fileKey, fileName }, index) {
            if (extractedText) {
                try {
                    const textByteSize = Buffer.byteLength(extractedText, 'utf-8');
                    console.log(`Processing text for ${fileName}, size: ${textByteSize} bytes`);
                    // Fix: The issue is here - embeddings is number[][] but we need to pass it to storeChunkedEmbeddings correctly
                    const embeddings = yield (0, embeddingService_1.generateEmbeddings)(extractedText);
                    const baseEmbeddingId = `${chat.chatId}-${fileKey}`;
                    // Process embeddings and store them, whether single or multiple chunks
                    const embeddingIds = yield (0, embeddingService_1.storeChunkedEmbeddings)(baseEmbeddingId, embeddings, // Pass the full array of embeddings (each one is a number[])
                    {
                        userId,
                        chatId: chat.chatId,
                        fileName: fileName,
                        extractedText: extractedText
                    });
                    // If we have multiple embeddings, store as array, otherwise store as single string
                    const idToStore = embeddingIds.length > 1 ? embeddingIds : embeddingIds[0];
                    // Update MongoDB with embedding ID(s)
                    yield (0, embeddingService_1.updateFileWithEmbeddingId)(chat.chatId, fileKey, idToStore);
                    if (embeddingIds.length > 1) {
                        console.log(`Chunked embeddings stored for: ${fileKey} (${embeddingIds.length} chunks)`);
                    }
                    else {
                        console.log(`Embedding stored and updated for: ${fileKey} with ${extractedText.length} chars of text`);
                    }
                }
                catch (embeddingError) {
                    console.error("Error generating or storing embeddings:", embeddingError);
                }
            }
            else {
                console.warn(`No extracted text available for ${fileName}, skipping embedding generation`);
            }
        })));
        res.json({
            chatId: chat.chatId,
            uploaded: processedFiles.map(({ fileName, fileUrl }) => ({
                fileName,
                fileUrl,
            })),
            message: "Files uploaded and embeddings stored successfully",
        });
    }
    catch (error) {
        console.error("Error processing files:", error);
        res.status(500).json({ error: "Failed to upload files and create chat" });
    }
});
exports.uploadFilesAndExtractText = uploadFilesAndExtractText;
// Extract text based on file type
const extractTextFromFile = (fileBuffer, mimeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mimeType === "application/pdf") {
            const pdfData = yield (0, pdf_parse_1.default)(fileBuffer);
            return pdfData.text;
        }
        else if (mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const docxData = yield mammoth_1.default.extractRawText({ buffer: fileBuffer });
            return docxData.value;
        }
        else if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            mimeType === "application/vnd.ms-excel") {
            return (0, fileProcessor_1.extractTextFromExcel)(fileBuffer);
        }
        else if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
            return yield (0, fileProcessor_1.extractTextFromPPTX)(fileBuffer);
        }
        else if (mimeType === "text/csv") {
            return yield (0, fileProcessor_1.extractTextFromCSV)(fileBuffer);
        }
        else if (mimeType === "text/plain") {
            return fileBuffer.toString("utf-8");
        }
        else if (mimeType.startsWith("image/")) {
            return yield (0, fileProcessor_1.extractTextFromImage)(fileBuffer);
        }
        else {
            throw new Error("Unsupported file type");
        }
    }
    catch (error) {
        console.error("Error extracting text:", error);
        return "";
    }
});
