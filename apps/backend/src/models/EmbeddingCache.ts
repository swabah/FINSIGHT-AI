import mongoose, { Document, Schema } from "mongoose";

export interface IEmbeddingCache extends Document {
	userId: string;
	lastEmbedded: Date;
	txCount: number;
	isDirty: boolean;
}

const EmbeddingCacheSchema: Schema = new Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		lastEmbedded: {
			type: Date,
			default: null,
		},
		txCount: {
			type: Number,
			default: 0,
		},
		// True = transactions changed since last embed; must re-embed
		isDirty: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

export default mongoose.model<IEmbeddingCache>("EmbeddingCache", EmbeddingCacheSchema);
