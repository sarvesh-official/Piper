import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../model/chatModel";
import { pinecone } from "./pineconeService";
import { chunkText } from "../utils/textChunker";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const embeddingModel = "embedding-001";

export const generateEmbeddings = async (text: string): Promise<number[][]> => {
  try {
    // Check if text needs chunking
    const textChunks = chunkText(text);
    
    // Generate embeddings for each chunk
    const embeddingsArray = await Promise.all(
      textChunks.map(async (chunk: string) => {
        const model = genAI.getGenerativeModel({ model: embeddingModel });
        const result = await model.embedContent(chunk);
        return result.embedding.values;
      })
    );
    
    return embeddingsArray;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
};

// Interface for storing vector data
interface VectorData {
  id: string;
  values: number[];  // This expects a single array of numbers
  metadata: {
    userId: string;
    chatId: string;
    fileName: string;
    extractedText?: string;
    chunkIndex?: number;
    totalChunks?: number;
  };
}

export const storeInPinecone = async (data: VectorData): Promise<void> => {
  try {
    // Check if metadata size is within limits (40KB)
    let metadata = { ...data.metadata };
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
    const index = pinecone.index("chat-app");
    const namespace = index.namespace(namespaceId);
    
    // Use the upsert method with the proper format for Pinecone v3
    await namespace.upsert([{
      id: data.id,
      values: data.values,  // This needs to be a single array of numbers
      metadata
    }]);
  } catch (error) {
    console.error("Error storing in Pinecone:", error);
    throw new Error("Failed to store in vector database");
  }
};

// Function to store chunked embeddings in Pinecone
export const storeChunkedEmbeddings = async (
  baseId: string,
  embeddings: number[][],  // Array of embedding arrays
  metadata: {
    userId: string;
    chatId: string;
    fileName: string;
    extractedText: string;
  }
): Promise<string[]> => {
  const embeddingIds: string[] = [];
  // We need to re-chunk the text to ensure it matches the embeddings
  const textChunks = chunkText(metadata.extractedText);
  
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
    
    await storeInPinecone({
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
};

export const updateFileWithEmbeddingId = async (
  chatId: string,
  fileKey: string,
  embeddingId: string | string[]
) => {
  try {
    const result = await Chat.updateOne(
      { chatId, "files.fileKey": fileKey },
      { $set: { "files.$.embeddingId": embeddingId } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error(`No file found with key ${fileKey} in chat ${chatId}`);
    }
    
    return result;
  } catch (error) {
    console.error("Error updating file with embedding ID:", error);
    throw new Error("Failed to update file with embedding ID");
  }
};

// Add this function to delete embeddings by ID
export const deleteEmbeddingsById = async (
  userId: string,
  embeddingIds: string | string[]
): Promise<void> => {
  try {
    // Create namespace from userId to target specific user's embeddings
    const namespaceId = `user-${userId}`;
    
    // Get the index and namespace
    const index = pinecone.index("chat-app");
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
          await namespace.deleteMany(batch);
          console.log(`Successfully deleted batch of ${batch.length} embeddings`);
        } catch (batchError) {
          console.error(`Error deleting batch ${i/batchSize + 1}:`, batchError);
          // Continue with next batch even if this one failed
        }
      }
      
      console.log(`Attempted to delete ${ids.length} embeddings from Pinecone for user ${userId}`);
    } else {
      console.log(`No embedding IDs provided for deletion for user ${userId}`);
    }
  } catch (error) {
    console.error("Error in deleteEmbeddingsById:", error);
    throw new Error("Failed to delete embeddings from vector database");
  }
};  