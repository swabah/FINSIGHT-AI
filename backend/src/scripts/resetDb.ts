/**
 * DB Reset Script
 * Drops all collections in the FinSight AI database.
 * Run with: npx ts-node --project tsconfig.json src/scripts/resetDb.ts
 * Or: node -e "require('./dist/scripts/resetDb.js')"
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

async function resetDatabase() {
	console.log("🔗 Connecting to MongoDB Atlas...");
	await mongoose.connect(MONGODB_URI);
	console.log("✅ Connected.");

	const db = mongoose.connection.db!;
	const collections = await db.listCollections().toArray();

	if (collections.length === 0) {
		console.log("ℹ️  No collections found — database is already empty.");
	} else {
		for (const col of collections) {
			await db.dropCollection(col.name);
			console.log(`🗑️  Dropped: ${col.name}`);
		}
		console.log(`\n✅ All ${collections.length} collection(s) dropped. Database is clean.`);
	}

	await mongoose.disconnect();
	console.log("🔌 Disconnected.\n");
}

resetDatabase().catch((err) => {
	console.error("❌ Reset failed:", err.message);
	process.exit(1);
});
