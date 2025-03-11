import { Request, Response } from "express";
import { uploadFileToS3 } from "../services/s3Service";
import Chat from "../model/chatModel";
import PdfParse from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";

export const uploadFilesAndExtractText = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.body;
    const files = req.files as Express.Multer.File[];
    const chatName =
      files
        .map((f) => f.originalname)
        .join(", ")
        .substring(0, 50) || "New Chat";

    if (!userId || !files || files.length === 0 || files.length > 3) {
      res
        .status(400)
        .json({ error: "Invalid request. Upload 1 to 3 files only." });
      return;
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        // Extract text for embeddings (not sent to frontend)
        const extractedText = await extractTextFromFile(
          file.buffer,
          file.mimetype
        );

        // Upload file to S3
        const { fileKey, fileUrl } = await uploadFileToS3(userId, file);

        return { fileName: file.originalname, fileUrl, fileKey, extractedText };
      })
    );

    // Create a new chat entry in the database
    const chat = new Chat({
      chatName,
      userId,
      files: processedFiles.map(({ fileName, fileUrl, fileKey }) => ({
        fileName,
        fileUrl,
        fileKey
      })),
      extractedTexts: processedFiles.map(({ extractedText }) => extractedText),
      createdAt: new Date()
    });

    await chat.save();

    res.json({
      chatId: chat.chatId,
      uploaded: processedFiles.map(({ fileName, fileUrl, fileKey }) => ({
        fileName,
        fileUrl,
        fileKey
      })),
      extractedTexts: processedFiles.map(({ extractedText }) => extractedText)
    });
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ error: "Failed to upload files and create chat" });
  }
};

// Function to extract text based on file type
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
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
      mimeType === "application/vnd.ms-excel" // .xls
    ) {
      return extractTextFromExcel(fileBuffer);
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
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

// Function to extract text from CSV
const extractTextFromCSV = async (fileBuffer: Buffer): Promise<string> => {
  return fileBuffer.toString("utf-8"); // Simple conversion to text
};

// Function to extract text from PPTX
const extractTextFromPPTX = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const pptData = await mammoth.extractRawText({ buffer: fileBuffer });
    return pptData.value;
  } catch (error) {
    console.error("Error extracting text from PPTX:", error);
    return "";
  }
};

const extractTextFromImage = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const {
      data: { text }
    } = await Tesseract.recognize(fileBuffer, "eng");
    return text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    return "";
  }
};

const extractTextFromExcel = (fileBuffer: Buffer): string => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    let extractedText = "";
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const text = XLSX.utils.sheet_to_csv(sheet);
      extractedText += text + "\n";
    });
    return extractedText.trim();
  } catch (error) {
    console.error("Error extracting text from Excel:", error);
    return "";
  }
};
