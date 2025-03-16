import express from "express";
import {
  getDashboardChatSummaries,
  getDashboardCourseSummaries
} from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/chats", requireAuth, getDashboardChatSummaries);
router.get("/courses", requireAuth, getDashboardCourseSummaries);

export default router;
