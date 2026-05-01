import { Router } from "express";
import { body, param, query } from "express-validator";
import { protect } from "../middleware/auth.js";
import {
	chatWithAI,
	getChatHistory,
	confirmDelete,
	getConversations,
	getConversationMessages,
	updateConversation,
	deleteConversation,
} from "../controllers/chatController.js";

const router = Router();

// All routes protected by JWT
router.use(protect);

router.post(
	"/",
	[body("query").trim().isLength({ min: 1 }).withMessage("Query cannot be empty")],
	chatWithAI,
);

router.post(
	"/confirm-delete",
	[body("transaction_id").notEmpty().withMessage("transaction_id is required")],
	confirmDelete,
);

router.get(
	"/history",
	[query("limit").optional().isInt({ min: 1, max: 100 })],
	getChatHistory,
);

// Conversation-aware endpoints
router.get("/conversations", getConversations);

router.get(
	"/conversations/:id/messages",
	[param("id").notEmpty().withMessage("Conversation ID is required")],
	getConversationMessages,
);

router.put(
	"/conversations/:id",
	[
		param("id").notEmpty().withMessage("Conversation ID is required"),
		body("title").notEmpty().withMessage("Title is required"),
	],
	updateConversation,
);

router.delete(
	"/conversations/:id",
	[param("id").notEmpty().withMessage("Conversation ID is required")],
	deleteConversation,
);

export default router;
