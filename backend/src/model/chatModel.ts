import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; 

const chatSchema = new mongoose.Schema({
  chatId: { type: String, unique: true, default: uuidv4 },
  chatName: { type: String, required: true },
  userId: { type: String, required: true },
  messages: [
    {
      role: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  files: [
    {
      userId: String, 
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileKey: String, // Added fileKey field that's used in the find operation
      extractedText: String, // Added extractedText field for content retrieval
      embeddingId: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
