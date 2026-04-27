import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import { runAgentPipeline, confirmDeleteTransaction, type HistoryEntry } from "../services/agentService";
import { markDirty } from "../services/vectorStoreService";
import ChatLog from "../models/ChatLog";

// @desc    Chat with AI (agentic — function calling)
// @route   POST /api/chat
// @access  Private
export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ success: false, errors: errors.array() });
			return;
		}

		const { query, history = [], conversation_id } = req.body as {
			query: string;
			history: HistoryEntry[];
			conversation_id?: string;
		};
		const userId = req.user!._id.toString();

		// Use existing conversation_id or generate a new one
		const convId = conversation_id || uuidv4();

		// Run the agentic pipeline (function calling)
		const agentResult = await runAgentPipeline(userId, query, history);

		// Build a title from the first user query (truncated)
		const title = query.length > 60 ? query.slice(0, 57) + "…" : query;

		// Persist to ChatLog with conversation tracking
		await ChatLog.create({
			user_id: userId,
			conversation_id: convId,
			conversation_title: title,
			query,
			bot_response: agentResult.response,
			message_type: agentResult.message_type,
			action_data: agentResult.action_data ?? {},
			tool_calls: agentResult.tool_calls,
			context_used: agentResult.context_used,
			timestamp: new Date(),
		});

		// If a transaction was created via chat, mark embeddings dirty
		if (agentResult.message_type === "action_success" && agentResult.tool_calls.includes("add_transaction")) {
			await markDirty(userId);
		}

		res.status(200).json({
			success: true,
			data: {
				conversation_id: convId,
				query,
				response: agentResult.response,
				message_type: agentResult.message_type,
				action_data: agentResult.action_data ?? null,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error("Chat API error:", msg);
		res.status(500).json({ success: false, message: "Error processing chat request", error: msg });
	}
};

// @desc    User confirmed a delete — execute it
// @route   POST /api/chat/confirm-delete
// @access  Private
export const confirmDelete = async (req: Request, res: Response): Promise<void> => {
	try {
		const { transaction_id, chat_log_id } = req.body as { transaction_id: string; chat_log_id?: string };
		const userId = req.user!._id.toString();

		if (!transaction_id) {
			res.status(400).json({ success: false, message: "transaction_id is required" });
			return;
		}

		const result = await confirmDeleteTransaction(userId, transaction_id);

		if (!result.success) {
			res.status(400).json({ success: false, message: result.message });
			return;
		}

		// Update the ChatLog if provided so the "confirm UI" doesn't render again on history load
		if (chat_log_id) {
			await ChatLog.findByIdAndUpdate(chat_log_id, {
				message_type: "action_success",
				bot_response: `✅ ${result.message}`,
				$unset: { action_data: 1 },
			}).catch(err => console.error("Could not update ChatLog:", err));
		}

		// Mark embeddings dirty since a transaction was removed
		await markDirty(userId);

		res.status(200).json({ success: true, message: result.message });
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error("Confirm delete error:", msg);
		res.status(500).json({ success: false, message: "Error deleting transaction", error: msg });
	}
};

// @desc    Get all conversations for a user (grouped by conversation_id)
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user!._id.toString();

		// Aggregate: for each conversation, get its title and the latest timestamp
		const conversations = await ChatLog.aggregate([
			{ $match: { user_id: req.user!._id } },
			{ $sort: { timestamp: 1 } },
			{
				$group: {
					_id: "$conversation_id",
					title: { $first: "$conversation_title" },
					lastMessage: { $last: "$query" },
					updatedAt: { $max: "$timestamp" },
					messageCount: { $sum: 1 },
				},
			},
			{ $sort: { updatedAt: -1 } },
			{ $limit: 50 },
		]);

		res.status(200).json({ success: true, data: conversations });
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		res.status(500).json({ success: false, message: "Error fetching conversations", error: msg });
	}
};

// @desc    Get all messages in a specific conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user!._id.toString();
		const { id: conversationId } = req.params;

		const messages = await ChatLog.find({
			user_id: userId,
			conversation_id: conversationId,
		})
			.sort({ timestamp: 1 })
			.select("query bot_response message_type action_data timestamp conversation_id")
			.lean();

		res.status(200).json({
			success: true,
			count: messages.length,
			data: messages,
		});
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		res.status(500).json({ success: false, message: "Error fetching messages", error: msg });
	}
};

// @desc    Get user's raw full chat history (flat, no conversation grouping)
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user!._id.toString();
		const limit = Number(req.query.limit) || 30;

		const chatHistory = await ChatLog.find({ user_id: userId })
			.sort({ timestamp: -1 })
			.limit(limit)
			.select("query bot_response message_type action_data timestamp conversation_id")
			.lean();

		res.status(200).json({
			success: true,
			count: chatHistory.length,
			data: chatHistory,
		});
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error("Get chat history error:", msg);
		res.status(500).json({ success: false, message: "Error fetching chat history", error: msg });
	}
};

// @desc    Rename a conversation
// @route   PUT /api/chat/conversations/:id
// @access  Private
export const updateConversation = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user!._id.toString();
		const { id: conversationId } = req.params;
		const { title } = req.body;

		if (!title) {
			res.status(400).json({ success: false, message: "Title is required" });
			return;
		}

		// Update all chat logs matching the conversation_id
		const result = await ChatLog.updateMany(
			{ user_id: userId, conversation_id: conversationId },
			{ $set: { conversation_title: title } }
		);

		if (result.matchedCount === 0) {
			res.status(404).json({ success: false, message: "Conversation not found" });
			return;
		}

		res.status(200).json({ success: true, message: "Conversation renamed successfully" });
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		res.status(500).json({ success: false, message: "Error renaming conversation", error: msg });
	}
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/conversations/:id
// @access  Private
export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user!._id.toString();
		const { id: conversationId } = req.params;

		// Delete all chat logs matching the conversation_id
		const result = await ChatLog.deleteMany({ user_id: userId, conversation_id: conversationId });

		if (result.deletedCount === 0) {
			res.status(404).json({ success: false, message: "Conversation not found" });
			return;
		}

		res.status(200).json({ success: true, message: "Conversation deleted successfully" });
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		res.status(500).json({ success: false, message: "Error deleting conversation", error: msg });
	}
};
