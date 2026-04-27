import { Router } from "express";
import { body, param, query } from "express-validator";
import { protect } from "../middleware/auth.js";
import {
	createTransaction,
	getTransactions,
	updateTransaction,
	deleteTransaction,
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from "../controllers/transactionController.js";

const router = Router();

// Validation middleware for creating transaction
const createTransactionValidation = [
	body("amount")
		.isFloat({ min: 0.01 })
		.withMessage("Amount must be a positive number greater than 0"),
	body("type")
		.isIn(["income", "expense"])
		.withMessage("Type must be either 'income' or 'expense'"),
	body("category").isMongoId().withMessage("Invalid category ID format"),
	body("description")
		.trim()
		.isLength({ min: 1, max: 500 })
		.withMessage("Description must be between 1 and 500 characters"),
	body("date")
		.optional()
		.isISO8601()
		.withMessage("Invalid date format. Use ISO 8601 format (e.g., 2026-04-09)"),
];

// Validation middleware for updating transaction (all fields optional)
const updateTransactionValidation = [
	body("amount")
		.optional()
		.isFloat({ min: 0.01 })
		.withMessage("Amount must be a positive number greater than 0"),
	body("type")
		.optional()
		.isIn(["income", "expense"])
		.withMessage("Type must be either 'income' or 'expense'"),
	body("category")
		.optional()
		.isMongoId()
		.withMessage("Invalid category ID format"),
	body("description")
		.optional()
		.trim()
		.isLength({ min: 1, max: 500 })
		.withMessage("Description must be between 1 and 500 characters"),
	body("date")
		.optional()
		.isISO8601()
		.withMessage("Invalid date format. Use ISO 8601 format (e.g., 2026-04-09)"),
];

// Validation middleware for creating category
const categoryValidation = [
	body("name")
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Category name must be between 1 and 50 characters"),
	body("color_code")
		.optional()
		.isHexColor()
		.withMessage("Invalid color code format"),
];

// All routes are protected with JWT authentication
router.use(protect);

// Category Routes
router.get("/categories", getCategories);
router.post("/categories", categoryValidation, createCategory);
router.put("/categories/:id", categoryValidation, updateCategory);
router.delete("/categories/:id", deleteCategory);

// Transaction Routes
router.post("/", createTransactionValidation, createTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransactionValidation, updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
