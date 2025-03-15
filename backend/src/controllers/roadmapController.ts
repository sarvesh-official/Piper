import { Request, Response } from 'express';
import * as roadmapService from '../services/roadmapService';

export const generateRoadmap = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      complexity, 
      duration, 
      interactivity, 
      includeQuizzes,
      includeInteractive,
      includeCode
    } = req.body;
    
    // Get the user ID from auth middleware
    const userId = (req as any).auth.userId;
    
    if (!title) {
        res.status(400).json({ error: 'Course title is required' });
      return 
    }
    
    // Log the generation request
    console.log(`Generating roadmap: "${title}" for user ${userId}`);
    
    const roadmap = await roadmapService.generateRoadmap({
      userId,
      title,
      complexity: complexity || 50,
      duration: duration || 60,
      interactivity: interactivity || 50,
      includeQuizzes: includeQuizzes !== undefined ? includeQuizzes : true,
      includeInteractive: includeInteractive !== undefined ? includeInteractive : true,
      includeCode: includeCode !== undefined ? includeCode : true
    });
    
    console.log(`Roadmap generated successfully with ${roadmap.modules.length} modules`);
    res.status(201).json(roadmap);
  } catch (error: any) {
    console.error("Error in roadmap generation controller:", error);
    res.status(500).json({ error: error.message || 'An error occurred during roadmap generation' });
  }
};

export const getRoadmap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth.userId;
    
    const roadmap = await roadmapService.getRoadmapById(id, userId);
    
    if (!roadmap) {
        res.status(404).json({ error: 'Roadmap not found' });
      return 
    }
    
    res.json(roadmap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const regenerateRoadmap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth.userId;
    
    const { 
      title, 
      complexity, 
      duration, 
      interactivity, 
      includeQuizzes,
      includeInteractive,
      includeCode
    } = req.body;
    
    // Fix: Call roadmapService.regenerateRoadmap instead of the controller function (which would cause recursion)
    const roadmap = await roadmapService.regenerateRoadmap(id, userId, {
      title,
      complexity,
      duration,
      interactivity,
      includeQuizzes,
      includeInteractive,
      includeCode
    });
    
    if (!roadmap) {
        res.status(404).json({ error: 'Roadmap not found' });
      return 
    }
    
    res.json(roadmap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserRoadmaps = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const roadmaps = await roadmapService.getUserRoadmaps(userId);
    res.json(roadmaps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
