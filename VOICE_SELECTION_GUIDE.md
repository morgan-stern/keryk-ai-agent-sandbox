# Voice Selection Feature Guide

## Overview

The keryk_sandbox voice agent now supports multiple voice options from OpenAI's realtime API. Users can select from 8 different voices, each with unique characteristics, and their preference is saved for future sessions.

## Available Voices

1. **Alloy** (Default)
   - Gender: Neutral
   - Style: Professional and clear
   - Description: Neutral and balanced

2. **Ash**
   - Gender: Male
   - Style: Friendly and natural
   - Description: Warm and conversational

3. **Ballad**
   - Gender: Female
   - Style: Rich and melodic
   - Description: Expressive and emotive

4. **Coral**
   - Gender: Female
   - Style: Energetic and friendly
   - Description: Bright and cheerful

5. **Echo**
   - Gender: Male
   - Style: Clear and engaging
   - Description: Smooth and versatile

6. **Sage**
   - Gender: Neutral
   - Style: Calm and authoritative
   - Description: Wise and thoughtful

7. **Shimmer**
   - Gender: Female
   - Style: Gentle and warm
   - Description: Soft and soothing

8. **Verse**
   - Gender: Male
   - Style: Confident and expressive
   - Description: Dynamic and articulate

## How to Use

### Selecting a Voice

1. Navigate to any agent that supports voice mode
2. Click the microphone icon to enter voice mode
3. Before connecting, you'll see a "Select Voice" dropdown
4. Click the dropdown to see all available voices
5. Each voice option shows:
   - Voice name
   - Description
   - Style characteristics
   - Gender tag
   - Speaker icon to preview (preview feature planned for future)
6. Click on a voice to select it
7. Your selection is automatically saved

### Voice Persistence

- Your voice preference is saved in localStorage
- The selected voice will be remembered across sessions
- Each browser/device maintains its own preference

### During Voice Chat

- The selected voice name is displayed in the status text (e.g., "Voice chat active (nova)")
- To change voices, you must disconnect and reconnect
- The voice selector is only available when not connected

## Technical Implementation

### Components Added

1. **VoiceSelector Component** (`/src/components/voice/VoiceSelector.tsx`)
   - Dropdown UI for voice selection
   - Shows voice details and characteristics
   - Includes preview button placeholder for future enhancement

### Files Modified

1. **VoiceMode Component** (`/src/components/VoiceMode.tsx`)
   - Added `selectedVoice` state
   - Integrated VoiceSelector component
   - Added localStorage persistence
   - Pass selected voice to useOpenAIRealtime hook

2. **useOpenAIRealtime Hook** (`/src/hooks/useOpenAIRealtime.ts`)
   - Already supported voice parameter
   - Sends voice selection in session configuration

### Data Flow

```
User selects voice → VoiceSelector → VoiceMode state → localStorage
                                                      ↓
                                            useOpenAIRealtime hook
                                                      ↓
                                            OpenAI Realtime API
```

## Future Enhancements

1. **Voice Preview**: Add actual voice samples for each option
2. **Per-Agent Preferences**: Save different voice preferences for different agents
3. **Voice Speed/Pitch**: Add controls for voice speed and pitch if API supports it
4. **Custom Voices**: Support for custom voice models when available

## Testing

1. Start the application:
   ```bash
   npm run dev
   ```

2. Navigate to an agent and enter voice mode
3. Try different voices and verify:
   - Voice selector appears before connection
   - Selected voice is shown in status
   - Preference persists after page reload
   - Different voices sound distinct during conversation

## Notes

- Voice selection is only available before starting a voice chat
- The OpenAI API key must be configured for voice mode to work
- HTTPS is required for voice features on mobile devices