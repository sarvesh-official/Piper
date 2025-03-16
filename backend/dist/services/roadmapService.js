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
exports.generateRoadmap = generateRoadmap;
exports.getRoadmapById = getRoadmapById;
exports.regenerateRoadmap = regenerateRoadmap;
exports.getUserRoadmaps = getUserRoadmaps;
exports.linkRoadmapToCourse = linkRoadmapToCourse;
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const roadmapModel_1 = require("../model/roadmapModel");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Generate a roadmap with AI
function generateRoadmap(params) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate modules using AI
        const modules = yield generateModulesUsingAI(params);
        // Create and save the roadmap
        const roadmap = new roadmapModel_1.Roadmap({
            userId: params.userId,
            title: params.title,
            complexity: params.complexity,
            duration: params.duration,
            interactivity: params.interactivity,
            includeQuizzes: params.includeQuizzes,
            includeInteractive: params.includeInteractive,
            includeCode: params.includeCode,
            modules
        });
        yield roadmap.save();
        return roadmap;
    });
}
// Get a roadmap by ID
function getRoadmapById(roadmapId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return roadmapModel_1.Roadmap.findOne({ _id: roadmapId, userId });
    });
}
// Regenerate an existing roadmap
function regenerateRoadmap(roadmapId, userId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const roadmap = yield roadmapModel_1.Roadmap.findOne({ _id: roadmapId, userId });
        if (!roadmap) {
            return null;
        }
        // Update roadmap parameters
        if (params.title !== undefined)
            roadmap.title = params.title;
        if (params.complexity !== undefined)
            roadmap.complexity = params.complexity;
        if (params.duration !== undefined)
            roadmap.duration = params.duration;
        if (params.interactivity !== undefined)
            roadmap.interactivity = params.interactivity;
        if (params.includeQuizzes !== undefined)
            roadmap.includeQuizzes = params.includeQuizzes;
        if (params.includeInteractive !== undefined)
            roadmap.includeInteractive = params.includeInteractive;
        if (params.includeCode !== undefined)
            roadmap.includeCode = params.includeCode;
        // Regenerate modules using AI
        roadmap.modules = yield generateModulesUsingAI({
            userId: roadmap.userId,
            title: roadmap.title,
            complexity: roadmap.complexity,
            duration: roadmap.duration,
            interactivity: roadmap.interactivity,
            includeQuizzes: roadmap.includeQuizzes,
            includeInteractive: roadmap.includeInteractive,
            includeCode: roadmap.includeCode
        });
        yield roadmap.save();
        return roadmap;
    });
}
// Private function to generate modules using AI
function generateModulesUsingAI(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Determine the complexity level based on the numeric value
            let complexityLevel = "beginner";
            if (params.complexity >= 30 && params.complexity < 70) {
                complexityLevel = "intermediate";
            }
            else if (params.complexity >= 70) {
                complexityLevel = "advanced";
            }
            // Determine the approximate duration of the course
            let durationDescription = "1-2 hours";
            if (params.duration >= 30 && params.duration < 70) {
                durationDescription = "4-6 hours";
            }
            else if (params.duration >= 70) {
                durationDescription = "10+ hours";
            }
            // Determine the number of modules to generate
            const moduleCount = Math.max(3, Math.min(8, Math.floor(params.duration / 15) + 2));
            // Determine which lesson types to include
            const lessonTypes = [];
            lessonTypes.push("lesson"); // Always include standard lessons
            if (params.includeCode)
                lessonTypes.push("code");
            if (params.includeQuizzes)
                lessonTypes.push("quiz");
            // Set focus on concise content
            let contentFocus = "concise content with clear examples";
            // Set interactivity focus
            let interactivityFocus = "balanced mix of text and interactive content";
            if (params.interactivity < 30) {
                interactivityFocus = "mostly text-based content with minimal interactivity";
            }
            else if (params.interactivity >= 70) {
                interactivityFocus = "highly interactive content with engaging activities";
            }
            // Initialize the model
            const model = new google_genai_1.ChatGoogleGenerativeAI({
                modelName: "gemini-1.5-flash",
                maxOutputTokens: 4096,
                apiKey: process.env.COURSE_API_KEY
            });
            // Create an enhanced prompt template with properly escaped curly braces
            const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`
    You are an expert curriculum designer. Create a comprehensive learning roadmap for a course on {title} 
    that is suitable for {complexity} level learners.

    The course should take approximately {duration} to complete and consist of {moduleCount} modules.
    Focus on creating a {interactivity} learning experience.

    Include the following lesson types: {lessonTypes}.

    Each module should:
    - Build progressively on previous modules
    - Cover a distinct subtopic or skill area within the overall course topic
    - Include 3-6 lessons that logically progress from basic concepts to practical applications
    
    For each lesson:
    - Include a clear, descriptive title that indicates what will be learned
    - Provide a realistic duration in minutes (typical lessons range from 10-30 minutes)
    - Include a brief 1-2 sentence description of what the lesson covers
    - For code lessons, specify the programming language or technology being taught
    - For quizzes, focus on assessing the key learning objectives of the module

    Format your response as a valid JSON array following this exact structure:
    [
      {{
        "id": 1,
        "title": "Module Title",
        "lessons": [
          {{
            "type": "lesson",
            "title": "Lesson Title",
            "duration": "XX min",
            "description": "Brief description of the lesson content"
          }},
          {{
            "type": "code",
            "title": "Code Example Title",
            "duration": "XX min",
            "description": "Description of coding exercise"
          }}
        ]
      }}
    ]
    
    The content should be highly customized to the topic "{title}" and appropriate for {complexity} level learners.
    Make the lesson durations realistic, with the total course duration approximately matching {duration}.
    Ensure the final output is valid JSON that strictly follows the format specified above.
    `);
            // Create an output parser for JSON structure
            const parser = new output_parsers_1.JsonOutputParser();
            // Generate the prompt with the course parameters
            const prompt = yield promptTemplate.format({
                title: params.title,
                complexity: complexityLevel,
                duration: durationDescription,
                moduleCount: moduleCount,
                interactivity: interactivityFocus,
                lessonTypes: lessonTypes.join(", ")
            });
            // Generate the course roadmap
            console.log(`Generating roadmap for "${params.title}" using AI...`);
            const response = yield model.invoke(prompt);
            // Extract the text content from the response
            const responseText = response.content.toString();
            console.log("AI response received for roadmap generation");
            // Parse the JSON response with enhanced error handling
            let generatedModules;
            try {
                // First attempt to parse directly
                generatedModules = yield parser.parse(responseText);
            }
            catch (parseError) {
                console.warn("Initial JSON parsing failed, attempting cleanup:", parseError);
                // Try to extract JSON from markdown or clean up the response
                let cleanedJson = responseText;
                // Extract JSON if wrapped in code blocks
                const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
                if (jsonMatch && jsonMatch[1]) {
                    cleanedJson = jsonMatch[1].trim();
                }
                // Remove any trailing commas in arrays/objects
                cleanedJson = cleanedJson.replace(/,(\s*[\]}])/g, '$1');
                // Try to find JSON array in the text
                if (!cleanedJson.trim().startsWith('[')) {
                    const arrayStart = cleanedJson.indexOf('[');
                    const arrayEnd = cleanedJson.lastIndexOf(']');
                    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
                        cleanedJson = cleanedJson.substring(arrayStart, arrayEnd + 1);
                    }
                }
                try {
                    // Parse the cleaned JSON
                    generatedModules = JSON.parse(cleanedJson);
                }
                catch (secondError) {
                    console.error("Failed to parse JSON even after cleanup:", secondError);
                    throw new Error("Failed to generate a valid roadmap. Please try again with different parameters.");
                }
            }
            // Validate and format the generated modules
            if (!Array.isArray(generatedModules)) {
                console.error("Invalid module format - not an array");
                throw new Error("The generated roadmap was invalid. Please try again.");
            }
            // Ensure we have at least one module
            if (generatedModules.length === 0) {
                throw new Error("No modules were generated. Please try again with a different course topic.");
            }
            // Convert the generated content to our module format with enhanced validation
            const formattedModules = generatedModules.map((module, index) => ({
                id: module.id || index + 1,
                title: module.title || `Module ${index + 1}`,
                lessons: (module.lessons || [])
                    .filter(lesson => {
                    // Only include lessons of the types specified in the parameters
                    if (!lesson.type)
                        return false;
                    if (lesson.type === 'code' && !params.includeCode)
                        return false;
                    if (lesson.type === 'quiz' && !params.includeQuizzes)
                        return false;
                    return true;
                })
                    .map(lesson => ({
                    type: lesson.type,
                    title: lesson.title || 'Untitled Lesson',
                    duration: lesson.duration || '15 min',
                    description: lesson.description || ''
                }))
            }));
            // Ensure each module has at least one lesson
            const validModules = formattedModules.filter(module => module.lessons.length > 0);
            if (validModules.length === 0) {
                throw new Error("No valid modules with lessons were generated. Please try again with different parameters.");
            }
            console.log(`Successfully generated roadmap with ${validModules.length} modules`);
            return validModules;
        }
        catch (error) {
            console.error("Error generating roadmap with AI:", error);
            throw error;
        }
    });
}
// Get all roadmaps for a user
function getUserRoadmaps(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return roadmapModel_1.Roadmap.find({ userId }).sort({ createdAt: -1 });
    });
}
// Link a roadmap to a course
function linkRoadmapToCourse(roadmapId, courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        return roadmapModel_1.Roadmap.findByIdAndUpdate(roadmapId, { courseId }, { new: true });
    });
}
