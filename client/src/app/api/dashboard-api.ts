const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface ChatSummary {
  id: string;
  topic: string;
  chat: string;
  quiz: number;
  files: { fileName: string, fileUrl?: string, fileKey?: string }[];
  createdAt: string;
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
