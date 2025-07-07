# Agent System Prompt Display in Keryk Sandbox

## Summary
Added the ability to view full agent system prompts in keryk_sandbox, with real data flowing from Curator through the Mentor backend.

## Changes Made

### 1. Created AgentPromptModal Component
- `/src/components/AgentPromptModal.tsx` - Modal to display full system prompts
- Features:
  - Scrollable view for long prompts
  - Copy-to-clipboard functionality
  - Character, word, and line count
  - Styled to match keryk_sandbox theme

### 2. Updated AgentCard Component
- `/src/components/AgentCard.tsx` - Added "View System Prompt" button
- Shows below agent description
- Opens modal when clicked
- Only visible when agent has a system prompt

### 3. Enhanced API Route
- `/app/api/agents/route.ts` - Updated to fetch real data from Curator
- Data flow: Curator → Mentor Backend → Keryk Sandbox
- Tries multiple endpoints in order:
  1. `/api/curator-data/agents` - Real agent data from Curator
  2. `/api/agents` - Mentor agents endpoint
  3. Mock data - Fallback if backend unavailable
- Converts StandardizedAgent format to keryk_sandbox format
- Preserves full system prompts from Curator

## How to Use

1. **View Agent System Prompts:**
   - Navigate to the agents page in keryk_sandbox
   - Look for "View System Prompt" link below each agent description
   - Click to open modal with full prompt

2. **Backend Connection:**
   - Ensure Mentor backend is running on `http://localhost:8080`
   - The app will automatically fetch real agent data from Curator
   - Falls back to mock data if backend is unavailable

## Data Flow

```
Curator (Firebase)
    ↓
Mentor Backend (/api/curator-data/agents)
    ↓
Keryk Sandbox (/api/agents/route.ts)
    ↓
AgentCard Component
    ↓
AgentPromptModal (displays full prompt)
```

## Testing

To verify the system prompts are working:
1. Start the Mentor backend: `cd mentor/packages/backend && npm run dev`
2. Start keryk_sandbox: `cd keryk_sandbox && npm run dev`
3. Navigate to the agents page
4. Click "View System Prompt" on any agent card
5. Should see full prompts (e.g., Lumos agent has 12,371 characters)

## Key Points
- Real agent data from Curator (no mock prompts)
- Full system prompts preserved (including 12k+ character prompts)
- Graceful fallback to mock data if backend unavailable
- Consistent UI/UX with keryk_sandbox design system