import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; 

// Define schema for quiz questions
const quizQuestionSchema = new mongoose.Schema({
  id: Number,
  type: {
    type: String,
    enum: ['mcq', 'true_false'],
    required: true
  },
  question: String,
  options: [String],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be Number or String
    required: true
  },
  explanation: String
});

// Define quiz schema
const quizSchema = new mongoose.Schema({
  questions: [quizQuestionSchema],
  generatedAt: { type: Date, default: Date.now },
  settings: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    questionTypes: {
      mcq: Boolean,
      trueFalse: Boolean
    },
    customPrompt: String
  }
});

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
      fileKey: String,
      extractedText: String,
      embeddingId: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  // Add quiz field to store generated quizzes
  quiz: quizSchema,
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
