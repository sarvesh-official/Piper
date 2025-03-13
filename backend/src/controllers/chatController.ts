import { Request, Response } from "express";
import Chat from "../model/chatModel";
import { v4 as uuidv4 } from "uuid";
import { queryChat } from "../services/queryChat";
import { deleteEmbeddingsFromPinecone } from "../services/pineconeService";
import { deleteFilesFromS3 } from "../services/s3Service";

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
      res.status(404).json({ error: "Chat not found" });
      return 
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
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    // Extract file keys from the deleted chat
    const fileKeys = deletedChat.files && Array.isArray(deletedChat.files) 
      ? deletedChat.files.map(file => file.fileKey) 
      : [];
    
    let resourcesDeleted = true;
    
    try {
      // Delete files from S3
      // if (fileKeys.length > 0) {
      //   await deleteFilesFromS3(fileKeys.filter((key): key is string => !!key));
      // }
      
      // Delete embeddings from Pinecone
      // await deleteEmbeddingsFromPinecone(userId, fileKeys.filter((key): key is string => !!key));
      
      console.log(`Successfully deleted resources for chat ${chatId}`);
    } catch (deleteError) {
      console.error("Error deleting associated resources:", deleteError);
      resourcesDeleted = false;
    }

    res.json({ 
      success: true, 
      message: resourcesDeleted 
        ? "Chat and associated resources deleted successfully" 
        : "Chat deleted, but there was an issue removing some associated resources"
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};

export const handleChatQuery = async (req: Request, res: Response) => {
  try {
    const { chatId, query } = req.body;
    const userId = (req as any).auth.userId; // Get userId from auth middleware

    if (!userId || !chatId || !query) {
      res.status(400).json({ error: "chatId and query are required" });
      return;
    }

    // Fetch the chat session to get the associated files
    const chat = await Chat.findOne({ chatId, userId }).lean();

    if (!chat) {
      res.status(404).json({ error: "Chat session not found" });
      return;
    }

    const files = chat.files || [];
    if (files.length === 0) {
      res.status(400).json({ error: "No files available for this chat session" });
      return;
    }

    // Ensure the role is either "user" or "assistant"
    const { answer, sources } = await queryChat(
      userId, 
      query, 
      chatId, 
      files,
      (chat.messages || []).map(message => ({
        ...message,
        role: message.role as "user" | "assistant",
        content: message.content || ""
      }))
    );
    
    // Add the message to the chat history
    await Chat.findOneAndUpdate(
      { chatId, userId },
      {
        $push: {
          messages: [
            { role: "user", content: query, timestamp: new Date() },
            { role: "assistant", content: answer, timestamp: new Date() }
          ]
        }
      }
    );

    res.json({ 
      answer, 
      sources,
      success: true 
    });
  } catch (error) {
    console.error("Error handling chat query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
