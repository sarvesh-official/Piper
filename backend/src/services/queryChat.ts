import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { 
  ChatPromptTemplate, 
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder
} from "@langchain/core/prompts";
import { generateEmbeddings } from "./embeddingService";
import { pinecone } from "./pineconeService";
import dotenv from "dotenv";
import { ChatMessage } from "../types/chat";

dotenv.config();

// Type helper for Pinecone metadata
type PineconeMetadata = {
  userId?: string;
  chatId?: string;
  fileName?: string;
  [key: string]: string | number | boolean | string[] | undefined;
};

/**
 * Executes a chat query against files using RAG (Retrieval Augmented Generation)
 * @param userId User ID
 * @param query User's question
 * @param chatId Chat session ID
 * @param files Array of file objects associated with the chat
 * @param history Previous messages in the conversation
 * @returns An object with the AI's response and sources
 */
export const queryChat = async (
  userId: string, 
  query: string, 
  chatId: string,
  files: Array<any>,
  history: ChatMessage[] = []
): Promise<{answer: string, sources: string[]}> => {
  try {
    console.log(`Starting query for user ${userId}, chatId ${chatId} with ${files.length} files and ${history.length} history messages`);
    // Log the files structure to debug
    files.forEach(file => {
      console.log(`Available file: ${file.fileName || 'unnamed'}, has extractedText: ${!!file.extractedText}, fileKey: ${file.fileKey || 'none'}`);
    });
    
    // Step 1: Generate embedding for the query
    // generateEmbeddings returns number[][], but we need the first embedding array
    const queryEmbeddingsResult = await generateEmbeddings(query);
    
    // Ensure we have at least one embedding
    if (!queryEmbeddingsResult || queryEmbeddingsResult.length === 0) {
      throw new Error("Failed to generate embeddings for the query");
    }
    
    // Get the first embedding from the result (it's typically a single chunk for a query)
    const queryEmbedding = queryEmbeddingsResult[0];

    // Step 2: Search in Pinecone with query embedding using namespace
    console.log(`Searching Pinecone for userId: ${userId}`);
    
    // Get the index and namespace
    const index = pinecone.index("chat-app");
    const namespace = index.namespace(`user-${userId}`);
    
    // Query the namespace directly with the single embedding array
    const searchResults = await namespace.query({
      vector: queryEmbedding,
      topK: 3,
      filter: { chatId: chatId },
      includeMetadata: true
    });
    
    console.log(`Found ${searchResults.matches?.length || 0} matches in Pinecone`);

    // Step 3: Extract and format context from search results
    const sources: string[] = [];
    let context = "Based on the following information:\n\n";
    
    if (searchResults.matches && searchResults.matches.length > 0) {
      // For each match, retrieve the file content from the database or storage
      for (const match of searchResults.matches) {
        const metadata = match.metadata as PineconeMetadata;
        
        if (metadata && typeof metadata.fileName === 'string') {
          const fileName = metadata.fileName;
          sources.push(fileName);
          console.log(`Processing match for file: ${fileName}, with metadata:`, JSON.stringify(metadata));
          
          // Enhanced file finding logic with better debugging
          const file = files.find(f => {
            // Try different matching strategies
            const exactMatch = f.fileName === fileName;
            const keyInFileName = typeof f.fileKey === 'string' && f.fileKey.includes(fileName);
            const fileNameInKey = typeof f.fileKey === 'string' && fileName.includes(f.fileKey);
            
            // Log the matching attempts
            if (exactMatch) console.log(`Found exact match for ${fileName}`);
            if (keyInFileName) console.log(`Found match: fileKey (${f.fileKey}) includes fileName (${fileName})`);
            if (fileNameInKey) console.log(`Found match: fileName (${fileName}) includes fileKey (${f.fileKey})`);
            
            return exactMatch || keyInFileName || fileNameInKey;
          });
          
          if (file) {
            if (file.extractedText) {
              console.log(`Found extractedText for ${fileName}, length: ${file.extractedText.length} chars`);
              context += `From ${fileName}:\n${file.extractedText}\n\n`;
            } else {
              console.log(`File found but extractedText missing for: ${fileName}`);
              
              // Try to recover text from other fields if available
              if (file.content) {
                console.log(`Using 'content' field as fallback for ${fileName}`);
                context += `From ${fileName}:\n${file.content}\n\n`;
              } else if (file.text) {
                console.log(`Using 'text' field as fallback for ${fileName}`);
                context += `From ${fileName}:\n${file.text}\n\n`;
              } else {
                console.log(`No text content found in any field for ${fileName}`);
              }
            }
          } else {
            console.log(`No matching file found for ${fileName} in the provided files array`);
          }
        }
      }
    }
    
    // If no relevant context was found
    if (context === "Based on the following information:\n\n") {
      console.log("No relevant context found for the query");
      context += "No relevant information found in the uploaded documents.";
    }

    // Log the final context to understand what's being sent to the LLM
    console.log(`Final context length: ${context.length} characters`);
    
    // Ensure history belongs to this user and chat
    // This is just a safety check - proper filtering should happen when loading history
    if (history.length > 0) {
      console.log(`Using conversation history with ${history.length} previous messages for continuity`);
    }

    // Step 4: Call Gemini with LangChain
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash", // Updated to newer model
      maxOutputTokens: 2048,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are an AI assistant that answers questions based on the provided context. " +
        `Today's date is ${new Date().toLocaleDateString()}. ` +
        "When answering, cite the specific file names where you found the information. " +
        "If the answer cannot be found in the context but is about a general educational topic " +
        "(like explaining a concept, technology, or methodology), you can provide a helpful educational " +
        "response, but clearly indicate that you're sharing general knowledge rather than information " +
        "from the user's documents. " +
        "For questions that require specific information from documents that isn't available, " +
        "politely say that you don't know based on the available information, then suggest where the user might find this information elsewhere. " +
        "Be tolerant of typos and unclear phrasing - try to understand what the user meant even if there are mistakes. " +
        "If you recognize a typo or ambiguous reference, respond to what you believe the user intended to ask. " +
        "Answer like a helpful human would."
      ),
      // Add conversation history for context
      ...(history.length > 0 ? [new MessagesPlaceholder("chat_history")] : []),
      HumanMessagePromptTemplate.fromTemplate(
        `Context: {context}\n\nQuestion: {question}`
      )
    ]);

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);
    
    // Convert history to the format expected by LangChain
    const formattedHistory = history.map(msg => ({
      type: msg.role === 'user' ? 'human' : 'ai',
      content: msg.content
    }));

    const answer = await chain.invoke({
      context: context,
      question: query,
      chat_history: formattedHistory
    });

    return {
      answer,
      sources: [...new Set(sources)] // Remove duplicates
    };
  } catch (error) {
    console.error("Error in queryChat:", error);
    throw new Error("Failed to process your question. Please try again later.");
  }
};