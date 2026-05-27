import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

/**
 * Simple keyword-based search (fallback when vector search is not available)
 * Searches transaction descriptions and category names
 */
export const searchTransactionsByKeywords = async (
	userId: string,
	query: string,
	limit: number = 10,
): Promise<string[]> => {
	try {
		// Extract keywords from query (remove common words)
		const stopWords = [
			"how",
			"much",
			"did",
			"i",
			"spend",
			"on",
			"this",
			"month",
			"what",
			"are",
			"my",
			"total",
			"expenses",
			"income",
		];
		const keywords = query
			.toLowerCase()
			.split(" ")
			.filter((word) => !stopWords.includes(word) && word.length > 2);

		// Build search query
		const searchConditions: any[] = [];

		keywords.forEach((keyword) => {
			searchConditions.push({
				description: { $regex: keyword, $options: "i" },
			});
		});

		// Fetch transactions
		const transactions = await Transaction.find({
			user_id: new mongoose.Types.ObjectId(userId),
			$or: searchConditions.length > 0 ? searchConditions : undefined,
		})
			.populate("category", "name")
			.sort({ date: -1 })
			.limit(limit)
			.lean();

		// Convert to readable format
		const results = transactions.map((transaction) => {
			const date = new Date(transaction.date);
			const dateStr = date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			});
			const categoryName = (transaction.category as any)?.name || "Unknown";
			const description = transaction.description;

			if (transaction.type === "expense") {
				return `On ${dateStr}, spent ₹${transaction.amount.toFixed(2)} on ${categoryName} (${description})`;
			} else {
				return `On ${dateStr}, received ₹${transaction.amount.toFixed(2)} from ${categoryName} (${description})`;
			}
		});

		return results;
	} catch (error) {
		console.error("Error in keyword search:", error);
		return [];
	}
};

/**
 * Get all recent transactions (no search, just return recent)
 */
export const getRecentTransactions = async (
	userId: string,
	limit: number = 20,
): Promise<string[]> => {
	try {
		const transactions = await Transaction.find({
			user_id: new mongoose.Types.ObjectId(userId),
		})
			.populate("category", "name")
			.sort({ date: -1 })
			.limit(limit)
			.lean();

		const results = transactions.map((transaction) => {
			const date = new Date(transaction.date);
			const dateStr = date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			});
			const categoryName = (transaction.category as any)?.name || "Unknown";
			const description = transaction.description;

			if (transaction.type === "expense") {
				return `On ${dateStr}, spent ₹${transaction.amount.toFixed(2)} on ${categoryName} (${description})`;
			} else {
				return `On ${dateStr}, received ₹${transaction.amount.toFixed(2)} from ${categoryName} (${description})`;
			}
		});

		return results;
	} catch (error) {
		console.error("Error fetching recent transactions:", error);
		return [];
	}
};

/**
 * Get all recent transactions and return both string context and raw rows
 */
export const getRecentTransactionsWithRows = async (
	userId: string,
	limit: number = 20,
) => {
	try {
		const transactions = await Transaction.find({
			user_id: new mongoose.Types.ObjectId(userId),
		})
			.populate("category", "name")
			.sort({ date: -1 })
			.limit(limit)
			.lean();

		const results = transactions.map((transaction) => {
			const date = new Date(transaction.date);
			const dateStr = date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			});
			const categoryName = (transaction.category as any)?.name || "Unknown";
			const description = transaction.description;

			let text = "";
			if (transaction.type === "expense") {
				text = `On ${dateStr}, spent ₹${transaction.amount.toFixed(2)} on ${categoryName} (${description})`;
			} else {
				text = `On ${dateStr}, received ₹${transaction.amount.toFixed(2)} from ${categoryName} (${description})`;
			}

			return {
				text,
				row: {
					_id: transaction._id.toString(),
					date: date.toISOString().split("T")[0],
					description: transaction.description,
					category: categoryName,
					type: transaction.type,
					amount: transaction.amount,
				},
			};
		});

		return results;
	} catch (error) {
		console.error("Error fetching recent transactions with rows:", error);
		return [];
	}
};
