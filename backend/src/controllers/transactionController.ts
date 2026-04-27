import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import { markDirty } from "../services/vectorStoreService.js";

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
		).populate("category", "name color_code").populate("user_id", "username");

		// Invalidate embedding cache — new transaction means vectors are stale
		await markDirty(req.user!._id.toString());

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

		// Fetch transactions with populated category and user
		const transactions = await Transaction.find(query)
			.populate("category", "name color_code")
			.populate("user_id", "username")
			.sort({ createdAt: -1 }) // Sort by system entry time
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
		const updatedTransaction = await Transaction.findById(id)
			.populate("category", "name color_code")
			.populate("user_id", "username");

		// Invalidate embedding cache — updated transaction means vectors are stale
		await markDirty(req.user!._id.toString());

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

		// Invalidate embedding cache — deleted transaction means vectors are stale
		await markDirty(req.user!._id.toString());

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

// @desc    Get all categories for logged-in user
// @route   GET /api/transactions/categories
// @access  Private
export const getCategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// Build query filter: User's categories OR default categories
		const query: any = {
			$or: [{ user: req.user!._id }, { isDefault: true }],
		};

		// Fetch categories
		const categories = await Category.find(query).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: categories.length,
			data: categories,
		});
	} catch (error: any) {
		console.error("Get categories error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching categories",
			error: error.message,
		});
	}
};

// @desc    Create a new category
// @route   POST /api/transactions/categories
// @access  Private
export const createCategory = async (
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

		const { name, color_code } = req.body;

		// Check if category with same name already exists for this user
		const existing = await Category.findOne({
			name,
			user: req.user!._id,
		});

		if (existing) {
			res.status(400).json({
				success: false,
				message: "Category with this name already exists",
			});
			return;
		}

		const category = await Category.create({
			name,
			color_code: color_code || "#6b7280",
			isDefault: false,
			user: req.user!._id,
		});

		res.status(201).json({
			success: true,
			message: "Category created successfully",
			data: category,
		});
	} catch (error: any) {
		console.error("Create category error:", error);
		res.status(500).json({
			success: false,
			message: "Error creating category",
			error: error.message,
		});
	}
};

// @desc    Update a category
// @route   PUT /api/transactions/categories/:id
// @access  Private
export const updateCategory = async (
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
		const { name, color_code } = req.body;

		const category = await Category.findById(id);

		if (!category) {
			res.status(404).json({
				success: false,
				message: "Category not found",
			});
			return;
		}

		// Verify ownership
		if (
			category.user?.toString() !== req.user!._id.toString() ||
			category.isDefault
		) {
			res.status(403).json({
				success: false,
				message: "Not authorized to update this category",
			});
			return;
		}

		category.name = name ?? category.name;
		category.color_code = color_code ?? category.color_code;

		await category.save();

		res.status(200).json({
			success: true,
			message: "Category updated successfully",
			data: category,
		});
	} catch (error: any) {
		console.error("Update category error:", error);
		res.status(500).json({
			success: false,
			message: "Error updating category",
			error: error.message,
		});
	}
};

// @desc    Delete a category
// @route   DELETE /api/transactions/categories/:id
// @access  Private
export const deleteCategory = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

		const category = await Category.findById(id);

		if (!category) {
			res.status(404).json({
				success: false,
				message: "Category not found",
			});
			return;
		}

		// Verify ownership
		if (
			category.user?.toString() !== req.user!._id.toString() ||
			category.isDefault
		) {
			res.status(403).json({
				success: false,
				message: "Not authorized to delete this category",
			});
			return;
		}

		// Check if any transactions use this category
		const txCount = await Transaction.countDocuments({ category: id });
		if (txCount > 0) {
			res.status(400).json({
				success: false,
				message:
					"Cannot delete category that is being used by transactions. Delete or reassign those transactions first.",
			});
			return;
		}

		await Category.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (error: any) {
		console.error("Delete category error:", error);
		res.status(500).json({
			success: false,
			message: "Error deleting category",
			error: error.message,
		});
	}
};
