import { Request, Response } from "express";
import Chat from "../model/chatModel";
import { Course } from "../model/courseModel";

export const getDashboardChatSummaries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;

    const chats = await Chat.find({ userId })
      .select("chatId chatName files messages createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!chats || chats.length === 0) {
        res.json([]);
      return 
    }

    const chatSummaries = chats.map(chat => {
      // Calculate a fake quiz psrogress for demo purposes (can be replaced with actual logic)
      const quizProgress = Math.floor(Math.random() * 100);
      
      // Get the most recent message content as preview
      const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content || "No message content" 
        : "No messages";

      return {
        id: chat.chatId,
        topic: chat.chatName || "Untitled Chat",
        chat: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? "..." : ""),
        quiz: quizProgress,
        files: chat.files || [],
        createdAt: chat.createdAt
      };
    });

    res.json(chatSummaries);
  } catch (error) {
    console.error("Error fetching dashboard chat summaries:", error);
    res.status(500).json({ error: "Failed to fetch chat summaries" });
  }
};

export const getDashboardCourseSummaries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;

    const courses = await Course.find({ userId })
      .select("_id title description progress status")
      .sort({ createdAt: -1 })
      .lean();

    if (!courses) {
        res.json([]);
      return 
    }

    res.json(courses);
  } catch (error) {
    console.error("Error fetching dashboard course summaries:", error);
    res.status(500).json({ error: "Failed to fetch course summaries" });
  }
};
