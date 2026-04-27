# Retrieval-Augmented Generation (RAG) & AI Engine

The core innovation of FinSight AI is its context-aware conversational interface. Instead of relying on a standard LLM that provides generic financial advice, FinSight AI implements a **RAG pipeline** to ensure the AI's responses are strictly based on the user's personal financial history.

## 🧠 The RAG Workflow

1. **Data Ingestion**: The user's transaction history is fetched securely from MongoDB.
2. **Stringification**: The structured financial data is converted into natural language chunks (e.g., "On Jan 1st, spent ₹500 on Food").
3. **Embedding & Vector Store**: These text chunks are processed to generate vector embeddings which are stored in the database for semantic similarity matching.
4. **Context Retrieval**: When a user asks a question, the system searches the vector store for the most relevant transaction records.
5. **Prompt Engineering & Tool Binding**: The retrieved context, along with a strictly engineered System Prompt, is passed to the AI (Gemini 2.5 Pro via LangChain). The AI also has access to "tools" (native functions) to execute actions.
6. **Generation**: The AI analyzes the user's prompt, decides whether to fetch more context, add a transaction, or summarize data, and then generates a final response.

## 🛠️ AI Tools (Function Calling)

The AI agent is equipped with several bound tools to perform actions natively without hallucinating data:
- `analyze_finances`: Analyzes spending patterns and performs semantic search over the user's data.
- `batch_add_transactions`: Automatically parses user input to categorize and log income/expenses directly into the database.
- `list_transactions`: Fetches a tabular view of transactions with filters.
- `search_and_request_delete`: Finds transactions matching a query and requests explicit user confirmation before deletion.
- `execute_delete_transaction`: Deletes a confirmed transaction.
- `visualize_finances`: Triggers the UI to render native Pie/Bar charts dynamically based on the AI's request.
- `get_balance`: Instantly computes the user's exact net balance.

## 🔐 Privacy & Security
The RAG pipeline ensures strict data isolation. Context retrieval and vector search are scoped explicitly by `userId`, guaranteeing that the AI never cross-contaminates financial advice or data between different users.
