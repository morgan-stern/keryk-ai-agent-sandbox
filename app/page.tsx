'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LogOut, Sparkles, Zap, AlertCircle } from 'lucide-react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useAgentsAPI } from '@/hooks/useAgentsAPI'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AgentCard } from '@/components/AgentCard'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading, hasSandboxAccess } = useAuthCheck()
  const { agents, loading: agentsLoading, error } = useAgentsAPI()
  const [searchQuery, setSearchQuery] = useState('')
  
  const loading = authLoading || agentsLoading
  
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  const handleAgentSelect = (agentId: string) => {
    router.push(`/chat/${agentId}`)
  }
  
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted font-body">Loading agents...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold font-heading">Unable to load agents</h2>
          <p className="text-text-muted font-body text-sm">
            {error.message || 'An error occurred while loading agents. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium font-body text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Gradient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-border backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Keryk AI Agent Sandbox
                </h1>
                <p className="text-text-muted mt-1 font-body text-sm">
                  {user?.isAnonymous ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Test mode - Limited access
                    </span>
                  ) : (
                    'Select an agent to start your conversation'
                  )}
                </p>
              </div>
            </div>
            {user && (
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm bg-card hover:bg-card-hover border border-border rounded-xl transition-all duration-200 font-body hover:shadow-lg hover:shadow-primary/5"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="font-medium">{user.isAnonymous ? 'Exit Test Mode' : 'Sign Out'}</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="relative container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search agents by name or capability..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-body text-foreground placeholder:text-text-muted/60"
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6 text-sm text-text-muted font-body">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {filteredAgents.length} agents available
            </span>
            {!user?.isAnonymous && (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Full access enabled
              </span>
            )}
          </div>
        </div>
        
        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => handleAgentSelect(agent.id)}
            />
          ))}
        </div>
        
        {filteredAgents.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-card rounded-full mb-4">
              <Search className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-lg text-text-muted font-body">
              No agents found matching "{searchQuery}"
            </p>
            <p className="text-sm text-text-muted/60 mt-2 font-body">
              Try adjusting your search terms
            </p>
          </div>
        )}
        
        {/* Feature hints for anonymous users */}
        {user?.isAnonymous && (
          <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold font-heading mb-2">Want to access all agents?</h3>
            <p className="text-sm text-text-muted font-body mb-4">
              Sign up for a free account to unlock all AI agents and features
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium font-body text-sm"
            >
              Create Account
            </button>
          </div>
        )}
      </main>
    </div>
  )
}