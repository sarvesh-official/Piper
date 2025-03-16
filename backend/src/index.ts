import express, { Request, Response, NextFunction } from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { requireAuth } from "./middlewares/authMiddleware";
import { connectToDatabase } from "./utils";
import chatRoutes from "./routes/chatRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import quizRoutes from "./routes/quizRoutes";
import docRoutes from "./routes/docRoutes";
import courseRoutes from "./routes/courseRoutes";
import roadmapRoutes from "./routes/roadmapRoutes";
import dashboardRoutes from "./routes/dashboardRoutes"; 

configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

// Updated CORS configuration to handle credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(clerkMiddleware({publishableKey : process.env.CLERK_PUBLIC_KEY as string, secretKey : process.env.CLERK_SECRET_KEY as string}));

app.get("/dashboard", requireAuth, (req: Request, res: Response) => {
  res.json({ message: "Welcome to the dashboard!", userId: (req as any).auth.userId });
});

app.use("/api/upload", requireAuth, uploadRoutes);
app.use("/api/chat", requireAuth, chatRoutes);
app.use("/api/quiz", requireAuth, quizRoutes);
app.use("/api/documents", requireAuth, docRoutes);
app.use("/api/courses", requireAuth, courseRoutes);
app.use("/api/roadmaps", requireAuth, roadmapRoutes); // Add roadmap routes
app.use("/api/dashboard", requireAuth, dashboardRoutes); // Add roadmap routes

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Public API is working!" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

// Connect to database before starting the server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });


