import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import blink from '@/blink/client'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import CardBuilder from '@/pages/CardBuilder'
import MyCards from '@/pages/MyCards'
import Contacts from '@/pages/Contacts'
import Analytics from '@/pages/Analytics'
import ProfileSettings from '@/pages/ProfileSettings'
import PublicCard from '@/pages/PublicCard'
import QRCodePage from '@/pages/QRCodePage'
import NFCManager from '@/pages/NFCManager'
import EmailSignature from '@/pages/EmailSignature'
import SocialIntegration from '@/pages/SocialIntegration'
import LoadingScreen from '@/components/LoadingScreen'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/card/:cardId" element={<PublicCard />} />
          
          {/* Protected routes */}
          {user ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/builder" element={<CardBuilder />} />
              <Route path="/cards" element={<MyCards />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/qr-codes" element={<QRCodePage />} />
              <Route path="/nfc" element={<NFCManager />} />
              <Route path="/email-signature" element={<EmailSignature />} />
              <Route path="/social" element={<SocialIntegration />} />
              <Route path="/settings" element={<ProfileSettings />} />
            </>
          ) : (
            <Route path="*" element={<LandingPage />} />
          )}
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App