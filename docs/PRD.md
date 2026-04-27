# 📄 Product Requirements Document (PRD)

**Project Name**: FinSight AI: RAG-Driven Personal Finance Manager  
**Developer**: Ahmed Swabah  
**Stack**: MERN (MongoDB, Express, React, Node) + Bun + LangChain  

## 1. Functional Requirements
- **Authentication**: Secure registration and login using JWT and bcrypt.
- **Transaction Management**: Full CRUD operations for income and expenses with category tagging (e.g., Food, Transport, Rent).
- **RAG-Driven Chatbot**: A conversational interface that queries the user's specific transaction history to provide contextual financial advice and insights.
- **Visual Analytics**: Real-time generation of pie charts for spending categories and bar graphs for monthly trends.

## 2. Technical Constraints & Logic
- **The RAG Workflow**: Ingest MongoDB data $\rightarrow$ Stringify records $\rightarrow$ Vector Search (Similarity) $\rightarrow$ LLM Prompting $\rightarrow$ User Response.
- **Performance**: The Dashboard must load in $<2$ seconds; Chatbot responses should complete in $3-5$ seconds.
- **Scalability**: A modular architecture to allow future additions, such as OCR for receipts or Voice Input.

## 3. Data Schema (MongoDB Collections)
- **Users**: `_id`, `username`, `email`, `password_hash`
- **Transactions**: `_id`, `user_id`, `amount`, `type`, `category`, `date`, `description`
- **ChatLogs**: `_id`, `user_id`, `query`, `bot_response`, `timestamp`
- **VectorStore**: `_id`, `content_chunk`, `vector_embedding`
