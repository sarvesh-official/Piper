import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

/**
 * Access the Pinecone index by name.
 * Ensure the index name matches the one created in Pinecone's dashboard.
 */
export const pineconeIndex = pinecone.index("chat-app");

/**
 * Delete embeddings from Pinecone for a specific user and set of file keys.
 * @param userId - The ID of the user whose embeddings should be deleted.
 * @param fileKeys - The file keys associated with the embeddings to delete.
 */
export const deleteEmbeddingsFromPinecone = async (userId: string, fileKeys: string[]): Promise<void> => {
  try {
    // Create namespace from userId to target specific user's embeddings
    const namespace = `user-${userId}`;

    // Generate IDs based on the file keys
    // This assumes your embeddings are stored with IDs that can be derived from file keys
    const ids = fileKeys.map(fileKey => {
      // This pattern will need to match how you originally stored the embeddings
      return `${fileKey}-embedding`;
    });

    if (ids.length > 0) {
      // Use the `delete` method to remove embeddings
      await pineconeIndex.deleteMany({
        ids,
        namespace,
      });

      console.log(`Successfully deleted ${ids.length} embeddings from Pinecone`);
    }
  } catch (error) {
    console.error("Error deleting embeddings from Pinecone:", error);
    throw error;
  }
};