'use client';

import React from 'react';
import { X, MessageSquare, Copy, Check } from 'lucide-react';

interface AgentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  systemPrompt: string;
}

export function AgentPromptModal({
  isOpen,
  onClose,
  agentName,
  systemPrompt
}: AgentPromptModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">System Prompt</h2>
              <p className="text-sm text-text-muted">{agentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-background hover:bg-background-hover border border-border rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-background-hover rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6 max-h-[calc(80vh-80px)]">
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[60vh]">
              {systemPrompt}
            </pre>
          </div>
          
          {/* Metadata */}
          <div className="mt-4 flex gap-4 text-sm text-text-muted">
            <div>
              <span className="font-medium">Characters:</span> {systemPrompt.length.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Words:</span> {systemPrompt.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Lines:</span> {systemPrompt.split('\n').length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}