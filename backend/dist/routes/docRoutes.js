"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("./../middlewares/authMiddleware");
const express_1 = __importDefault(require("express"));
const docController_1 = require("../controllers/docController");
const router = express_1.default.Router();
// Apply authentication middleware if you have one
// router.use(authenticateUser);
// Document routes
router.get("/uploaded", authMiddleware_1.requireAuth, docController_1.getUserUploadedDocuments);
router.get("/generated", authMiddleware_1.requireAuth, docController_1.getUserGeneratedDocuments);
exports.default = router;
