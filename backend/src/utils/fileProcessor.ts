import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Chat from "../model/chatModel";
import path from "path";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

if (!process.env.GOOGLE_PROJECT_ID) {
  throw new Error("Environment variable GOOGLE_PROJECT_ID is required but not found");
}

if (!process.env.GOOGLE_LOCATION) {
  throw new Error("Environment variable GOOGLE_LOCATION is required but not found");
}

if (!process.env.GOOGLE_PROCESSOR_ID) {
  throw new Error("Environment variable GOOGLE_PROCESSOR_ID is required but not found");
}

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION;
const PROCESSOR_ID = process.env.GOOGLE_PROCESSOR_ID;
const PROCESSOR_NAME = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

// 🔹 Google Document AI Client
const client = new DocumentProcessorServiceClient({
  keyFilename: path.join(__dirname, "../config/service-account.json"),
});

//  Function to extract text from CSV
export const extractTextFromCSV = async (fileBuffer: Buffer): Promise<string> => {
  return fileBuffer.toString("utf-8"); // Simple conversion to text
};

//  Function to extract text from Excel (XLSX)
export const extractTextFromExcel = (fileBuffer: Buffer): string => {
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
    console.error("❌ Error extracting text from Excel:", error);
    return "";
  }
};

//  Function to extract text from PPTX
export const extractTextFromPPTX = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const pptData = await mammoth.extractRawText({ buffer: fileBuffer });
    return pptData.value.trim();
  } catch (error) {
    console.error("❌ Error extracting text from PPTX:", error);
    return "";
  }
};

// Function to extract text from images (JPG, PNG, etc.) using Document AI
export const extractTextFromImage = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const base64File = fileBuffer.toString("base64");
    const request = {
      name: PROCESSOR_NAME,
      rawDocument: {
        content: Buffer.from(base64File, "base64"),
        mimeType: "image/png", 
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document?.text) {
      console.warn("⚠️ No text found in the image.");
      return "";
    }

    console.log("✅ Extracted Image Text (Document AI):", document.text.trim());
    return document.text.trim();
  } catch (error) {
    console.error("❌ Error extracting text from image using Document AI:", error);
    return "";
  }
};

//  Function to extract text from PDFs using Google Document AI
export const extractTextFromPDF = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const base64File = fileBuffer.toString("base64");
    const request = {
      name: PROCESSOR_NAME,
      rawDocument: {
        content: Buffer.from(base64File, "base64"),
        mimeType: "application/pdf",
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document?.text) {
      console.warn("⚠️ No text found in the PDF.");
      return "";
    }

    console.log("✅ Extracted PDF Text (Document AI):", document.text.trim());
    return document.text.trim();
  } catch (error) {
    console.error("❌ Error extracting text from PDF using Document AI:", error);
    return "";
  }
};

//  Function to fetch extracted text from chat history
export const fetchExtractedText = async (userId: string, chatId: string) => {
  const chat = await Chat.findOne({ userId, chatId });

  if (!chat) {
    throw new Error("❌ Chat not found.");
  }

  // Combine extracted text from all uploaded files
  const extractedText = chat.files
    .map((file) => file.extractedText)
    .filter((text) => text)
    .join("\n");

  return extractedText;
};