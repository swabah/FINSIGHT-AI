


## INDIRA GANDHI NATIONAL OPEN UNIVERSITY
## BCSP – 064

## FINSIGHT AI: RAG-DRIVEN
## PERSONAL FINANCE MANAGER



## BY:
## NAME: AHMEDSWABAH
## ENROLLMENT NO: 2300019823
## UNDER THE GUIDANCE OF:
## AJMAL FAVAS P
## SOFTWARE ENGINEER


Submitted to the School of Computer and Information Sciences, IGNOU
in partial fulfillment of the requirements for the award of the degree

Bachelor’s Computer Applications (BCA)

## 2021


## SCHOOL OF COMPUTER AND INFORMATION SCIENCES INDIRA GANDHI
## NATIONAL OPEN UNIVERSITY MAIDAN GARHI, NEW DELHI-110068



## TABLE OF CONTENTS


## 1. INTRODUCTION 3
## 2. OBJECTIVES 4
## 3. PROJECT CATEGORY 5
## 4. FEASIBILITY STUDY 5
## 5. SYSTEM REQUIREMENTS ANALYSIS 6
- ANALYSIS (Data Flow & ER Diagrams) 8
## 7. PROPOSED SYSTEM DESIGN 11
## 8. DATA STRUCTURE 12
## 9. REPORTS GENERATION 13
## 9. TESTING PROCESS TO BE USED 13
## 10. SOFTWARE AND HARDWARE REQUIREMENTS 14
## 11. PROCESS LOGIC OF KEY MODULES 14
## 12. LIMITATIONS 15
## 13. FUTURE SCOPE 16
## 14. CONCLUSION 16
## 15. BIBLIOGRAPHY 17









## 1. INTRODUCTION
Managing money is one of those things that sounds simple in theory—spend less than you
earn—but is incredibly difficult in practice. As a student, I’ve noticed that most people, myself
included, struggle to keep track of where our money actually goes. We might use a spreadsheet
for a few days, or download a mobile banking app, but these tools have major limitations.
Spreadsheets are tedious and prone to manual errors, while banking apps only show us
transaction histories without telling us what those numbers mean for our financial health.
This project, titled "FinSight AI: RAG-Driven Personal Finance Manager," was born out of
that frustration. I wanted to build a web-based application that doesn't just record expenses but
actively helps the user understand them. The core idea is to combine a standard expense tracker
with the power of Generative AI.
However, standard AI models (like basic DeepSeek) can "hallucinate" or give generic advice that
doesn't apply to the user's specific situation. To solve this, I am using a technique called
Retrieval-Augmented Generation (RAG). This allows the chatbot to look up the user's specific
financial data and general financial guidelines before answering a question.
For example, if a user asks, "Can I afford a vacation?" a standard bot might say, "Yes, vacations
are great!" My system, however, will check the user's savings category, see that they are over
budget for the month, and suggest, "Your travel budget is currently low, maybe wait until next
month."
The project is built using the MERN stack (MongoDB, Express, React, Node.js, and Bun). It
addresses the lack of personalized, conversational insights in current financial tools and aims to
make financial literacy accessible through a friendly chat interface.






## 2. OBJECTIVES
When I started planning this project, I set a few clear goals for myself. I didn't want to just build
a "CRUD" (Create, Read, Update, Delete) app; I wanted to challenge myself with modern tech
stacks.
My primary objectives are:
- Develop a Full-Stack Platform: To build a robust multi-user web application where
users can register, log in, and securely manage their income and expense records.
- Implement RAG Architecture: To integrate a Retrieval-Augmented Generation pipeline
that allows an AI chatbot to answer questions based on the user's specific stored data,
rather than just general knowledge.
- Visual Analytics: To move beyond text by generating dynamic charts (pie charts for
categorization, bar graphs for monthly comparisons) that help users visualize their
financial health instantly.
- Security Best Practices: To ensure that sensitive financial data is protected using
industry-standard encryption (bcrypt for passwords) and secure session management
(JSON Web Tokens).
- SDLC Implementation: To document and execute the entire software development
lifecycle, from requirement gathering to testing, proving the system's reliability for
academic submission.

## 3. PROJECT CATEGORY
Category: AI-Enhanced Web Application Type: Full-Stack Development with NLP Integration
## Domain: Fintech / Personal Finance Management
This project falls under the category of modern web development integrated with AI. Unlike a
static website, this is a dynamic app that processes data in real-time.



## Technologies Used:
● Frontend: React.js (for a component-based, responsive UI).
● Backend: Node.js & Express.js (for handling API requests and business logic).
● Runtime: Bun (utilized for faster package management and script execution).
● Database: MongoDB Atlas (a NoSQL database perfect for storing unstructured chat logs
and structured transaction data).
● AI Engine: LangChain (for managing the RAG pipeline) and a Vector Store (for storing
data embeddings).

## 4. FEASIBILITY STUDY
Before starting development, I analyzed whether this project was realistic given the time and
resources available to a final-year student.
4.1 Technical Feasibility The chosen technology stack (MERN) is JavaScript-based from end to
end. Since I have a background in JavaScript, this reduces the learning curve significantly. The
most complex part is the AI integration. However, by using libraries like LangChain and
pre-trained embedding models (via APIs like Hugging Face or OpenAI), I can implement the
RAG pipeline without needing to train a Large Language Model (LLM) from scratch, which
would be technically impossible on a personal laptop. The system is designed to run on standard
hardware, making it technically feasible.
4.2 Economic Feasibility Budget is a major constraint for academic projects. Fortunately, the
entire software stack is open-source.
● Development Tools: VS Code, Git, and Postman are free.
● Database: MongoDB Atlas offers a generous free tier which is sufficient for this project.
● Hosting: Platforms like Vercel  and Render (for backend) provide free hobby tiers.
● AI Costs: I am utilizing free tiers to keep expenses near zero.



4.3 Operational Feasibility The application is designed to be user-friendly. The interface
mimics familiar apps (like dashboards and chat apps), so users won't need a manual to
understand how to add an expense or ask the chatbot a question. From a maintenance
perspective, the modular code structure ensures that if I need to fix a bug in the "Income"
module, it won't break the "Chatbot" module.

## 5. SYSTEM REQUIREMENTS ANALYSIS
To ensure FinSight AI meets user needs, I have broken down the requirements into clear
categories.
## 5.1 System Users
● The Individual User: The main actor who logs in, adds daily expenses, sets budgets, and
asks the chatbot for advice.
● The System Administrator (Me/Developer): Responsible for maintaining the backend,
ensuring the database is online, and managing API keys.
## 5.2 Functional Requirements
● Authentication: The system must verify user identity. No user should be able to see
another user's financial data.
● Transaction Management: Users must be able to Create, Read, Update, and Delete
(CRUD) transactions. They should be able to tag these with categories (e.g., "Food",
"Transport").
● Context-Aware Chat: When a user asks "How much did I spend on coffee?", the bot
must query the database for transactions tagged "Coffee" or "Food" and sum them up
before answering.
● Dashboard: A visual landing page showing a summary of the current month's
performance.



5.3 Non-Functional Requirements
● Performance: The dashboard should load in under 2 seconds. Chatbot responses should
generate within 3-5 seconds.
● Reliability: The system should handle errors gracefully (e.g., if the AI service is down,
the standard expense tracker should still work).
● Scalability: The code should be written in a way that allows adding new features (like
"Voice Input") later without rewriting the core logic.

- ANALYSIS (Data Flow & ER Diagrams)
## 6.1 Data Flow Diagrams
Level 0 (Context Level): The system acts as a central black box. The User inputs credentials
and financial data; the system outputs authentication tokens, visualization charts, and
AI-generated advice.




Level 1 (Decomposition): The system is split into three core modules:
- Auth Module: Verifies JWT tokens and manages sessions.
- Transaction Manager: Handles CRUD operations for income and expenses.
- RAG Engine: Processes user queries, retrieves relevant transaction chunks, and
generates responses via the LLM.






Level 2 (RAG Logic): Specific to the AI component—User Query → Vector Embedding →
Similarity Search (MongoDB) → LLM Context Window → Final Response.










6.2 Entity Relationship (ER) Model
The system uses a document-oriented approach, but the logical relationships are as follows:
● One-to-Many: One User can have multiple Transactions and Chat Logs.
● Many-to-One: Many Transactions belong to a specific Category.
● Embedding Link: Document Chunks (financial rules) are linked via vector similarity
scores rather than traditional foreign keys.





## 7. PROPOSED SYSTEM DESIGN
I have designed FinSight AI using a modular 3-tier architecture:
- The Client Tier (Frontend) This is what the user sees. Built with React.js, it is a single-page
application (SPA). This means the page doesn't reload every time you click a button; it feels like
a smooth mobile app. I am using libraries like Chart.js here to render the graphs directly in the
browser, reducing the load on the server.
- The Business Logic Tier (Backend) This is the brain of the operation, running on Node.js. It
exposes RESTful API endpoints (like /api/add-expense or /api/chat).
● Security Layer: Before any code runs, a "Middleware" checks if the user has a valid
JWT token. If not, the request is rejected.
● Controller Layer: This sorts the request. If it’s a chat request, it routes it to the AI
module; if it’s a data entry, it routes it to the Database module.
- The Data Tier (Database) I am using MongoDB Atlas. Unlike SQL tables, MongoDB uses
"Collections." This is perfect for my project because financial data can vary (some transactions
might have notes, others won't), and NoSQL handles this flexibility well.

## 8. DATA STRUCTURE
The project utilizes MongoDB, a NoSQL database, to store data in flexible JSON-like
documents. The database design is optimized for fast read/write operations and vector search.
## Key Collections:
- Users: Stores authentication details.
○ Fields: _id, username, email, password_hash, preferences.




- Transactions: The core financial records.
○ Fields: _id, user_id (ref), amount, type (income/expense), category, date,
description.
- Categories: Pre-defined and custom tags for organizing spending.
○ Fields: _id, name, type, color_code (for charts).
- ChatLogs: Stores interaction history for context-aware AI responses.
○ Fields: _id, user_id, query, bot_response, timestamp.
- VectorStore: Stores embeddings for the RAG pipeline.
○ Fields: _id, content_chunk, vector_embedding (array of floats), metadata.

## 9. REPORTS GENERATION
One of the key features of FinSight AI is its ability to turn data into reports.
● Monthly Financial Statement: A summary view that shows Total Income vs. Total
Expense. It calculates the "Savings Rate" (percentage of income saved).
● Category Breakdown: A Pie Chart that visualizes spending. This immediately
highlights issues, such as "Why is 50% of my money going to 'Entertainment'?"
● Chat History: The system keeps a log of advice given by the bot, which users can
review later to see what financial strategies were suggested.

## 10. TESTING PROCESS TO BE USED
Testing is crucial to ensure the app doesn't crash during the demo or corrupt user data.
Unit Testing: I will test individual functions in isolation. For example, I will write a test for the
"Calculate Total" function to ensure that $50 + $50 actually equals $100 and not "5050" (a
common JavaScript string error). Tools: Jest.



Integration Testing: This checks if the frontend talks to the backend correctly. I will use
Postman to send fake data to my API endpoints to see if they save to the database correctly
without using the UI.
System Testing: I will simulate a full user flow: Register -> Login -> Add Expense -> Ask
Chatbot -> Logout. This ensures the session is maintained and cleared correctly.
Edge Case Testing: I will try to "break" the system. What happens if a user enters a negative
number for income? What happens if they ask the chatbot a nonsense question? The system
should handle these without crashing.


## 11. SOFTWARE AND HARDWARE REQUIREMENTS
## Software Requirements:
● Operating System: Windows 10/11, Linux, or macOS.
● Language: JavaScript (ES6+).
● Frameworks: React (Frontend), Express (Backend).
● Database: MongoDB (Cloud-hosted on Atlas).
● Tools: VS Code (Editor), Postman (API Testing), Git (Version Control).
## Hardware Requirements:
● Processor: Intel Core i3 or higher (i5 recommended for smooth emulation).
● RAM: Minimum 4GB (8GB recommended for running React and Node servers
simultaneously).
● Storage: 500MB free space for project files and dependencies.
● Connectivity: Active internet connection is required to fetch data from the MongoDB
cloud and query the AI APIs.




## 12. PROCESS LOGIC OF KEY MODULES
This section details how the code actually works for the most important features.
- Authentication Logic (JWT) When a user signs up, their password is not saved as plain text
(which is dangerous). Instead, I use
bcrypt to scramble it into a "hash." When they log in, the
system hashes the entered password and compares it to the stored hash. If they match, the server
generates a JSON Web Token (JWT). This token is like a digital ID card that the browser shows
for every subsequent request.
- The RAG (Retrieval-Augmented Generation) Workflow This is the core innovation of the
project. Here is the step-by-step logic:
- Ingestion: The user's transaction history is fetched from MongoDB.
- Stringification: The data is converted into a readable text format (e.g., "On Jan 1st, spent
500 on Food").
- Context Retrieval: When the user asks a question, the system searches these text strings
to find relevant data.
- Prompt Engineering: The system creates a prompt for the AI: "You are a financial
assistant. Here is the user's spending data: [Data]. The user asked: [Question]. Answer
based on the data."
- Generation: The AI generates a response, which is sent back to the frontend.
- Analytics Logic The backend uses MongoDB "Aggregation Pipelines." It groups transactions
by category and sums the amounts on the database side. This is much faster than downloading all
transactions to the frontend and calculating them there.






## 13. LIMITATIONS
Every project has room for improvement. The current limitations of FinSight AI include:
● No Bank Sync: Users have to enter data manually. Integrating real bank APIs requires
expensive licenses and security compliances that are out of scope for a student project.
● Internet Dependency: Since the database and AI models are in the cloud, the app does
not work offline.
● Single Currency: Currently, the system assumes all transactions are in one currency
(INR). It does not handle multi-currency conversion.
● Basic AI Memory: The chatbot processes the current query well but doesn't have a
"long-term memory" of conversations from months ago.


## 14. FUTURE SCOPE
There is significant potential to expand this project into a commercial product in the future:
● OCR for Bills: I could integrate a feature where users take a photo of a receipt, and an
AI vision model automatically extracts the date and amount.
● Voice Interface: Adding speech-to-text so users can just say, "Hey FinSight, I just spent
50 rupees on tea," and it gets recorded automatically.
● Investment Tracking: Expanding the database to track stocks, mutual funds, and crypto
assets alongside daily expenses.
● Gamification: Adding badges and leaderboards for users who stick to their budgets,
making finance fun.






## 15. CONCLUSION
FinSight AI represents a modern approach to an age-old problem. By leveraging the power of
the MERN stack and Retrieval-Augmented Generation (RAG), this project moves beyond simple
record-keeping. It provides users with a conversational interface to their own money,
empowering them to make better financial decisions.
Through this project, I have successfully applied the theoretical concepts of Software
Engineering, Database Management, and Artificial Intelligence learned during my BCA course.
It has given me hands-on experience in full-stack development and solved a real-world
problem—financial illiteracy—using technology.
















## 16. BIBLIOGRAPHY

- IGNOU. (2024). BCSP-064 Project Guidelines. Retrieved from https://ignou.ac.in
- MongoDB Inc. (2024). MongoDB Atlas Documentation.
https://www.mongodb.com/docs/atlas/
- React Team. (2024). React: The Library for Web and Native User Interfaces.
https://react.dev
- LangChain. (2024). Introduction to RAG pipelines. https://js.langchain.com/docs/
- Mozilla Developer Network (MDN). (2024). Express.js Framework and Middleware.
https://developer.mozilla.org
- OpenAI. (2024). Prompt Engineering Guide.
https://platform.openai.com/docs/guides/prompt-engineering
- Freeman, A. (2020). Pro MERN Stack: Full Stack Web App Development. Apress.
