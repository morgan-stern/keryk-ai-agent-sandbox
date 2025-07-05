import { Suspense } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { LoadingScreen } from '@/components/LoadingScreen'

export default function ChatPage({ 
  params 
}: { 
  params: { agentId: string } 
}) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Suspense fallback={<LoadingScreen />}>
        <ChatInterface agentId={params.agentId} />
      </Suspense>
    </div>
  )
}