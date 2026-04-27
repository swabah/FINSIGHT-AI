import mongoose, { Document, Schema } from "mongoose";

export interface IChatLog extends Document {
	user_id: mongoose.Types.ObjectId;
	conversation_id: string;
	conversation_title: string;
	query: string;
	bot_response: string;
	message_type: "text" | "table" | "action_success" | "confirm_delete" | "chart";
	action_data: Record<string, unknown>;
	tool_calls: string[];
	context_used: string[];
	timestamp: Date;
	createdAt: Date;
	updatedAt: Date;
}

const ChatLogSchema: Schema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true,
		},
		conversation_id: {
			type: String,
			required: true,
			index: true,
		},
		conversation_title: {
			type: String,
			default: "New Conversation",
		},
		query: {
			type: String,
			required: [true, "Query is required"],
			trim: true,
		},
		bot_response: {
			type: String,
			required: [true, "Bot response is required"],
			trim: true,
		},
		// New: rich message type for frontend rendering
		message_type: {
			type: String,
			enum: ["text", "table", "action_success", "confirm_delete", "chart"],
			default: "text",
		},
		// New: structured payload accompanying the text response
		action_data: {
			type: Schema.Types.Mixed,
			default: {},
		},
		// New: which Gemini tools were invoked during this turn
		tool_calls: {
			type: [String],
			default: [],
		},
		context_used: {
			type: [String],
			default: [],
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

// Index for fast user chat history queries
ChatLogSchema.index({ user_id: 1, timestamp: -1 });
ChatLogSchema.index({ user_id: 1, conversation_id: 1, timestamp: 1 });

export default mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
