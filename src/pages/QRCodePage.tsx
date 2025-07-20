import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { QrCode, CreditCard, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cardService, type DigitalCard } from '../services/database'
import QRCodeGenerator from '@/components/QRCodeGenerator.tsx'

export default function QRCodePage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<DigitalCard[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      const userCards = await cardService.getUserCards()
      setCards(userCards)
      if (userCards.length > 0) {
        setSelectedCardId(userCards[0].id)
      }
    } catch (error) {
      console.error('Failed to load cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedCard = cards.find(card => card.id === selectedCardId)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Generate QR codes for your digital business cards and other content.
          </p>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No cards available</h3>
              <p className="text-muted-foreground mb-6">
                Create your first digital business card to generate QR codes
              </p>
              <Button onClick={() => navigate('/builder')} className="gradient-bg hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Card Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Select Business Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a business card" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: card.backgroundColor }}
                            />
                            <span>{card.name}</span>
                            <Badge variant={Number(card.isActive) > 0 ? "default" : "secondary"} className="text-xs">
                              {Number(card.isActive) > 0 ? "Active" : "Draft"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedCard && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: selectedCard.backgroundColor }}
                        >
                          {selectedCard.fullName ? selectedCard.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h3 className="font-medium">{selectedCard.fullName || 'No name set'}</h3>
                          <p className="text-sm text-muted-foreground">{selectedCard.jobTitle || 'No title set'}</p>
                          <p className="text-xs text-muted-foreground">{selectedCard.company || 'No company set'}</p>
                        </div>
                        <div className="ml-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/builder?edit=${selectedCard.id}`)}
                          >
                            Edit Card
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Generator */}
            {selectedCard && (
              <QRCodeGenerator 
                cardId={selectedCard.id}
                cardUrl={`${window.location.origin}/card/${selectedCard.id}`}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}