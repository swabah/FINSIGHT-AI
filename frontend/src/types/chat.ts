export interface ChatMessage {
	id: string;
	query: string;
	bot_response: string;
	timestamp: string;
}

export interface ChatRequest {
	query: string;
}

export interface ChatResponse {
	success: boolean;
	data: {
		response: string;
		query: string;
		timestamp: string;
	};
}

export interface ChatHistoryResponse {
	success: boolean;
	data: ChatMessage[];
}
