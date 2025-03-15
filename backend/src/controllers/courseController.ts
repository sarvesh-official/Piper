import { Request, Response } from 'express';
import { CourseStatus } from '../model/courseModel';
import { courseService } from '../services/courseService';

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { roadmapId } = req.body;
    const userId = (req as any).auth.userId;
    
    if (!roadmapId) {
        res.status(400).json({ error: 'Roadmap ID is required' });
      return 
    }
    
    console.log(`Creating detailed course from roadmap ${roadmapId} for user ${userId}`);
    
    const course = await courseService.createCourseFromRoadmap({
      userId,
      roadmapId
    });
    
    console.log(`Course created successfully with ${course.modules.length} modules`);
    res.status(201).json(course);
  } catch (error: any) {
    console.error("Error in course creation controller:", error);
    res.status(500).json({ error: error.message || 'An error occurred during course creation' });
  }
};

export const getCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth.userId;
    
    const course = await courseService.getCourseById(id, userId);
    
    if (!course) {
        res.status(404).json({ error: 'Course not found' });
      return 
    }
    
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const courses = await courseService.getUserCourses(userId);
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// New controller methods for lesson completion and status update
export const updateLessonCompletion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moduleId, lessonIndex, completed } = req.body;
    const userId = (req as any).auth.userId;

    if (moduleId === undefined || lessonIndex === undefined || completed === undefined) {
        res.status(400).json({ error: 'moduleId, lessonIndex and completed are required' });
      return 
    }

    const course = await courseService.updateLessonCompletion(
      id,
      userId,
      moduleId,
      lessonIndex,
      completed
    );

    if (!course) {
        res.status(404).json({ error: 'Course not found' });
      return 
    }

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCourseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, add } = req.body;
    const userId = (req as any).auth.userId;

    if (!status || add === undefined) {
        res.status(400).json({ error: 'status and add are required' });
      return 
    }

    if (!['active', 'bookmarked', 'completed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
      return 
    }

    const course = await courseService.updateCourseStatus(
      id, 
      userId, 
      status as CourseStatus, 
      Boolean(add)
    );

    if (!course) {
        res.status(404).json({ error: 'Course not found' });
      return 
    }

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
