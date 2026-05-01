import { MongoClient } from "mongodb";

/**
 * Setup MongoDB Atlas Vector Search Index
 *
 * This script creates the necessary vector search index for the RAG pipeline.
 * Note: This requires MongoDB Atlas M10+ cluster for vector search support.
 *
 * For M0 free tier clusters, you may need to manually create the index via Atlas UI.
 */
export const setupVectorIndex = async (): Promise<void> => {
	try {
		const mongoURI = process.env.MONGODB_URI;
		if (!mongoURI) {
			throw new Error("MONGODB_URI is not defined in environment variables");
		}

		const client = new MongoClient(mongoURI);
		await client.connect();

		const db = client.db("finsight-ai");
		const collection = db.collection("transaction_embeddings");

		const indexName = process.env.VECTOR_SEARCH_INDEX_NAME || "vector_index";

		console.log(`🔍 Checking for vector search index: ${indexName}...`);

		// Try to list existing indexes
		const indexes = await collection.indexes();
		const vectorIndexExists = indexes.some((idx) => idx.name === indexName);

		if (vectorIndexExists) {
			console.log("✅ Vector search index already exists");
		} else {
			console.log("⚠️  Vector search index not found.");
			console.log("\n📋 Manual Setup Required:");
			console.log("1. Go to your MongoDB Atlas dashboard");
			console.log(
				"2. Navigate to Collections > finsight-ai > transaction_embeddings",
			);
			console.log("3. Click 'Create Search Index'");
			console.log("4. Select 'Atlas Vector Search'");
			console.log("5. Use the following index definition:\n");
			console.log(
				JSON.stringify(
					{
						fields: [
							{
								type: "vector",
								path: "embedding",
								numDimensions: 768, // For Google Gemini text-embedding-004
								similarity: "cosine",
							},
							{
								type: "filter",
								path: "userId",
							},
							{
								type: "filter",
								path: "chunkIndex",
							},
						],
					},
					null,
					2,
				),
			);
			console.log("\n6. Name the index: vector_index");
			console.log("7. Click 'Create'");
		}

		await client.close();
	} catch (error: any) {
		console.error("❌ Error setting up vector index:", error.message);
		console.log(
			"\n💡 Tip: You can still use the application. The vector index can be created later via Atlas UI.",
		);
	}
};
