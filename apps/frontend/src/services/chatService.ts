import axios from "axios";
import type {
	ChatRequest,
	ChatResponse,
	ChatHistoryResponse,
	ConversationsResponse,
} from "../types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
	"Content-Type": "application/json",
});

export const sendChatMessage = async (
	token: string,
	data: ChatRequest,
): Promise<ChatResponse> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/chat`, data, {
			headers: authHeaders(token),
		});
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to send message. Please try again.");
	}
};

export const fetchConversations = async (token: string): Promise<ConversationsResponse> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
			headers: authHeaders(token),
		});
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to fetch conversations.");
	}
};

export const fetchConversationMessages = async (
	token: string,
	conversationId: string,
): Promise<ChatHistoryResponse> => {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
			{ headers: authHeaders(token) },
		);
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to fetch conversation messages.");
	}
};

export const fetchChatHistory = async (
	token: string,
	limit = 30,
): Promise<ChatHistoryResponse> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/chat/history`, {
			params: { limit },
			headers: authHeaders(token),
		});
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to fetch chat history.");
	}
};

export const confirmDelete = async (
	token: string,
	transactionId: string,
	chatLogId?: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/chat/confirm-delete`,
			{ transaction_id: transactionId, chat_log_id: chatLogId },
			{ headers: authHeaders(token) },
		);
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to delete transaction.");
	}
};

export const updateConversationTitle = async (
	token: string,
	conversationId: string,
	title: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/chat/conversations/${conversationId}`,
			{ title },
			{ headers: authHeaders(token) },
		);
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to rename conversation.");
	}
};

export const deleteChatConversation = async (
	token: string,
	conversationId: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = await axios.delete(
			`${API_BASE_URL}/chat/conversations/${conversationId}`,
			{ headers: authHeaders(token) },
		);
		return response.data;
	} catch (error: unknown) {
		const msg = axios.isAxiosError(error)
			? error.response?.data?.message
			: undefined;
		throw new Error(msg || "Failed to delete conversation.");
	}
};
