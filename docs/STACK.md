# Tech Stack & Architecture

FinSight AI utilizes a robust, modern 3-tier architecture built around the MERN stack and enhanced with cutting-edge tools.

## 🏗️ The 3-Tier Architecture

### 1. Client Tier (Frontend)
- **Framework**: React.js powered by Vite
- **Styling**: Tailwind CSS & Base UI for a clean, responsive component system
- **Routing**: React Router DOM
- **Data Visualization**: Chart.js & react-chartjs-2 for dynamic pie and bar charts
- **API Fetching**: Axios and TanStack React Query for efficient data synchronization

### 2. Business Logic Tier (Backend)
- **Runtime**: Node.js & Bun
- **Server**: Express.js exposing RESTful API endpoints
- **AI Integration**: LangChain & `@langchain/google-genai` for the LLM pipeline
- **Security**: 
  - `bcryptjs` for password hashing
  - `jsonwebtoken` for secure stateless sessions
  - `express-validator` for strict input sanitization

### 3. Data Tier (Database)
- **Database**: MongoDB Atlas (NoSQL)
- **ODM**: Mongoose

## 🗄️ Database Schema

The system uses a document-oriented structure optimized for both fast CRUD operations and vector search:
- **`Users`**: Authentication details (`_id`, `username`, `email`, `password_hash`).
- **`Transactions`**: Core financial records (`_id`, `user_id`, `amount`, `type`, `category`, `date`, `description`).
- **`Categories`**: Spending tags with visual color codes for charts.
- **`ChatLogs`**: Interaction history for maintaining conversation context.
- **`VectorStore`**: Stores content chunks and vector embeddings used by the RAG pipeline.

## ⚙️ Development & Build
The project is configured as an **npm workspace**, allowing seamless dependency management and concurrent execution of both the frontend and backend through a unified set of commands at the root level.
