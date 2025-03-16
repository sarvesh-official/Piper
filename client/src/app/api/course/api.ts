// Types
export type LessonType = 'lesson' | 'code' | 'quiz';
export type CourseStatus = 'active' | 'bookmarked' | 'completed';

export interface Lesson {
  type: LessonType;
  title: string;
  duration: string;
  content?: string;
  completed?: boolean; // Track lesson completion status
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  userId: string;
  title: string;
  complexity: number;
  duration: number;
  interactivity: number;
  includeQuizzes: boolean;
  includeInteractive: boolean;
  includeCode: boolean;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
  roadmapId?: string;
  status: CourseStatus[];
  progress: number;
  description?: string;
  favorite: boolean; // Add favorite field
}

// API client functions
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Create course from a roadmap
export async function createCourseFromRoadmap(roadmapId: string, token: string): Promise<Course> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ roadmapId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create course');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in createCourseFromRoadmap:', error);
    throw error;
  }
}

// Get a course by ID
export async function getCourse(courseId: string, token: string): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch course');
  }

  return response.json();
}

// Get all courses for a user
export async function getUserCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch user courses');
  }

  return response.json();
}

// Add methods to update lesson completion and course status
export async function updateLessonCompletion(
  courseId: string,
  moduleId: number,
  lessonIndex: number,
  completed: boolean,
  token: string
): Promise<Course> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses/${courseId}/lesson-completion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ moduleId, lessonIndex, completed })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update lesson completion');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in updateLessonCompletion:', error);
    throw error;
  }
}

export async function updateCourseStatus(
  courseId: string, 
  status: CourseStatus, 
  add: boolean,
  token: string
): Promise<Course> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses/${courseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status, add })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update course status');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in updateCourseStatus:', error);
    throw error;
  }
}

// New function to toggle course favorite status
export async function toggleCourseFavorite(courseId: string, token: string): Promise<Course> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses/${courseId}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to toggle course favorite status');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in toggleCourseFavorite:', error);
    throw error;
  }
}

// Get filtered courses
export async function getFilteredCourses(filter: string = '', token: string): Promise<Course[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses?filter=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to fetch filtered courses');
    }

    return response.json();
  } catch (error: any) {
    console.error('API error in getFilteredCourses:', error);
    throw error;
  }
}

// Export as an object - verify no generateCourse function is exported
const courseApi = {
  createCourseFromRoadmap,
  getCourse,
  getUserCourses,
  updateLessonCompletion, // Add new methods
  updateCourseStatus,
  toggleCourseFavorite, // Add new method
  getFilteredCourses, // Add the new function to the exports
};

export default courseApi;
