import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import Chat from "../model/chatModel";

dotenv.config();

// Initialize Pinecone client
export const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

/**
 * Access the Pinecone index by name.
 * Ensure the index name matches the one created in Pinecone's dashboard.
 */
export const pineconeIndex = pinecone.index("chat-app");

/**
 * Delete embeddings from Pinecone for a specific user and set of file keys.
 * @param userId - The ID of the user whose embeddings should be deleted.
 * @param chatId - The ID of the chat containing the files.
 * @param fileKeys - The file keys associated with the embeddings to delete.
 */
export const deleteEmbeddingsFromPinecone = async (userId: string, chatId: string, fileKeys: string[]): Promise<void> => {
  try {
    // Create namespace from userId to target specific user's embeddings
    const namespaceId = `user-${userId}`;
    const namespace = pineconeIndex.namespace(namespaceId);

    if (fileKeys.length === 0) {
      return;
    }

    // Find the chat to get embedding IDs
    const chat = await Chat.findOne({ chatId, userId });
    if (!chat) {
      console.log(`No chat found with ID ${chatId} for user ${userId}`);
      return;
    }

    // Collect all embedding IDs to delete
    const embeddingIds: string[] = [];
    
    // Filter files by the provided fileKeys and extract their embedding IDs
    for (const file of chat.files) {
      // Fix: Check if fileKey exists and is a string before using includes
      if (file.fileKey && typeof file.fileKey === 'string' && fileKeys.includes(file.fileKey)) {
        if (file.embeddingId) {
          if (Array.isArray(file.embeddingId)) {
            // Add all chunk IDs
            embeddingIds.push(...file.embeddingId);
          } else {
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
        await namespace.deleteMany(batch);
      }
      
      console.log(`Successfully deleted ${embeddingIds.length} embeddings from Pinecone`);
    } else {
      console.log('No embedding IDs found to delete');
    }
  } catch (error) {
    console.error("Error deleting embeddings from Pinecone:", error);
    throw error;
  }
};