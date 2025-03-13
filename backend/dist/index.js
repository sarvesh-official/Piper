"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@clerk/express");
const authMiddleware_1 = require("./middlewares/authMiddleware");
const utils_1 = require("./utils");
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)({ publishableKey: process.env.CLERK_PUBLIC_KEY, secretKey: process.env.CLERK_SECRET_KEY }));
app.get("/dashboard", authMiddleware_1.requireAuth, (req, res) => {
    res.json({ message: "Welcome to the dashboard!", userId: req.auth.userId });
});
app.use("/api/upload", authMiddleware_1.requireAuth, uploadRoutes_1.default);
app.use("/api/chat", authMiddleware_1.requireAuth, chatRoutes_1.default);
app.use("/api/quiz", authMiddleware_1.requireAuth, quizRoutes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "Public API is working!" });
});
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});
// Connect to database before starting the server
(0, utils_1.connectToDatabase)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});
