import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import Chat from "../model/chatModel";
import dotenv from "dotenv";

dotenv.config();

export type QuizQuestion = {
  id: number;
  type: "mcq" | "true_false";
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
};

interface GenerateQuizParams {
  extractedTexts: string[];
  questionCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionTypes: {
    mcq: boolean;
    trueFalse: boolean;
  };
  customPrompt?: string;
  chatId: string;
}

export const generateQuizQuestions = async (
  params: GenerateQuizParams
): Promise<QuizQuestion[]> => {
  const {
    extractedTexts,
    questionCount,
    difficulty,
    questionTypes,
    customPrompt,
    chatId
  } = params;

  try {
    // Find the chat to get model information
    const chat = await Chat.findOne({ chatId });

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
    } else if (questionTypes.mcq) {
      typeInstruction =
        "Create only multiple-choice questions with 4 options each.";
    } else if (questionTypes.trueFalse) {
      typeInstruction = "Create only true/false questions.";
    } else {
      // Default to MCQ if nothing specified
      typeInstruction = "Create multiple-choice questions with 4 options each.";
    }

    // Create the prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
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
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      maxOutputTokens: 4096
    });

    // Create an output parser for JSON structure
    const parser = new JsonOutputParser();

    // Generate the quiz questions
    const prompt = await promptTemplate.format({ content: combinedText });
    const response = await model.invoke(prompt);

    // Extract the text content from the response
    const responseText = response.content.toString();
    console.log("Quiz generation response:", responseText);
    // Parse the JSON response
    const generatedQuestions = (await parser.parse(
      responseText
    )) as QuizQuestion[];

    // Store the quiz in the chat document
    await Chat.findOneAndUpdate(
      { chatId },
      {
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
      }
    );

    return generatedQuestions;
  } catch (error) {
    console.error("Error in quiz generation:", error);
    throw error;
  }
};
