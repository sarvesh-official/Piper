import { Request, Response } from "express";
import Chat from "../model/chatModel";
import { v4 as uuidv4 } from "uuid";

export const createChat = async (req: Request, res: Response) => {
  try {
    const { userId, files } = req.body;

    if (!userId || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ error: "Invalid request parameters" });
      return;
    }

    const chatId = uuidv4();

    const chatName =
      files.length === 1
        ? files[0].fileName
        : `${files[0].fileName}, ${files[1]?.fileName || "..."}`;

    const newChat = new Chat({
      chatId,
      userId,
      chatName,
      files: files.map((file) => ({
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: file.fileName.split(".").pop(),
        fileKey: file.fileKey
      })),
      messages: []
    });

    await newChat.save();

    res.status(201).json({
      success: true,
      chatId,
      chatName,
      message: "Chat created successfully"
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const { page = 1, limit = 10 } = req.query;

    const chatHistory = await Chat.find({ userId })
      .select("chatId chatName createdAt files") // Ensure chatName & files are selected
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const formattedHistory = chatHistory.map((chat) => {
      const chatName = chat.chatName || "Untitled Chat"; // Handle missing chatName
      const files = Array.isArray(chat.files) ? chat.files : []; // Ensure files is an array

      return {
        chatId: chat.chatId,
        title: chatName.length > 50 ? chatName.substring(0, 50) + "..." : chatName,
        timestamp: chat.createdAt,
        preview: `${files.length} file(s) uploaded`
      };
    });

    res.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};


export const getChatById = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).auth.userId;

    const chat = await Chat.findOne({chatId, userId}).lean();

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    res.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};

export const addMessageToChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { role, content } = req.body;
    const userId = (req as any).auth.userId;

    const chat = await Chat.findOneAndUpdate(
      { chatId, userId },
      { $push: { messages: { role, content, timestamp: new Date() } } },
      { new: true }
    )
      .select("chatId messages")
      .lean();

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).auth.userId;

    const deletedChat = await Chat.findOneAndDelete({ chatId, userId });

    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};
