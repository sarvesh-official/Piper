import { Request, Response } from "express";
import Chat from "../model/chatModel";
import { generateQuizQuestions } from "../services/quizService";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "../services/s3Service"; // Add this import

interface GenerateQuizRequest {
  fileKeys: string[];
  questionCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionTypes: {
    mcq: boolean;
    trueFalse: boolean;
  };
  customPrompt?: string;
  chatId: string;
  forceRegenerate?: boolean; // New option to force regeneration
}

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const {
      fileKeys,
      questionCount,
      difficulty,
      questionTypes,
      customPrompt,
      chatId,
      forceRegenerate = false  // When true, ignores existing quiz and generates a new one
    } = req.body as GenerateQuizRequest;
    const userId = (req as any).auth.userId; // Get userId from auth middleware

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get the chat document which contains the files
    const chat = await Chat.findOne({ chatId, userId }).lean();

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Check if a quiz already exists and we don't need to regenerate
    if (!forceRegenerate && chat.quiz && chat.quiz.questions && chat.quiz.questions.length > 0) {
      console.log("Returning existing quiz from chat document");
      res.status(200).json({ 
          quiz: chat.quiz.questions,
          isExisting: true,
          generatedAt: chat.quiz.generatedAt
        });
        return
    }

    // If forceRegenerate is true or no quiz exists, generate a new quiz

    // Filter files based on the provided fileKeys - ensure exact matching
    const selectedFiles = (chat.files || []).filter((file) => {
      // Make sure fileKey exists and is a string before using includes
      const fileKey = file.fileKey;
      return typeof fileKey === 'string' && fileKeys.includes(fileKey);
    });

    console.log(`Filtered ${selectedFiles.length} files from ${fileKeys.length} provided keys`);
    console.log("Selected fileKeys:", fileKeys);
    console.log("Available fileKeys in chat:", chat.files?.map(f => f.fileKey).filter(key => typeof key === 'string'));

    if (selectedFiles.length === 0) {
      res
        .status(404)
        .json({ message: "No files found with the provided keys" });
      return;
    }

    // Extract text content from the files
    const extractedTexts = selectedFiles
      .map((file) => file.extractedText || "")
      .filter((text) => text.length > 0);

    if (extractedTexts.length === 0) {
      res
        .status(400)
        .json({ message: "No text content available in the selected files" });
      return;
    }

    console.log(`Generating quiz with ${extractedTexts.length} text sources`);

    // Generate quiz questions using the service
    const quiz = await generateQuizQuestions({
      extractedTexts,
      questionCount,
      difficulty,
      questionTypes,
      customPrompt,
      chatId,
      forceRegenerate  // Pass the forceRegenerate flag to the service
    });

    res.status(200).json({ 
      quiz,
      isExisting: false,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate quiz",
        error: (error as Error).message
      });
  }
};

// Add a new endpoint to get existing quiz for a chat
export const getExistingQuiz = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).auth.userId;

    const chat = await Chat.findOne({ chatId, userId }).lean();

    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
      return 
    }

    if (!chat.quiz || !chat.quiz.questions || chat.quiz.questions.length === 0) {
        res.status(404).json({ message: "No quiz found for this chat" });
      return 
    }

    res.status(200).json({ 
        quiz: chat.quiz.questions,
        settings: chat.quiz.settings,
        generatedAt: chat.quiz.generatedAt
    });
    return 
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ 
        message: "Failed to fetch quiz", 
        error: (error as Error).message 
    });
    return 
  }
};

// Controller method to get quiz by chat ID
export const getQuizByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const userId = (req as any).auth.userId;

    if (!chatId) {
      res.status(400).json({ error: "Chat ID is required" });
      return 
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return 
    }

    const chat = await Chat.findOne({ chatId, userId });

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return 
    }

    if (!chat.quiz || !chat.quiz.questions || chat.quiz.questions.length === 0) {
      res.status(404).json({ error: "No quiz found for this chat" });
      return 
    }

    res.status(200).json({
      quiz: {
        title: "Quiz on " + chat.chatName,
        questions: chat.quiz.questions,
      },
      isExisting: true,
      generatedAt: chat.quiz.generatedAt,
    });
    
    return 
  } catch (error) {
    console.error("Error fetching quiz by chat ID:", error);
    res.status(500).json({ error: "Internal server error" });
    return 
  }
};

// Controller method to save quiz to My Documents
export const saveQuizToDocuments = async (req: Request, res: Response) => {
  try {
    const { chatId, quizTitle } = req.body;

    const userId = (req as any).auth.userId;
    const isSubmitted = req.body.isSubmitted === "true";
    const score = parseInt(req.body.score) || undefined;
    const totalQuestions = parseInt(req.body.totalQuestions) || undefined;
    
    if (!chatId) {
      res.status(400).json({ error: "Chat ID is required" });
      return 
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return 
    }

    if (!req.file) {
      res.status(400).json({ error: "Quiz file is required" });
      return 
    }

    const chat = await Chat.findOne({ chatId, userId });

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return 
    }

    // Upload file to S3
    const fileBuffer = req.file.buffer;
    const fileKey = `quizzes/${userId}/${uuidv4()}-${req.file.originalname}`;
    const contentType = req.file.mimetype;
    
    const uploadResult = await uploadToS3(fileBuffer, fileKey, contentType);
    
    if (!uploadResult) {
      res.status(500).json({ error: "Failed to upload quiz to storage" });
      return 
    }

    // Add saved quiz to the chat's quiz
    if (!chat.quiz) {
      // Initialize quiz if it doesn't exist
      chat.quiz = {
        questions: [],
        generatedAt: new Date(),
        settings: {
          difficulty: 'intermediate',
          questionCount: 10,
          questionTypes: { mcq: true, trueFalse: true }
        },
        savedQuizzes: [] // Initialize empty array
      };
    } else if (!chat.quiz.savedQuizzes) {
      // Initialize savedQuizzes if it doesn't exist
      chat.quiz.savedQuizzes = [];
    }

    // Add the newly saved quiz
    chat.quiz.savedQuizzes.push({
      fileName: req.file.originalname,
      fileUrl: uploadResult.Location,
      fileKey: fileKey,
      quizTitle: quizTitle || "Quiz",
      savedAt: new Date(),
      isSubmitted,
      score,
      totalQuestions
    });

    // Save the updated chat document
    await chat.save();

    res.status(200).json({
      success: true,
      message: "Quiz successfully saved to My Documents",
      savedQuiz: {
        fileName: req.file.originalname,
        fileUrl: uploadResult.Location,
        quizTitle: quizTitle || "Quiz"
      }
    });
    return 
  } catch (error) {
    console.error("Error saving quiz to documents:", error);
    res.status(500).json({ error: "Failed to save quiz to My Documents" });
    return
  }
};
