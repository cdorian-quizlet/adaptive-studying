# AI Coach Backend API

This directory contains the backend API endpoint for the AI Coach feature, which integrates with OpenAI's custom GPT.

## Setup

### 1. Install Dependencies

```bash
cd api
npm init -y
npm install express openai dotenv cors
```

### 2. Environment Variables

Create a `.env` file in the `api` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 3. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new API key
4. Copy it to your `.env` file

### 4. Run the Server

```bash
node ai-coach-endpoint.js
```

Or use nodemon for development:

```bash
npm install -g nodemon
nodemon ai-coach-endpoint.js
```

## API Endpoints

### POST /api/ai-coach

Send a message to the AI Coach and get a response.

**Request Body:**
```json
{
  "message": "Help me study for my biology exam",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "response": "I'd be happy to help you study for your biology exam...",
  "success": true
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Using Custom GPT

The endpoint is configured to use your custom GPT: `g-68ffcaf103708191a8bf9be92609f4d9-quizlet-ai-coach`

To modify the GPT behavior, you can:
1. Update the system message in `ai-coach-endpoint.js`
2. Adjust the temperature and max_tokens parameters
3. Modify the custom GPT settings in OpenAI's platform

## CORS

The API is configured with CORS to allow requests from your frontend. In production, you should restrict this to your specific domain:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## Deployment

For production deployment, consider:
- Using a process manager like PM2
- Deploying to services like:
  - Vercel
  - Heroku
  - AWS Lambda
  - Railway
  - Render

### Example: Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Update your frontend API URL to the Vercel deployment URL

## Security Notes

- Never commit your `.env` file
- Add `.env` to `.gitignore`
- Use environment variables for all sensitive data
- Implement rate limiting in production
- Add authentication if needed

