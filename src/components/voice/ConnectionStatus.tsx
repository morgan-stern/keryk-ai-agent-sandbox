'use client'

import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react'

export type ConnectionState = 'idle' | 'initializing' | 'requesting-permission' | 'connecting' | 'connected' | 'error'

interface ConnectionStatusProps {
  state: ConnectionState
  error?: string | null
}

const connectionSteps = [
  { key: 'initializing', label: 'Initializing...' },
  { key: 'requesting-permission', label: 'Requesting microphone access...' },
  { key: 'connecting', label: 'Connecting to voice service...' },
  { key: 'connected', label: 'Connected' },
]

export function ConnectionStatus({ state, error }: ConnectionStatusProps) {
  const currentStepIndex = connectionSteps.findIndex(step => step.key === state)

  if (state === 'idle') {
    return null
  }

  if (state === 'error' && error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Connection Failed</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {connectionSteps.map((step, index) => {
          const isCompleted = currentStepIndex > index
          const isCurrent = currentStepIndex === index
          const isPending = currentStepIndex < index

          return (
            <div key={step.key} className="flex items-center">
              {/* Step indicator */}
              <div className="relative">
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {isCurrent && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {isPending && (
                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                )}
              </div>

              {/* Connection line */}
              {index < connectionSteps.length - 1 && (
                <div 
                  className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Current step label */}
      <p className="text-sm text-center text-text-muted">
        {connectionSteps[currentStepIndex]?.label || 'Connecting...'}
      </p>
    </div>
  )
}