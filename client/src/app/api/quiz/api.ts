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

export interface SavedQuizDetails {
  fileName: string;
  fileUrl: string;
  quizTitle: string;
  savedAt?: string;
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

// Function to save quiz to My Documents
export const saveQuizToDocuments = async (
  file: File,
  chatId: string,
  quizDetails: {
    quizTitle: string;
    isSubmitted: boolean;
    score?: number;
    totalQuestions?: number;
  },
  token: string
): Promise<SavedQuizDetails> => {
  const formData = new FormData();
  
  formData.append("file", file);
  formData.append("chatId", chatId);
  formData.append("quizTitle", quizDetails.quizTitle);
  formData.append("isSubmitted", quizDetails.isSubmitted.toString());
  
  if (quizDetails.isSubmitted && quizDetails.score !== undefined) {
    formData.append("score", quizDetails.score.toString());
  }
  
  if (quizDetails.totalQuestions !== undefined) {
    formData.append("totalQuestions", quizDetails.totalQuestions.toString());
  }

  const response = await fetch(`${API_URL}/api/quiz/save-to-documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "An unexpected error occurred",
    }));
    throw new Error(errorData.error || `Error: ${response.status}`);
  }

  const data = await response.json();
  return data.savedQuiz;
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