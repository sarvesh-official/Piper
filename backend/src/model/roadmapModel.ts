import mongoose, { Schema, Document } from 'mongoose';

export type LessonType = 'lesson' | 'code' | 'quiz';

export interface IRoadmapLesson {
  type: LessonType;
  title: string;
  duration: string;
  description?: string;
}

export interface IRoadmapModule {
  id: number;
  title: string;
  lessons: IRoadmapLesson[];
}

export interface IRoadmap extends Document {
  userId: string;
  title: string;
  complexity: number;
  duration: number;
  interactivity: number;
  includeQuizzes: boolean;
  includeInteractive: boolean;
  includeCode: boolean;
  modules: IRoadmapModule[];
  createdAt: Date;
  updatedAt: Date;
  courseId?: string; // Reference to a course if one has been created from this roadmap
}

const RoadmapLessonSchema = new Schema<IRoadmapLesson>({
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
  description: {
    type: String
  }
});

const RoadmapModuleSchema = new Schema<IRoadmapModule>({
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  lessons: [RoadmapLessonSchema]
});

const RoadmapSchema = new Schema<IRoadmap>({
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
  interactivity: {
    type: Number,
    required: true
  },
  includeQuizzes: {
    type: Boolean,
    default: true
  },
  includeInteractive: {
    type: Boolean,
    default: true
  },
  includeCode: {
    type: Boolean,
    default: true
  },
  modules: [RoadmapModuleSchema],
  courseId: {
    type: String
  }
}, {
  timestamps: true
});

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
