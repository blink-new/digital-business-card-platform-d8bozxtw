import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertCircle,
  History,
  Settings,
  Zap,
  QrCode
} from 'lucide-react'
import { NFCSharing } from '@/components/NFCSharing'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface NFCTag {
  id: string
  name: string
  cardId: string
  cardTitle: string
  cardUrl: string
  createdAt: string
  lastUsed?: string
  isActive: boolean
  writeCount: number
}

interface BusinessCard {
  id: string
  title: string
  name: string
  company: string
  position: string
  email: string
  phone: string
  website: string
  isActive: boolean
}

export default function NFCManager() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nfcTags, setNfcTags] = useState<NFCTag[]>([])
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([])
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  const loadData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Load business cards
      const cardsData = await blink.db.businessCards.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setBusinessCards(cardsData)

      // Load NFC tags
      const tagsData = await blink.db.nfcTags.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setNfcTags(tagsData)

      if (cardsData.length > 0 && !selectedCard) {
        setSelectedCard(cardsData[0])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      })
    }
  }, [user?.id, selectedCard])

  const createNFCTag = async () => {
    if (!selectedCard || !newTagName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a card and enter a tag name.",
        variant: "destructive"
      })
      return
    }

    setIsCreatingTag(true)
    
    try {
      const cardUrl = `${window.location.origin}/card/${selectedCard.id}`
      
      const newTag: Omit<NFCTag, 'id'> = {
        name: newTagName.trim(),
        cardId: selectedCard.id,
        cardTitle: selectedCard.title,
        cardUrl: cardUrl,
        createdAt: new Date().toISOString(),
        isActive: true,
        writeCount: 0,
        userId: user.id
      }

      const createdTag = await blink.db.nfcTags.create(newTag)
      setNfcTags(prev => [createdTag, ...prev])
      setNewTagName('')
      
      toast({
        title: "NFC Tag Created",
        description: `"${newTagName}" has been created and is ready to be written.`,
      })
    } catch (error) {
      console.error('Error creating NFC tag:', error)
      toast({
        title: "Error",
        description: "Failed to create NFC tag. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreatingTag(false)
    }
  }

  const deleteNFCTag = async (tagId: string) => {
    try {
      await blink.db.nfcTags.delete(tagId)
      setNfcTags(prev => prev.filter(tag => tag.id !== tagId))
      
      toast({
        title: "NFC Tag Deleted",
        description: "The NFC tag has been removed from your account.",
      })
    } catch (error) {
      console.error('Error deleting NFC tag:', error)
      toast({
        title: "Error",
        description: "Failed to delete NFC tag. Please try again.",
        variant: "destructive"
      })
    }
  }

  const updateTagWriteCount = async (tagId: string) => {
    try {
      const tag = nfcTags.find(t => t.id === tagId)
      if (!tag) return

      const updatedTag = {
        ...tag,
        writeCount: tag.writeCount + 1,
        lastUsed: new Date().toISOString()
      }

      await blink.db.nfcTags.update(tagId, {
        writeCount: updatedTag.writeCount,
        lastUsed: updatedTag.lastUsed
      })

      setNfcTags(prev => prev.map(t => t.id === tagId ? updatedTag : t))
    } catch (error) {
      console.error('Error updating tag write count:', error)
    }
  }

  const toggleTagStatus = async (tagId: string) => {
    try {
      const tag = nfcTags.find(t => t.id === tagId)
      if (!tag) return

      const updatedTag = { ...tag, isActive: !tag.isActive }
      await blink.db.nfcTags.update(tagId, { isActive: updatedTag.isActive })
      
      setNfcTags(prev => prev.map(t => t.id === tagId ? updatedTag : t))
      
      toast({
        title: updatedTag.isActive ? "Tag Activated" : "Tag Deactivated",
        description: `The NFC tag is now ${updatedTag.isActive ? 'active' : 'inactive'}.`,
      })
    } catch (error) {
      console.error('Error toggling tag status:', error)
      toast({
        title: "Error",
        description: "Failed to update tag status. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to manage your NFC tags.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFC Manager</h1>
        <p className="text-muted-foreground">
          Manage your NFC tags and enable instant business card sharing
        </p>
      </div>

      <Tabs defaultValue="tags" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tags">My NFC Tags</TabsTrigger>
          <TabsTrigger value="write">Write to NFC</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-6">
          {/* Create New Tag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New NFC Tag
              </CardTitle>
              <CardDescription>
                Associate a business card with a new NFC tag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tagName">Tag Name</Label>
                  <Input
                    id="tagName"
                    placeholder="e.g., Office Desk Tag, Conference Badge"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardSelect">Business Card</Label>
                  <select
                    id="cardSelect"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={selectedCard?.id || ''}
                    onChange={(e) => {
                      const card = businessCards.find(c => c.id === e.target.value)
                      setSelectedCard(card || null)
                    }}
                  >
                    <option value="">Select a card...</option>
                    {businessCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.title} - {card.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button 
                onClick={createNFCTag}
                disabled={!selectedCard || !newTagName.trim() || isCreatingTag}
                className="w-full md:w-auto"
              >
                {isCreatingTag ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create NFC Tag
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* NFC Tags List */}
          <div className="grid gap-4">
            {nfcTags.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No NFC Tags Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first NFC tag to start sharing your business cards instantly
                  </p>
                </CardContent>
              </Card>
            ) : (
              nfcTags.map(tag => (
                <Card key={tag.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {tag.isActive ? (
                            <Wifi className="h-5 w-5 text-green-500" />
                          ) : (
                            <WifiOff className="h-5 w-5 text-red-500" />
                          )}
                          <CardTitle className="text-lg">{tag.name}</CardTitle>
                        </div>
                        <Badge variant={tag.isActive ? "default" : "secondary"}>
                          {tag.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTagStatus(tag.id)}
                        >
                          {tag.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNFCTag(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Linked to: {tag.cardTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Writes:</span>
                        <p className="font-medium">{tag.writeCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <p className="font-medium">
                          {tag.lastUsed 
                            ? new Date(tag.lastUsed).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium">
                          {tag.isActive ? 'Ready' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="write" className="space-y-6">
          {selectedCard ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <NFCSharing
                cardId={selectedCard.id}
                cardUrl={`${window.location.origin}/card/${selectedCard.id}`}
                cardTitle={selectedCard.title}
                onNFCWrite={(success) => {
                  if (success) {
                    // Find the tag for this card and update write count
                    const tag = nfcTags.find(t => t.cardId === selectedCard.id)
                    if (tag) {
                      updateTagWriteCount(tag.id)
                    }
                  }
                }}
              />
              <QRCodeGenerator
                url={`${window.location.origin}/card/${selectedCard.id}`}
                title={selectedCard.title}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Card Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Please select a business card to enable NFC writing
                </p>
                {businessCards.length > 0 && (
                  <Button onClick={() => setSelectedCard(businessCards[0])}>
                    Select First Card
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total NFC Tags</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nfcTags.length}</div>
                <p className="text-xs text-muted-foreground">
                  {nfcTags.filter(t => t.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Writes</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nfcTags.reduce((sum, tag) => sum + tag.writeCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all tags
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Used Tag</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nfcTags.length > 0 
                    ? Math.max(...nfcTags.map(t => t.writeCount))
                    : 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {nfcTags.length > 0 
                    ? nfcTags.reduce((max, tag) => 
                        tag.writeCount > max.writeCount ? tag : max
                      ).name
                    : 'No tags yet'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent NFC Activity</CardTitle>
              <CardDescription>
                Latest NFC tag writes and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nfcTags.filter(tag => tag.lastUsed).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No NFC activity yet
                </div>
              ) : (
                <div className="space-y-4">
                  {nfcTags
                    .filter(tag => tag.lastUsed)
                    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
                    .slice(0, 5)
                    .map(tag => (
                      <div key={tag.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Wifi className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">{tag.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {tag.cardTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{tag.writeCount} writes</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tag.lastUsed!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}