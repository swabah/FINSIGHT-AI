# FinSight AI Backend

Backend API for FinSight AI - RAG-Driven Personal Finance Manager

## 🚀 Tech Stack

- **Runtime:** Bun
- **Framework:** Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Language:** TypeScript

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection configuration
│   ├── controllers/
│   │   └── authController.ts    # Authentication logic (register, login, getMe)
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── errorHandler.ts      # Error handling middleware
│   ├── models/
│   │   └── User.ts              # User schema with bcrypt hashing
│   ├── routes/
│   │   └── authRoutes.ts        # Authentication routes with validation
│   └── server.ts                # Main Express application
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment variables template
├── package.json
└── tsconfig.json
```

## 🛠️ Getting Started

### Prerequisites

- Bun (v1.0+)
- MongoDB Atlas account

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your MongoDB Atlas connection string and JWT secret.

4. **Run the development server:**
   ```bash
   bun run dev
   ```

   The server will start on `http://localhost:5000` with hot-reload enabled.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server status |
| GET | `/` | API welcome message |

## 🔐 API Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User (Protected Route)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **Input Validation:** express-validator for all inputs
- **CORS Protection:** Configurable CORS policy
- **Error Handling:** Centralized error handling middleware

## 📝 User Schema

```typescript
{
  username: String (unique, required, 3-30 chars)
  email: String (unique, required, validated)
  password_hash: String (required, min 6 chars, hashed)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## 🧪 Testing

(Tests will be added in future phases)

## 📜 Scripts

- `bun run dev` - Start development server with hot-reload
- `bun run start` - Start production server
- `bun run build` - Build TypeScript to JavaScript

## 🚧 Next Steps (Phase 2)

- Transaction Management CRUD API
- RAG-Driven Chatbot Integration
- Vector Store Setup
- Financial Analytics Endpoints

## 📄 License

This project is part of FinSight AI - RAG-Driven Personal Finance Manager.
