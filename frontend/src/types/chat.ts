// ─── Backend Data Types ────────────────────────────────────────────────────────

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

export type MessageType = "text" | "table" | "action_success" | "confirm_delete" | "chart";

// ─── Chat API Request/Response ─────────────────────────────────────────────────

export interface HistoryEntry {
	role: "user" | "ai";
	text: string;
}

export interface ChatRequest {
	query: string;
	history: HistoryEntry[];
	conversation_id?: string; // pass existing ID to continue a conversation
}

export interface ChatResponseData {
	conversation_id: string;
	query: string;
	response: string;
	message_type: MessageType;
	action_data: {
		transactions?: TransactionRow[];
		confirmDelete?: ConfirmDeletePayload;
		created?: TransactionRow;
		charts?: { title: string; data: any[] }[];
	} | null;
	timestamp: string;
}

export interface ChatResponse {
	success: boolean;
	data: ChatResponseData;
}

// ─── Conversation List ─────────────────────────────────────────────────────────

export interface Conversation {
	_id: string;          // conversation_id
	title: string;
	lastMessage: string;
	updatedAt: string;
	messageCount: number;
}

export interface ConversationsResponse {
	success: boolean;
	data: Conversation[];
}

// ─── Messages Within a Conversation ───────────────────────────────────────────

export interface ChatHistoryItem {
	_id: string;
	conversation_id: string;
	query: string;
	bot_response: string;
	message_type: MessageType;
	action_data: ChatResponseData["action_data"];
	timestamp: string;
}

export interface ChatHistoryResponse {
	success: boolean;
	count: number;
	data: ChatHistoryItem[];
}

// ─── Frontend Local Message State ──────────────────────────────────────────────

export interface RichMessage {
	id: string;
	sender: "user" | "ai";
	type: MessageType;
	text: string;
	actionData?: ChatResponseData["action_data"];
	timestamp: string;
}
