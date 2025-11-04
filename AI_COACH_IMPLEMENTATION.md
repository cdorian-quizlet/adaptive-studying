# AI Coach Implementation Guide

## Overview

The AI Coach feature has been implemented to provide an in-app chat experience powered by your custom GPT. Users can ask questions and get intelligent responses directly within the application.

## Features

### 1. **Initial Entry Screen**
- Three quick action buttons: "Help me cram", "Quiz me", "Prep for an exam"
- Clicking any button prefills the input with a predefined prompt
- Clean, modern UI with 2-column grid layout
- Bottom input field for custom questions

### 2. **Chat Interface**
- Seamless transition from initial view to chat view
- Message bubbles with distinct styling for user and AI
- Typing indicator while waiting for AI response
- Smooth animations and transitions
- Auto-scroll to latest message
- Message history preserved during conversation

### 3. **Navigation**
- Menu button allows returning to initial view
- Confirmation dialog if conversation history exists
- Back button works appropriately in both views

## Architecture

### Frontend (`html/ai-coach.html`, `js/ai-coach.js`, `css/ai-coach-styles.css`)

**Flow:**
1. User clicks action button or types question
2. Input is prefilled (if action button) or submitted
3. View transitions from initial to chat
4. User message appears in chat
5. Typing indicator shows
6. API call to backend
7. AI response appears in chat
8. User can continue conversation

**Key Functions:**
- `handleStudyOptionClick()` - Prefills input with prompts
- `handleSubmitQuestion()` - Processes user input
- `switchToChatView()` - Transitions to chat interface
- `addMessageToChat()` - Adds messages to chat
- `sendMessageToAI()` - Makes API call to backend
- `showTypingIndicator()` / `removeTypingIndicator()` - Loading states

### Backend (`api/ai-coach-endpoint.js`)

**Stack:**
- Node.js + Express
- OpenAI SDK
- CORS for cross-origin requests
- Environment variables for API keys

**Endpoint:**
```
POST /api/ai-coach
Body: { message: string, history: array }
Response: { response: string, success: boolean }
```

**Features:**
- Maintains conversation context
- Uses custom GPT (g-68ffcaf103708191a8bf9be92609f4d9)
- Error handling
- Health check endpoint

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd api
npm install
```

This installs:
- express
- openai
- dotenv
- cors

### 2. Configure Environment

Create `api/.env`:
```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

### 3. Start Backend Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Update Frontend API URL (if needed)

If your backend runs on a different URL, update in `js/ai-coach.js`:

```javascript
const response = await fetch('http://your-backend-url/api/ai-coach', {
  // ...
});
```

## Customization

### Modify Prefilled Prompts

In `js/ai-coach.js`:

```javascript
switch(action) {
    case 'cram':
        promptText = 'Your custom prompt here';
        break;
    // ...
}
```

### Adjust AI Behavior

In `api/ai-coach-endpoint.js`:

```javascript
messages.push({
    role: 'system',
    content: 'Your custom system message here'
});

// Or adjust parameters
const completion = await openai.chat.completions.create({
    model: CUSTOM_GPT_ID,
    messages: messages,
    temperature: 0.7,      // Creativity (0-1)
    max_tokens: 1000,      // Response length
});
```

### Style Customization

All styles in `css/ai-coach-styles.css`:
- `.chat-message.user` - User message styling
- `.chat-message.assistant` - AI message styling
- `.typing-indicator` - Loading animation
- Colors, spacing, animations all customizable

## Deployment

### Backend Options

1. **Vercel** (Recommended for Next.js/Node.js)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Heroku**
   ```bash
   heroku create
   git push heroku main
   ```

3. **Railway**
   - Connect GitHub repo
   - Auto-deploys on push

4. **AWS Lambda + API Gateway**
   - Serverless deployment
   - Use AWS SAM or Serverless Framework

### Production Considerations

1. **CORS** - Restrict to your domain:
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

2. **Rate Limiting** - Add rate limiting:
   ```bash
   npm install express-rate-limit
   ```

3. **Authentication** - Add API key validation if needed

4. **Error Monitoring** - Integrate Sentry or similar

5. **Caching** - Cache responses for common questions

## Troubleshooting

### API Call Fails

1. Check backend is running: `curl http://localhost:3000/health`
2. Verify OPENAI_API_KEY in .env
3. Check browser console for CORS errors
4. Verify network tab in DevTools

### No Response from AI

1. Check OpenAI API key is valid
2. Verify custom GPT ID is correct
3. Check OpenAI API status
4. Review backend logs for errors

### Messages Not Appearing

1. Check browser console for errors
2. Verify DOM elements exist (chatMessages div)
3. Check CSS display properties
4. Test with browser DevTools

## Future Enhancements

- [ ] Markdown rendering in AI responses
- [ ] Code syntax highlighting
- [ ] Voice input/output
- [ ] Save conversation history
- [ ] Share conversations
- [ ] Multi-language support
- [ ] Image upload support
- [ ] Suggested follow-up questions
- [ ] Rich media responses (images, diagrams)
- [ ] Study plan generation from conversations

## Files Modified/Created

### Modified
- `html/ai-coach.html` - Added chat interface
- `js/ai-coach.js` - Added chat logic and API integration
- `css/ai-coach-styles.css` - Added chat styling
- `js/script.js` - Updated FAB to navigate to AI coach

### Created
- `api/ai-coach-endpoint.js` - Backend API server
- `api/package.json` - Node.js dependencies
- `api/.gitignore` - Ignore sensitive files
- `api/README.md` - Backend setup instructions
- `AI_COACH_IMPLEMENTATION.md` - This file

## Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs
3. Verify environment variables
4. Test API endpoint directly with Postman/cURL
5. Check OpenAI API documentation

## License

Same as parent project.

