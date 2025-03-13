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
  forceRegenerate?: boolean; // Add this parameter to support regeneration
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
    chatId,
    forceRegenerate = false // Default to false if not provided
  } = params;

  try {
    // Find the chat to get model information
    const chat = await Chat.findOne({ chatId });

    if (!chat) {
      throw new Error("Chat not found");
    } 

    // Skip checking for existing quiz when forceRegenerate is true
    console.log(`Quiz generation with forceRegenerate=${forceRegenerate}`);

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
    
    // Add robust JSON parsing with error handling
    let generatedQuestions: QuizQuestion[];
    try {
      // First attempt to parse directly
      generatedQuestions = await parser.parse(responseText) as QuizQuestion[];
    } catch (parseError) {
      console.warn("Initial JSON parsing failed, attempting cleanup:", parseError);
      
      // Try to extract JSON from markdown or clean up the response
      let cleanedJson = responseText;
      
      // Extract JSON if wrapped in code blocks
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedJson = jsonMatch[1].trim();
      }
      
      // Remove any trailing commas in arrays/objects
      cleanedJson = cleanedJson.replace(/,(\s*[\]}])/g, '$1');
      
      // Try to find JSON array in the text
      if (!cleanedJson.trim().startsWith('[')) {
        const arrayStart = cleanedJson.indexOf('[');
        const arrayEnd = cleanedJson.lastIndexOf(']');
        if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
          cleanedJson = cleanedJson.substring(arrayStart, arrayEnd + 1);
        }
      }
      
      try {
        // Parse the cleaned JSON
        generatedQuestions = JSON.parse(cleanedJson) as QuizQuestion[];
      } catch (secondError) {
        console.error("Failed to parse JSON even after cleanup:", secondError);
        throw new Error("Failed to parse the generated quiz questions. The AI response was not valid JSON.");
      }
    }
    
    // Validate the structure of generated questions
    if (!Array.isArray(generatedQuestions)) {
      throw new Error("Invalid quiz questions format: Expected an array");
    }
    
    // Ensure each question has the required fields
    generatedQuestions = generatedQuestions.map((q, index) => ({
      id: q.id || index + 1,
      type: q.type || "mcq",
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ""
    })).filter(q => q.question && q.options.length > 0);

    if (generatedQuestions.length === 0) {
      throw new Error("No valid questions were generated");
    }

    // Store the quiz in the chat document
    await Chat.findOneAndUpdate(
      { chatId },
      {
        $push: {
          messages: {
            $each: [
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
          }
        },
        $set: {
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
      },
      { new: true }
    );

    return generatedQuestions;
  } catch (error) {
    console.error("Error in quiz generation:", error);
    throw error;
  }
};
