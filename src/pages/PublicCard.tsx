import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Share2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  QrCode,
  UserPlus
} from 'lucide-react'
import { cardService, analyticsService, contactService, type DigitalCard } from '../services/database'

export default function PublicCard() {
  const { cardId } = useParams<{ cardId: string }>()
  const navigate = useNavigate()
  const [card, setCard] = useState<DigitalCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingContact, setAddingContact] = useState(false)

  useEffect(() => {
    if (cardId) {
      loadCard(cardId)
    }
  }, [cardId])

  const loadCard = async (id: string) => {
    try {
      const cardData = await cardService.getPublicCard(id)
      if (cardData) {
        setCard(cardData)
        // Record the view
        await analyticsService.recordCardView(id, {
          viewerIp: '', // Would be filled by server in real implementation
          viewerUserAgent: navigator.userAgent,
          referrer: document.referrer
        })
      } else {
        setError('Card not found or not public')
      }
    } catch (error) {
      console.error('Failed to load card:', error)
      setError('Failed to load card')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContact = async () => {
    if (!card) return
    
    try {
      setAddingContact(true)
      await contactService.createContact({
        fullName: card.fullName || 'Unknown',
        email: card.email,
        phone: card.phone,
        company: card.company,
        jobTitle: card.jobTitle,
        website: card.website,
        sourceType: 'card_share',
        sourceCardId: card.id
      })
      
      // Update contact count on card
      await cardService.updateCard(card.id, {
        contactCount: card.contactCount + 1
      })
      
      alert('Contact added successfully!')
    } catch (error) {
      console.error('Failed to add contact:', error)
      alert('Failed to add contact')
    } finally {
      setAddingContact(false)
    }
  }

  const handleShare = async () => {
    if (!card) return
    
    try {
      await analyticsService.recordCardShare(card.id, 'link')
      
      if (navigator.share) {
        await navigator.share({
          title: `${card.fullName}'s Business Card`,
          text: `Check out ${card.fullName}'s digital business card`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading card...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Card Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This card does not exist or is not publicly available.'}
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">CardConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">Digital Business Card</p>
        </div>

        {/* Business Card */}
        <Card className="card-shadow border-0 overflow-hidden">
          {/* Cover Image */}
          <div 
            className="h-32 relative"
            style={{ 
              background: `linear-gradient(135deg, ${card.backgroundColor} 0%, ${card.accentColor} 100%)` 
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <CardContent className="relative -mt-16 pb-8">
            {/* Profile Section */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto bg-gray-200 flex items-center justify-center">
                  {card.profileImageUrl ? (
                    <img
                      src={card.profileImageUrl}
                      alt={card.fullName || 'Profile'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-500">
                      {card.fullName ? card.fullName.charAt(0).toUpperCase() : '?'}
                    </span>
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">
                {card.fullName || 'No name set'}
              </h1>
              <p className="text-lg text-muted-foreground mb-1">
                {card.jobTitle || 'No title set'}
              </p>
              <p className="text-primary font-medium mb-4">
                {card.company || 'No company set'}
              </p>
            </div>

            {/* Bio */}
            {card.bio && (
              <div className="mb-6">
                <p className="text-muted-foreground text-center leading-relaxed">
                  {card.bio}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {card.email && (
                <a 
                  href={`mailto:${card.email}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground">{card.email}</span>
                </a>
              )}
              
              {card.phone && (
                <a 
                  href={`tel:${card.phone}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-foreground">{card.phone}</span>
                </a>
              )}
              
              {card.website && (
                <a 
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-foreground">{card.website}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            {(card.linkedinUrl || card.twitterUrl || card.instagramUrl) && (
              <div className="flex justify-center space-x-4 mb-6">
                {card.linkedinUrl && (
                  <a 
                    href={card.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-500" />
                  </a>
                )}
                {card.twitterUrl && (
                  <a 
                    href={card.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center hover:bg-sky-500/20 transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-sky-500" />
                  </a>
                )}
                {card.instagramUrl && (
                  <a 
                    href={card.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center hover:bg-pink-500/20 transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-pink-500" />
                  </a>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveContact}
                className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
                disabled={addingContact}
              >
                {addingContact ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t text-center">
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <span>{card.viewCount} views</span>
                <span>{card.shareCount} shares</span>
                <span>{card.contactCount} contacts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">
            Powered by CardConnect
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Create Your Own Card
          </Button>
        </div>
      </div>
    </div>
  )
}