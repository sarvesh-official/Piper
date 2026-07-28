import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Chat from "../model/chatModel";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

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
    console.error("Error extracting text from Excel:", error);
    return "";
  }
};

//  Function to extract text from PPTX
export const extractTextFromPPTX = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const pptData = await mammoth.extractRawText({ buffer: fileBuffer });
    return pptData.value.trim();
  } catch (error) {
    console.error("Error extracting text from PPTX:", error);
    return "";
  }
};

// Function to extract text from images (JPG, PNG, etc.) using Tesseract.js (local, free)
export const extractTextFromImage = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const worker = await createWorker("eng");
    const { data: { text } } = await worker.recognize(fileBuffer);
    await worker.terminate();
    console.log("Extracted Image Text (Tesseract):", text.trim().substring(0, 100) + "...");
    return text.trim();
  } catch (error) {
    console.error("Error extracting text from image using Tesseract:", error);
    return "";
  }
};

//  Function to extract text from PDFs using pdf-parse (local, free)
export const extractTextFromPDF = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(fileBuffer);
    if (!data.text || data.text.trim().length === 0) {
      console.warn("No text found in the PDF (might be a scanned document).");
      return "";
    }
    console.log("Extracted PDF Text (pdf-parse):", data.text.trim().substring(0, 100) + "...");
    return data.text.trim();
  } catch (error) {
    console.error("Error extracting text from PDF using pdf-parse:", error);
    return "";
  }
};

//  Function to fetch extracted text from chat history
export const fetchExtractedText = async (userId: string, chatId: string) => {
  const chat = await Chat.findOne({ userId, chatId });

  if (!chat) {
    throw new Error("Chat not found.");
  }

  // Combine extracted text from all uploaded files
  const extractedText = chat.files
    .map((file) => file.extractedText)
    .filter((text) => text)
    .join("\n");

  return extractedText;
};
