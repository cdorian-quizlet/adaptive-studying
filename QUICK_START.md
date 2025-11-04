# AI Coach Quick Start Guide

## 🎯 Problem & Solution

**The Error:** "Sorry, I encountered an error. Please try again."

**The Fix:** The backend server needs to be running for the AI Coach to work.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd api
npm install
```

This installs:
- `express` - Web server
- `openai` - OpenAI API client
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

### Step 2: Create Environment File

Create a file named `.env` in the `api` folder:

```bash
cd api
touch .env
```

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

**Where to get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key and paste it in your `.env` file

### Step 3: Start the Backend Server

```bash
# From the api directory
npm start

# OR for development with auto-reload
npm run dev
```

You should see:

```
╔════════════════════════════════════════════╗
║   AI Coach API Server                     ║
╚════════════════════════════════════════════╝
✓ Server running on port 3000
✓ API endpoint: http://localhost:3000/api/ai-coach
✓ Health check: http://localhost:3000/health
✓ Model: gpt-4-turbo-preview
✓ OpenAI API Key: ***configured***

Ready to receive requests! 🚀
```

### Step 4: Test It!

Open your app and click the sparkle FAB button. Try asking a question!

---

## 🧪 Testing the Backend

### Test 1: Health Check

Open this in your browser:
```
http://localhost:3000/health
```

You should see: `{"status":"ok"}`

### Test 2: Test API with cURL

```bash
curl -X POST http://localhost:3000/api/ai-coach \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me study for my biology exam",
    "history": []
  }'
```

You should get a JSON response with an AI-generated answer.

### Test 3: Browser Console

Open your browser's developer console (F12) when using the AI Coach. You'll see:
```
Sending message to AI: Help me cram for my upcoming test
API URL: http://localhost:3000/api/ai-coach
Response status: 200
AI Response received: {response: "...", success: true}
```

---

## ❌ Troubleshooting

### Error: "Failed to fetch" or "Make sure the backend server is running"

**Solution:** The backend isn't running. Start it with `npm start` in the `api` folder.

### Error: "OPENAI_API_KEY not found"

**Solution:** Create the `.env` file with your API key:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Error: "Cannot find module 'express'"

**Solution:** Install dependencies:
```bash
cd api
npm install
```

### Error: Port 3000 already in use

**Solution:** Either:
1. Kill the process using port 3000
2. Or change the port in `.env`:
   ```env
   PORT=3001
   ```
   And update `js/ai-coach.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3001';
   ```

### Error: Rate limit or API quota exceeded

**Solution:** 
- Check your OpenAI account has credits
- Wait if you've hit rate limits
- Consider using `gpt-3.5-turbo` instead (cheaper):
  ```javascript
  // In api/ai-coach-endpoint.js
  const MODEL = 'gpt-3.5-turbo';
  ```

---

## 📁 File Structure

```
adaptive-studying/
├── api/
│   ├── ai-coach-endpoint.js    ← Backend server
│   ├── package.json             ← Dependencies
│   ├── .env                     ← Your API key (create this!)
│   └── .gitignore              ← Protects .env
├── js/
│   └── ai-coach.js             ← Frontend logic
├── html/
│   └── ai-coach.html           ← UI
└── css/
    └── ai-coach-styles.css     ← Styling
```

---

## 🔧 Configuration

### Change the AI Model

Edit `api/ai-coach-endpoint.js`:

```javascript
// Cheaper and faster (recommended for testing)
const MODEL = 'gpt-3.5-turbo';

// Most capable (more expensive)
const MODEL = 'gpt-4-turbo-preview';

// Latest GPT-4
const MODEL = 'gpt-4';
```

### Change Backend URL

If deploying to production, update `js/ai-coach.js`:

```javascript
// For local development
const API_BASE_URL = 'http://localhost:3000';

// For production
const API_BASE_URL = 'https://your-backend-url.com';
```

### Customize AI Personality

Edit the system message in `api/ai-coach-endpoint.js` around line 53.

---

## 🚀 Production Deployment

Once it works locally, deploy the backend to:

- **Vercel** (easiest): `vercel deploy`
- **Railway**: Connect GitHub repo
- **Heroku**: `git push heroku main`
- **Render**: Connect repo in dashboard

Then update `API_BASE_URL` in `js/ai-coach.js` to your production URL.

---

## 💰 Cost Estimates

Approximate OpenAI API costs:

- **GPT-3.5-Turbo**: ~$0.001 per conversation (very cheap!)
- **GPT-4-Turbo**: ~$0.01 per conversation
- **GPT-4**: ~$0.03 per conversation

Most testing and low-volume usage costs less than $5/month.

---

## ✅ Checklist

- [ ] Installed Node.js (v18+)
- [ ] Ran `npm install` in api folder
- [ ] Created `.env` file with OpenAI API key
- [ ] Started backend with `npm start`
- [ ] Saw success message in terminal
- [ ] Tested health check endpoint
- [ ] Opened app and clicked FAB
- [ ] Asked AI Coach a question
- [ ] Got a response!

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check backend terminal** for server logs
3. **Verify API key** is correct in `.env`
4. **Test health endpoint** in browser: http://localhost:3000/health
5. **Try GPT-3.5** instead of GPT-4 (faster, cheaper, more reliable for testing)

---

## 📚 Next Steps

Once it's working:
- Customize the AI's personality in the system message
- Add more action buttons in the UI
- Deploy to production
- Add user authentication
- Save conversation history
- Add voice input

Happy studying! 🎓

