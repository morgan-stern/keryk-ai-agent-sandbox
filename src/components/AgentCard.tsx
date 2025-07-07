'use client'

import { useState } from 'react'
import { Mic, MessageSquare, ArrowRight, Sparkles, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/types/agent'
import { AgentPromptModal } from './AgentPromptModal'

interface AgentCardProps {
  agent: Agent & { systemPrompt?: string }
  onClick: () => void
  className?: string
}

export function AgentCard({ agent, onClick, className }: AgentCardProps) {
  const [showPromptModal, setShowPromptModal] = useState(false);

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
        'group relative flex flex-col p-6 bg-card rounded-2xl transition-all duration-300 touch-manipulation tap-highlight-transparent',
        'border border-border hover:border-primary/30',
        'text-left',
        'hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]',
        'hover:bg-gradient-to-br hover:from-card hover:to-card-hover',
        'overflow-hidden',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
      
      {/* Sparkle icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="w-5 h-5 text-primary/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-primary transition-colors duration-300">
            {agent.name}
          </h3>
          <div className="flex gap-1.5 p-2 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
            <MessageSquare className={cn(
              "w-4 h-4 transition-colors duration-300",
              "text-primary"
            )} />
            {agent.voiceEnabled && (
              <Mic className={cn(
                "w-4 h-4 transition-colors duration-300",
                "text-primary"
              )} />
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-text-muted line-clamp-3 font-body leading-relaxed mb-2 flex-grow">
          {agent.description}
        </p>
        
        {/* System Prompt Button */}
        {agent.systemPrompt && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowPromptModal(true);
            }}
            className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 mb-4 transition-colors cursor-pointer"
          >
            <FileText className="h-3 w-3" />
            View System Prompt
          </div>
        )}
        
        {/* Action indicator */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Start chatting
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </button>

    {/* System Prompt Modal */}
    {agent.systemPrompt && (
      <AgentPromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        agentName={agent.name}
        systemPrompt={agent.systemPrompt}
      />
    )}
    </>
  )
}
