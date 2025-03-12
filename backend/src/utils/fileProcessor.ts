import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import Chat from "../model/chatModel";

// Function to extract text from CSV
export const extractTextFromCSV = async (fileBuffer: Buffer): Promise<string> => {
  return fileBuffer.toString("utf-8"); // Simple conversion to text
};

// Function to extract text from PPTX
export const extractTextFromPPTX = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const pptData = await mammoth.extractRawText({ buffer: fileBuffer });
    return pptData.value;
  } catch (error) {
    console.error("Error extracting text from PPTX:", error);
    return "";
  }
};

export const extractTextFromImage = async (fileBuffer: Buffer): Promise<string> => {
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




export const fetchExtractedText = async (userId: string, chatId: string) => {
  const chat = await Chat.findOne({ userId, chatId });

  if (!chat) {
    throw new Error("Chat not found.");
  }

  // Combine extracted text from all uploaded files
  const extractedText = chat.files
    .map((file) => file.extractedText)
    .filter((text) => text) // Ensure only available text is included
    .join("\n");

  return extractedText;
};