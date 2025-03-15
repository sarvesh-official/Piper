import express from 'express';
import { 
  createCourse, 
  getCourse, 
  getUserCourses, 
  updateLessonCompletion, 
  updateCourseStatus 
} from '../controllers/courseController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Create a new course from a roadmap
router.post('/create', createCourse);

// Get a specific course by ID
router.get('/:id', getCourse);

// Get all courses for a user
router.get('/', getUserCourses);

// Update lesson completion status
router.put('/:id/lesson-completion', updateLessonCompletion);

// Update course status (bookmark, complete, etc.)
router.put('/:id/status', updateCourseStatus);

export default router;
