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
        // Array to collect any processing errors
        const processingErrors = [];
        // Store embeddings and update MongoDB
        yield Promise.all(processedFiles.map((_a, index_1) => __awaiter(void 0, [_a, index_1], void 0, function* ({ extractedText, fileKey, fileName }, index) {
            if (extractedText) {
                try {
                    const textByteSize = Buffer.byteLength(extractedText, 'utf-8');
                    console.log(`Processing text for ${fileName}, size: ${textByteSize} bytes`);
                    // Check if the text is too large
                    if (textByteSize > 30000) {
                        console.log(`Text is large (${textByteSize} bytes), chunking before embedding generation`);
                        // Chunk the text into smaller pieces (around 25KB each to stay well below the 36KB limit)
                        const textChunks = chunkText(extractedText, 25000);
                        console.log(`Split into ${textChunks.length} chunks for processing`);
                        const allEmbeddings = [];
                        // Process each chunk and collect embeddings
                        for (let i = 0; i < textChunks.length; i++) {
                            try {
                                const chunkEmbeddings = yield (0, embeddingService_1.generateEmbeddings)(textChunks[i]);
                                allEmbeddings.push(...chunkEmbeddings);
                            }
                            catch (chunkError) {
                                console.error(`Error processing chunk ${i + 1}/${textChunks.length}:`, chunkError.message);
                            }
                        }
                        if (allEmbeddings.length === 0) {
                            throw new Error("Failed to generate any embeddings from text chunks");
                        }
                        const baseEmbeddingId = `${chat.chatId}-${fileKey}`;
                        // Store all collected embeddings
                        const embeddingIds = yield (0, embeddingService_1.storeChunkedEmbeddings)(baseEmbeddingId, allEmbeddings, {
                            userId,
                            chatId: chat.chatId,
                            fileName: fileName,
                            extractedText: extractedText
                        });
                        // Update MongoDB with embedding ID(s)
                        const idToStore = embeddingIds.length > 1 ? embeddingIds : embeddingIds[0];
                        yield (0, embeddingService_1.updateFileWithEmbeddingId)(chat.chatId, fileKey, idToStore);
                        console.log(`Processed ${allEmbeddings.length} embeddings for ${fileName}`);
                    }
                    else {
                        // Original code for smaller files
                        const embeddings = yield (0, embeddingService_1.generateEmbeddings)(extractedText);
                        const baseEmbeddingId = `${chat.chatId}-${fileKey}`;
                        const embeddingIds = yield (0, embeddingService_1.storeChunkedEmbeddings)(baseEmbeddingId, embeddings, {
                            userId,
                            chatId: chat.chatId,
                            fileName: fileName,
                            extractedText: extractedText
                        });
                        const idToStore = embeddingIds.length > 1 ? embeddingIds : embeddingIds[0];
                        yield (0, embeddingService_1.updateFileWithEmbeddingId)(chat.chatId, fileKey, idToStore);
                        if (embeddingIds.length > 1) {
                            console.log(`Chunked embeddings stored for: ${fileKey} (${embeddingIds.length} chunks)`);
                        }
                        else {
                            console.log(`Embedding stored and updated for: ${fileKey} with ${extractedText.length} chars of text`);
                        }
                    }
                }
                catch (embeddingError) {
                    const errorMessage = `Error processing ${fileName}: ${embeddingError.message}`;
                    console.error(errorMessage);
                    processingErrors.push(errorMessage);
                }
            }
            else {
                console.warn(`No extracted text available for ${fileName}, skipping embedding generation`);
                processingErrors.push(`Could not extract text from ${fileName}`);
            }
        })));
        res.json({
            chatId: chat.chatId,
            uploaded: processedFiles.map(({ fileName, fileUrl }) => ({
                fileName,
                fileUrl,
            })),
            message: processingErrors.length > 0
                ? "Files uploaded but some embedding processing issues occurred"
                : "Files uploaded and embeddings stored successfully",
            processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
        });
    }
    catch (error) {
        console.error("Error processing files:", error);
        res.status(500).json({
            error: "Failed to upload files and create chat",
            details: error.message
        });
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
// Function to chunk text into smaller pieces
function chunkText(text, maxBytes) {
    const chunks = [];
    let currentChunk = "";
    // Split by paragraphs or sentences to maintain context
    const paragraphs = text.split(/\n\s*\n/);
    for (const paragraph of paragraphs) {
        // If adding this paragraph would exceed the limit, store current chunk and start a new one
        if (Buffer.byteLength(currentChunk + paragraph, 'utf-8') > maxBytes && currentChunk) {
            chunks.push(currentChunk);
            currentChunk = paragraph;
        }
        else {
            // Add paragraph to current chunk with a newline if needed
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
        // Check if current chunk is large enough to split
        while (Buffer.byteLength(currentChunk, 'utf-8') > maxBytes) {
            // If a single paragraph is too large, split by sentences
            const sentences = currentChunk.split(/(?<=[.!?])\s+/);
            currentChunk = "";
            let tempChunk = "";
            for (const sentence of sentences) {
                if (Buffer.byteLength(tempChunk + sentence, 'utf-8') > maxBytes && tempChunk) {
                    chunks.push(tempChunk);
                    tempChunk = sentence;
                }
                else {
                    tempChunk += (tempChunk ? ' ' : '') + sentence;
                }
            }
            currentChunk = tempChunk;
        }
    }
    // Add the final chunk if not empty
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}
