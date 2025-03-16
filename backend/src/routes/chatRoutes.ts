import express from "express";
import {
  createChat,
  getChatHistory,
  getChatById,
  addMessageToChat,
  deleteChat,
  handleChatQuery
} from "../controllers/chatController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create", requireAuth, createChat);
router.get("/history", requireAuth, getChatHistory);
router.get("/:chatId", requireAuth, getChatById);
router.post("/:chatId/messages", requireAuth, addMessageToChat);
router.delete("/:chatId", requireAuth, deleteChat);
router.post("/query", requireAuth, handleChatQuery);

export default router;
