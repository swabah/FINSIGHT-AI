import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import Transaction from "../models/Transaction";
import Category from "../models/Category";

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				errors: errors.array(),
			});
			return;
		}

		const { amount, type, category, description, date } = req.body;

		// Verify category exists and matches transaction type
		const categoryDoc = await Category.findById(category);
		if (!categoryDoc) {
			res.status(404).json({
				success: false,
				message: "Category not found",
			});
			return;
		}

		// Ensure category type matches transaction type
		if (categoryDoc.type !== type) {
			res.status(400).json({
				success: false,
				message: `Category type mismatch. Selected category is for ${categoryDoc.type}, but transaction type is ${type}`,
			});
			return;
		}

		// Create transaction with automatic user linking from JWT
		const transaction = await Transaction.create({
			user_id: req.user!._id, // Extracted from JWT token
			amount,
			type,
			category,
			description,
			date: date || new Date(),
		});

		// Populate category details in response
		const populatedTransaction = await Transaction.findById(
			transaction._id,
		).populate("category", "name type color_code");

		res.status(201).json({
			success: true,
			message: "Transaction created successfully",
			data: populatedTransaction,
		});
	} catch (error: any) {
		console.error("Create transaction error:", error);
		res.status(500).json({
			success: false,
			message: "Error creating transaction",
			error: error.message,
		});
	}
};

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { type, category, limit = 50 } = req.query;

		// Build query filter - always filter by user_id
		const query: any = {
			user_id: req.user!._id,
		};

		// Add optional filters
		if (type && ["income", "expense"].includes(type as string)) {
			query.type = type;
		}

		if (category) {
			query.category = category;
		}

		// Fetch transactions with populated category
		const transactions = await Transaction.find(query)
			.populate("category", "name type color_code")
			.sort({ date: -1 }) // Newest first
			.limit(Number(limit));

		res.status(200).json({
			success: true,
			count: transactions.length,
			data: transactions,
		});
	} catch (error: any) {
		console.error("Get transactions error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching transactions",
			error: error.message,
		});
	}
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				errors: errors.array(),
			});
			return;
		}

		const { id } = req.params;
		const { amount, type, category, description, date } = req.body;

		// Find transaction
		const transaction = await Transaction.findById(id);

		if (!transaction) {
			res.status(404).json({
				success: false,
				message: "Transaction not found",
			});
			return;
		}

		// Verify ownership - users can only update their own transactions
		if (transaction.user_id.toString() !== req.user!._id.toString()) {
			res.status(403).json({
				success: false,
				message: "Not authorized to update this transaction",
			});
			return;
		}

		// If category is being updated, verify it exists and matches type
		if (category) {
			const categoryDoc = await Category.findById(category);
			if (!categoryDoc) {
				res.status(404).json({
					success: false,
					message: "Category not found",
				});
				return;
			}

			// Ensure category type matches transaction type (use new type if provided)
			const transactionType = type || transaction.type;
			if (categoryDoc.type !== transactionType) {
				res.status(400).json({
					success: false,
					message: `Category type mismatch. Selected category is for ${categoryDoc.type}, but transaction type is ${transactionType}`,
				});
				return;
			}
		}

		// Update transaction fields
		transaction.amount = amount ?? transaction.amount;
		transaction.type = type ?? transaction.type;
		transaction.category = category ?? transaction.category;
		transaction.description = description ?? transaction.description;
		transaction.date = date ?? transaction.date;

		// Save updated transaction
		await transaction.save();

		// Populate category details in response
		const updatedTransaction = await Transaction.findById(id).populate(
			"category",
			"name type color_code",
		);

		res.status(200).json({
			success: true,
			message: "Transaction updated successfully",
			data: updatedTransaction,
		});
	} catch (error: any) {
		console.error("Update transaction error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating transaction",
			error: error.message,
		});
	}
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

		// Find transaction
		const transaction = await Transaction.findById(id);

		if (!transaction) {
			res.status(404).json({
				success: false,
				message: "Transaction not found",
			});
			return;
		}

		// Verify ownership - users can only delete their own transactions
		if (transaction.user_id.toString() !== req.user!._id.toString()) {
			res.status(403).json({
				success: false,
				message: "Not authorized to delete this transaction",
			});
			return;
		}

		// Delete transaction
		await Transaction.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Transaction deleted successfully",
		});
	} catch (error: any) {
		console.error("Delete transaction error:", error);
		res.status(500).json({
			success: false,
			message: "Error deleting transaction",
			error: error.message,
		});
	}
};
