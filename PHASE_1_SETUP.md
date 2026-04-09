# FinSight AI - Phase 1 Setup Guide

## ✅ Phase 1 Complete: Backend Authentication System

Phase 1 has been successfully implemented with the following components:

### 📦 What's Been Built

1. **Backend Project Structure** ✅
   - Modular architecture with Controllers, Models, Routes, Middleware
   - TypeScript configuration with strict mode
   - Bun runtime setup

2. **Database Configuration** ✅
   - MongoDB Atlas connection with Mongoose
   - Connection pooling and error handling

3. **User Authentication** ✅
   - User Schema with bcrypt password hashing
   - JWT-based session management
   - Secure registration and login APIs
   - Input validation with express-validator

4. **Security Features** ✅
   - Password hashing (bcrypt, 10 salt rounds)
   - JWT token authentication
   - Protected routes middleware
   - CORS configuration
   - Error handling middleware

### 🚀 Quick Start Guide

#### Step 1: Install Bun (if not already installed)

Bun has been installed on your system. To verify:
```bash
bun --version
```

#### Step 2: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

#### Step 3: Configure Environment Variables

Navigate to the backend folder and edit the `.env` file:

```bash
cd backend
```

Update the following in `.env`:

```env
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finsight-ai?retryWrites=true&w=majority

# Change to a secure random string for production
JWT_SECRET=your_super_secret_jwt_key_here
```

**Example:**
```env
MONGODB_URI=mongodb+srv://ahmed:MyPassword123@cluster0.abc123.mongodb.net/finsight-ai?retryWrites=true&w=majority
JWT_SECRET=finsight_super_secret_key_2026_xyz
```

#### Step 4: Start the Development Server

```bash
cd backend
bun run dev
```

You should see:
```
🚀 Server is running on port 5000
📊 Environment: development
🔗 API: http://localhost:5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### 🧪 Testing the API

#### 1. Test Server Health

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-04-09T18:00:00.000Z"
}
```

#### 2. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"email\": \"test@example.com\",
    \"password\": \"password123\"
  }"
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "username": "testuser",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"password123\"
  }"
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "65f1234567890abcdef12345",
    "username": "testuser",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4. Get Current User (Protected Route)

Save the token from login/register response, then:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12345",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-04-09T18:00:00.000Z"
  }
}
```

### 📁 Project Structure

```
FINSIGHT-AI/
├── backend/                    # Backend API (Phase 1 Complete) ✅
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts    # MongoDB connection
│   │   ├── controllers/
│   │   │   └── authController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT verification
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   └── User.ts        # User schema
│   │   ├── routes/
│   │   │   └── authRoutes.ts  # Auth endpoints
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Main app
│   ├── .env                   # Environment vars
│   ├── .env.example           # Template
│   ├── package.json
│   └── README.md
│
├── frontend/                   # Frontend (Phase 2) 🚧
│   └── (To be initialized)
│
└── docs/
    ├── PRD.md
    └── DESIGN.md
```

### 🔐 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Welcome message | No |
| GET | `/health` | Server health check | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### ⚙️ Available Scripts

```bash
bun run dev      # Development with hot-reload
bun run start    # Production mode
bun run build    # TypeScript build
```

### 🛠️ Using Postman/Thunder Client

For easier testing, you can use:
- **Postman**: Import the API endpoints
- **Thunder Client**: VS Code extension
- **Insomnia**: Alternative API client

**Collection Setup:**
1. Base URL: `http://localhost:5000`
2. Create environment variable `token` to store JWT
3. Set Auth header for protected routes: `Authorization: Bearer {{token}}`

### 📝 Validation Rules

**Registration:**
- Username: 3-30 characters, alphanumeric + underscores only
- Email: Valid email format
- Password: Minimum 6 characters, must contain at least one number

**Login:**
- Email: Valid email format
- Password: Required field

### 🚧 Next Steps (Phase 2)

1. **Frontend Setup**
   - Initialize React + Vite project
   - Setup routing and state management
   - Create authentication UI

2. **Backend APIs**
   - Transaction Management (CRUD)
   - Category tagging system
   - Financial analytics endpoints

3. **RAG Integration**
   - LangChain setup
   - Vector store configuration
   - Chatbot API

### 🐛 Troubleshooting

**MongoDB Connection Error:**
- Verify your connection string in `.env`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has read/write permissions

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

**TypeScript Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules
bun install
```

### 📚 Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)

---

**Phase 1 Status: ✅ COMPLETE**

The backend authentication system is fully functional and ready for frontend integration.
