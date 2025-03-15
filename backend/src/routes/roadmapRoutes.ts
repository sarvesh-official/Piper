import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { generateRoadmap, getRoadmap, getUserRoadmaps, regenerateRoadmap } from '../controllers/roadmapController';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Generate a new roadmap
router.post('/generate', generateRoadmap);

// Get a specific roadmap by ID
router.get('/:id', getRoadmap);

// Regenerate an existing roadmap
router.post('/:id/regenerate', regenerateRoadmap);

// Get all roadmaps for a user
router.get('/', getUserRoadmaps);

export default router;
