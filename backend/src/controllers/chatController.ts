import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { runRAGPipeline } from "../services/ragService";
import ChatLog from "../models/ChatLog";

// @desc    Chat with AI financial assistant
// @route   POST /api/chat
// @access  Private
export const chatWithAI = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				errors: errors.array(),
			});
			return;
		}

		const { query } = req.body;
		const userId = req.user!._id.toString();

		// Run RAG Pipeline
		const { response, context } = await runRAGPipeline(userId, query);

		// Save chat interaction to database
		const chatLog = await ChatLog.create({
			user_id: userId,
			query,
			bot_response: response,
			context_used: context,
			timestamp: new Date(),
		});

		res.status(200).json({
			success: true,
			data: {
				query,
				response,
				timestamp: chatLog.timestamp,
			},
		});
	} catch (error: any) {
		console.error("Chat API error:", error);
		res.status(500).json({
			success: false,
			message: "Error processing chat request",
			error: error.message,
		});
	}
};

// @desc    Get user's chat history
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user!._id.toString();
		const limit = Number(req.query.limit) || 20;

		// Fetch recent chat history
		const chatHistory = await ChatLog.find({ user_id: userId })
			.sort({ timestamp: -1 }) // Newest first
			.limit(limit)
			.select("query bot_response timestamp") // Exclude context_used for cleaner response
			.lean();

		res.status(200).json({
			success: true,
			count: chatHistory.length,
			data: chatHistory,
		});
	} catch (error: any) {
		console.error("Get chat history error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching chat history",
			error: error.message,
		});
	}
};
