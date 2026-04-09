import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Initialize MongoDB client
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
	throw new Error("MONGODB_URI is not defined in environment variables");
}

const client = new MongoClient(mongoURI);
const dbName = "finsight-ai";
const collectionName = "transaction_embeddings";

// Initialize Google Gemini embeddings (FREE)
// Official model name from Google AI documentation
const embeddings = new GoogleGenerativeAIEmbeddings({
	apiKey: process.env.GOOGLE_API_KEY,
	modelName: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
});

let vectorStore: MongoDBAtlasVectorSearch | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let collection: any = null;

/**
 * Initialize the vector store and collection
 * Call this once when the application starts
 */
export const initializeVectorStore = async (): Promise<void> => {
	try {
		await client.connect();
		const db = client.db(dbName);
		collection = db.collection(collectionName);

		// Create MongoDB Atlas Vector Search instance
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

/**
 * Upsert transaction chunks into the vector store
 * Deletes old chunks for the user before inserting new ones
 *
 * @param userId - The user's MongoDB ObjectId
 * @param chunks - Array of transaction text strings
 */
export const upsertTransactionChunks = async (
	userId: string,
	chunks: string[],
): Promise<void> => {
	try {
		if (!collection) {
			throw new Error("Vector store not initialized");
		}

		if (chunks.length === 0) {
			console.log("⚠️  No chunks to upsert");
			return;
		}

		console.log(
			`📝 Upserting ${chunks.length} transaction chunks for user ${userId}...`,
		);

		// Delete old chunks for this user
		await collection.deleteMany({ userId });
		console.log(`🗑️  Deleted old chunks for user ${userId}`);

		// Generate embeddings for all chunks
		const documents = chunks.map((chunk, index) => ({
			text: chunk,
			embedding: [] as number[], // Will be filled by vector store
			userId,
			chunkIndex: index,
			timestamp: new Date(),
		}));

		// Add documents to vector store (automatically generates embeddings)
		await vectorStore!.addDocuments(
			documents.map((doc) => ({
				pageContent: doc.text,
				metadata: {
					userId: doc.userId,
					chunkIndex: doc.chunkIndex,
					timestamp: doc.timestamp,
				},
			})),
		);

		console.log(
			`✅ Successfully upserted ${chunks.length} chunks for user ${userId}`,
		);
	} catch (error: any) {
		console.error("❌ Error upserting transaction chunks:", error.message);
		console.error("Full error:", error);
		throw error;
	}
};

/**
 * Search for similar transactions based on query
 *
 * @param query - The user's natural language query
 * @param userId - The user's MongoDB ObjectId (for filtering)
 * @param k - Number of results to return (default: 10)
 * @returns Array of similar transaction documents with text and metadata
 */
export const searchSimilarTransactions = async (
	query: string,
	userId: string,
	k: number = 10,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Array<{ text: string; metadata: Record<string, any> }>> => {
	try {
		if (!vectorStore) {
			throw new Error("Vector store not initialized");
		}

		// Perform similarity search with metadata filter
		console.log(`🔍 Searching for similar transactions for user ${userId}...`);
		const results = await vectorStore.similaritySearchWithScore(query, k, {
			userId, // Filter by user ID
		});

		console.log(`✅ Found ${results.length} similar transactions`);

		// Format results
		const formattedResults = results.map(([doc, score]) => ({
			text: doc.pageContent,
			metadata: {
				...doc.metadata,
				score, // Include similarity score
			},
		}));

		return formattedResults;
	} catch (error: any) {
		console.error("❌ Error searching similar transactions:", error.message);
		console.error("Full error:", error);
		console.log(
			"💡 Tip: Make sure MongoDB Atlas Vector Search index 'vector_index' exists!",
		);
		return [];
	}
};

/**
 * Get the vector store instance
 */
export const getVectorStore = (): MongoDBAtlasVectorSearch | null => {
	return vectorStore;
};

/**
 * Close the MongoDB connection
 * Call this when shutting down the application
 */
export const closeVectorStore = async (): Promise<void> => {
	try {
		await client.close();
		console.log("✅ Vector Store connection closed");
	} catch (error) {
		console.error("❌ Error closing Vector Store:", error);
	}
};
