import mongoose, { Document, Schema } from "mongoose";

export interface IChatLog extends Document {
	user_id: mongoose.Types.ObjectId;
	query: string;
	bot_response: string;
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
		context_used: {
			type: [String],
			default: [],
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

// Index for fast user chat history queries
ChatLogSchema.index({ user_id: 1, timestamp: -1 });

export default mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
