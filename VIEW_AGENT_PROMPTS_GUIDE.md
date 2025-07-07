# How to View Agent System Prompts in Keryk Sandbox

## Setup Required

### 1. Start the Mentor Backend (Required for Real Agent Data)
```bash
cd /Users/morganstern/mentor/packages/backend
npm run dev
```
The backend should start on `http://localhost:8080`

### 2. Start Keryk Sandbox
```bash
cd /Users/morganstern/keryk_sandbox
npm run dev
```
The app will start on `http://localhost:3000`

## What I've Added

### Components
1. **AgentPromptModal** (`/src/components/AgentPromptModal.tsx`)
   - Modal component to display full system prompts
   - Includes copy-to-clipboard functionality
   - Shows character/word/line count

2. **Updated AgentCard** (`/src/components/AgentCard.tsx`)
   - Added "View System Prompt" button below agent description
   - Button only shows when agent has a system prompt
   - Clicking opens the modal

### Data Flow Updates
1. **API Route** (`/app/api/agents/route.ts`)
   - Now fetches real agents from Curator via Mentor backend
   - Tries `/api/curator-data/agents` first for real data
   - Falls back to mock data if backend unavailable
   - Preserves full system prompts

2. **useAgentsAPI Hook** (`/src/hooks/useAgentsAPI.ts`)
   - Updated to include `systemPrompt` in agent data
   - Maps from backend format to keryk_sandbox format

3. **Agent Type** (`/src/types/agent.ts`)
   - Added optional `systemPrompt` field

## How to Use

1. **View System Prompts:**
   - Go to the main page (http://localhost:3000)
   - Look for "View System Prompt" link below each agent's description
   - Click to open modal with full prompt
   - Use "Copy" button to copy prompt to clipboard

2. **Verify Real Data:**
   - With Mentor backend running, you should see 5 agents from Curator
   - Lumos Validation Expert should have a 12,371 character prompt
   - Without backend, you'll see mock agents with shorter prompts

## Testing

Run the test script to verify everything is working:
```bash
node test-agent-prompts.js
```

This will show:
- How many agents are loaded
- Whether each agent has a system prompt
- The length of each prompt
- Whether you're getting real data from Curator

## Troubleshooting

1. **No "View System Prompt" button:**
   - Ensure Mentor backend is running
   - Hard refresh the page (Cmd+Shift+R)
   - Check browser console for errors

2. **Only seeing mock agents:**
   - Verify Mentor backend is running on port 8080
   - Check that the backend can access Curator Firebase
   - Look for errors in both frontend and backend logs

3. **TypeScript errors:**
   - Run `npm run type-check` to see any issues
   - Most are minor and won't prevent the app from running

## Key Files Modified
- `/src/components/AgentPromptModal.tsx` (new)
- `/src/components/AgentCard.tsx` 
- `/app/api/agents/route.ts`
- `/src/hooks/useAgentsAPI.ts`
- `/src/types/agent.ts`