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
exports.deleteEmbeddingsById = exports.updateFileWithEmbeddingId = exports.storeChunkedEmbeddings = exports.storeInPinecone = exports.generateEmbeddings = void 0;
const generative_ai_1 = require("@google/generative-ai");
const chatModel_1 = __importDefault(require("../model/chatModel"));
const pineconeService_1 = require("./pineconeService");
const textChunker_1 = require("../utils/textChunker");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const EMBEDDING_MODELS = [
    process.env.GOOGLE_EMBEDDING_MODEL,
    "gemini-embedding-001",
    "text-embedding-004",
    "embedding-001",
].filter((model) => Boolean(model));
const generateEmbeddings = (text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if text needs chunking
        const textChunks = (0, textChunker_1.chunkText)(text);
        let lastError;
        for (const embeddingModel of EMBEDDING_MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: embeddingModel });
                // Generate embeddings for each chunk
                const embeddingsArray = yield Promise.all(textChunks.map((chunk) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield model.embedContent(chunk);
                    return result.embedding.values;
                })));
                if (process.env.NODE_ENV !== "production") {
                    console.log(`Using embedding model: ${embeddingModel}`);
                }
                return embeddingsArray;
            }
            catch (error) {
                lastError = error;
                const status = error === null || error === void 0 ? void 0 : error.status;
                if (status !== 404) {
                    throw error;
                }
                console.warn(`Embedding model ${embeddingModel} unavailable, trying fallback model.`);
            }
        }
        throw lastError !== null && lastError !== void 0 ? lastError : new Error("No supported embedding model found");
    }
    catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error("Failed to generate embeddings");
    }
});
exports.generateEmbeddings = generateEmbeddings;
const storeInPinecone = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if metadata size is within limits (40KB)
        let metadata = Object.assign({}, data.metadata);
        if (metadata.extractedText) {
            const textSize = Buffer.byteLength(JSON.stringify(metadata.extractedText), 'utf-8');
            if (textSize > 38000) { // Leave some buffer below 40KB
                // Truncate the text or remove it completely
                delete metadata.extractedText;
                console.log(`Metadata too large (${textSize} bytes), removing extracted text from metadata`);
            }
        }
        // Create namespace from userId to target specific user's embeddings
        const namespaceId = `user-${metadata.userId}`;
        // Get the index directly from pinecone
        const index = pineconeService_1.pinecone.index("chat-app");
        const namespace = index.namespace(namespaceId);
        // Use the upsert method with the proper format for Pinecone v3
        yield namespace.upsert([{
                id: data.id,
                values: data.values, // This needs to be a single array of numbers
                metadata
            }]);
    }
    catch (error) {
        console.error("Error storing in Pinecone:", error);
        throw new Error("Failed to store in vector database");
    }
});
exports.storeInPinecone = storeInPinecone;
// Function to store chunked embeddings in Pinecone
const storeChunkedEmbeddings = (baseId, embeddings, // Array of embedding arrays
metadata) => __awaiter(void 0, void 0, void 0, function* () {
    const embeddingIds = [];
    // We need to re-chunk the text to ensure it matches the embeddings
    const textChunks = (0, textChunker_1.chunkText)(metadata.extractedText);
    if (textChunks.length !== embeddings.length) {
        console.warn(`Warning: Number of text chunks (${textChunks.length}) doesn't match embeddings (${embeddings.length})`);
    }
    // Store each embedding with its corresponding text chunk
    for (let i = 0; i < embeddings.length; i++) {
        const embeddingId = `${baseId}-chunk-${i}`;
        embeddingIds.push(embeddingId);
        const chunkText = i < textChunks.length ? textChunks[i] : "";
        // Pass the individual embedding array (number[]) to storeInPinecone
        const embeddingVector = embeddings[i];
        yield (0, exports.storeInPinecone)({
            id: embeddingId,
            values: embeddingVector, // Pass a single embedding array
            metadata: {
                userId: metadata.userId,
                chatId: metadata.chatId,
                fileName: metadata.fileName,
                extractedText: chunkText,
                chunkIndex: i,
                totalChunks: embeddings.length
            }
        });
    }
    return embeddingIds;
});
exports.storeChunkedEmbeddings = storeChunkedEmbeddings;
const updateFileWithEmbeddingId = (chatId, fileKey, embeddingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield chatModel_1.default.updateOne({ chatId, "files.fileKey": fileKey }, { $set: { "files.$.embeddingId": embeddingId } });
        if (result.matchedCount === 0) {
            throw new Error(`No file found with key ${fileKey} in chat ${chatId}`);
        }
        return result;
    }
    catch (error) {
        console.error("Error updating file with embedding ID:", error);
        throw new Error("Failed to update file with embedding ID");
    }
});
exports.updateFileWithEmbeddingId = updateFileWithEmbeddingId;
// Add this function to delete embeddings by ID
const deleteEmbeddingsById = (userId, embeddingIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create namespace from userId to target specific user's embeddings
        const namespaceId = `user-${userId}`;
        // Get the index and namespace
        const index = pineconeService_1.pinecone.index("chat-app");
        const namespace = index.namespace(namespaceId);
        // Convert to array if it's a single string
        const ids = Array.isArray(embeddingIds) ? embeddingIds : [embeddingIds];
        if (ids.length > 0) {
            // Delete embeddings in batches of 1000 to avoid API limitations
            const batchSize = 1000;
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize);
                try {
                    // Use the same direct array syntax as in storeInPinecone
                    yield namespace.deleteMany(batch);
                    console.log(`Successfully deleted batch of ${batch.length} embeddings`);
                }
                catch (batchError) {
                    console.error(`Error deleting batch ${i / batchSize + 1}:`, batchError);
                    // Continue with next batch even if this one failed
                }
            }
            console.log(`Attempted to delete ${ids.length} embeddings from Pinecone for user ${userId}`);
        }
        else {
            console.log(`No embedding IDs provided for deletion for user ${userId}`);
        }
    }
    catch (error) {
        console.error("Error in deleteEmbeddingsById:", error);
        throw new Error("Failed to delete embeddings from vector database");
    }
});
exports.deleteEmbeddingsById = deleteEmbeddingsById;
