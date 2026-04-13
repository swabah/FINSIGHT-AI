# RAG Pipeline Setup Guide

## Overview
This guide will help you set up the RAG (Retrieval-Augmented Generation) pipeline for FinSight AI.

## Prerequisites

### 1. Google Gemini API Key (100% FREE)

Both LLM and embeddings use Google Gemini - completely free!

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. **Rate Limits:** 60 requests/min, 1M tokens/day (very generous!)

**No credit card required!**

### 2. MongoDB Atlas Configuration

Your MongoDB Atlas cluster must support Vector Search:
- **M0 Free Tier:** Supports vector search with limitations
- **M10+ (Recommended):** Full vector search support

## Setup Steps

### Step 1: Configure Environment Variables

Edit `backend/.env` file:

```env
# LLM Configuration (Google Gemini - FREE)
GOOGLE_API_KEY=your_actual_google_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Embedding Model Configuration (Google Gemini - FREE)
EMBEDDING_MODEL=models/text-embedding-004
```
# Vector Store Configuration
VECTOR_SEARCH_INDEX_NAME=vector_index
TRANSACTION_CHUNK_SIZE=5
```

### Step 2: Install Dependencies

```bash
cd backend
bun install
```

### Step 3: Start the Server

```bash
bun run dev
```

The server will:
1. Connect to MongoDB
2. Initialize the Vector Store
3. Check for the vector search index
4. Provide instructions if manual setup is needed

### Step 4: Create MongoDB Atlas Vector Search Index

If the automatic check indicates the index doesn't exist, follow these steps:

1. **Go to MongoDB Atlas Dashboard:** https://cloud.mongodb.com
2. **Navigate to Collections:**
   - Select your cluster
   - Click "Collections"
   - Select database: `finsight-ai`
   - Select collection: `transaction_embeddings` (will be created after first use)

3. **Create Search Index:**
   - Click "Create Search Index"
   - Select "Atlas Vector Search"
   - Click "Next"

4. **Configure Index:**
   - Index Name: `vector_index`
   - Database: `finsight-ai`
   - Collection: `transaction_embeddings`

5. **Add Field Mappings:**
   Click "Add Field Mapping" and add these fields:

   **Field 1 (Vector):**
   - Type: `vector`
   - Path: `embedding`
   - Number of Dimensions: `768`
   - Similarity: `cosine`

   **Field 2 (Filter):**
   - Type: `filter`
   - Path: `userId`

   **Field 3 (Filter):**
   - Type: `filter`
   - Path: `chunkIndex`

6. **Create Index:**
   - Review the configuration
   - Click "Create"
   - Wait for index to build (may take a few minutes)

### Step 5: Test the RAG Pipeline

#### 1. Authenticate and Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'
```

Copy the `token` from the response.

#### 2. Add Some Transactions (if you haven't already)

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "type": "expense",
    "category": "CATEGORY_ID_HERE",
    "description": "Grocery shopping",
    "date": "2026-04-05"
  }'
```

#### 3. Test Chat Endpoint

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How much did I spend on food?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "query": "How much did I spend on food?",
    "response": "Based on your transaction history, you spent ₹X on food...",
    "timestamp": "2026-04-09T12:00:00Z"
  }
}
```

#### 4. Get Chat History

```bash
curl -X GET "http://localhost:5000/api/chat/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Example Queries to Try

Once your RAG pipeline is set up, try these queries:

1. "How much did I spend on coffee this month?"
2. "What are my biggest expenses?"
3. "Show me my recent transactions"
4. "How much income did I receive?"
5. "What's my spending pattern on entertainment?"
6. "Give me a summary of my finances"

## Troubleshooting

### Error: "MONGODB_URI is not defined"
- Ensure `.env` file exists and contains `MONGODB_URI`

### Error: "GOOGLE_API_KEY is not defined"
- Add your Google Gemini API key to `.env`
- Get it from https://aistudio.google.com/app/apikey

### Vector Search Index Not Found
- Follow Step 4 above to manually create the index
- Check that the index name matches `VECTOR_SEARCH_INDEX_NAME` in `.env`

### LLM API Errors
- Verify your Google API key is correct
- Check your API quota at https://aistudio.google.com
- Ensure you're using a supported Gemini model

### Vector Search Index Not Building
- Google Gemini embeddings use 768 dimensions (not 1536)
- Make sure the index definition specifies `numDimensions: 768`

### No Relevant Results
- Make sure you have transactions in the database
- The vector index may need time to build (check Atlas dashboard)
- Try different query phrasings

## Cost Estimation

### Development Usage (100 queries/day)
- **Google Gemini LLM:** FREE (60 req/min, 1M tokens/day)
- **Google Gemini Embeddings:** FREE (included in same API key)
- **MongoDB Atlas:** Free (M0 tier)
- **Total:** $0/month 🎉

### Production Usage (1000 queries/day)
- **Google Gemini LLM:** FREE (within limits) or $0.0001/1K tokens if exceeded
- **Google Gemini Embeddings:** FREE (within limits)
- **MongoDB Atlas:** ~$57/month (M10 tier)
- **Total:** ~$57/month

**Student Project:** Completely FREE with Google AI Studio tier!

## Performance Optimization

1. **Transaction Limit:** Currently fetches 100 most recent transactions
2. **Similarity Search:** Returns top 10 most relevant chunks
3. **Embedding Refresh:** Embeddings are updated on each query to ensure freshness
4. **Future Improvements:**
   - Implement caching for frequent queries
   - Add incremental embedding updates
   - Use batch processing for large transaction sets

## Architecture

```
User Query
    ↓
Chat Controller (POST /api/chat)
    ↓
RAG Pipeline Service
    ├── Stringify Transactions → Human-readable text
    ├── Upsert to Vector Store → Generate embeddings (Google Gemini FREE)
    ├── Similarity Search → Retrieve relevant chunks
    └── LLM Generation → Google Gemini (FREE)
    ↓
ChatLog Saved → MongoDB
    ↓
Response to User
```

## Next Steps

- [ ] Add streaming responses for better UX
- [ ] Implement conversation memory (multi-turn context)
- [ ] Add analytics dashboard for chat usage
- [ ] Implement caching for frequent queries
- [ ] Add support for date range filtering
- [ ] Support multiple languages

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas vector search index is properly configured
4. Test API keys with curl/Postman before using the application
