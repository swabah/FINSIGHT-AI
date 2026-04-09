import Transaction from "../models/Transaction";
import mongoose from "mongoose";

/**
 * Formats a date into a human-readable string
 * Uses relative dates for recent transactions (within 7 days)
 * Uses absolute dates for older transactions
 */
const formatDate = (date: Date): string => {
	const now = new Date();
	const transactionDate = new Date(date);
	const diffTime = now.getTime() - transactionDate.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return "today";
	} else if (diffDays === 1) {
		return "yesterday";
	} else if (diffDays < 7) {
		return `${diffDays} days ago`;
	} else {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return transactionDate.toLocaleDateString("en-US", options);
	}
};

/**
 * Fetches user transactions and converts them to readable text strings
 * @param userId - The user's MongoDB ObjectId
 * @param limit - Maximum number of transactions to fetch (default: 100)
 * @returns Array of human-readable transaction strings
 */
export const stringifyTransactions = async (
	userId: string,
	limit: number = 100,
): Promise<string[]> => {
	try {
		// Fetch transactions from MongoDB with populated category
		const transactions = await Transaction.find({
			user_id: new mongoose.Types.ObjectId(userId),
		})
			.populate("category", "name")
			.sort({ date: -1 }) // Newest first
			.limit(limit)
			.lean();

		if (transactions.length === 0) {
			return [];
		}

		// Convert each transaction to human-readable format
		const transactionStrings = transactions.map((transaction) => {
			const dateStr = formatDate(transaction.date);
			const categoryName = (transaction.category as any)?.name || "Unknown";
			const description = transaction.description;

			if (transaction.type === "expense") {
				return `On ${dateStr}, spent ₹${transaction.amount.toFixed(2)} on ${categoryName} (${description})`;
			} else {
				return `On ${dateStr}, received ₹${transaction.amount.toFixed(2)} from ${categoryName} (${description})`;
			}
		});

		return transactionStrings;
	} catch (error) {
		console.error("Error stringifying transactions:", error);
		return [];
	}
};
