import { Request, Response, NextFunction } from "express";
import { uploadFileToS3 } from "../services/s3Service";
import Chat from "../model/chatModel";
import { generateEmbeddings, storeChunkedEmbeddings, updateFileWithEmbeddingId } from "../services/embeddingService";
import { extractTextFromCSV, extractTextFromExcel, extractTextFromImage, extractTextFromPPTX, extractTextFromPDF } from "../utils/fileProcessor";
import mammoth from "mammoth";
import multer from "multer";

// Add a middleware to handle multer errors
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ 
        error: "File size exceeds the limit of 5 MB" 
      });
      return 
    }
    res.status(400).json({ 
      error: `Upload error: ${err.message}` 
    });
    return 
  } else if (err) {
    // An unknown error occurred
    res.status(500).json({ 
      error: `Unknown error: ${err.message}` 
    });
    return 
  }
  next();
};

export const uploadFilesAndExtractText = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!userId || !files || files.length === 0 || files.length > 3) {
      res
      .status(400)
      .json({ error: "Invalid request. Upload 1 to 3 files only." });
      return 
    }

    const chatName =
      files.map((f) => f.originalname).join(", ").substring(0, 50) || "New Chat";

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const extractedText = await extractTextFromFile(
          file.buffer,
          file.mimetype
        );
        const { fileKey, fileUrl } = await uploadFileToS3(userId, file);

        return { fileName: file.originalname, fileUrl, fileKey, extractedText };
      })
    );

    // Create a new chat entry with extracted text stored in the file objects
    const chat = new Chat({
      chatName,
      userId,
      files: processedFiles.map(({ fileName, fileUrl, fileKey, extractedText }) => ({
        userId,
        fileName,
        fileUrl,
        fileKey,
        extractedText, // Include extracted text directly in the file objects
        fileType: files.find(f => f.originalname === fileName)?.mimetype || 'unknown',
      })),
      createdAt: new Date(),
    });

    await chat.save();
    console.log(`Chat created with ${processedFiles.length} files, each with extracted text`);

    // Array to collect any processing errors
    const processingErrors: string[] = [];
    
    // Store embeddings and update MongoDB
    await Promise.all(
      processedFiles.map(async ({ extractedText, fileKey, fileName }, index) => {
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
              
              const allEmbeddings: number[][] = [];
              
              // Process each chunk and collect embeddings
              for (let i = 0; i < textChunks.length; i++) {
                try {
                  const chunkEmbeddings = await generateEmbeddings(textChunks[i]);
                  allEmbeddings.push(...chunkEmbeddings);
                } catch (chunkError: any) {
                  console.error(`Error processing chunk ${i+1}/${textChunks.length}:`, chunkError.message);
                }
              }
              
              if (allEmbeddings.length === 0) {
                throw new Error("Failed to generate any embeddings from text chunks");
              }
              
              const baseEmbeddingId = `${chat.chatId}-${fileKey}`;
              
              // Store all collected embeddings
              const embeddingIds = await storeChunkedEmbeddings(
                baseEmbeddingId,
                allEmbeddings,
                {
                  userId,
                  chatId: chat.chatId,
                  fileName: fileName,
                  extractedText: extractedText
                }
              );
              
              // Update MongoDB with embedding ID(s)
              const idToStore = embeddingIds.length > 1 ? embeddingIds : embeddingIds[0];
              await updateFileWithEmbeddingId(chat.chatId, fileKey, idToStore);
              
              console.log(`Processed ${allEmbeddings.length} embeddings for ${fileName}`);
            } else {
              // Original code for smaller files
              const embeddings = await generateEmbeddings(extractedText);
              const baseEmbeddingId = `${chat.chatId}-${fileKey}`;
              
              const embeddingIds = await storeChunkedEmbeddings(
                baseEmbeddingId,
                embeddings,
                {
                  userId,
                  chatId: chat.chatId,
                  fileName: fileName,
                  extractedText: extractedText
                }
              );
              
              const idToStore = embeddingIds.length > 1 ? embeddingIds : embeddingIds[0];
              await updateFileWithEmbeddingId(chat.chatId, fileKey, idToStore);
              
              if (embeddingIds.length > 1) {
                console.log(`Chunked embeddings stored for: ${fileKey} (${embeddingIds.length} chunks)`);
              } else {
                console.log(`Embedding stored and updated for: ${fileKey} with ${extractedText.length} chars of text`);
              }
            }
          } catch (embeddingError: any) {
            const errorMessage = `Error processing ${fileName}: ${embeddingError.message}`;
            console.error(errorMessage);
            processingErrors.push(errorMessage);
          }
        } else {
          console.warn(`No extracted text available for ${fileName}, skipping embedding generation`);
          processingErrors.push(`Could not extract text from ${fileName}`);
        }
      })
    );

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
  } catch (error: any) {
    console.error("Error processing files:", error);
    res.status(500).json({ 
      error: "Failed to upload files and create chat", 
      details: error.message 
    });
  }
};

// Extract text based on file type
const extractTextFromFile = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  try {
    if (mimeType === "application/pdf") {
      // Use the enhanced PDF extraction function that can detect handwriting
      return await extractTextFromPDF(fileBuffer);
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      return docxData.value;
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      return extractTextFromExcel(fileBuffer);
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return await extractTextFromPPTX(fileBuffer);
    } else if (mimeType === "text/csv") {
      return await extractTextFromCSV(fileBuffer);
    } else if (mimeType === "text/plain") {
      return fileBuffer.toString("utf-8");
    } else if (mimeType.startsWith("image/")) {
      return await extractTextFromImage(fileBuffer);
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    return "";
  }
};

// Function to chunk text into smaller pieces
function chunkText(text: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  
  // Split by paragraphs or sentences to maintain context
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit, store current chunk and start a new one
    if (Buffer.byteLength(currentChunk + paragraph, 'utf-8') > maxBytes && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
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
        } else {
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
