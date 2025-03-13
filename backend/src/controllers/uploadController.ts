import { Request, Response, NextFunction } from "express";
import { uploadFileToS3 } from "../services/s3Service";
import Chat from "../model/chatModel";
import { generateEmbeddings, storeChunkedEmbeddings, updateFileWithEmbeddingId } from "../services/embeddingService";
import { extractTextFromCSV, extractTextFromExcel, extractTextFromImage, extractTextFromPPTX } from "../utils/fileProcessor";
import PdfParse from "pdf-parse";
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

    // Store embeddings and update MongoDB
    await Promise.all(
      processedFiles.map(async ({ extractedText, fileKey, fileName }, index) => {
        if (extractedText) {
          try {
            const textByteSize = Buffer.byteLength(extractedText, 'utf-8');
            console.log(`Processing text for ${fileName}, size: ${textByteSize} bytes`);
            
            // Fix: The issue is here - embeddings is number[][] but we need to pass it to storeChunkedEmbeddings correctly
            const embeddings = await generateEmbeddings(extractedText);
            const baseEmbeddingId = `${chat.chatId}-${fileKey}`;
            
            // Process embeddings and store them, whether single or multiple chunks
            const embeddingIds = await storeChunkedEmbeddings(
              baseEmbeddingId,
              embeddings, // Pass the full array of embeddings (each one is a number[])
              {
                userId,
                chatId: chat.chatId,
                fileName: fileName,
                extractedText: extractedText
              }
            );
            
            // If we have multiple embeddings, store as array, otherwise store as single string
            const idToStore = embeddingIds.length > 1 ? embeddingIds : embeddingIds[0];
            
            // Update MongoDB with embedding ID(s)
            await updateFileWithEmbeddingId(chat.chatId, fileKey, idToStore);
            
            if (embeddingIds.length > 1) {
              console.log(`Chunked embeddings stored for: ${fileKey} (${embeddingIds.length} chunks)`);
            } else {
              console.log(`Embedding stored and updated for: ${fileKey} with ${extractedText.length} chars of text`);
            }
          } catch (embeddingError) {
            console.error("Error generating or storing embeddings:", embeddingError);
          }
        } else {
          console.warn(`No extracted text available for ${fileName}, skipping embedding generation`);
        }
      })
    );

    res.json({
      chatId: chat.chatId,
      uploaded: processedFiles.map(({ fileName, fileUrl }) => ({
        fileName,
        fileUrl,
      })),
      message: "Files uploaded and embeddings stored successfully",
    });
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ error: "Failed to upload files and create chat" });
  }
};

// Extract text based on file type
const extractTextFromFile = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  try {
    if (mimeType === "application/pdf") {
      const pdfData = await PdfParse(fileBuffer);
      return pdfData.text;
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
