import mongoose, { Schema, Document } from 'mongoose';

export type LessonType = 'lesson' | 'code' | 'quiz';
export type CourseStatus = 'active' | 'bookmarked' | 'completed';

export interface ILesson {
  type: LessonType;
  title: string;
  duration: string;
  content?: string;
  completed?: boolean; // Track lesson completion status
}

export interface IModule {
  id: number;
  title: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  userId: string;
  title: string;
  complexity: number;
  duration: number;
  includeQuizzes: boolean;
  includeCode: boolean;
  modules: IModule[];
  createdAt: Date;
  updatedAt: Date;
  roadmapId: string;
  status: CourseStatus[]; // Array of course statuses
  progress: number; // Overall course progress percentage
  description?: string; // Course description for UI
}

const LessonSchema = new Schema<ILesson>({
  type: {
    type: String,
    enum: ['lesson', 'code', 'quiz'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const ModuleSchema = new Schema<IModule>({
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  lessons: [LessonSchema]
});

const CourseSchema = new Schema<ICourse>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  complexity: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  includeQuizzes: {
    type: Boolean,
    default: true
  },
  includeCode: {
    type: Boolean,
    default: true
  },
  modules: [ModuleSchema],
  roadmapId: {
    type: String,
    required: true
  },
  status: {
    type: [String],
    enum: ['active', 'bookmarked', 'completed'],
    default: ['active']
  },
  progress: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
