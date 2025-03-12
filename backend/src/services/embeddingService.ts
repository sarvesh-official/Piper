import { GoogleGenerativeAI } from "@google/generative-ai";
import { pineconeIndex } from "./pineconeService";
import dotenv from "dotenv";
import Chat from "../model/chatModel";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "embedding-001" });


export const generateEmbeddings = async (text: string): Promise<number[]> => {
  try {
    if (!text.trim()) {
      throw new Error("Text is empty. Cannot generate embeddings.");
    }

    const response = await model.embedContent(text);
    if (!response.embedding?.values) {
      throw new Error("Invalid embedding response.");
    }

    return response.embedding.values;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
};


export const storeInPinecone = async ({
    id,
    values,
    metadata
  }: {
    id: string;
    values: number[];
    metadata: { 
      userId: string; 
      chatId: string; 
      fileName: string;
      extractedText: string; 
    };
  }): Promise<string> => {
    try {
      const { chatId, fileName, userId, extractedText } = metadata;
      
      const enhancedMetadata = {
        ...metadata,
        timestamp: new Date().toISOString()
      };
      
     
      const existingFilesQuery = await pineconeIndex.query({
        vector: values, // Using the current vector 
        filter: { chatId },
        topK: 10 
      });
      
      const filesForThisChat = existingFilesQuery.matches.filter(
        match => match.metadata && match.metadata.chatId === chatId
      );
      
      const existingFile = filesForThisChat.find(
        match => match.metadata && match.metadata.fileName === fileName
      );
      
      // If file with same name exists, update it
      if (existingFile) {
        await pineconeIndex.upsert([{ id: existingFile.id, values, metadata: enhancedMetadata }]);
        console.log(`Updated embeddings for ${fileName} with extracted text (${extractedText.length} chars)`);
        return existingFile.id;
      }
      
      if (filesForThisChat.length >= 3) {
        throw new Error("Maximum file limit (3) reached for this chat.");
      }
      
      await pineconeIndex.upsert([{ id, values, metadata: enhancedMetadata }]);
      
      console.log(`Stored embeddings for ${fileName} with extracted text (${extractedText.length} chars)`);
      return id;
    } catch (error) {
      console.error("Error storing embeddings in Pinecone:", error);
      throw new Error("Failed to store embeddings");
    }
  };


export const updateFileWithEmbeddingId = async (
  chatId: string,
  fileKey: string,
  embeddingId: string
): Promise<void> => {
  try {
    const result = await Chat.updateOne(
      { chatId, "files.fileKey": fileKey },
      { $set: { "files.$.embeddingId": embeddingId } }
    );

    if (result.modifiedCount === 0) {
      console.warn(`No file found with fileKey ${fileKey} in chat ${chatId}`);
    } else {
      console.log(`Embedding ID updated for file with key: ${fileKey}`);
    }
  } catch (error) {
    console.error("Error updating embeddingId in MongoDB:", error);
    throw new Error("Failed to update embeddingId");
  }
};