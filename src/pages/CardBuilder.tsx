import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Layout, 
  Type, 
  Image, 
  Save, 
  Eye,
  Smartphone,
  Monitor,
  Share2,
  CheckCircle,
  QrCode
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cardService, type DigitalCard } from '../services/database'
import QRCodeGenerator from '@/components/QRCodeGenerator.tsx'
import { NFCSharing } from '@/components/NFCSharing'

interface CardFormData {
  name: string
  fullName: string
  jobTitle: string
  company: string
  email: string
  phone: string
  website: string
  bio: string
  templateId: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

export default function CardBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editCardId = searchParams.get('edit')
  
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    fullName: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    templateId: 'modern',
    backgroundColor: '#2563EB',
    textColor: '#FFFFFF',
    accentColor: '#F59E0B'
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    if (editCardId) {
      loadCardForEditing(editCardId)
    }
  }, [editCardId])

  const loadCardForEditing = async (cardId: string) => {
    try {
      setLoading(true)
      const card = await cardService.getCardById(cardId)
      if (card) {
        setFormData({
          name: card.name,
          fullName: card.fullName || '',
          jobTitle: card.jobTitle || '',
          company: card.company || '',
          email: card.email || '',
          phone: card.phone || '',
          website: card.website || '',
          bio: card.bio || '',
          templateId: card.templateId,
          backgroundColor: card.backgroundColor,
          textColor: card.textColor,
          accentColor: card.accentColor
        })
      }
    } catch (error) {
      console.error('Failed to load card:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      if (editCardId) {
        // Update existing card
        await cardService.updateCard(editCardId, formData)
      } else {
        // Create new card
        await cardService.createCard(formData)
      }
      
      // Show success message and redirect
      navigate('/cards')
    } catch (error) {
      console.error('Failed to save card:', error)
    } finally {
      setSaving(false)
    }
  }

  const templates = [
    { id: 'modern', name: 'Modern', colors: { bg: '#2563EB', accent: '#F59E0B' } },
    { id: 'classic', name: 'Classic', colors: { bg: '#1F2937', accent: '#10B981' } },
    { id: 'creative', name: 'Creative', colors: { bg: '#7C3AED', accent: '#F59E0B' } },
    { id: 'executive', name: 'Executive', colors: { bg: '#0F172A', accent: '#3B82F6' } }
  ]

  const colorSchemes = [
    { bg: '#2563EB', accent: '#F59E0B', name: 'Blue & Amber' },
    { bg: '#10B981', accent: '#F59E0B', name: 'Green & Amber' },
    { bg: '#7C3AED', accent: '#EC4899', name: 'Purple & Pink' },
    { bg: '#DC2626', accent: '#F59E0B', name: 'Red & Amber' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading card...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {editCardId ? 'Edit Card' : 'Card Builder'}
          </h1>
          <p className="text-muted-foreground">
            {editCardId ? 'Update your digital business card' : 'Create and customize your digital business card with our intuitive builder.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Builder Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Type className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Card Name</Label>
                  <Input 
                    id="cardName" 
                    placeholder="My Business Card"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    placeholder="Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    placeholder="Tech Corp"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="https://johndoe.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Brief description about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Design Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {templates.map((template) => (
                      <Button 
                        key={template.id}
                        variant={formData.templateId === template.id ? "default" : "outline"} 
                        size="sm"
                        onClick={() => {
                          handleInputChange('templateId', template.id)
                          handleInputChange('backgroundColor', template.colors.bg)
                          handleInputChange('accentColor', template.colors.accent)
                        }}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Color Scheme</Label>
                  <div className="flex space-x-2 mt-2">
                    {colorSchemes.map((scheme, index) => (
                      <div 
                        key={index}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-md flex"
                        style={{ 
                          background: `linear-gradient(45deg, ${scheme.bg} 50%, ${scheme.accent} 50%)` 
                        }}
                        onClick={() => {
                          handleInputChange('backgroundColor', scheme.bg)
                          handleInputChange('accentColor', scheme.accent)
                        }}
                        title={scheme.name}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editCardId ? 'Update Card' : 'Save Card'}
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/cards')}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview & QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Card Preview</TabsTrigger>
                    <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                    <TabsTrigger value="nfc">NFC Sharing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Live Preview</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant={previewMode === 'mobile' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setPreviewMode('mobile')}
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobile
                        </Button>
                        <Button 
                          variant={previewMode === 'desktop' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setPreviewMode('desktop')}
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          Desktop
                        </Button>
                      </div>
                    </div>
                <div 
                  className="p-8 rounded-lg text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.backgroundColor} 0%, ${formData.accentColor} 100%)` 
                  }}
                >
                  <div 
                    className={`mx-auto bg-white rounded-xl shadow-lg p-6 text-gray-900 ${
                      previewMode === 'mobile' ? 'max-w-sm' : 'max-w-md'
                    }`}
                  >
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">
                          {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold">
                        {formData.fullName || 'Your Name'}
                      </h2>
                      <p className="text-gray-600">
                        {formData.jobTitle || 'Your Job Title'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {formData.company || 'Your Company'}
                      </p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      {formData.email && (
                        <div className="flex items-center">
                          <span className="w-16 text-gray-500">Email:</span>
                          <span>{formData.email}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex items-center">
                          <span className="w-16 text-gray-500">Phone:</span>
                          <span>{formData.phone}</span>
                        </div>
                      )}
                      {formData.website && (
                        <div className="flex items-center">
                          <span className="w-16 text-gray-500">Website:</span>
                          <span className="text-blue-600">{formData.website}</span>
                        </div>
                      )}
                    </div>
                    
                    {formData.bio && (
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-xs text-gray-600">
                          {formData.bio}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-center space-x-4">
                      <Button 
                        size="sm" 
                        className="text-xs"
                        style={{ backgroundColor: formData.backgroundColor }}
                      >
                        Add to Contacts
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
                  </TabsContent>

                  <TabsContent value="qrcode" className="space-y-4">
                    <QRCodeGenerator 
                      cardUrl={editCardId ? `${window.location.origin}/card/${editCardId}` : undefined}
                      defaultData={formData.website || formData.email || ''}
                    />
                  </TabsContent>

                  <TabsContent value="nfc" className="space-y-4">
                    {editCardId ? (
                      <NFCSharing
                        cardId={editCardId}
                        cardUrl={`${window.location.origin}/card/${editCardId}`}
                        cardTitle={formData.name || 'Business Card'}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Save Your Card First</p>
                        <p>NFC sharing will be available after you save your business card.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}