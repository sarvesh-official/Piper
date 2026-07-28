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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCourseFavorite = exports.updateCourseStatus = exports.updateLessonCompletion = exports.getUserCourses = exports.getCourse = exports.createCourse = void 0;
const courseService_1 = require("../services/courseService");
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roadmapId } = req.body;
        const userId = req.auth.userId;
        if (!roadmapId) {
            res.status(400).json({ error: 'Roadmap ID is required' });
            return;
        }
        console.log(`Creating detailed course from roadmap ${roadmapId} for user ${userId}`);
        const course = yield courseService_1.courseService.createCourseFromRoadmap({
            userId,
            roadmapId
        });
        console.log(`Course created successfully with ${course.modules.length} modules`);
        res.status(201).json(course);
    }
    catch (error) {
        console.error("Error in course creation controller:", error);
        res.status(500).json({ error: error.message || 'An error occurred during course creation' });
    }
});
exports.createCourse = createCourse;
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        const course = yield courseService_1.courseService.getCourseById(id, userId);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getCourse = getCourse;
const getUserCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        // Fetch all courses without filtering
        const courses = yield courseService_1.courseService.getUserCourses(userId);
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUserCourses = getUserCourses;
// New controller methods for lesson completion and status update
const updateLessonCompletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { moduleId, lessonIndex, completed } = req.body;
        const userId = req.auth.userId;
        if (moduleId === undefined || lessonIndex === undefined || completed === undefined) {
            res.status(400).json({ error: 'moduleId, lessonIndex and completed are required' });
            return;
        }
        const course = yield courseService_1.courseService.updateLessonCompletion(id, userId, moduleId, lessonIndex, completed);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateLessonCompletion = updateLessonCompletion;
const updateCourseStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, add } = req.body;
        const userId = req.auth.userId;
        if (!status || add === undefined) {
            res.status(400).json({ error: 'status and add are required' });
            return;
        }
        if (!['active', 'bookmarked', 'completed'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const course = yield courseService_1.courseService.updateCourseStatus(id, userId, status, Boolean(add));
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateCourseStatus = updateCourseStatus;
const toggleCourseFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        const course = yield courseService_1.courseService.toggleCourseFavorite(id, userId);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.toggleCourseFavorite = toggleCourseFavorite;
