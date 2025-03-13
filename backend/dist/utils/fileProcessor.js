"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchExtractedText = exports.extractTextFromExcel = exports.extractTextFromImage = exports.extractTextFromPPTX = exports.extractTextFromCSV = void 0;
const mammoth_1 = __importDefault(require("mammoth"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const XLSX = __importStar(require("xlsx"));
const chatModel_1 = __importDefault(require("../model/chatModel"));
// Function to extract text from CSV
const extractTextFromCSV = (fileBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    return fileBuffer.toString("utf-8"); // Simple conversion to text
});
exports.extractTextFromCSV = extractTextFromCSV;
// Function to extract text from PPTX
const extractTextFromPPTX = (fileBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pptData = yield mammoth_1.default.extractRawText({ buffer: fileBuffer });
        return pptData.value;
    }
    catch (error) {
        console.error("Error extracting text from PPTX:", error);
        return "";
    }
});
exports.extractTextFromPPTX = extractTextFromPPTX;
const extractTextFromImage = (fileBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: { text } } = yield tesseract_js_1.default.recognize(fileBuffer, "eng");
        return text;
    }
    catch (error) {
        console.error("Error extracting text from image:", error);
        return "";
    }
});
exports.extractTextFromImage = extractTextFromImage;
const extractTextFromExcel = (fileBuffer) => {
    try {
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        let extractedText = "";
        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const text = XLSX.utils.sheet_to_csv(sheet);
            extractedText += text + "\n";
        });
        return extractedText.trim();
    }
    catch (error) {
        console.error("Error extracting text from Excel:", error);
        return "";
    }
};
exports.extractTextFromExcel = extractTextFromExcel;
const fetchExtractedText = (userId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chatModel_1.default.findOne({ userId, chatId });
    if (!chat) {
        throw new Error("Chat not found.");
    }
    // Combine extracted text from all uploaded files
    const extractedText = chat.files
        .map((file) => file.extractedText)
        .filter((text) => text) // Ensure only available text is included
        .join("\n");
    return extractedText;
});
exports.fetchExtractedText = fetchExtractedText;
