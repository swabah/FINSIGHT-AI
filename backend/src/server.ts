import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import { initializeVectorStore } from "./services/vectorStoreService";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import chatRoutes from "./routes/chatRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

const startServer = async () => {
	try {
		// Connect to MongoDB
		await connectDB();

		// Initialize Vector Store for RAG pipeline
		await initializeVectorStore();

		// Start server
		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => {
			console.log(`🚀 Server is running on port ${PORT}`);
			console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
			console.log(`🔗 API: http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// Middleware
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:5175",
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "Welcome to FinSight AI API",
		version: "1.0.0",
	});
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Execute server startup
startServer();

export default app;
