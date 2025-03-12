// import { pineconeIndex } from "../services/pineconeService";
// import Chat from "../model/chatModel";

// // Define type for Pinecone metadata
// type PineconeMetadata = {
//   userId?: string;
//   chatId?: string;
//   fileName?: string;
//   extractedText?: string;
//   timestamp?: string;
//   [key: string]: any;
// };

// /**
//  * Verify if a file's embeddings include extracted text in Pinecone
//  * @param chatId Chat ID
//  * @param fileName File name to check
//  * @returns Result object with verification status
//  */
// export async function verifyFileEmbeddings(chatId: string, fileName: string): Promise<{
//   success: boolean;
//   hasMongoText: boolean;
//   hasPineconeText: boolean;
//   message: string;
// }> {
//   try {
//     // First find the file in MongoDB
//     const chat = await Chat.findOne({ chatId });
//     if (!chat) {
//       console.log(`Chat ${chatId} not found`);
//       return { success: false, hasMongoText: false, hasPineconeText: false, message: "Chat not found" };
//     }

//     const file = chat.files.find(f => f.fileName === fileName);
//     if (!file) {
//       console.log(`File ${fileName} not found in chat ${chatId}`);
//       return { success: false, hasMongoText: false, hasPineconeText: false, message: "File not found" };
//     }

//     console.log(`MongoDB file data:`);
//     console.log(`- fileName: ${file.fileName}`);
//     console.log(`- fileKey: ${file.fileKey || 'N/A'}`);
//     console.log(`- embeddingId: ${file.embeddingId || 'N/A'}`);
    
//     const hasMongoText = !!file.extractedText;
//     console.log(`- Has extractedText in MongoDB: ${hasMongoText}`);
    
//     if (hasMongoText) {
//       console.log(`- MongoDB extractedText length: ${file.extractedText!.length} chars`);
//     }
    
//     // Default value for Pinecone text status
//     let hasPineconeText = false;
    
//     // Check Pinecone data
//     if (file.embeddingId) {
//       try {
//         // Use try-catch specifically around the Pinecone operation
//         const pineconeData = await pineconeIndex.fetch([file.embeddingId]);
        
//         if (pineconeData && pineconeData.records && Object.keys(pineconeData.records).length > 0) {
//           const record = pineconeData.records[0];
//           const metadata = record.metadata as PineconeMetadata || {};
          
//           console.log(`Pinecone metadata fields: ${Object.keys(metadata).join(', ')}`);
          
//           hasPineconeText = !!metadata.extractedText;
//           console.log(`- Has extractedText in Pinecone: ${hasPineconeText}`);
          
//           if (hasPineconeText && metadata.extractedText) {
//             console.log(`- Pinecone extractedText length: ${metadata.extractedText.length} chars`);
//           } else {
//             console.log(`WARNING: extractedText missing in Pinecone metadata!`);
//           }
//         } else {
//           console.log(`No data found in Pinecone for embeddingId ${file.embeddingId}`);
//         }
//       } catch (pineconeError) {
//         console.error(`Pinecone fetch error: ${pineconeError}`);
//         return { 
//           success: false, 
//           hasMongoText: hasMongoText, 
//           hasPineconeText: false, 
//           message: `Error fetching from Pinecone: ${pineconeError instanceof Error ? pineconeError.message : String(pineconeError)}`
//         };
//       }
//     } else {
//       console.log(`No embeddingId available for this file`);
//     }
    
//     return { 
//       success: true, 
//       hasMongoText, 
//       hasPineconeText, 
//       message: hasPineconeText ? "Verification complete - text found in both systems" : "Text missing in Pinecone"
//     };
//   } catch (error) {
//     console.error("Error verifying embeddings:", error);
//     return { 
//       success: false, 
//       hasMongoText: false, 
//       hasPineconeText: false, 
//       message: `Error verifying embeddings: ${error instanceof Error ? error.message : String(error)}`
//     };
//   }
// }

// /**
//  * Fix missing extracted text in Pinecone by copying from MongoDB
//  * @param chatId Chat ID
//  * @param fileName File name to fix
//  * @returns Result object indicating success or failure
//  */
// export async function fixMissingEmbeddingText(chatId: string, fileName: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   try {
//     // Get file data from MongoDB
//     const chat = await Chat.findOne({ chatId });
//     if (!chat) {
//       console.log(`Chat ${chatId} not found`);
//       return { success: false, message: "Chat not found" };
//     }

//     const file = chat.files.find(f => f.fileName === fileName);
//     if (!file) {
//       console.log(`File ${fileName} not found in chat ${chatId}`);
//       return { success: false, message: "File not found" };
//     }
    
//     if (!file.extractedText) {
//       console.log(`File ${fileName} has no extractedText in MongoDB`);
//       return { success: false, message: "No extracted text available in MongoDB" };
//     }

//     if (!file.embeddingId) {
//       console.log(`No embeddingId for file ${fileName}`);
//       return { success: false, message: "No embedding ID found" };
//     }

//     // First get the existing vector from Pinecone
//     try {
//       const pineconeData = await pineconeIndex.fetch([file.embeddingId]);
      
//       if (!pineconeData || !pineconeData.records || Object.keys(pineconeData.records).length === 0) {
//         console.log(`No vector found in Pinecone for ${file.embeddingId}`);
//         return { success: false, message: "No vector found in Pinecone" };
//       }

//       // Get the existing vector values and metadata
//       const existingRecord = pineconeData.records[0];
//       const updatedMetadata = {
//         ...existingRecord.metadata,
//         extractedText: file.extractedText,
//         lastUpdated: new Date().toISOString()
//       };

//       // Update the vector with the extracted text
//       await pineconeIndex.upsert([{
//         id: file.embeddingId,
//         values: existingRecord.values,
//         metadata: updatedMetadata
//       }]);

//       console.log(`Successfully updated Pinecone metadata for ${fileName} with extractedText (${file.extractedText.length} chars)`);
//       return { success: true, message: "Successfully updated Pinecone with extracted text" };
//     } catch (pineconeError) {
//       console.error(`Pinecone operation error: ${pineconeError}`);
//       return { 
//         success: false, 
//         message: `Error with Pinecone operations: ${pineconeError instanceof Error ? pineconeError.message : String(pineconeError)}`
//       };
//     }
//   } catch (error) {
//     console.error("Error fixing missing text:", error);
//     return { 
//       success: false, 
//       message: `Error fixing embeddings: ${error instanceof Error ? error.message : String(error)}`
//     };
//   }
// }