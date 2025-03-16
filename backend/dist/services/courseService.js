"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseService = exports.CourseService = void 0;
const courseModel_1 = require("../model/courseModel");
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const dotenv_1 = __importDefault(require("dotenv"));
const roadmapService_1 = require("./roadmapService");
dotenv_1.default.config();
class CourseService {
    createCourseFromRoadmap(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, roadmapId } = params;
            // Get the roadmap
            const roadmap = yield (0, roadmapService_1.getRoadmapById)(roadmapId, userId);
            if (!roadmap) {
                throw new Error("Roadmap not found");
            }
            // Check if a course already exists for this roadmap
            if (roadmap.courseId) {
                const existingCourse = yield this.getCourseById(roadmap.courseId, userId);
                if (existingCourse) {
                    return existingCourse;
                }
            }
            // Generate detailed content for each module/lesson in the roadmap
            const detailedModules = yield this.generateDetailedModules(roadmap.title, roadmap.modules);
            // Generate a dedicated course description instead of extracting from lesson content
            const description = yield this.generateCourseDescription(roadmap.title, roadmap.complexity, roadmap.modules);
            // Capitalize the first letter of the course title
            const formattedTitle = roadmap.title ? roadmap.title.charAt(0).toUpperCase() + roadmap.title.slice(1) : roadmap.title;
            // Create and save the course
            const course = new courseModel_1.Course({
                userId,
                roadmapId,
                title: formattedTitle,
                complexity: roadmap.complexity,
                duration: roadmap.duration,
                includeQuizzes: roadmap.includeQuizzes,
                includeCode: roadmap.includeCode,
                modules: detailedModules,
                description
            });
            yield course.save();
            // Update the roadmap with the course ID
            yield (0, roadmapService_1.linkRoadmapToCourse)(roadmapId, course._id.toString());
            return course;
        });
    }
    getCourseById(courseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return courseModel_1.Course.findOne({ _id: courseId, userId });
        });
    }
    getUserCourses(userId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return all courses for the user without any filtering
            return courseModel_1.Course.find({ userId }).sort({ createdAt: -1 });
        });
    }
    // New methods for lesson completion and course status
    updateLessonCompletion(courseId, userId, moduleId, lessonIndex, completed) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield this.getCourseById(courseId, userId);
            if (!course) {
                throw new Error("Course not found");
            }
            // Find the module and lesson
            const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
            if (moduleIndex === -1) {
                throw new Error("Module not found");
            }
            if (lessonIndex < 0 || lessonIndex >= course.modules[moduleIndex].lessons.length) {
                throw new Error("Lesson not found");
            }
            // Update the lesson completion status
            course.modules[moduleIndex].lessons[lessonIndex].completed = completed;
            // Recalculate progress
            const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
            const completedLessons = course.modules.reduce((sum, module) => sum + module.lessons.filter(lesson => lesson.completed).length, 0);
            course.progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            // Update course status if needed
            if (course.progress === 100 && !course.status.includes('completed')) {
                course.status.push('completed');
            }
            else if (course.progress < 100 && course.status.includes('completed')) {
                course.status = course.status.filter(s => s !== 'completed');
            }
            yield course.save();
            return course;
        });
    }
    updateCourseStatus(courseId, userId, status, add) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield this.getCourseById(courseId, userId);
            if (!course) {
                throw new Error("Course not found");
            }
            if (add) {
                // Add status if it doesn't already exist
                if (!course.status.includes(status)) {
                    course.status.push(status);
                }
            }
            else {
                // Remove status
                course.status = course.status.filter(s => s !== status);
            }
            yield course.save();
            return course;
        });
    }
    generateDetailedModules(courseTitle, roadmapModules) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Generating detailed content for course: ${courseTitle}`);
            const detailedModules = [];
            // Process each module one by one to avoid overloading the AI with too much text
            for (const roadmapModule of roadmapModules) {
                const detailedLessons = yield this.generateDetailedLessonsForModule(courseTitle, roadmapModule);
                detailedModules.push({
                    id: roadmapModule.id,
                    title: roadmapModule.title,
                    lessons: detailedLessons
                });
            }
            return detailedModules;
        });
    }
    generateDetailedLessonsForModule(courseTitle, roadmapModule) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const model = new google_genai_1.ChatGoogleGenerativeAI({
                    modelName: "gemini-1.5-flash",
                    maxOutputTokens: 8192 // We need more tokens for detailed content
                });
                // Process each lesson one by one for more detailed content
                const detailedLessons = [];
                for (const roadmapLesson of roadmapModule.lessons) {
                    // Create a specific prompt for this lesson with emphasis on brevity
                    const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`
        You're creating detailed content for a lesson in a course about "${courseTitle}".
        
        Module: ${roadmapModule.title}
        Lesson: ${roadmapLesson.title}
        Lesson Type: ${roadmapLesson.type}
        
        ${roadmapLesson.description ? `Description: ${roadmapLesson.description}` : ''}
        
        Please create concise, educational content for this lesson that is engaging and informative.
        Keep the content focused on the most important aspects of the topic.
        
        ${roadmapLesson.type === 'lesson' ? `
        Write educational content that teaches the topic thoroughly. Include:
        - Brief introduction (1-2 sentences)
        - Main content with examples (keep this focused and concise)
        - Key takeaways (2-3 points maximum)

        IMPORTANT FORMATTING INSTRUCTIONS:
        - Use markdown formatting for headings, lists, emphasis, etc.
        - When including code snippets, ALWAYS use the following format:
          \`\`\`language
          // Your code here with proper comments
          \`\`\`
        - Always specify the programming language after the opening backticks (e.g. \`\`\`javascript, \`\`\`python, etc.)
        - Add a class identifier at the start of each code block like this:
          \`\`\`javascript class="piper-code-block"
          // Your code here
          \`\`\`
        - Use proper indentation in code blocks for readability` : ''}
        
        ${roadmapLesson.type === 'code' ? `
        Create a coding example with:
        - Brief explanation of the problem or task (1-2 sentences)
        - Solution as a code snippet using the exact format:
        
        \`\`\`language class="piper-code-block"
        // Your code here with meaningful comments
        \`\`\`

        Where "language" should be replaced with the actual programming language (e.g., javascript, python, java, etc.)
        
        - Brief explanation of how the code works (2-3 sentences)
        - Simple exercise for the student to try

        Make sure the code example is well-formatted with proper indentation and follows best practices.` : ''}
        
        ${roadmapLesson.type === 'quiz' ? `
        Create a focused quiz with:
        - 5 multiple-choice questions
        - Each question should have 4 options (labeled a, b, c, d)
        - Indicate the correct answer letter for each question
        - Include brief explanation for why the answer is correct

        IMPORTANT: Format the quiz exactly like this example:

        # Quiz Title: Module Name Quiz

        **1. First question text?**

        a) Option 1
        b) Option 2
        c) Option 3
        d) Option 4

        **Correct Answer: b)**

        Brief explanation of why option b is correct.

        **2. Second question text?**

        a) Option 1
        b) Option 2
        c) Option 3
        d) Option 4

        **Correct Answer: a)**

        Brief explanation of why option a is correct.

        Continue this exact format for all 5 questions.` : ''}
        
        Format your response using clear markdown headings, lists, and formatting to make the content readable and structured.
        Keep the overall length moderate - aim for content that can be read in the stated lesson duration.
        `, {});
                    const prompt = yield promptTemplate.format({});
                    const response = yield model.invoke(prompt);
                    const detailedContent = response.content.toString();
                    // Add the detailed lesson
                    detailedLessons.push({
                        type: roadmapLesson.type,
                        title: roadmapLesson.title,
                        duration: roadmapLesson.duration,
                        content: detailedContent
                    });
                }
                return detailedLessons;
            }
            catch (error) {
                console.error("Error generating detailed content:", error);
                // If there's an error, return the original lessons without detailed content
                return roadmapModule.lessons.map((lesson) => ({
                    type: lesson.type,
                    title: lesson.title,
                    duration: lesson.duration,
                    content: lesson.description || 'Content generation failed. Please try regenerating this lesson.'
                }));
            }
        });
    }
    // New method to generate a concise course description
    generateCourseDescription(title, complexity, modules) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Format complexity level
                let level = "beginner";
                if (complexity >= 30 && complexity < 70) {
                    level = "intermediate";
                }
                else if (complexity >= 70) {
                    level = "advanced";
                }
                // Check if we have enough modules to analyze
                if (!modules || modules.length === 0) {
                    return `A ${level}-level course about ${title}.`;
                }
                // Extract topic areas from module titles for a more comprehensive description
                const topicAreas = modules.slice(0, 3).map(module => module.title
                    .replace(/Introduction to/i, '')
                    .replace(/Advanced/i, '')
                    .replace(/Getting Started with/i, '')
                    .trim()).join(', ');
                // Use AI to generate a concise description
                const model = new google_genai_1.ChatGoogleGenerativeAI({
                    modelName: "gemini-1.5-flash",
                    maxOutputTokens: 200, // Limited tokens since we need a short description
                    apiKey: process.env.COURSE_API_KEY
                });
                const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`
      Create a concise description (maximum 100 characters) for a ${level}-level course about "${title}".
      Do not use phrases like "This course" or "In this course".
      Start with an action verb when possible.
      Focus on what learners will gain from the course.
      
      Sample output format: "Learn to build responsive websites using HTML, CSS and JavaScript fundamentals."
      `);
                const prompt = yield promptTemplate.format({});
                const response = yield model.invoke(prompt);
                let generatedDescription = response.content.toString().trim();
                // Remove quotes if present
                generatedDescription = generatedDescription.replace(/^["']|["']$/g, '');
                // Ensure it's not too long (max 150 chars)
                if (generatedDescription.length > 150) {
                    generatedDescription = generatedDescription.substring(0, 147) + '...';
                }
                return generatedDescription;
            }
            catch (error) {
                console.error("Failed to generate course description:", error);
                // Fallback description if generation fails
                let level = "beginner";
                if (complexity >= 30 && complexity < 70) {
                    level = "intermediate";
                }
                else if (complexity >= 70) {
                    level = "advanced";
                }
                return `A comprehensive ${level}-level course covering all aspects of ${title}.`;
            }
        });
    }
    toggleCourseFavorite(courseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield courseModel_1.Course.findOne({ _id: courseId, userId });
            if (!course) {
                return null;
            }
            // Type-safe approach to toggle the favorite status
            const currentFavoriteStatus = course.get('favorite') || false;
            course.set('favorite', !currentFavoriteStatus);
            return course.save();
        });
    }
    ;
}
exports.CourseService = CourseService;
exports.courseService = new CourseService();
