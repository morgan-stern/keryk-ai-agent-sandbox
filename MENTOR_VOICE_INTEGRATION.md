# Mentor Backend Integration for Voice-to-Voice Chat

## Setup Instructions

### 1. Start Mentor Backend

First, ensure Mentor backend is running:

```bash
cd /Users/morganstern/mentor
npm run dev:backend
```

The backend will start on port 8080.

### 2. Configure Keryk Sandbox

Add to `.env.local`:

```bash
NEXT_PUBLIC_MENTOR_BACKEND_URL=http://localhost:8080
```

### 3. How It Works

The integration uses Mentor's existing OpenAI Realtime API infrastructure:

1. **Voice Route Updated**: The `/api/agents/[agentId]/voice` route now proxies to Mentor
2. **Session Creation**: Mentor creates OpenAI Realtime sessions with ephemeral tokens
3. **WebSocket Connection**: Browser connects directly to OpenAI using the token
4. **No Additional Proxy Needed**: Mentor handles all the authentication and session management

### 4. Testing Voice Chat

1. Open http://localhost:3001 (Keryk Sandbox)
2. Click on any agent
3. Click the info button (ℹ️) to see configuration
4. Click the voice mode toggle (🎤)
5. If Mentor backend is running, voice mode will be active\!

### 5. Troubleshooting

**"Voice chat requires Mentor backend" error**:
- Ensure Mentor backend is running on port 8080
- Check that both projects have their dependencies installed
- Verify OPENAI_API_KEY is set in Mentor's `.env`

**Connection refused errors**:
- Check if port 8080 is already in use
- Try `lsof -i :8080` to see what's using the port
- Kill any conflicting processes

**Authentication errors**:
- Mentor backend has authentication middleware
- For development, you may need to bypass auth in Mentor
- Or ensure you have valid Firebase auth tokens

### 6. Architecture Benefits

Using Mentor's backend provides:
- Production-ready OpenAI Realtime integration
- WebSocket infrastructure with Socket.IO
- Multi-agent orchestration capabilities
- Built-in error handling and monitoring
- Session management and security

### 7. Voice Features Available

With this integration, you get:
- Real-time voice-to-voice conversations
- Speech-to-text with voice recording button
- Agent-specific voice personalities
- Seamless switching between text and voice modes
- Full OpenAI Realtime API capabilities

No additional proxy server setup required\!
EOF < /dev/null