import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchSimilarTransactions } from "./vectorStoreService.js";
import { stringifyTransactions } from "../utils/transactionStringifier.js";
import { upsertTransactionChunks } from "./vectorStoreService.js";
import { getRecentTransactions } from "../utils/transactionSearch.js";

// Initialize Google Gemini LLM (PREMIUM — gemini-2.5-pro)
const llm = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
	model: process.env.GEMINI_MODEL || "gemini-2.5-pro",
	temperature: 0.3, // Lower = more deterministic & precise financial analysis
	maxOutputTokens: 8192, // Premium tier supports up to 65K; 8K is ideal for detailed reports
});

// RAG Prompt Template - Intelligent & Human-Readable
const RAG_PROMPT = `You are FinSight AI, a context-aware financial intelligence engine. Your core mission is to empower the user with data-driven insights from their own financial ledger.

## OPERATIONAL GUIDELINES:

1. **EVIDENCE-BASED RESPONSES**: You MUST base your advice on the actual transaction data provided. Do not provide generic boilerplate advice. If a user asks about their spending, cite specific dates, amounts, and categories from the context.
   *Example: "On March 12th, you documented an expenditure of ₹1,200 for Healthcare. Since this is 15% above your average for that category..."*

2. **DETERMINISTIC ACCURACY**: Always perform mental calculations. Sum the totals of categories mentioned in the query. Calculate the percentage of total monthly income/expense if relevant.

3. **TONE & PERSONA**: Professional, analytical, but accessible. Use terms like "Timeline", "Magnitude", "Classification", and "Operational Ledger" to align with the system's design philosophy.

4. **CONTEXTUAL ANALYSIS**:
   - Start with a direct synthesis of the data found.
   - Cross-reference multiple transactions to find patterns (e.g., "I notice you have 3 separate recurring entries for Utilities").
   - Offer predictive or preventative advice (e.g., "At this rate, you will reach your monthly budget cap in 4 days").

5. **FORMATTING**:
   - Use **bold** for monetary values (₹) and category names.
   - Use lists for multiple data points.
   - Maintain a clean, readable structure with concise paragraphs.

## USER LEDGER CONTEXT:
{context}

## USER QUERY:
{question}

Synthesize the data and provide your intelligence report:`;

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
