# Voice-to-Voice Chat Setup Guide

## Current Status

The Keryk AI Agent Sandbox has **voice infrastructure ready** but requires a WebSocket proxy server to enable real-time voice-to-voice chat.

### ✅ What's Currently Available

1. **Voice Recording to Text** (Working)
   - Click the microphone button in text chat
   - Speak your message
   - It converts to text and sends to the AI
   - AI responds in text
   - Uses browser's Web Speech API

2. **Infrastructure Ready**
   - Voice API endpoint at `/api/agents/[agentId]/voice/route.ts`
   - WebSocket handling code prepared
   - OpenAI Realtime API integration ready
   - Voice mode UI implemented

### ❌ What's Missing: WebSocket Proxy Server

Real-time voice-to-voice chat requires a WebSocket proxy because:
- Browser security prevents direct WebSocket connections to OpenAI
- Need server-side handling of API keys
- Audio streaming requires persistent connection

## How to Enable Voice-to-Voice Chat

### Option 1: Use OpenAI Realtime Console (Recommended for Testing)

1. Clone the OpenAI Realtime Console:
   ```bash
   git clone https://github.com/openai/openai-realtime-console.git
   cd openai-realtime-console
   ```

2. Install and run the relay server:
   ```bash
   npm install
   npm run relay
   ```

3. Update your `.env.local`:
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:8081
   ```

4. The voice mode will automatically work when the relay is running

### Option 2: Deploy Your Own Proxy Server

Create a simple Express.js proxy server that forwards WebSocket messages between the browser and OpenAI's Realtime API.

### Option 3: Use Vercel Edge Functions (Production)

For production deployment, create an Edge Function that handles WebSocket upgrades.

## Testing Voice Features

### Current Voice Recording (Working Now)
1. Open any agent chat
2. Click the microphone button (🎤)
3. Speak your message
4. Button turns red while recording
5. Speech converts to text
6. Send as normal text message

### Future Voice-to-Voice (Requires Proxy)
1. Click the voice/mic toggle in header
2. Enter voice mode interface
3. Real-time conversation with AI
4. No text input needed

## Configuration Details

### Agent Configuration Viewer
Click the info (ℹ️) button in any chat to see:
- System prompt used
- Model configuration (GPT-4o-mini)
- Temperature (0.7)
- Max tokens (500)
- Voice-to-voice status

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your-api-key

# Optional (for voice-to-voice)
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:8081
```

## Troubleshooting

### Voice Recording Not Working
- Check browser permissions for microphone
- Try Chrome/Edge (best support)
- Check console for errors
- Ensure HTTPS in production

### Voice Mode Shows "Coming Soon"
- This is expected without proxy server
- Follow setup instructions above
- Check proxy server is running
- Verify WebSocket URL in env

## Architecture Overview

```
Browser <-> Next.js App <-> WebSocket Proxy <-> OpenAI Realtime API
   |            |                |                     |
   |            |                |                     |
Speech     Voice UI      Handles Auth          AI Voice Model
Input     & Controls       & Relay            (GPT-4 Voice)
```

## Next Steps

1. **For Development**: Use OpenAI Realtime Console relay
2. **For Production**: Deploy custom proxy server
3. **For Testing**: Current voice-to-text is fully functional

The app is designed to automatically enable voice-to-voice chat once a proxy server is available at the configured WebSocket URL.
EOF < /dev/null