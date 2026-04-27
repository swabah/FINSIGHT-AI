# 🚀 FinSight AI - Production Deployment Guide

This guide covers deploying both the frontend and backend of FinSight AI to production.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account with Vector Search enabled
- Google Gemini API key
- Vercel account (for deployment)
- Git repository initialized

---

## 🏗️ Backend Deployment (Vercel)

### 1. Environment Setup

Create `backend/.env.production`:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Atlas Connection (replace with your connection string)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finsight-ai?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_production_jwt_key_min_32_chars
JWT_EXPIRE=7d

# Google Gemini API
GOOGLE_API_KEY=your_production_google_api_key
GEMINI_MODEL=gemini-2.0-flash

# Embedding Model
EMBEDDING_MODEL=gemini-embedding-001

# Vector Store
VECTOR_SEARCH_INDEX_NAME=vector_index
TRANSACTION_CHUNK_SIZE=5

# CORS - Add your deployed frontend URL
FRONTEND_URL=https://finsight-ai-frontend-ivory.vercel.app
```

### 2. Build & Test Locally

```bash
# Install dependencies
npm install

# Build the backend
cd backend
npm run build

# Test production build locally
npm start
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

**Or use Vercel Dashboard:**
1. Import your Git repository
2. Set root directory to `backend`
3. Add all environment variables from `.env.production`
4. Deploy

---

## 🎨 Frontend Deployment (Vercel)

### 1. Environment Setup

Create `frontend/.env.production`:

```env
# Production API URL (your deployed backend)
VITE_API_URL=https://finsight-ai-backend-yourusername.vercel.app/api
```

### 2. Build & Test Locally

```bash
cd frontend
npm run build
npm run preview
```

### 3. Deploy to Vercel

The frontend already has `vercel.json` configured. Simply deploy:

```bash
cd frontend
vercel --prod
```

**Or use Vercel Dashboard:**
1. Import your Git repository
2. Set root directory to `frontend`
3. Framework preset: Vite
4. Add `VITE_API_URL` environment variable
5. Deploy

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is at least 32 characters and cryptographically random
- [ ] MongoDB Atlas IP whitelist configured (if not using 0.0.0.0/0)
- [ ] CORS FRONTEND_URL properly set to production domain only
- [ ] Google API key restricted to specific APIs (Gemini, Embeddings)
- [ ] Environment variables NOT committed to Git (all `.env*` files in `.gitignore`)
- [ ] Rate limiting enabled (already configured in server.ts)
- [ ] Helmet security headers enabled (already configured)

---

## 🏥 Health Checks

After deployment, verify:

```bash
# Backend health check
curl https://finsight-ai-backend-yourusername.vercel.app/health

# API root
curl https://finsight-ai-backend-yourusername.vercel.app/
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

---

## 📊 Monitoring

- Vercel Dashboard provides:
  - Function logs
  - Performance metrics
  - Error tracking
  - Bandwidth usage

- MongoDB Atlas Dashboard:
  - Database performance
  - Connection metrics
  - Slow query logs

---

## 🔄 CI/CD Setup (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Verify `FRONTEND_URL` in backend env matches actual frontend URL |
| MongoDB connection fails | Check IP whitelist and connection string |
| Rate limiting too strict | Adjust limits in `server.ts` |
| Build fails | Ensure TypeScript version ^5.8.3 |

---

## 📦 Production Build Commands

```bash
# Full production build
npm run build

# Backend only
npm run build:backend

# Frontend only
npm run build:frontend

# Start production server (after build)
npm run start
```

---

## 🎯 Quick Reference

| Component | Local URL | Production URL |
|-----------|-----------|----------------|
| Frontend | http://localhost:5173 | https://finsight-ai-frontend.vercel.app |
| Backend | http://localhost:5000 | https://finsight-ai-backend.vercel.app |
| API Base | http://localhost:5000/api | https://finsight-ai-backend.vercel.app/api |
