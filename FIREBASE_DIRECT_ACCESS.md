# Firebase Direct Access Implementation

## Overview

The keryk_sandbox now fetches agent data directly from Firebase's `standardizedAgents` collection, removing the dependency on the Mentor backend for agent definitions.

## Benefits

1. **No Mentor Backend Required**: Agent data loads directly from Firebase
2. **Faster Response Times**: Direct access eliminates proxy overhead
3. **Better Reliability**: No dependency on another service being running
4. **Full System Prompts**: All agent prompts are loaded from Curator

## Data Flow

### Previous Flow (via Mentor)
```
keryk_sandbox → Mentor Backend → Firebase → keryk_sandbox
```

### New Flow (Direct)
```
keryk_sandbox → Firebase
```

## Implementation Details

### 1. Firebase Configuration

The app uses Firebase Admin SDK with service account credentials:

```typescript
// src/lib/firebase-admin.ts
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  // ... other fields
}
```

### 2. Agent Fetching

Two new functions handle direct Firebase access:

```typescript
// src/lib/firebase-agents.ts
export async function getAgentsFromFirebase(): Promise<KerykAgent[]>
export async function getAgentFromFirebase(agentId: string): Promise<KerykAgent | null>
```

### 3. Data Conversion

The functions convert from StandardizedAgent format (Curator) to KerykAgent format:

```typescript
// StandardizedAgent → KerykAgent
{
  name: agent.name → displayName: agent.name,
  configuration.systemPrompt → systemPrompt,
  configuration.model → model,
  configuration.temperature → temperature,
  configuration.maxTokens → maxTokens,
  metadata.enabled → isActive,
  // ... etc
}
```

### 4. API Routes

Both API routes now use Firebase as the primary source:

- `/api/agents` - Lists all agents
- `/api/agents/[agentId]/message` - Chat with specific agent

### 5. Fallback Behavior

If Firebase fails, the system falls back to Mentor backend:

1. Try Firebase direct access
2. If fails, try Mentor backend
3. If both fail, return empty/error

## Testing

To verify Firebase direct access is working:

```bash
# Start only keryk_sandbox (no Mentor backend needed)
cd /Users/morganstern/keryk_sandbox
npm run dev

# Check the console logs - you should see:
# "✅ Successfully loaded X agents directly from Firebase"
```

## Environment Variables

Required in `.env.local`:

```env
# Firebase Admin (for server-side access)
FIREBASE_PROJECT_ID=sme-interview-platform
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-eflrs@sme-interview-platform.iam.gserviceaccount.com

# OpenAI (for chat functionality)
OPENAI_API_KEY=sk-proj-...
```

## Troubleshooting

### "No agents found in Firebase"
- Verify Firebase credentials are correct
- Check that the `standardizedAgents` collection exists
- Ensure service account has read permissions

### "Failed to fetch agent data"
- Check Firebase Admin initialization
- Verify environment variables are loaded
- Check console for specific error messages

### System prompts not showing
- Agents should have `configuration.systemPrompt` field
- Check Firebase console to verify data structure

## Future Improvements

1. **Caching**: Add Redis/memory cache for agent data
2. **Real-time Updates**: Use Firestore listeners for live updates
3. **Batch Operations**: Optimize for multiple agent fetches
4. **Error Recovery**: Enhanced retry logic with exponential backoff