import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Extend Express Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}

interface JwtPayload {
	id: string;
}

export const protect = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	let token: string | undefined;

	// Check if token exists in Authorization header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// Get token from header
			token = req.headers.authorization.split(" ")[1];

			if (!token) {
				res.status(401).json({
					success: false,
					message: "Not authorized, no token provided",
				});
				return;
			}

			// Verify token
			const secret = process.env.JWT_SECRET || "default_secret";
			const decoded = jwt.verify(token, secret) as unknown as JwtPayload;

			// Get user from token (exclude password_hash)
			const user = await User.findById(decoded.id).select("-password_hash");

			if (!user) {
				res.status(401).json({
					success: false,
					message: "User not found",
				});
				return;
			}

			// Attach user to request
			req.user = user;
			next();
		} catch (error) {
			console.error("Auth middleware error:", error);
			res.status(401).json({
				success: false,
				message: "Not authorized, token failed",
			});
			return;
		}
	}

	if (!token) {
		res.status(401).json({
			success: false,
			message: "Not authorized, no token provided",
		});
		return;
	}
};
