import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { createChat, getChatById, getChatHistory } from "../controllers/chatController";

const router = express.Router();

router.post("/create", requireAuth, createChat);
router.get("/history", requireAuth, getChatHistory);
router.get("/:chatId", requireAuth, getChatById);

export default router;
