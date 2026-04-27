# 🚀 FinSight AI: RAG-Driven Personal Finance Manager

![FinSight AI](https://img.shields.io/badge/FinSight%20AI-Intelligent%20Finance-00b4d8?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20Bun-success?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-LangChain%20%7C%20Gemini-orange?style=for-the-badge)

**FinSight AI** is a next-generation personal finance manager built to move beyond standard spreadsheet tracking. By combining a modern web dashboard with **Retrieval-Augmented Generation (RAG)**, FinSight AI allows you to converse with your own financial data naturally. 

Ask questions like *"How much did I spend on food this month?"* or *"Am I saving enough for my vacation?"* and receive intelligent, personalized insights instantly.

---

## 📖 Comprehensive Documentation

To dive deeper into the specific mechanics of the platform, check out the dedicated documentation files located in the `/docs` folder:

- 🧠 **[RAG & AI Engine](./docs/RAG-AI.md)**: Deep dive into the Retrieval-Augmented Generation pipeline, vector embeddings, and LangChain integration.
- 🏗️ **[Tech Stack & Architecture](./docs/STACK.md)**: Details on the 3-Tier architecture, MongoDB schemas, and tooling.
- 🎨 **[Design System](./docs/DESIGN.md)**: UI/UX guidelines, color palettes, and component structures.
- 📄 **[Product Requirements Document](./docs/PRD.md)**: Original project objectives, functional requirements, and constraints.

---

## ✨ Key Features

1. **Context-Aware AI Chatbot (RAG)**
   - Powered by Gemini 2.5 Pro and LangChain.
   - Doesn't hallucinate: Responses are strictly generated based on your personal transaction history retrieved via vector similarity search.
   - Fully capable of taking actions: The AI can parse natural language to add expenses, generate charts, and query your balance autonomously.

2. **Smart Transaction Management**
   - Full CRUD functionality for tracking income and expenses.
   - Intelligent auto-categorization.
   - Batch uploading and robust error validation.

3. **Real-time Visual Analytics**
   - Instantly visualize your spending habits.
   - Dynamic pie charts for category breakdowns and bar graphs for monthly cash-flow trends.
   - Ask the AI to "Show me a chart of my expenses," and it renders native UI components on the fly.

4. **Bank-Grade Security**
   - Stateless JWT-based authentication.
   - Strong password hashing with `bcryptjs`.
   - Complete data isolation (AI Vector searches are strictly scoped to the authenticated user ID).

---

## 🛠️ Architecture Overview

FinSight AI utilizes a robust **MERN** stack accelerated by **Bun** for the backend runtime and **Vite** for the frontend. 

- **Frontend**: React.js, Tailwind CSS, Base UI, Chart.js, React Router
- **Backend**: Node.js, Express.js, Bun (Runtime)
- **Database**: MongoDB Atlas (Storage + Vector Store), Mongoose ODM
- **AI Infrastructure**: LangChain, `@langchain/google-genai`
- **Monorepo Management**: NPM Workspaces & Concurrently

---

## 🚀 Getting Started

Follow these steps to run FinSight AI locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Account (with Vector Search capabilities)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Free Tier available)

### 1. Clone & Install
Because the project uses npm workspaces, a single install command at the root will set up both the frontend and backend.
```bash
git clone https://github.com/yourusername/finsight-ai.git
cd finsight-ai
npm install
```

### 2. Configure Environment Variables
You need to set up environment variables for both the frontend and backend.

**Backend (`/backend/.env`)**
Create a `.env` file in the `backend` directory based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finsight-ai?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-2.5-pro
EMBEDDING_MODEL=gemini-embedding-001
VECTOR_SEARCH_INDEX_NAME=vector_index
```

**Frontend (`/frontend/.env`)**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Development Servers
Thanks to `concurrently`, you can boot up both the React frontend and the Express backend with a single command from the root directory:

```bash
npm run dev
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 👨‍💻 Author

**Ahmed Swabah**  
*Developed as a BCA Academic Project for Indira Gandhi National Open University (IGNOU)*

---

## 📜 License

This project is licensed under the MIT License.
