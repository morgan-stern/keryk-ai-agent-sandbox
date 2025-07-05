# Voice Features Implementation Roadmap

## Current Status ✅

### Completed
1. **Text Chat with AI Integration**
   - ✅ Real OpenAI GPT-4o-mini responses
   - ✅ Proper error handling and fallbacks
   - ✅ Rate limiting and authentication

2. **Voice Mode UI**
   - ✅ Voice toggle button for all agents
   - ✅ Voice mode interface with status indicators
   - ✅ Proper mode switching

3. **Backend Infrastructure**
   - ✅ OpenAI client configuration
   - ✅ Speech-to-text API endpoint (`/api/speech-to-text`)
   - ✅ Voice recording hooks and utilities

## Implementation Strategy

### Phase 1: Voice Recording in Text Chat (Quick Win)
**Goal**: Allow users to record voice, convert to text, then get text response

#### Files Ready:
- `src/hooks/useVoiceRecording.ts` - Voice recording logic
- `src/lib/voice-input.ts` - Utility classes
- `app/api/speech-to-text/route.ts` - Whisper API endpoint

#### To Complete:
1. **Add voice recording button to ChatInterface**:
   ```tsx
   // Add next to send button
   <VoiceRecordButton 
     onTranscript={(text) => setInputMessage(text)}
     useWhisper={true}
   />
   ```

2. **Two Options**:
   - **Option A**: Browser Speech Recognition (free, works offline)
   - **Option B**: OpenAI Whisper (requires API key, better accuracy)

#### User Flow:
1. User clicks microphone button
2. Records voice message
3. Audio converts to text in input field
4. User can edit text or send directly
5. Agent responds with text

### Phase 2: Voice-to-Voice Chat (Advanced)
**Goal**: Real-time voice conversation with agent

#### Technical Requirements:
1. **WebSocket Proxy Server** (current blocker)
   - OpenAI Realtime API requires server-side authentication
   - Browser WebSocket can't send auth headers
   
2. **Solutions**:
   - **Option A**: Next.js API route with WebSocket upgrade
   - **Option B**: Separate WebSocket server (Socket.io)
   - **Option C**: Use OpenAI's upcoming client-side SDK

#### User Flow:
1. User enables voice mode
2. Real-time audio streaming to OpenAI
3. Agent responds with voice
4. Continuous conversation

## Quick Implementation Guide

### To Add Voice Recording to Text Chat:

1. **Update ChatInterface.tsx**:
```tsx
// Add imports
import { VoiceInput } from '@/lib/voice-input'

// Add state
const [voiceInput] = useState(() => new VoiceInput())
const [isRecording, setIsRecording] = useState(false)

// Add voice recording button
<button
  onClick={() => {
    if (isRecording) {
      voiceInput.stop()
    } else {
      voiceInput.setCallbacks(
        (transcript) => setInputMessage(transcript),
        (error) => console.error(error)
      )
      voiceInput.start()
    }
    setIsRecording(!isRecording)
  }}
  className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white' : 'hover:bg-background'}`}
>
  <Mic className="w-5 h-5" />
</button>
```

2. **Test with OpenAI API key configured in `.env.local`**

### Environment Setup:
```bash
# Copy example file
cp .env.local.example .env.local

# Add your OpenAI API key
OPENAI_API_KEY=sk-your-key-here
```

## Current Files Structure

```
src/
├── hooks/
│   ├── useVoiceRecording.ts     # Voice recording hook (ready)
│   └── useRealtimeVoice.ts      # Voice chat hook (needs proxy)
├── lib/
│   ├── voice-input.ts           # Voice input utilities (ready)
│   └── openai.ts                # OpenAI client (working)
├── components/
│   ├── ChatInterface.tsx        # Main chat (needs voice button)
│   ├── VoiceChat.tsx            # Voice UI components (ready)
│   └── VoiceChatInterface.tsx   # Voice chat wrapper (ready)
└── app/api/
    ├── speech-to-text/route.ts  # Whisper endpoint (working)
    └── agents/[id]/message/     # Text chat endpoint (working)
```

## Testing Checklist

### Text Chat ✅
- [x] Send message → get AI response
- [x] Error handling works
- [x] Proper agent context in responses

### Voice Recording (To Test)
- [ ] Browser speech recognition works
- [ ] Whisper API transcription works
- [ ] Voice button integration
- [ ] Audio permissions handling

### Voice Chat (Future)
- [ ] WebSocket proxy setup
- [ ] Real-time audio streaming
- [ ] Voice response playback

## Browser Support

### Speech Recognition (Built-in)
- ✅ Chrome, Edge, Safari
- ❌ Firefox (limited support)

### Media Recording (For Whisper)
- ✅ All modern browsers
- Requires HTTPS in production

## Production Considerations

1. **API Costs**:
   - Whisper: $0.006 per minute
   - GPT-4o-mini: $0.15 per 1M input tokens

2. **Performance**:
   - Web Speech API: Instant, free
   - Whisper API: ~1-2 second delay, more accurate

3. **Privacy**:
   - Web Speech API: Stays in browser
   - Whisper API: Audio sent to OpenAI