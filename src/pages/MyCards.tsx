import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  CreditCard, 
  Eye, 
  Share2, 
  Edit, 
  MoreVertical,
  QrCode,
  Download,
  Search,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cardService, type DigitalCard } from '../services/database'
import QRCodeGenerator from '@/components/QRCodeGenerator.tsx'

export default function MyCards() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<DigitalCard[]>([])
  const [filteredCards, setFilteredCards] = useState<DigitalCard[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [])

  useEffect(() => {
    // Filter cards based on search query
    if (searchQuery.trim()) {
      const filtered = cards.filter(card => 
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.company?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCards(filtered)
    } else {
      setFilteredCards(cards)
    }
  }, [cards, searchQuery])

  const loadCards = async () => {
    try {
      const userCards = await cardService.getUserCards()
      setCards(userCards)
    } catch (error) {
      console.error('Failed to load cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await cardService.deleteCard(cardId)
        setCards(prev => prev.filter(card => card.id !== cardId))
      } catch (error) {
        console.error('Failed to delete card:', error)
      }
    }
  }

  const handleToggleActive = async (cardId: string) => {
    try {
      const card = cards.find(c => c.id === cardId)
      if (card) {
        const newActiveState = Number(card.isActive) > 0 ? "0" : "1"
        await cardService.updateCard(cardId, { isActive: newActiveState })
        setCards(prev => prev.map(c => 
          c.id === cardId ? { ...c, isActive: newActiveState } : c
        ))
      }
    } catch (error) {
      console.error('Failed to toggle card status:', error)
    }
  }

  const copyCardLink = (cardId: string) => {
    const url = `${window.location.origin}/card/${cardId}`
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your cards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Cards</h1>
            <p className="text-muted-foreground">
              Manage and share your digital business cards.
            </p>
          </div>
          <Button onClick={() => navigate('/builder')} className="gradient-bg hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4 mr-2" />
            Create New Card
          </Button>
        </div>

        {/* Search Bar */}
        {cards.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="hover-lift">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleActive(card.id)}
                      title={Number(card.isActive) > 0 ? "Deactivate card" : "Activate card"}
                    >
                      {Number(card.isActive) > 0 ? (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCard(card.id)}
                      title="Delete card"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {card.templateId}
                  </Badge>
                  <Badge variant={Number(card.isActive) > 0 ? "default" : "secondary"} className="text-xs">
                    {Number(card.isActive) > 0 ? "Active" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Card Preview */}
                <div 
                  className="p-4 rounded-lg text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${card.backgroundColor} 0%, ${card.accentColor} 100%)` 
                  }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {card.fullName ? card.fullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{card.fullName || 'No name set'}</h3>
                        <p className="text-sm opacity-90">{card.jobTitle || 'No title set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{card.viewCount} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{card.shareCount} shares</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(card.updatedAt)}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/builder?edit=${card.id}`)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/card/${card.id}`)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        title="Generate QR Code"
                      >
                        <QrCode className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>QR Code for {card.name}</DialogTitle>
                      </DialogHeader>
                      <QRCodeGenerator 
                        cardId={card.id}
                        cardUrl={`${window.location.origin}/card/${card.id}`}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyCardLink(card.id)}
                    title="Copy card link"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Card */}
          <Card className="hover-lift border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Create New Card</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Design a new digital business card
              </p>
              <Button onClick={() => navigate('/builder')} className="gradient-bg hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No cards yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first digital business card to start networking
            </p>
            <Button onClick={() => navigate('/builder')} className="gradient-bg hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Card
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {cards.length > 0 && filteredCards.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No cards found</h3>
            <p className="text-muted-foreground mb-6">
              No cards match your search for "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}