import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
	user_id: mongoose.Types.ObjectId;
	amount: number;
	type: "income" | "expense";
	category: mongoose.Types.ObjectId;
	date: Date;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	formattedAmount: string; // Virtual getter
}

const TransactionSchema: Schema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true,
		},
		amount: {
			type: Number,
			required: [true, "Amount is required"],
			min: [0.01, "Amount must be greater than 0"],
		},
		type: {
			type: String,
			required: [true, "Transaction type is required"],
			enum: ["income", "expense"],
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Category is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
			default: Date.now,
		},
		description: {
			type: String,
			required: false,
			trim: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
			default: "",
		},
	},
	{
		timestamps: true,
	},
);

// Compound index for fast user transaction queries by date
TransactionSchema.index({ user_id: 1, date: -1 });

// Index for category-based queries (for aggregation pipelines)
TransactionSchema.index({ category: 1 });

// Virtual getter for formatted amount with currency symbol
TransactionSchema.virtual("formattedAmount").get(function (this: ITransaction) {
	const sign = this.type === "income" ? "+" : "-";
	return `${sign}₹${this.amount.toFixed(2)}`;
});

// Ensure virtuals are included in JSON responses
TransactionSchema.set("toJSON", { virtuals: true });
TransactionSchema.set("toObject", { virtuals: true });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
