import { Router } from "express";
import { body, query } from "express-validator";
import { protect } from "../middleware/auth";
import { chatWithAI, getChatHistory } from "../controllers/chatController";

const router = Router();

// Validation middleware for chat query
const chatValidation = [
	body("query")
		.trim()
		.isLength({ min: 3 })
		.withMessage("Query must be at least 3 characters"),
];

// Validation middleware for chat history query parameters
const chatHistoryValidation = [
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];

// All routes are protected with JWT authentication
router.use(protect);

// Routes
router.post("/", chatValidation, chatWithAI);
router.get("/history", chatHistoryValidation, getChatHistory);

export default router;
