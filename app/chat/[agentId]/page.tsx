import { Suspense } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { LoadingScreen } from '@/components/LoadingScreen'

export default async function ChatPage({ 
  params 
}: { 
  params: Promise<{ agentId: string }> 
}) {
  const { agentId } = await params
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Suspense fallback={<LoadingScreen />}>
        <ChatInterface agentId={agentId} />
      </Suspense>
    </div>
  )
}