"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roadmapController_1 = require("../controllers/roadmapController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.requireAuth);
// Generate a new roadmap
router.post('/generate', roadmapController_1.generateRoadmap);
// Get a specific roadmap by ID
router.get('/:id', roadmapController_1.getRoadmap);
// Regenerate an existing roadmap
router.post('/:id/regenerate', roadmapController_1.regenerateRoadmap);
// Get all roadmaps for a user
router.get('/', roadmapController_1.getUserRoadmaps);
exports.default = router;
