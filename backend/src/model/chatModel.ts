import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IQuizQuestion {
  id: number;
  type: 'mcq' | 'true/false'| 'true_false';  
  question: string;
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
}

export interface IQuizSettings {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  questionTypes: {
    mcq: boolean;
    trueFalse: boolean;
  };
  customPrompt?: string;
}

export interface ISavedQuiz {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  quizTitle: string;
  savedAt: Date;
  isSubmitted: boolean;
  score?: number;
  totalQuestions?: number;
}

export interface IQuiz {
  questions: IQuizQuestion[];
  generatedAt: Date;
  settings: IQuizSettings;
  savedQuizzes: ISavedQuiz[]; 
}

export interface IFile {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  extractedText?: string;
  embeddingId?: string | string[]; 
}

export interface IMessage {
  role: "user" | "system" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  chatId: string;
  chatName: string;
  userId: string;
  files: IFile[];
  messages: IMessage[];
  quiz?: IQuiz;
  createdAt: Date;
  updatedAt?: Date;
}

const fileSchema = new Schema<IFile>({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileKey: { type: String, required: true },
  fileType: { type: String, required: true },
  extractedText: { type: String },
  embeddingId: { type: Schema.Types.Mixed }, 
});

const messageSchema = new Schema<IMessage>({
  role: { type: String, required: true, enum: ["user", "system", "assistant"] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const quizQuestionSchema = new mongoose.Schema({
  id: Number,
  type: {
    type: String,
    enum: ['mcq', 'true/false', 'true_false'],  
    required: true
  },
  question: String,
  options: [String],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, 
    required: true
  },
  explanation: String
});

const savedQuizSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileKey: { type: String, required: true },
  quizTitle: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
  isSubmitted: { type: Boolean, default: false },
  score: { type: Number },
  totalQuestions: { type: Number }
});

const quizSchema = new mongoose.Schema({
  questions: [quizQuestionSchema],
  generatedAt: { type: Date, default: Date.now },
  settings: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    questionCount: { type: Number, default: 10 },
    questionTypes: {
      mcq: Boolean,
      trueFalse: Boolean
    },
    customPrompt: String
  },
  savedQuizzes: [savedQuizSchema]
});

const chatSchema = new Schema<IChat>({
  chatId: { type: String, default: () => uuidv4(), unique: true },
  chatName: { type: String, required: true },
  userId: { type: String, required: true },
  files: [fileSchema],
  messages: [messageSchema],
  quiz: quizSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
