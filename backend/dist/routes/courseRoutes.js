"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.requireAuth);
// Create a new course from a roadmap
router.post('/create', courseController_1.createCourse);
// Get a specific course by ID
router.get('/:id', courseController_1.getCourse);
// Get all courses for a user
router.get('/', courseController_1.getUserCourses);
// Update lesson completion status
router.put('/:id/lesson-completion', courseController_1.updateLessonCompletion);
// Update course status (bookmark, complete, etc.)
router.put('/:id/status', courseController_1.updateCourseStatus);
exports.default = router;
