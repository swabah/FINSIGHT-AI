import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe, updateUser, deleteUser } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Validation middleware
const registerValidation = [
	body("username")
		.trim()
		.isLength({ min: 3, max: 30 })
		.withMessage("Username must be between 3 and 30 characters")
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage("Username can only contain letters, numbers, and underscores"),
	body("email")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email address")
		.normalizeEmail(),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long")
		.matches(/\d/)
		.withMessage("Password must contain at least one number"),
];

const loginValidation = [
	body("email")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email address")
		.normalizeEmail(),
	body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);

export default router;
