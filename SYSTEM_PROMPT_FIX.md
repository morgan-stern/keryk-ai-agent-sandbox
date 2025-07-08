# System Prompt Fix Documentation

## Issue

Agents were not using their system prompts when generating responses. For example, the Adders Expert agent has detailed PTRS eligibility rules in its system prompt, but was not referencing this information when answering questions.

## Root Cause

The chat message route (`/api/agents/[agentId]/message/route.ts`) was only passing the agent's name and description to the OpenAI API, not the full system prompt containing the agent's knowledge.

## Solution

### 1. Updated OpenAI Integration (`/src/lib/openai.ts`)

- Added `systemPrompt` parameter to `generateChatResponse` function
- Added `AgentConfig` interface for model settings
- Now uses the provided system prompt instead of a generic one
- Respects agent-specific settings (model, temperature, maxTokens)

### 2. Updated Message Route (`/app/api/agents/[agentId]/message/route.ts`)

- Fetches full agent data from `/api/agents` endpoint (includes system prompts)
- Passes system prompt to `generateChatResponse`
- Uses agent's configured model, temperature, and token settings
- Added debug logging to track system prompt usage

## Changes Made

### Before
```typescript
// Only used name and description
const aiResponse = await generateChatResponse(
  messages,
  agent.name,
  agent.description
)
```

### After
```typescript
// Now uses full system prompt and agent configuration
const agentConfig: AgentConfig = {
  model: agent.model || 'gpt-4o-mini',
  temperature: agent.temperature ?? 0.7,
  maxTokens: agent.maxTokens || 1000
}

const aiResponse = await generateChatResponse(
  messages,
  agent.name || agent.displayName,
  agent.description,
  agent.systemPrompt, // Full system prompt with knowledge
  agentConfig
)
```

## Testing

Use the provided test script to verify agents are using their system prompts:

```bash
node test-agent-chat.js
```

This script:
1. Fetches the Adders Expert agent
2. Asks about PTRS eligibility (which is detailed in the system prompt)
3. Checks if the response contains expected terms from the prompt
4. Also tests Duke Rules Agent for comparison

## Expected Behavior

When asking the Adders Expert about PTRS eligibility, it should now respond with specific details like:
- Road Types: tertiary, secondary, or primary
- Lanes: ≥ 2
- Speed Limit: ≤ 45 mph
- Centerline: Preferred but not required
- Traffic Volume: Any

## Debug Information

The server console will now log:
- Agent name being used
- System prompt length in characters
- Model being used

Example:
```
Processing message for agent: Adders Expert
System prompt length: 15234 characters
Using model: gpt-4
```

## Notes

- Ensure the Mentor backend is running to get real agent data with system prompts
- Without the backend, mock agents will be used with placeholder prompts
- The fix maintains backward compatibility with agents that don't have system prompts