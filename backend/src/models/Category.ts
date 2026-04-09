import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
	name: string;
	type: "income" | "expense";
	color_code: string;
	isDefault: boolean;
	user?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
		},
		type: {
			type: String,
			required: [true, "Category type is required"],
			enum: ["income", "expense"],
		},
		color_code: {
			type: String,
			default: "#6b7280", // Default gray color
		},
		isDefault: {
			type: Boolean,
			default: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

// Compound index for unique category names per type
CategorySchema.index({ name: 1, type: 1 }, { unique: true });

// Index for faster queries
CategorySchema.index({ type: 1 });
CategorySchema.index({ isDefault: 1 });

export default mongoose.model<ICategory>("Category", CategorySchema);
