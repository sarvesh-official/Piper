"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/chats", authMiddleware_1.requireAuth, dashboardController_1.getDashboardChatSummaries);
router.get("/courses", authMiddleware_1.requireAuth, dashboardController_1.getDashboardCourseSummaries);
exports.default = router;
