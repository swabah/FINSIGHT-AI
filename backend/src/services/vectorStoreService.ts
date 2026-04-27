import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import EmbeddingCache from "../models/EmbeddingCache.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// Initialize MongoDB client for vector store
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
	throw new Error("MONGODB_URI is not defined in environment variables");
}

const client = new MongoClient(mongoURI);
const dbName = "finsight-ai";
const collectionName = "transaction_embeddings";

// Initialize Google Gemini embeddings (v1beta-compatible model)
// gemini-embedding-001 works on the v1beta endpoint used by @langchain/google-genai
// text-embedding-004 requires the v1 stable endpoint — not supported here
const embeddings = new GoogleGenerativeAIEmbeddings({
	apiKey: process.env.GOOGLE_API_KEY,
	modelName: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
});

let vectorStore: MongoDBAtlasVectorSearch | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let collection: any = null;

/**
 * Initialize the vector store and collection.
 * Called once on server startup.
 */
export const initializeVectorStore = async (): Promise<void> => {
	try {
		await client.connect();
		const db = client.db(dbName);
		collection = db.collection(collectionName);

		vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
			collection: collection,
			indexName: process.env.VECTOR_SEARCH_INDEX_NAME || "vector_index",
			textKey: "text",
			embeddingKey: "embedding",
		});

		console.log("✅ Vector Store initialized successfully");
	} catch (error) {
		console.error("❌ Error initializing Vector Store:", error);
		throw error;
	}
};

// ─────────────────────────────────────────────────────────────────────────────
// Event-Driven Embedding Cache
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark a user's embeddings as dirty (transactions have changed).
 * Called by transactionController on create / update / delete.
 */
export const markDirty = async (userId: string): Promise<void> => {
	try {
		await EmbeddingCache.findOneAndUpdate(
			{ userId },
			{ isDirty: true },
			{ upsert: true, returnDocument: 'after' },
		);
		console.log(`🏷️  Embedding cache marked dirty for user ${userId}`);
	} catch (error) {
		console.error("Error marking embedding cache dirty:", error);
	}
};

/**
 * Check if embeddings need refreshing and upsert only when necessary.
 * Conditions for re-embedding:
 *   1. Never embedded before (isDirty = true by default)
 *   2. Transactions were modified since last embed (isDirty = true)
 *   3. txCount has changed (safety net)
 */
export const checkAndUpsertEmbeddings = async (
	userId: string,
	chunks: string[],
): Promise<void> => {
	if (!collection) throw new Error("Vector store not initialized");

	const currentTxCount = await Transaction.countDocuments({
		user_id: new mongoose.Types.ObjectId(userId),
	});

	const cache = await EmbeddingCache.findOne({ userId });

	const needsRefresh =
		!cache ||
		cache.isDirty ||
		cache.txCount !== currentTxCount;

	if (!needsRefresh) {
		console.log(`⚡ Embedding cache is fresh for user ${userId} — skipping upsert`);
		return;
	}

	console.log(
		`📝 Refreshing embeddings for user ${userId} (dirty=${cache?.isDirty}, txCount: ${cache?.txCount} → ${currentTxCount})`,
	);

	// Delete stale vectors for this user
	await collection.deleteMany({ userId });

	// Add new documents to vector store (auto-generates embeddings)
	if (chunks.length > 0) {
		await vectorStore!.addDocuments(
			chunks.map((chunk, index) => ({
				pageContent: chunk,
				metadata: {
					userId,
					chunkIndex: index,
					timestamp: new Date(),
				},
			})),
		);
	}

	// Update cache state
	await EmbeddingCache.findOneAndUpdate(
		{ userId },
		{ isDirty: false, txCount: currentTxCount, lastEmbedded: new Date() },
		{ upsert: true },
	);

	console.log(
		`✅ Re-embedded ${chunks.length} chunks for user ${userId}`,
	);
};

/**
 * Legacy upsert (kept for compatibility; prefer checkAndUpsertEmbeddings).
 */
export const upsertTransactionChunks = async (
	userId: string,
	chunks: string[],
): Promise<void> => {
	await checkAndUpsertEmbeddings(userId, chunks);
};

/**
 * Search for similar transactions based on a natural-language query.
 */
export const searchSimilarTransactions = async (
	query: string,
	userId: string,
	k: number = 10,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Array<{ text: string; metadata: Record<string, any> }>> => {
	try {
		if (!vectorStore) throw new Error("Vector store not initialized");

		console.log(`🔍 Searching for similar transactions for user ${userId}...`);
		const results = await vectorStore.similaritySearchWithScore(query, k, {
			userId,
		});

		console.log(`✅ Found ${results.length} similar transactions`);

		return results.map(([doc, score]) => ({
			text: doc.pageContent,
			metadata: { ...doc.metadata, score },
		}));
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error("❌ Error searching similar transactions:", msg);
		console.log("💡 Tip: Make sure MongoDB Atlas Vector Search index 'vector_index' exists!");
		return [];
	}
};

export const getVectorStore = (): MongoDBAtlasVectorSearch | null => vectorStore;

export const closeVectorStore = async (): Promise<void> => {
	try {
		await client.close();
		console.log("✅ Vector Store connection closed");
	} catch (error) {
		console.error("❌ Error closing Vector Store:", error);
	}
};
