import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
	username: string;
	email: string;
	password_hash: string;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters long"],
			maxlength: [30, "Username cannot exceed 30 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
		},
		password_hash: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
		},
	},
	{
		timestamps: true,
	},
);

// Hash password before saving
// Note: Using async middleware - no next() callback needed
UserSchema.pre("save", async function () {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified("password_hash")) {
		return;
	}

	const salt = await bcrypt.genSalt(10);
	const passwordToHash = this.password_hash as string;
	this.password_hash = await bcrypt.hash(passwordToHash, salt);
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
	candidatePassword: string,
): Promise<boolean> {
	try {
		return await bcrypt.compare(candidatePassword, this.password_hash);
	} catch (error) {
		return false;
	}
};

// Don't return password_hash when converting to JSON
UserSchema.set("toJSON", {
	transform: (_doc, ret) => {
		delete (ret as any).password_hash;
		return ret;
	},
});

export default mongoose.model<IUser>("User", UserSchema);
