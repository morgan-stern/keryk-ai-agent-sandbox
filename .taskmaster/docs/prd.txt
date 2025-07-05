# Keryk AI Agent Sandbox - Product Requirements Document

## 🎯 Executive Summary

**Product Name**: Keryk AI Agent Sandbox  
**Type**: Lightweight, mobile-friendly web application  
**Purpose**: Demo platform for single agent interactions via text or voice  
**Target**: Demonstration and testing of Keryk AI agents

## 📱 Product Overview

### Vision
A streamlined, mobile-first web application that showcases the power of Keryk AI agents through simple, focused interactions. Users can quickly test agents using either text chat or voice conversations powered by OpenAI's Realtime API.

### Key Principles
- **Simplicity First**: Minimal UI, maximum functionality
- **Mobile Optimized**: Touch-friendly, responsive design
- **Instant Access**: Quick agent selection and immediate interaction
- **Demo Ready**: Perfect for showcasing agent capabilities

## 🏗️ Technical Architecture

### Stack
- **Framework**: Next.js 15 (same as Mentor)
- **UI Components**: Existing Mentor component library
- **Styling**: Tailwind CSS with dark mode default
- **Authentication**: Firebase Auth (shared with Mentor)
- **Database**: Firebase Firestore (read-only agent access)
- **Voice**: OpenAI Realtime API
- **Hosting**: Vercel or similar CDN

### Architecture Pattern
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Browser   │────▶│  Next.js App     │────▶│ Firebase        │
│  (Mobile/Desktop)│     │  (Sandbox)       │     │ (Curator DB)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          │
                        ┌──────────────────┐             │
                        │ OpenAI Realtime  │◀────────────┘
                        │     API          │
                        └──────────────────┘
```

## 🔑 Core Features

### 1. Authentication
- **Firebase Auth** integration (reuse Mentor setup)
- **Anonymous Access** for designated test agent
- **Separate Permissions**: New `sandbox_access` flag in user profile
- **Quick Login**: Email/password only, no social auth

### 2. Agent Discovery
- **Browse All Agents**: Grid/list view with search
- **Search & Filter**: By name, description, or tags
- **Agent Cards**: Show name, description, and available modes (text/voice)
- **Live Sync**: Real-time updates from Curator database

### 3. Chat Interface
- **Single Conversation**: One active chat at a time
- **Mode Toggle**: Switch between text and voice
- **Dark Mode Default**: Optimized for various lighting conditions
- **Mobile Keyboard**: Proper handling of virtual keyboards
- **Message Queue**: Offline messages queued for sending

### 4. Text Chat Mode
- **Simple Input**: Single-line input with send button
- **Message Bubbles**: Clear user/agent distinction
- **Typing Indicators**: Show when agent is processing
- **Auto-scroll**: Keep latest messages visible
- **Copy Support**: Long-press to copy messages

### 5. Voice Chat Mode
- **OpenAI Realtime**: Direct integration
- **Continuous Listening**: No push-to-talk required
- **Voice Activity Detection**: Automatic speech detection
- **Interruption Support**: Natural conversation flow
- **Visual Feedback**: Waveform or pulse animation
- **Mode Indicator**: Clear visual showing voice active

### 6. UI/UX Design
- **Minimal Chrome**: Maximum space for conversation
- **Touch Optimized**: Large tap targets (44px minimum)
- **Responsive Layout**: Works on all screen sizes
- **Fast Transitions**: Native-feeling animations
- **Loading States**: Skeleton screens and progress indicators

## 📐 User Flow

### Initial Experience
1. **Landing Page**: Simple hero with "Try an Agent" CTA
2. **Auth Check**: Anonymous users get test agent access
3. **Agent Selection**: Browse or search for agents
4. **Mode Selection**: Choose text or voice
5. **Start Chatting**: Immediate interaction

### Authenticated Experience
1. **Quick Login**: Email/password
2. **Full Agent Library**: Access all permitted agents
3. **Persistent Selection**: Remember last used agent
4. **Seamless Switching**: Easy agent changes mid-session

## 🎨 Design Specifications

### Color Palette (Dark Mode Default)
```css
--background: #0a0a0a
--foreground: #ffffff
--card: #1a1a1a
--card-hover: #2a2a2a
--primary: #3b82f6 (Keryk Blue)
--primary-hover: #2563eb
--text-muted: #a1a1aa
--border: #27272a
```

### Typography
- **Font**: System fonts for performance
- **Sizes**: 
  - Body: 16px (1rem)
  - Headers: 24px (1.5rem)
  - Small: 14px (0.875rem)

### Spacing
- **Base Unit**: 4px
- **Touch Targets**: Minimum 44px
- **Padding**: 16px mobile, 24px tablet+
- **Message Spacing**: 8px between bubbles

### Components (Reuse from Mentor)
- `Card` - Agent selection cards
- `Button` - Primary actions
- `Input` - Text input
- `Avatar` - Agent/user avatars
- `ScrollArea` - Chat container

## 🔧 Technical Implementation

### File Structure
```
keryk-ai-agent-sandbox/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing/agent selection
│   │   ├── chat/[agentId]/
│   │   │   └── page.tsx          # Chat interface
│   │   ├── api/
│   │   │   ├── agents/route.ts   # Agent listing
│   │   │   └── auth/route.ts     # Auth endpoints
│   │   └── layout.tsx            # Root layout with dark mode
│   ├── components/
│   │   ├── AgentCard.tsx         # Agent selection card
│   │   ├── ChatInterface.tsx     # Main chat component
│   │   ├── TextChat.tsx          # Text mode component
│   │   ├── VoiceChat.tsx         # Voice mode component
│   │   └── ModeToggle.tsx        # Text/voice switcher
│   ├── hooks/
│   │   ├── useAgent.ts           # Agent data hook
│   │   ├── useRealtimeVoice.ts  # OpenAI Realtime hook
│   │   └── useMessageQueue.ts    # Offline queue hook
│   └── lib/
│       ├── firebase.ts           # Firebase setup
│       └── agents.ts             # Agent API functions
├── public/
│   └── manifest.json             # PWA manifest
└── package.json
```

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "firebase": "^11.0.0",
    "openai": "^5.0.0",
    "@keryk-mentor/shared": "workspace:*",
    "tailwindcss": "^3.4.0"
  }
}
```

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Next.js
- [ ] Firebase authentication integration
- [ ] Agent listing from Curator database
- [ ] Basic routing and navigation
- [ ] Dark mode theme implementation

### Phase 2: Text Chat (Week 2)
- [ ] Chat interface component
- [ ] Message handling and display
- [ ] Agent integration (StandardizedAgent)
- [ ] Typing indicators
- [ ] Message queue for offline

### Phase 3: Voice Integration (Week 3)
- [ ] OpenAI Realtime setup
- [ ] Voice UI components
- [ ] Audio permissions handling
- [ ] Voice activity detection
- [ ] Mode switching

### Phase 4: Polish & Deploy (Week 4)
- [ ] Mobile optimizations
- [ ] Performance tuning
- [ ] Error handling
- [ ] Loading states
- [ ] Deployment setup

## 📊 Success Metrics

### Technical Metrics
- **Page Load**: < 2s on 3G
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 200KB gzipped

### User Metrics
- **Time to First Message**: < 10s from landing
- **Mode Switch Time**: < 1s
- **Agent Load Time**: < 2s
- **Voice Latency**: < 500ms

## 🔒 Security Considerations

### Authentication
- Firebase Auth tokens required (except test agent)
- Separate `sandbox_access` permission flag
- No sensitive data storage
- Read-only agent access

### API Security
- Rate limiting on all endpoints
- CORS configured for app domain only
- No conversation persistence
- Sanitized message content

## 📱 Mobile-Specific Features

### Viewport Handling
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
```

### Touch Optimizations
- Disable double-tap zoom
- Fast tap response (touch-action)
- Swipe gestures for mode switching
- Proper keyboard dismissal

### Performance
- Lazy load agent images
- Virtual scrolling for agent list
- Debounced search input
- Minimal re-renders

## 🚫 Out of Scope

### Not Included in V1
- Conversation history/persistence
- Multi-agent conversations
- File uploads/attachments
- User preferences/settings
- Analytics tracking
- Export functionality
- Social sharing
- Push notifications
- Offline agent storage
- Multiple concurrent chats

## 🎯 Definition of Done

### MVP Checklist
- [ ] Users can browse all agents
- [ ] Anonymous access works for test agent
- [ ] Authenticated users can access permitted agents
- [ ] Text chat fully functional
- [ ] Voice chat with OpenAI Realtime working
- [ ] Smooth mode switching
- [ ] Mobile responsive design
- [ ] Dark mode implemented
- [ ] Deployed to production URL
- [ ] Basic error handling
- [ ] Loading states implemented

## 📅 Timeline

**Total Duration**: 4 weeks  
**Start Date**: TBD  
**Target Launch**: TBD

### Week-by-Week
- **Week 1**: Foundation & Setup
- **Week 2**: Text Chat Implementation  
- **Week 3**: Voice Integration
- **Week 4**: Polish & Deploy

## 🤝 Stakeholders

- **Product Owner**: Keryk AI Team
- **Development**: TBD
- **Design**: Use existing Mentor design system
- **QA**: Manual testing on key devices
- **Users**: Demo audience, potential customers

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-07  
**Status**: Ready for Development