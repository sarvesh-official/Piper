"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.post("/create", authMiddleware_1.requireAuth, chatController_1.createChat);
router.get("/history", authMiddleware_1.requireAuth, chatController_1.getChatHistory);
router.get("/:chatId", authMiddleware_1.requireAuth, chatController_1.getChatById);
exports.default = router;
