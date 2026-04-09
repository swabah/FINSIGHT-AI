import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchSimilarTransactions } from "./vectorStoreService";
import { stringifyTransactions } from "../utils/transactionStringifier";
import { upsertTransactionChunks } from "./vectorStoreService";
import { getRecentTransactions } from "../utils/transactionSearch";

// Initialize Google Gemini LLM (FREE)
const llm = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
	model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
	temperature: 0.4, // Slightly higher for more natural responses
	maxOutputTokens: 2048, // Increased for detailed responses
});

// RAG Prompt Template - Intelligent & Human-Readable
const RAG_PROMPT = `You are FinSight AI, an expert financial assistant powered by AI. Your goal is to provide clear, insightful, and actionable financial advice based on the user's transaction data.

## User's Transaction Data:
{context}

## User's Question:
{question}

## Response Guidelines:

1. **Be Conversational & Natural**: Write like a knowledgeable financial advisor talking to a friend. Use natural language, not robotic lists.

2. **Provide Specific Numbers**: Always calculate and mention exact amounts, totals, averages, and percentages when relevant.

3. **Structure Your Response**:
   - Start with a direct answer to their question
   - Provide supporting details with specific transaction examples
   - Include insights or patterns you notice
   - End with actionable advice or recommendations

4. **Use Formatting**:
   - Use bullet points for clarity when listing items
   - Use **bold** for important numbers or categories
   - Keep paragraphs short (2-3 sentences max)
   - Use currency symbol (₹) for all amounts

5. **Add Value**:
   - Identify spending patterns or trends
   - Compare categories if relevant
   - Suggest budgeting tips when appropriate
   - Highlight unusual or noteworthy transactions
   - Provide percentage breakdowns when helpful

6. **Be Honest About Limitations**:
   - If data is insufficient, say so clearly
   - Don't make up transactions or amounts not in the data
   - Suggest what additional data would help

## Example Response Style:

"Based on your recent transactions, you spent **₹2,450** on food across **5 transactions** this month. Here's the breakdown:

• **Grocery shopping**: ₹1,200 (49% of food spending)
• **Restaurants**: ₹850 (35%)
• **Coffee shops**: ₹400 (16%)

Your food expenses are slightly higher than average. Consider meal prepping on weekends to reduce restaurant visits - you could save approximately ₹500-700 per month.

Would you like me to analyze any other spending categories?"

Now, respond to the user's question following these guidelines:`;

const prompt = PromptTemplate.fromTemplate(RAG_PROMPT);
const outputParser = new StringOutputParser();

/**
 * Run the complete RAG pipeline
 *
 * @param userId - The user's MongoDB ObjectId
 * @param userQuery - The user's natural language query
 * @returns Object containing the bot response and context used
 */
export const runRAGPipeline = async (
	userId: string,
	userQuery: string,
): Promise<{ response: string; context: string[] }> => {
	try {
		// Step 1: Refresh transaction embeddings (ensure data is up-to-date)
		console.log(`\n🤖 Starting RAG Pipeline for user ${userId}`);
		console.log(`📝 Query: "${userQuery}"`);

		const transactionChunks = await stringifyTransactions(userId);
		console.log(`📊 Found ${transactionChunks.length} transactions to embed`);

		if (transactionChunks.length === 0) {
			return {
				response:
					"You don't have any transaction data yet. Start adding transactions to get personalized financial insights!",
				context: [],
			};
		}

		// Update vector store with latest transactions
		await upsertTransactionChunks(userId, transactionChunks);

		// Step 2: Retrieve - Search for similar transactions
		const similarTransactions = await searchSimilarTransactions(
			userQuery,
			userId,
			10, // Get top 10 most relevant chunks
		);

		if (similarTransactions.length === 0) {
			console.log(
				"⚠️  No similar transactions found in vector store, using fallback...",
			);

			// Fallback: Get recent transactions instead
			const recentTransactions = await getRecentTransactions(userId, 15);

			if (recentTransactions.length === 0) {
				return {
					response:
						"I couldn't find any relevant transactions for your query. Try asking about your spending patterns, specific categories, or recent transactions.",
					context: [],
				};
			}

			console.log(
				`✅ Fallback: Retrieved ${recentTransactions.length} recent transactions`,
			);

			// Use recent transactions as context
			const combinedContext = recentTransactions
				.map((chunk, index) => `${index + 1}. ${chunk}`)
				.join("\n");

			// Generate response with LLM
			const chain = prompt.pipe(llm).pipe(outputParser);
			const botResponse = await chain.invoke({
				context: combinedContext,
				question: userQuery,
			});

			return {
				response: botResponse,
				context: recentTransactions,
			};
		}

		console.log(
			`✅ Retrieved ${similarTransactions.length} relevant transactions`,
		);

		// Extract text from similar transactions
		const contextChunks = similarTransactions.map((result) => result.text);

		// Step 3: Augment - Combine retrieved chunks into context
		const combinedContext = contextChunks
			.map((chunk, index) => `${index + 1}. ${chunk}`)
			.join("\n");

		// Step 4: Generate - Create and invoke the chain
		const chain = prompt.pipe(llm).pipe(outputParser);

		const botResponse = await chain.invoke({
			context: combinedContext,
			question: userQuery,
		});

		return {
			response: botResponse,
			context: contextChunks,
		};
	} catch (error: any) {
		console.error("❌ Error in RAG Pipeline:", error);

		// Provide user-friendly error messages
		if (error.message?.includes("API key")) {
			return {
				response:
					"I'm currently unable to process your query due to a configuration issue. Please contact support.",
				context: [],
			};
		}

		return {
			response:
				"I'm having trouble processing your query right now. Please try again later.",
			context: [],
		};
	}
};
