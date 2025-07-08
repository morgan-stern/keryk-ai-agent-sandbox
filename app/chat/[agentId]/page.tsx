import { Suspense } from 'react'
import { EnhancedChatInterface } from '@/components/EnhancedChatInterface'
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
        <EnhancedChatInterface agentId={agentId} />
      </Suspense>
    </div>
  )
}