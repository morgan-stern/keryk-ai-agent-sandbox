export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted font-body animate-pulse">Loading chat interface...</p>
      </div>
    </div>
  )
}
