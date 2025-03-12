import { Request, Response } from "express";
import { generateQuizQuestions } from "../services/QuizService";
import Chat from "../model/chatModel";

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
      chatId
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
