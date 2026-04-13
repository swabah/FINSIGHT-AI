import axios from "axios";
import type {
	ChatRequest,
	ChatResponse,
	ChatHistoryResponse,
} from "../types/chat";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendChatMessage = async (
	token: string,
	data: ChatRequest,
): Promise<ChatResponse> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/chat`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		console.error("Send chat message error:", error);
		throw new Error(
			error.response?.data?.message ||
				"Failed to send message. Please try again.",
		);
	}
};

export const fetchChatHistory = async (
	token: string,
): Promise<ChatHistoryResponse> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/chat/history`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		console.error("Fetch chat history error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to fetch chat history.",
		);
	}
};
