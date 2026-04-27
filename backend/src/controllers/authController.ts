import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

// Generate JWT Token
const generateToken = (id: string): string => {
	const secret = process.env.JWT_SECRET || "default_secret";
	const expire = process.env.JWT_EXPIRE || "7d";
	return jwt.sign({ id }, secret, { expiresIn: expire } as jwt.SignOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
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

		const { username, email, password } = req.body;

		// Check if user already exists
		const userExists = await User.findOne({ $or: [{ email }, { username }] });

		if (userExists) {
			res.status(400).json({
				success: false,
				message: "User with this email or username already exists",
			});
			return;
		}

		// Create user
		const user = await User.create({
			username,
			email,
			password_hash: password, // Will be hashed by the pre-save middleware
		});

		// Generate token
		const token = generateToken(user._id.toString());

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: {
				id: user._id,
				username: user.username,
				email: user.email,
				token,
			},
		});
	} catch (error: any) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			message: "Error registering user",
			error: error.message,
		});
	}
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
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

		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });

		if (!user) {
			res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
			return;
		}

		// Check password
		const isPasswordMatch = await user.comparePassword(password);

		if (!isPasswordMatch) {
			res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
			return;
		}

		// Generate token
		const token = generateToken(user._id.toString());

		res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				id: user._id,
				username: user.username,
				email: user.email,
				token,
			},
		});
	} catch (error: any) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Error logging in",
			error: error.message,
		});
	}
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Not authorized",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				id: req.user._id,
				username: req.user.username,
				email: req.user.email,
				createdAt: req.user.createdAt,
			},
		});
	} catch (error: any) {
		console.error("Get me error:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching user profile",
			error: error.message,
		});
	}
};
