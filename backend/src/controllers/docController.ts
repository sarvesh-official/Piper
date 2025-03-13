import { Request, Response } from "express";
import Chat from "../model/chatModel";
import mongoose from "mongoose";

// Get all uploaded documents for a user
export const getUserUploadedDocuments = async (req: Request, res: Response) => {
  try {
    // Get user ID from request (assuming authentication middleware adds userId to req)
    const userId = (req as any).auth.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID is required" });
      return 
    }

    // Find all chats with files for this user
    const chats = await Chat.find({ userId });
    
    // Extract all files from the chats
    const uploadedDocs = chats.flatMap(chat => 
      chat.files.map(file => ({
        id: String((file as any)._id), // Use type assertion to handle _id
        name: file.fileName,
        // Use chat name as topic if available, otherwise use filename
        topic: chat.chatName || file.fileName.split('.')[0],
        dateUploaded: chat.createdAt.toISOString().split('T')[0],
        fileUrl: file.fileUrl,
        fileKey: file.fileKey
      }))
    );

    res.status(200).json(uploadedDocs);
    return 
  } catch (error) {
    console.error("Error fetching uploaded documents:", error);
    res.status(500).json({ 
        message: "Failed to fetch uploaded documents",
        error: error instanceof Error ? error.message : "Unknown error"
    });
    return 
  }
};

// Get all generated documents (quizzes) for a user
export const getUserGeneratedDocuments = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).auth.userId;

    if (!userId) {
        res.status(401).json({ message: "Unauthorized: User ID is required" });
      return 
    }

    // Find all chats with quizzes for this user
    const chats = await Chat.find({ 
      userId, 
      "quiz.savedQuizzes": { $exists: true, $not: { $size: 0 } }
    });
    
    // Extract all saved quizzes from the chats
    const generatedDocs = chats.flatMap(chat => 
      chat.quiz?.savedQuizzes.map(quiz => ({
        id: String((quiz as any)._id), // Use type assertion for _id
        name: quiz.fileName,
        topic: quiz.quizTitle,
        dateGenerated: quiz.savedAt.toISOString().split('T')[0],
        type: 'quiz', // All saved documents are quizzes for now
        fileUrl: quiz.fileUrl
      })) || []
    );

    res.status(200).json(generatedDocs);
    return 
  } catch (error) {
    console.error("Error fetching generated documents:", error);
    res.status(500).json({ 
        message: "Failed to fetch generated documents",
        error: error instanceof Error ? error.message : "Unknown error"
    });
    return 
  }
};
