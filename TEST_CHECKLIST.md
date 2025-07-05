# Keryk AI Agent Sandbox - Manual Test Checklist

## Setup
1. Open http://localhost:3001 in your browser
2. Open browser developer console (F12) to check for errors

## 1. Landing Page Tests

### Agent Grid Display
- [ ] Verify agents are displayed in a grid layout
- [ ] Check that agent cards show name, description, and avatar
- [ ] Verify "Test Agent" badges appear for test agents
- [ ] Check responsive layout on mobile screen sizes

### Search Functionality
- [ ] Type in search box and verify agents filter in real-time
- [ ] Clear search and verify all agents return
- [ ] Search for non-existent agent and verify no results message

### Authentication
- [ ] Click "Sign In" button (if visible)
- [ ] Verify login modal/page appears
- [ ] Test anonymous access to test agents
- [ ] If logged in, verify access to all agents

## 2. Chat Interface Tests

### Text Chat Mode

#### Initial State
- [ ] Click on an agent card to enter chat
- [ ] Verify chat interface loads with agent name in header
- [ ] Check welcome message appears
- [ ] Verify text input is enabled and focused

#### Sending Messages
- [ ] Type a message and click send
- [ ] Verify message appears in chat with user styling (right-aligned)
- [ ] Check typing indicator appears while waiting for response
- [ ] Verify agent response appears with assistant styling (left-aligned)
- [ ] Test Enter key to send (should work)
- [ ] Test Shift+Enter for new line (should not send)

#### Message Features
- [ ] Double-click a message to copy (desktop)
- [ ] Long-press a message to copy (mobile)
- [ ] Verify timestamps appear on hover
- [ ] Check auto-scroll works when new messages arrive

#### Input Features
- [ ] Type a long message and verify textarea auto-resizes
- [ ] Reach character limit and verify counter appears
- [ ] Send empty message (should not send)
- [ ] Verify input stays focused after sending

#### Offline Handling
- [ ] Turn off internet connection
- [ ] Send a message
- [ ] Verify offline indicator appears
- [ ] Turn internet back on
- [ ] Verify queued messages are sent

### Voice Chat Mode

#### Mode Switching
- [ ] Click voice mode toggle
- [ ] Verify UI switches to voice interface
- [ ] Check that text input disappears
- [ ] Verify voice visualization appears

#### Voice Features (requires microphone)
- [ ] Click connect button
- [ ] Allow microphone permissions when prompted
- [ ] Verify connection status changes to "Connected"
- [ ] Speak and check waveform visualization responds
- [ ] Verify transcript appears for your speech
- [ ] Check agent voice response (if API key configured)

#### Voice Controls
- [ ] Test mute/unmute button
- [ ] Verify mute state is reflected in UI
- [ ] Test disconnect button
- [ ] Verify returns to disconnected state

### Error Handling
- [ ] Simulate API error (disconnect internet after connecting)
- [ ] Verify error message appears
- [ ] Check error auto-dismisses after 5 seconds
- [ ] Verify retry functionality for failed messages

## 3. Navigation Tests

### Back Navigation
- [ ] Click back button in chat header
- [ ] Verify returns to agent selection
- [ ] Navigate to different agent
- [ ] Verify new chat session starts

### Direct URL Access
- [ ] Copy chat URL (e.g., /chat/agent-id)
- [ ] Open in new tab
- [ ] Verify chat loads correctly
- [ ] Test with invalid agent ID

## 4. Responsive Design Tests

### Mobile Layout
- [ ] Test on mobile device or responsive mode
- [ ] Verify touch targets are at least 44px
- [ ] Check that layout adapts properly
- [ ] Test keyboard doesn't cover input on mobile

### Tablet Layout
- [ ] Test on tablet size
- [ ] Verify grid adjusts appropriately
- [ ] Check chat interface uses available space well

## 5. Performance Tests

### Loading States
- [ ] Verify loading screen appears during initial load
- [ ] Check skeleton screens for agent cards (if implemented)
- [ ] Test with slow network (Chrome DevTools)

### Smooth Interactions
- [ ] Verify animations are smooth
- [ ] Check no jank when scrolling messages
- [ ] Test rapid message sending

## Common Issues to Check

1. **Console Errors**: Keep developer console open and check for any red errors
2. **Network Failures**: Check Network tab for failed requests
3. **Memory Leaks**: Use Performance monitor for extended testing
4. **Accessibility**: Test with keyboard navigation only

## Configuration to Verify

- [ ] Firebase configuration is set in `.env.local`
- [ ] OpenAI API key is configured (for voice chat)
- [ ] Test agents are available in Firestore

## Notes Section
Use this space to note any issues found:

---

### Issues Found:
1. ✅ FIXED: Syntax errors with escaped exclamation marks (\!) - Fixed using sed command
2. ✅ FIXED: Missing supportedModes in Firestore documents - Modified agents.ts to default to ['text', 'voice']
3. ✅ FIXED: Voice chat not appearing as option - Now automatically enabled for all agents
4. ✅ FIXED: Text chat placeholder responses - Now uses real OpenAI API integration

### Current Functionality:
1. ✅ **Text Chat**: Fully working with OpenAI GPT-4o-mini integration
2. ✅ **Voice Mode Toggle**: Available for all agents
3. ✅ **Voice Recording in Text Chat**: Browser speech recognition integrated
4. 🔧 **Voice Chat**: Shows "in development" message (requires WebSocket proxy)

### Voice Recording Features:
- 🎤 **Voice Recording Button**: Click microphone next to send button
- 🗣️ **Speech-to-Text**: Uses browser's built-in speech recognition
- ✍️ **Edit Before Send**: Voice converts to text, you can edit then send
- 🔄 **Visual Feedback**: Button turns red and pulses while recording
- ⚠️ **Error Handling**: Shows errors if microphone access denied

### Testing Guide:
1. **Setup**: Ensure OPENAI_API_KEY is configured in .env.local
2. **Text Chat**: Type messages to test AI integration
3. **Voice Recording**: 
   - Click microphone button (🎤)
   - Allow microphone permissions
   - Speak your message
   - Voice converts to text in input field
   - Edit if needed, then send
4. **Browser Support**: Works in Chrome, Edge, Safari (Firefox has limited support) 