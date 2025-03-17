const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'true/false' | 'true_false';
  question: string;
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
  _id?: string; // MongoDB adds this field
}

export interface QuizSettings {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  questionTypes: {
    mcq: boolean;
    trueFalse: boolean;
  };
  customPrompt?: string;
}

export interface SavedQuiz {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  quizTitle: string;
  savedAt: string; // ISO date string
  isSubmitted: boolean;
  score?: number;
  totalQuestions?: number;
  _id?: string; // MongoDB adds this field
}

export interface QuizData {
  questions: QuizQuestion[];
  generatedAt: string; // ISO date string
  settings: QuizSettings;
  savedQuizzes: SavedQuiz[];
  _id?: string; // MongoDB adds this field
}

export interface FileInfo {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  extractedText?: string;
  embeddingId?: string | string[];
  _id?: string; // MongoDB adds this field
}

export interface ChatSummary {
  id: string;
  topic: string;
  chat: string;
  quiz: number; // quiz progress percentage
  quizData?: QuizData; // quiz data object from backend
  files: FileInfo[];
  createdAt: string; // ISO date string
}

export interface CourseSummary {
  _id: string;
  title: string;
  description?: string;
  progress: number;
  status: string[];
}

// Get chat summaries for dashboard
export const fetchDashboardChatSummaries = async (token: string): Promise<ChatSummary[]> => {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/chats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to load chat summaries');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard chat summaries:', error);
    throw new Error('Failed to load chat summaries');
  }
};

// Get course summaries for dashboard
export const fetchDashboardCourseSummaries = async (token: string): Promise<CourseSummary[]> => {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to load course summaries');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard course summaries:', error);
    throw new Error('Failed to load course summaries');
  }
};
