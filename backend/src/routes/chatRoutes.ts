import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { 
  createChat, 
  getChatById, 
  getChatHistory,
  addMessageToChat, 
  deleteChat, 
  handleChatQuery 
} from "../controllers/chatController";

const router = express.Router();

router.post("/create", requireAuth, createChat);
router.get("/history", requireAuth, getChatHistory);
router.get("/:chatId", requireAuth, getChatById);
router.post("/:chatId/message", requireAuth, addMessageToChat);
router.delete("/:chatId", requireAuth, deleteChat);
router.post("/query", requireAuth, handleChatQuery);

export default router;
