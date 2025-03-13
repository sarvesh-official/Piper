import { API_URL } from "../file-upload/api";

// Quiz question type definition
export type QuizQuestion = {
  id: number;
  type: "mcq" | "true_false" | "trueFalse";
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
}

// Define the quiz response structure
export interface QuizApiResponse {
  quiz: {
    title: string;
    questions: QuizQuestion[];
  };
  isExisting: boolean;
  generatedAt: string;
}

// API request type
export interface GenerateQuizRequest {
  fileKeys: string[];
  questionCount: number; // This will now have values from 5-20
  difficulty: "beginner" | "intermediate" | "advanced";
  questionTypes: {
    mcq: boolean;
    trueFalse: boolean;
  };
  customPrompt?: string;
  forceRegenerate?: boolean;
}

// Function to call backend API to generate quiz
export const generateQuizFromApi = async (payload: GenerateQuizRequest, token: string, chatId: string): Promise<QuizApiResponse> => {
  try {
    // Ensure question count is within valid range (5-20)
    const validatedQuestionCount = Math.min(Math.max(payload.questionCount, 5), 20);
    
    const response = await fetch(`${API_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payload,
        questionCount: validatedQuestionCount, // Use the validated count
        chatId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate quiz');
    }
    
    const data = await response.json();
    return data as QuizApiResponse;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

// Function to get an existing quiz for a chat
export const getExistingQuizFromApi = async (chatId: string, token: string): Promise<QuizApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/quiz/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch quiz');
    }

    const data = await response.json();
    return data as QuizApiResponse;
  } catch (error) {
    console.error('Error fetching existing quiz:', error);
    throw error;
  }
};