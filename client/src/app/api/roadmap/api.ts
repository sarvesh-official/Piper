// Types
export type LessonType = 'lesson' | 'code' | 'quiz';

export interface RoadmapLesson {
  type: LessonType;
  title: string;
  duration: string;
  description?: string;
}

export interface RoadmapModule {
  id: number;
  title: string;
  lessons: RoadmapLesson[];
}

export interface Roadmap {
  _id: string;
  userId: string;
  title: string;
  complexity: number;
  duration: number;
  interactivity: number;
  includeQuizzes: boolean;
  includeInteractive: boolean;
  includeCode: boolean;
  modules: RoadmapModule[];
  createdAt: string;
  updatedAt: string;
  courseId?: string; // Reference to a course if one has been created from this roadmap
}

export interface GenerateRoadmapParams {
  title: string;
  complexity: number;
  duration: number;
  includeQuizzes: boolean;
  includeCode: boolean;
}

// API client functions
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Generate a roadmap
export async function generateRoadmap(params: GenerateRoadmapParams, token: string): Promise<Roadmap> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/roadmaps/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to generate roadmap');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in generateRoadmap:', error);
    throw error;
  }
}

// Regenerate a roadmap
export async function regenerateRoadmap(roadmapId: string, params: GenerateRoadmapParams, token: string): Promise<Roadmap> {
  const response = await fetch(`${API_BASE_URL}/api/roadmaps/${roadmapId}/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to regenerate roadmap');
  }

  return response.json();
}

// Get a roadmap by ID
export async function getRoadmap(roadmapId: string, token: string): Promise<Roadmap> {
  const response = await fetch(`${API_BASE_URL}/api/roadmaps/${roadmapId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch roadmap');
  }

  return response.json();
}

// Get all roadmaps for a user
export async function getUserRoadmaps(token: string): Promise<Roadmap[]> {
  const response = await fetch(`${API_BASE_URL}/api/roadmaps`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch user roadmaps');
  }

  return response.json();
}

// Create a detailed course from a roadmap
export async function createCourseFromRoadmap(roadmapId: string, token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ roadmapId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create course from roadmap');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in createCourseFromRoadmap:', error);
    throw error;
  }
}

// Also provide a default export
const roadmapApi = {
  generateRoadmap,
  regenerateRoadmap,
  getRoadmap,
  getUserRoadmaps,
  createCourseFromRoadmap,
};

export default roadmapApi;
