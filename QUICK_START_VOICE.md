# Quick Start: Voice-to-Voice Chat

## Current Status
- ✅ Info button (ℹ️) is now in chat interface  
- ✅ Voice route updated to use Mentor backend
- ✅ Frontend errors fixed
- ✅ "Loading agents..." issue resolved
- ✅ Default test agents now available

## To Enable Voice-to-Voice Chat:

### 1. Start Mentor Backend (Terminal 1)
```bash
cd /Users/morganstern/mentor
npm run dev:backend
```
Wait for: "🚀 Backend server running on port 8080"

### 2. Configure & Start Keryk Sandbox (Terminal 2)
```bash
cd /Users/morganstern/keryk_sandbox

# Add to .env.local (if not already added):
echo "NEXT_PUBLIC_MENTOR_BACKEND_URL=http://localhost:8080" >> .env.local

# Start the app
npm run dev
```

### 3. Test Voice Features
1. Open http://localhost:3000
2. Click any agent card
3. Click the ℹ️ info button to see agent configuration
4. Click the 🎤 voice toggle button
5. Voice mode should now work\!

## Troubleshooting

**Port conflicts?**
```bash
lsof -i :3000  # Check what's using port 3000
lsof -i :8080  # Check what's using port 8080
```

**Clear Next.js cache if needed:**
```bash
rm -rf .next
npm run dev
```

**Check Mentor has OpenAI key:**
```bash
cd /Users/morganstern/mentor
grep OPENAI_API_KEY .env
```

## What You Get
- Real-time voice-to-voice conversations
- Voice recording button for speech-to-text
- Agent configuration viewer
- No additional proxy setup needed\!
EOF < /dev/null