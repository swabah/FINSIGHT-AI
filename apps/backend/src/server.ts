import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import { initializeVectorStore } from "./services/vectorStoreService.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Trust proxy (required for Render and other reverse proxies)
app.set("trust proxy", 1);

// Security Middleware (must be before routes)
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests, please try again later",
	},
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: {
		success: false,
		message: "Too many authentication attempts, please try again later",
	},
});

// CORS configuration
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:5175",
	"https://finsight-ai-frontend-ivory.vercel.app",
	process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
	origin: function (origin: string | undefined, callback: any) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.get("/", (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Welcome to FinSight AI API",
		version: "1.0.0",
	});
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
	try {
		// Connect to MongoDB
		await connectDB();

		// Initialize Vector Store for RAG pipeline
		await initializeVectorStore();

		// Start server
		const PORT = process.env.PORT || 5000;
		const server = app.listen(PORT, () => {
			console.log(`🚀 Server is running on port ${PORT}`);
			console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
			console.log(`🔗 API: http://localhost:${PORT}`);
		});

		// Graceful shutdown with timeout
		const gracefulShutdown = (signal: string) => {
			console.log(`\n${signal} received. Starting graceful shutdown...`);
			
			// Force exit after 10 seconds if graceful shutdown hangs
			const forceExit = setTimeout(() => {
				console.error("Forced shutdown due to timeout");
				process.exit(1);
			}, 10000);
			
			server.close(() => {
				clearTimeout(forceExit);
				console.log("HTTP server closed");
				process.exit(0);
			});
		};

		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// Execute server startup
if (process.env.NODE_ENV !== 'test') {
	startServer();
}

export default app;
