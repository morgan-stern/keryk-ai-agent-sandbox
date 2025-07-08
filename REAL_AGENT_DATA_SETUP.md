# Setting Up Real Agent Data from Curator

## Overview

The keryk_sandbox application can display real AI agents with full system prompts from Curator, but it requires the Mentor backend to be running and properly configured. Without the backend, you'll see mock agents with placeholder system prompts.

## Current State

When you see system prompts like:
- "[System prompt not available - Mock data. Start Mentor backend to load real agent data from Curator]"

This means the app is using mock data because it cannot connect to the Mentor backend.

## Setup Instructions

### 1. Configure Mentor Backend

First, ensure the Mentor backend has proper Firebase credentials to access Curator:

```bash
cd /Users/morganstern/mentor/packages/backend
cp .env.example .env
```

Edit the `.env` file and add:
- `FIREBASE_PROJECT_ID` - Your Curator Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `FIREBASE_CLIENT_EMAIL` - Service account email

### 2. Start the Mentor Backend

```bash
cd /Users/morganstern/mentor/packages/backend
npm install
npm run dev
```

The backend should start on `http://localhost:8080`

### 3. Start Keryk Sandbox

```bash
cd /Users/morganstern/keryk_sandbox
npm run dev
```

### 4. Verify Real Data is Loading

Run the test script:
```bash
node test-curator-agents.js
```

You should see:
- ✅ Agents loaded from Curator with full system prompts
- Real agent names like "Duke Rules Agent", "Adders Expert", etc.
- System prompts with thousands of characters (not placeholders)

## Data Flow

```
Curator (Firebase)
    ↓
Mentor Backend (:8080)
    ├── /api/curator-data/agents (StandardizedAgent format)
    ↓
Keryk Sandbox (:3000)
    ├── /api/agents (converts to keryk format)
    ↓
UI Components
    └── AgentCard → View System Prompt
```

## Troubleshooting

### No Agents Loading
1. Check Mentor backend is running: `curl http://localhost:8080/health`
2. Check Firebase credentials in Mentor's `.env`
3. Check console logs in both applications

### Still Seeing Mock Data
1. The app tries to fetch from Mentor for 3 seconds before falling back to mocks
2. Check browser DevTools Network tab for failed requests
3. Ensure `NEXT_PUBLIC_MENTOR_BACKEND_URL` is set correctly (defaults to http://localhost:8080)

### Specific Agents Missing
The agents shown depend on what's configured in Curator. Common agents include:
- Test Knowledge Assistant
- MUTCD TA Specialist  
- Adders Expert
- Duke Rules Agent
- Lumos Validation Expert

## Mock vs Real Data

### Mock Data (Default)
- 5 predefined agents
- Placeholder system prompts
- Always available (no backend needed)
- Good for UI development

### Real Data (With Mentor Backend)
- Dynamic agents from Curator
- Full system prompts (can be 10,000+ characters)
- Requires backend configuration
- Production-ready data

## Environment Variables

### Keryk Sandbox
```bash
# Optional - defaults to http://localhost:8080
NEXT_PUBLIC_MENTOR_BACKEND_URL=http://localhost:8080
```

### Mentor Backend
```bash
# Required for Curator access
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
```

## API Endpoints

### Mentor Backend
- `GET /api/curator-data/agents` - Returns StandardizedAgent format
- `GET /api/agents` - Legacy endpoint (also works)

### Keryk Sandbox  
- `GET /api/agents` - Returns keryk agent format
  - First tries Mentor backend
  - Falls back to mock data if unavailable

## Next Steps

Once real data is loading:
1. Use the "View System Prompt" buttons to see full agent prompts
2. Test voice mode with different agents
3. Verify agent capabilities and tools are properly displayed