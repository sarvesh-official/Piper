import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { 
  ChatPromptTemplate, 
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} from "@langchain/core/prompts";
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
}

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

export const generateQuizQuestions = async (params: GenerateQuizParams): Promise<QuizQuestion[]> => {
  const { extractedTexts, questionCount, difficulty, questionTypes, customPrompt, chatId } = params;
  
  try {
    // Find the chat to get model information
    const chat = await Chat.findOne({ chatId });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Combine all text content
    const combinedText = extractedTexts.join('\n\n');
    
    // Determine which question types to include
    let typeInstruction = '';
    if (questionTypes.mcq && questionTypes.trueFalse) {
      typeInstruction = 'Create a mix of multiple-choice and true/false questions.';
    } else if (questionTypes.mcq) {
      typeInstruction = 'Create only multiple-choice questions with 4 options each.';
    } else if (questionTypes.trueFalse) {
      typeInstruction = 'Create only true/false questions.';
    } else {
      // Default to MCQ if nothing specified
      typeInstruction = 'Create multiple-choice questions with 4 options each.';
    }

    // Create the system prompt with escaped JSON schema
    const systemPrompt = `
    You are a quiz generator. Based on the provided content, create ${questionCount} ${difficulty} level quiz questions.
    ${typeInstruction}
    
    For each question:
    1. Provide a clear question
    2. For MCQ, provide 4 options with one correct answer
    3. For true/false, provide "True" and "False" as options
    4. Indicate the correct answer (use 0-based index for MCQs, and 0 for True, 1 for False)
    5. Add a brief explanation of why the answer is correct
    
    Format your response as a valid JSON array of questions with this structure:
    [
      {
        "id": 1,
        "type": "mcq",
        "question": "Example question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 2,
        "explanation": "Option C is correct because..."
      }
    ]
    
    ${customPrompt ? `ADDITIONAL INSTRUCTIONS: ${customPrompt}` : ''}
    `;

    // Initialize the model
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      maxOutputTokens: 4096,
    });

    // Create a prompt template with separate system and human messages
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate("CONTENT TO GENERATE QUESTIONS FROM:\n{content}")
    ]);

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);
    
    // Ensure the `content` variable is passed correctly
    const response = await chain.invoke({
      content: combinedText // This must match the variable name in the template
    });

    let generatedQuestions: QuizQuestion[] = [];

    try {
      // Extract JSON from the response
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('Invalid JSON response format');
      }
      
      const jsonStr = response.substring(jsonStart, jsonEnd);
      const parsedQuestions = JSON.parse(jsonStr) as QuizQuestion[];
      
      // Validate the structure of each question
      const validatedQuestions = parsedQuestions
        .filter(q => 
          q.id && 
          (q.type === 'mcq' || q.type === 'true_false') &&
          q.question &&
          Array.isArray(q.options) &&
          q.options.length > 0 &&
          (typeof q.correctAnswer === 'number' || typeof q.correctAnswer === 'string')
        )
        .slice(0, questionCount);
      
      if (validatedQuestions.length === 0) {
        throw new Error('No valid questions were generated');
      }
      
      generatedQuestions = validatedQuestions;
    } catch (parseError) {
      console.error('Error parsing quiz response:', parseError);
      throw new Error('Failed to parse quiz questions');
    }

    // Store the quiz in the chat document
    await Chat.findOneAndUpdate(
      { chatId },
      {
        $push: {
          messages: [
            { role: "user", content: `Generate ${questionCount} ${difficulty} quiz questions`, timestamp: new Date() },
            { role: "assistant", content: "Quiz generated successfully", timestamp: new Date() }
          ]
        },
        $set: {
          // Store the quiz in a new field
          quiz: {
            questions: generatedQuestions,
            generatedAt: new Date(),
            settings: {
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
    console.error('Error in quiz generation:', error);
    throw error;
  }
};