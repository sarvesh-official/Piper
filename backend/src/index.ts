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

configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware({publishableKey : process.env.CLERK_PUBLIC_KEY as string, secretKey : process.env.CLERK_SECRET_KEY as string}));

app.get("/dashboard", requireAuth, (req: Request, res: Response) => {
  res.json({ message: "Welcome to the dashboard!", userId: (req as any).auth.userId });
});

app.use("/api/upload",requireAuth, uploadRoutes);
app.use("/api/chat", requireAuth, chatRoutes);
app.use("/api/quiz", requireAuth, quizRoutes);
app.use("/api/documents", requireAuth, docRoutes);

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


