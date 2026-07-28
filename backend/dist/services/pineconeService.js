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
exports.deleteEmbeddingsFromPinecone = exports.pineconeIndex = exports.pinecone = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const dotenv_1 = __importDefault(require("dotenv"));
const chatModel_1 = __importDefault(require("../model/chatModel"));
dotenv_1.default.config();
// Initialize Pinecone client
exports.pinecone = new pinecone_1.Pinecone({ apiKey: process.env.PINECONE_API_KEY });
/**
 * Access the Pinecone index by name.
 * Ensure the index name matches the one created in Pinecone's dashboard.
 */
exports.pineconeIndex = exports.pinecone.index("chat-app");
/**
 * Delete embeddings from Pinecone for a specific user and set of file keys.
 * @param userId - The ID of the user whose embeddings should be deleted.
 * @param chatId - The ID of the chat containing the files.
 * @param fileKeys - The file keys associated with the embeddings to delete.
 */
const deleteEmbeddingsFromPinecone = (userId, chatId, fileKeys) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create namespace from userId to target specific user's embeddings
        const namespaceId = `user-${userId}`;
        const namespace = exports.pineconeIndex.namespace(namespaceId);
        if (fileKeys.length === 0) {
            return;
        }
        // Find the chat to get embedding IDs
        const chat = yield chatModel_1.default.findOne({ chatId, userId });
        if (!chat) {
            console.log(`No chat found with ID ${chatId} for user ${userId}`);
            return;
        }
        // Collect all embedding IDs to delete
        const embeddingIds = [];
        // Filter files by the provided fileKeys and extract their embedding IDs
        for (const file of chat.files) {
            // Fix: Check if fileKey exists and is a string before using includes
            if (file.fileKey && typeof file.fileKey === 'string' && fileKeys.includes(file.fileKey)) {
                if (file.embeddingId) {
                    if (Array.isArray(file.embeddingId)) {
                        // Add all chunk IDs
                        embeddingIds.push(...file.embeddingId);
                    }
                    else {
                        // Add single ID
                        embeddingIds.push(file.embeddingId);
                    }
                }
            }
        }
        if (embeddingIds.length > 0) {
            // Delete embeddings in batches of 1000 to avoid API limitations
            const batchSize = 1000;
            for (let i = 0; i < embeddingIds.length; i += batchSize) {
                const batch = embeddingIds.slice(i, i + batchSize);
                yield namespace.deleteMany(batch);
            }
            console.log(`Successfully deleted ${embeddingIds.length} embeddings from Pinecone`);
        }
        else {
            console.log('No embedding IDs found to delete');
        }
    }
    catch (error) {
        console.error("Error deleting embeddings from Pinecone:", error);
        throw error;
    }
});
exports.deleteEmbeddingsFromPinecone = deleteEmbeddingsFromPinecone;
