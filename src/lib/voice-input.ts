// Voice input utility for text chat
export class VoiceInput {
  private recognition: any = null
  private isListening = false
  private onResult?: (transcript: string) => void
  private onError?: (error: string) => void

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'
        
        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          this.onResult?.(transcript)
        }
        
        this.recognition.onerror = (event: any) => {
          this.onError?.(`Speech recognition error: ${event.error}`)
          this.isListening = false
        }
        
        this.recognition.onend = () => {
          this.isListening = false
        }
      }
    }
  }

  setCallbacks(onResult: (transcript: string) => void, onError: (error: string) => void) {
    this.onResult = onResult
    this.onError = onError
  }

  start() {
    if (!this.recognition) {
      this.onError?.('Speech recognition not supported in this browser')
      return
    }

    if (this.isListening) {
      return
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (error) {
      this.onError?.('Failed to start speech recognition')
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  isSupported() {
    return !!this.recognition
  }

  getIsListening() {
    return this.isListening
  }
}

// Whisper API transcription
export async function transcribeWithWhisper(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  
  const response = await fetch('/api/speech-to-text', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('Failed to transcribe audio')
  }
  
  const data = await response.json()
  return data.transcript || ''
}