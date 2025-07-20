import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
        <h2 className="text-lg font-medium text-foreground mb-2">CardConnect</h2>
        <p className="text-sm text-muted-foreground">Loading your digital business cards...</p>
      </div>
    </div>
  )
}