/**
 * agentService.ts — FinSight AI Agentic Orchestration Layer
 *
 * Uses Gemini 2.5 Pro native function calling (via LangChain tool binding)
 * to route user messages to typed tools instead of plain-text RAG.
 *
 * Tools available to the AI:
 *  - analyze_finances      : RAG-based analysis and predictions
 *  - add_transaction       : Create income / expense record
 *  - list_transactions     : Tabular transaction view (with filters)
 *  - search_and_request_delete : Find matching transactions for deletion (Option B)
 *  - execute_delete_transaction: Actually delete after user confirms
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import { stringifyTransactions } from "../utils/transactionStringifier.js";
import { checkAndUpsertEmbeddings, searchSimilarTransactions } from "./vectorStoreService.js";
import { getRecentTransactions } from "../utils/transactionSearch.js";
import { HumanMessage, AIMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MessageType = "text" | "table" | "action_success" | "confirm_delete" | "chart";

export interface TransactionRow {
	_id: string;
	date: string;
	description: string;
	category: string;
	type: "income" | "expense";
	amount: number;
}

export interface ConfirmDeletePayload {
	candidates: TransactionRow[];
	query: string;
}

export interface AgentResponse {
	message_type: MessageType;
	response: string;
	action_data?: {
		transactions?: TransactionRow[];
		confirmDelete?: ConfirmDeletePayload;
		created?: TransactionRow;
		charts?: { title: string; data: any[] }[];
	};
	tool_calls: string[];
	context_used: string[];
}

export interface HistoryEntry {
	role: "user" | "ai";
	text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM Initialisation
// ─────────────────────────────────────────────────────────────────────────────

const llm = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
	model: process.env.GEMINI_MODEL || "gemini-2.5-pro",
	temperature: 0.3,
	maxOutputTokens: 8192,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool Definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tool 1 — analyze_finances
 * RAG-backed analysis: spending patterns, predictions, summaries.
 */
const analyzeFinancesTool = tool(
	async ({ query, userId }: { query: string; userId: string }) => {
		// Refresh embeddings only if dirty
		const chunks = await stringifyTransactions(userId);
		if (chunks.length === 0) return JSON.stringify({ text: "No transactions found." });

		await checkAndUpsertEmbeddings(userId, chunks);

		let contextChunks: string[] = [];
		const results = await searchSimilarTransactions(query, userId, 12);
		if (results.length > 0) {
			contextChunks = results.map((r) => r.text);
		} else {
			contextChunks = await getRecentTransactions(userId, 20);
		}

		return JSON.stringify({ context: contextChunks });
	},
	{
		name: "analyze_finances",
		description:
			"Analyzes the user's financial data using semantic search. Use for: spending summaries, budget analysis, category breakdowns, predictions, trend analysis, savings advice.",
		schema: z.object({
			query: z.string().describe("The user's analysis question"),
			userId: z.string().describe("User ID for data isolation"),
		}),
	},
);

/**
 * Tool 2 — batch_add_transactions
 * Inserts one or more transactions in bulk.
 */
const batchAddTransactionsTool = tool(
	async ({
		userId,
		transactions,
	}: {
		userId: string;
		transactions: Array<{
			amount: number;
			type: "income" | "expense";
			category_name: string;
			description: string;
			date?: string;
		}>;
	}) => {
		const createdRows: TransactionRow[] = [];

		for (const t of transactions) {
			let categoryDoc = await Category.findOne({
				name: { $regex: new RegExp(`^${t.category_name}$`, "i") },
			});

			if (!categoryDoc) {
				const predefinedColors = [
					"#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
					"#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"
				];
				const randomColor = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];

				categoryDoc = await Category.create({
					name: t.category_name.charAt(0).toUpperCase() + t.category_name.slice(1),
					color_code: randomColor,
					isDefault: false,
					user: new mongoose.Types.ObjectId(userId)
				});
			}

			const tx = await Transaction.create({
				user_id: new mongoose.Types.ObjectId(userId),
				amount: t.amount,
				type: t.type,
				category: categoryDoc._id,
				description: t.description,
				date: t.date ? new Date(t.date) : new Date(),
			});

			createdRows.push({
				_id: tx._id.toString(),
				amount: t.amount,
				type: t.type,
				category: categoryDoc.name,
				description: t.description,
				date: (t.date ? new Date(t.date) : new Date()).toISOString().split("T")[0],
			});
		}

		return JSON.stringify({
			success: true,
			transactions: createdRows,
		});
	},
	{
		name: "batch_add_transactions",
		description:
			"Creates one or MORE financial transactions (income or expense) in the user's ledger simultaneously. Use this whether the user provides 1 item or 10 items in a list (e.g. tracking a shopping receipt).",
		schema: z.object({
			userId: z.string(),
			transactions: z.array(
				z.object({
					amount: z.number().min(0.01).describe("Transaction amount in INR"),
					type: z.enum(["income", "expense"]).describe("Transaction type"),
					category_name: z.string().describe("Category name (e.g., Food, Electronics, Groceries)"),
					description: z.string().describe("Short description of the item purchased or income received"),
					date: z.string().optional().describe("Date in YYYY-MM-DD format, defaults to today"),
				})
			).describe("Array of all extracted transaction items from the user's request"),
		}),
	},
);

/**
 * Tool 3 — list_transactions
 * Returns raw transaction rows for tabular display.
 */
const listTransactionsTool = tool(
	async ({
		userId,
		type,
		category_name,
		limit,
		keyword,
	}: {
		userId: string;
		type?: "income" | "expense";
		category_name?: string;
		limit?: number;
		keyword?: string;
	}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filter: any = { user_id: new mongoose.Types.ObjectId(userId) };
		if (type) filter.type = type;

		if (category_name) {
			const cat = await Category.findOne({
				name: { $regex: new RegExp(category_name, "i") },
			});
			if (cat) filter.category = cat._id;
		}

		if (keyword) {
			filter.description = { $regex: keyword, $options: "i" };
		}

		const txList = await Transaction.find(filter)
			.populate<{ category: { name: string } }>("category", "name")
			.sort({ date: -1 })
			.limit(limit || 20)
			.lean();

		const rows: TransactionRow[] = txList.map((t) => ({
			_id: t._id.toString(),
			date: new Date(t.date).toISOString().split("T")[0],
			description: t.description,
			category: (t.category as unknown as { name: string })?.name || "Unknown",
			type: t.type,
			amount: t.amount,
		}));

		return JSON.stringify({ rows, count: rows.length });
	},
	{
		name: "list_transactions",
		description:
			"Fetches transactions as structured rows for tabular display. Use when user asks to 'show', 'list', 'view', 'display' transactions.",
		schema: z.object({
			userId: z.string(),
			type: z.enum(["income", "expense"]).optional().describe("Filter by type"),
			category_name: z.string().optional().describe("Filter by category name"),
			limit: z.number().int().min(1).max(100).optional().describe("Max rows to return"),
			keyword: z.string().optional().describe("Keyword to search in description"),
		}),
	},
);

/**
 * Tool 4 — get_balance
 * Extremely fast aggregation to get the exact net balance.
 */
const getBalanceTool = tool(
	async ({ userId }: { userId: string }) => {
		const result = await Transaction.aggregate([
			{ $match: { user_id: new mongoose.Types.ObjectId(userId) } },
			{
				$group: {
					_id: null,
					totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
					totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
				},
			},
		]);

		let balance = 0;
		if (result.length > 0) {
			balance = result[0].totalIncome - result[0].totalExpense;
		}

		return JSON.stringify({ balance });
	},
	{
		name: "get_balance",
		description: "Use this exclusively when the user asks for 'balance' or 'current balance'. Do not use for general analysis.",
		schema: z.object({
			userId: z.string(),
		}),
	}
);

/**
 * Tool 4 — visualize_finances
 * Generates aggregated data specifically formatted for a native Pie Chart UI.
 */
const visualizeFinancesTool = tool(
	async ({ userId, type }: { userId: string; type?: "income" | "expense" | "both" }) => {
		const targetType = type || "both";
		const results: { title: string; data: any[] }[] = [];

		const getAggregation = async (txType: "income" | "expense", title: string) => {
			const aggs = await Transaction.aggregate([
				{ $match: { user_id: new mongoose.Types.ObjectId(userId), type: txType } },
				{
					$lookup: {
						from: "categories",
						localField: "category",
						foreignField: "_id",
						as: "categoryDoc",
					},
				},
				{ $unwind: "$categoryDoc" },
				{
					$group: {
						_id: "$categoryDoc.name",
						amount: { $sum: "$amount" },
						color: { $first: "$categoryDoc.color_code" },
					},
				},
				{ $sort: { amount: -1 } }
			]);

			if (aggs.length > 0) {
				results.push({
					title,
					data: aggs.map((e) => ({
						category: e._id,
						amount: e.amount,
						color: e.color || "#808080"
					})),
				});
			}
		};

		if (targetType === "both" || targetType === "expense") {
			await getAggregation("expense", "Expenses Breakdown");
		}
		if (targetType === "both" || targetType === "income") {
			await getAggregation("income", "Income Breakdown");
		}

		return JSON.stringify({ success: true, charts: results });
	},
	{
		name: "visualize_finances",
		description: "Use this to generate visual charts. Triggers when the user explicitly asks for a chart, visualization, or visual category breakdown.",
		schema: z.object({
			userId: z.string(),
			type: z.enum(["income", "expense", "both"]).optional().describe("Which type of transactions to visualize. Defaults to 'both' if not specified.")
		}),
	}
);

/**
 * Tool 4 — search_and_request_delete
 * Option B: finds ALL candidates matching the query, returns them for user selection.
 */
const searchAndRequestDeleteTool = tool(
	async ({
		userId,
		keyword,
		type,
		category_name,
	}: {
		userId: string;
		keyword?: string;
		type?: "income" | "expense";
		category_name?: string;
	}) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filter: any = { user_id: new mongoose.Types.ObjectId(userId) };
		if (type) filter.type = type;

		if (category_name) {
			const cat = await Category.findOne({
				name: { $regex: new RegExp(category_name, "i") },
			});
			if (cat) filter.category = cat._id;
		}

		if (keyword) {
			filter.description = { $regex: keyword, $options: "i" };
		}

		const txList = await Transaction.find(filter)
			.populate<{ category: { name: string } }>("category", "name")
			.sort({ date: -1 })
			.limit(15)
			.lean();

		const candidates: TransactionRow[] = txList.map((t) => ({
			_id: t._id.toString(),
			date: new Date(t.date).toISOString().split("T")[0],
			description: t.description,
			category: (t.category as unknown as { name: string })?.name || "Unknown",
			type: t.type,
			amount: t.amount,
		}));

		return JSON.stringify({
			candidates,
			query: keyword || category_name || type || "recent",
		});
	},
	{
		name: "search_and_request_delete",
		description:
			"Searches for transactions the user wants to delete and returns all candidates for them to confirm. Use when user says 'delete', 'remove', 'erase'. Always show candidates first — never delete directly.",
		schema: z.object({
			userId: z.string(),
			keyword: z.string().optional().describe("Keyword found in description (e.g. 'Zomato')"),
			type: z.enum(["income", "expense"]).optional(),
			category_name: z.string().optional(),
		}),
	},
);

/**
 * Tool 5 — execute_delete_transaction
 * Permanently deletes a single transaction by ID after user confirmed.
 */
const executeDeleteTransactionTool = tool(
	async ({ userId, transaction_id }: { userId: string; transaction_id: string }) => {
		const tx = await Transaction.findById(transaction_id);
		if (!tx) return JSON.stringify({ error: "Transaction not found" });
		if (tx.user_id.toString() !== userId)
			return JSON.stringify({ error: "Unauthorized" });

		await Transaction.findByIdAndDelete(transaction_id);
		return JSON.stringify({ success: true, deleted_id: transaction_id });
	},
	{
		name: "execute_delete_transaction",
		description:
			"Permanently deletes a specific transaction. Only call this after the user has explicitly confirmed which transaction to delete (you have the ID).",
		schema: z.object({
			userId: z.string(),
			transaction_id: z.string().describe("MongoDB ObjectId of the transaction to delete"),
		}),
	},
);

// ─────────────────────────────────────────────────────────────────────────────
// Bind tools to LLM
// ─────────────────────────────────────────────────────────────────────────────

const tools = [
	analyzeFinancesTool,
	batchAddTransactionsTool,
	listTransactionsTool,
	searchAndRequestDeleteTool,
	executeDeleteTransactionTool,
	visualizeFinancesTool,
	getBalanceTool,
];

const llmWithTools = llm.bindTools(tools);

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are FinSight AI, a highly intuitive, warm, and hyper-intelligent personal finance assistant. Your primary goal is to provide a seamless, friendly, and human-like user experience.

## TONE & PERSONA:
- **Tone**: Conversational, encouraging, highly empathetic, and professional.
- **Brevity**: Extreme brevity. Your responses MUST be short, simple, and direct. Use 1-3 natural sentences maximum for any conversational reply.
- **Formatting**: Feel free to use beautiful Markdown! You can use headings, lists, tables, and bold text to structure your responses perfectly just like ChatGPT.
- **BANNED Jargon**: NEVER use words like "system", "initialize", "session", "database", "backend", "prompt", or "JSON". Keep everything abstracted.

## YOUR CAPABILITIES:
- **Analyze** spending patterns, budgets, savings rates, and category breakdowns.
- **Add** income or expense transactions on behalf of the user seamlessly.
- **List** transactions when the user asks to see records.
- **Delete** transactions after explicit user confirmation (you MUST show candidates first).
- **Predict** future spending based on historical patterns.

## RESPONSE GUIDELINES:
- **Be Specific**: Cite actual amounts (₹) naturally in brief sentences. 
- **For Analysis**: Keep it short! Highlight the top takeaway and use markdown lists or bolding.
- **For Actions**: Naturally confirm what was done. Example: "I've gone ahead and logged your ₹500 lunch expense."
- **For Deletions**: Say something friendly like, "I found these matching transactions. Could you let me know which one you'd like to remove?"
- **For Charts/Visualizations**: NEVER generate markdown images, markdown links, or external URLs for charts! The UI automatically renders charts natively. Just acknowledge it by saying something like "Here is the visual breakdown of your finances:".
- **Format**: ALWAYS use ₹ (Indian Rupee) and valid Markdown natively. DO NOT generate image tags like \`![chart](...)\`.`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Agent Pipeline
// ─────────────────────────────────────────────────────────────────────────────

export const runAgentPipeline = async (
	userId: string,
	userQuery: string,
	history: HistoryEntry[] = [],
): Promise<AgentResponse> => {
	console.log(`\n🤖 Agent Pipeline — user ${userId}`);
	console.log(`📝 Query: "${userQuery}"`);

	const toolCallsInvoked: string[] = [];
	const contextUsed: string[] = [];

	try {
		// Build message history (last 6 messages = 3 turns)
		const historyMessages: BaseMessage[] = history.slice(-6).map((h) =>
			h.role === "user"
				? new HumanMessage(h.text)
				: new AIMessage(h.text),
		);

		// Initial call — AI picks a tool
		const messages: BaseMessage[] = [
			new SystemMessage(SYSTEM_PROMPT),
			...historyMessages,
			new HumanMessage(`[userId: ${userId}] ${userQuery}`),
		];

		const aiResponse = await llmWithTools.invoke(messages);

		// Check if AI called any tools
		const toolCalls = aiResponse.tool_calls ?? [];

		if (toolCalls.length === 0) {
			// No tool call — plain conversational response
			return {
				message_type: "text",
				response: typeof aiResponse.content === "string"
					? aiResponse.content
					: "I'm not sure how to help with that. Try asking about your spending, or say 'add ₹500 food for lunch'.",
				tool_calls: [],
				context_used: [],
			};
		}

		// Prepare the pipeline for a second LLM conversational pass with tool results
		let messageType: MessageType = "text";
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let actionData: any = undefined;
		const toolMessages: BaseMessage[] = [];

		messages.push(aiResponse);

		for (const tc of toolCalls) {
			toolCallsInvoked.push(tc.name);
			console.log(`🔧 Invoking tool: ${tc.name}`, tc.args);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const args: Record<string, any> = { ...tc.args, userId };
			let rawToolOutput = "";

			if (tc.name === "analyze_finances") {
				rawToolOutput = (await analyzeFinancesTool.invoke(args as any)) as string;
				const parsed = JSON.parse(rawToolOutput);
				if (parsed.context) contextUsed.push(...parsed.context);
			} else if (tc.name === "get_balance") {
				rawToolOutput = (await getBalanceTool.invoke(args as any)) as string;
			} else if (tc.name === "visualize_finances") {
				rawToolOutput = (await visualizeFinancesTool.invoke(args as any)) as string;
				const parsed = JSON.parse(rawToolOutput);
				if (parsed.charts && parsed.charts.length > 0) {
					messageType = "chart";
					actionData = { charts: parsed.charts };
				}
			} else if (tc.name === "batch_add_transactions") {
				rawToolOutput = (await batchAddTransactionsTool.invoke(args as any)) as string;
				const parsed = JSON.parse(rawToolOutput);
				if (parsed.success) {
					messageType = "table";
					actionData = { transactions: parsed.transactions };
				}
			} else if (tc.name === "list_transactions") {
				rawToolOutput = (await listTransactionsTool.invoke(args as any)) as string;
				const parsed = JSON.parse(rawToolOutput);
				const rows = parsed.rows as TransactionRow[];
				if (rows && rows.length > 0) {
					messageType = "table";
					actionData = { transactions: rows };
				}
			} else if (tc.name === "search_and_request_delete") {
				rawToolOutput = (await searchAndRequestDeleteTool.invoke(args as any)) as string;
				const parsed = JSON.parse(rawToolOutput);
				const candidates = parsed.candidates as TransactionRow[];
				if (candidates && candidates.length > 0) {
					messageType = "confirm_delete";
					actionData = {
						confirmDelete: {
							candidates,
							query: parsed.query,
						},
					};
				}
			} else if (tc.name === "execute_delete_transaction") {
				rawToolOutput = (await executeDeleteTransactionTool.invoke(args as any)) as string;
				const parsed = JSON.parse(rawToolOutput);
				if (!parsed.error) {
					messageType = "action_success";
				}
			}

			toolMessages.push(
				new ToolMessage({
					tool_call_id: tc.id || tc.name,
					name: tc.name,
					content: rawToolOutput || '{"error": "No output produced"}',
				})
			);
		}

		// Second LLM pass — synthesizes the raw JSON tool outputs into natural language
		const synthesisMessages = [...messages, ...toolMessages];
		const synthesisResponse = await llm.invoke(synthesisMessages);

		let finalResponseText = "I couldn't process that.";
		if (typeof synthesisResponse.content === "string" && synthesisResponse.content.trim() !== "") {
			finalResponseText = synthesisResponse.content;
		} else if (Array.isArray(synthesisResponse.content)) {
			finalResponseText = synthesisResponse.content
				.map((c) => (typeof c === "string" ? c : "text" in c ? c.text : ""))
				.join(" ")
				.trim();
		}

		return {
			message_type: messageType,
			response: finalResponseText,
			action_data: actionData,
			tool_calls: toolCallsInvoked,
			context_used: contextUsed,
		};
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error("❌ Agent Pipeline error:", msg);

		if (msg.includes("API key")) {
			return {
				message_type: "text",
				response: "⚠️ AI service configuration error. Please contact support.",
				tool_calls: toolCallsInvoked,
				context_used: [],
			};
		}

		return {
			message_type: "text",
			response: "⚠️ I encountered an error processing your request. Please try again.",
			tool_calls: toolCallsInvoked,
			context_used: [],
		};
	}
};

/**
 * Execute a user-confirmed deletion.
 * Called directly by the confirm-delete API route.
 */
export const confirmDeleteTransaction = async (
	userId: string,
	transactionId: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const tx = await Transaction.findById(transactionId);
		if (!tx) return { success: false, message: "Transaction not found." };
		if (tx.user_id.toString() !== userId)
			return { success: false, message: "Unauthorized." };

		await Transaction.findByIdAndDelete(transactionId);
		return { success: true, message: "Transaction deleted successfully." };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		return { success: false, message: msg };
	}
};
