"use strict";
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
exports.generateQuizQuestions = void 0;
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const chatModel_1 = __importDefault(require("../model/chatModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateQuizQuestions = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { extractedTexts, questionCount, difficulty, questionTypes, customPrompt, chatId } = params;
    try {
        // Find the chat to get model information
        const chat = yield chatModel_1.default.findOne({ chatId });
        if (!chat) {
            throw new Error("Chat not found");
        }
        if (!Array.isArray(extractedTexts) || extractedTexts.length === 0) {
            throw new Error("Invalid extractedTexts input.");
        }
        // Combine all text content
        const combinedText = extractedTexts.join("\n\n");
        if (!combinedText) {
            throw new Error("No content provided for quiz generation.");
        }
        // Validate and cap question count to ensure it's within reasonable limits
        const validatedQuestionCount = Math.min(Math.max(questionCount || 10, 5), 20);
        console.log(`Generating ${validatedQuestionCount} quiz questions at ${difficulty} level`);
        // Determine which question types to include
        let typeInstruction = "";
        if (questionTypes.mcq && questionTypes.trueFalse) {
            typeInstruction =
                "Create a mix of multiple-choice and true/false questions.";
        }
        else if (questionTypes.mcq) {
            typeInstruction =
                "Create only multiple-choice questions with 4 options each.";
        }
        else if (questionTypes.trueFalse) {
            typeInstruction = "Create only true/false questions.";
        }
        else {
            // Default to MCQ if nothing specified
            typeInstruction = "Create multiple-choice questions with 4 options each.";
        }
        // Create the prompt template
        const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`
    You are a quiz generator. Based on the provided content, create ${validatedQuestionCount} ${difficulty} level quiz questions.
    ${typeInstruction}
    
    For each question:
    1. Provide a clear question
    2. For MCQ, provide 4 options with one correct answer
    3. For true/false, provide "True" and "False" as options
    4. Indicate the correct answer (use 0-based index for MCQs, and 0 for True, 1 for False)
    5. Add a brief explanation of why the answer is correct
    
    Format your response as a valid JSON array of questions with this structure:
    [
      title : "title of the quiz",
      {{
        "id": 1,
        "type": "mcq",
        "question": "Example question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 2,
        "explanation": "Option C is correct because..."
    }}
    ]
    
    ${customPrompt ? `ADDITIONAL INSTRUCTIONS: ${customPrompt}` : ""}
    
    CONTENT TO GENERATE QUESTIONS FROM:
    {content}
    `);
        // Initialize the model
        const model = new google_genai_1.ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-flash",
            maxOutputTokens: 4096
        });
        // Create an output parser for JSON structure
        const parser = new output_parsers_1.JsonOutputParser();
        // Generate the quiz questions
        const prompt = yield promptTemplate.format({ content: combinedText });
        const response = yield model.invoke(prompt);
        // Extract the text content from the response
        const responseText = response.content.toString();
        console.log("Quiz generation response:", responseText);
        // Parse the JSON response
        const generatedQuestions = (yield parser.parse(responseText));
        // Store the quiz in the chat document
        yield chatModel_1.default.findOneAndUpdate({ chatId }, {
            $push: {
                messages: [
                    {
                        role: "user",
                        content: `Generate ${validatedQuestionCount} ${difficulty} quiz questions`,
                        timestamp: new Date()
                    },
                    {
                        role: "assistant",
                        content: "Quiz generated successfully",
                        timestamp: new Date()
                    }
                ]
            },
            $set: {
                // Store the quiz in a new field with settings that include the question count
                quiz: {
                    questions: generatedQuestions,
                    generatedAt: new Date(),
                    settings: {
                        questionCount: validatedQuestionCount,
                        difficulty,
                        questionTypes,
                        customPrompt: customPrompt || null
                    }
                }
            }
        });
        return generatedQuestions;
    }
    catch (error) {
        console.error("Error in quiz generation:", error);
        throw error;
    }
});
exports.generateQuizQuestions = generateQuizQuestions;
