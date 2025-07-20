import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Share2, 
  Link, 
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Globe,
  Video,
  MessageCircle,
  Users,
  BarChart3,
  Zap,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import blink from '@/blink/client'
import { toast } from '@/hooks/use-toast'

interface SocialProfile {
  id: string
  platform: string
  username: string
  url: string
  isActive: boolean
  followers?: number
  lastSync?: string
}

interface SharingSettings {
  autoShare: boolean
  platforms: string[]
  includeQR: boolean
  customMessage: string
}

export default function SocialIntegration() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([])
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    autoShare: false,
    platforms: [],
    includeQR: true,
    customMessage: 'Check out my digital business card!'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newProfile, setNewProfile] = useState({ platform: '', username: '', url: '' })
  const [editingProfile, setEditingProfile] = useState<string | null>(null)

  const socialPlatforms = [
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: 'bg-blue-600',
      baseUrl: 'https://linkedin.com/in/',
      placeholder: 'your-linkedin-username'
    },
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      icon: Twitter, 
      color: 'bg-black',
      baseUrl: 'https://twitter.com/',
      placeholder: 'yourusername'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      baseUrl: 'https://instagram.com/',
      placeholder: 'yourusername'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-blue-500',
      baseUrl: 'https://facebook.com/',
      placeholder: 'your.name'
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: Youtube, 
      color: 'bg-red-500',
      baseUrl: 'https://youtube.com/@',
      placeholder: 'yourchannel'
    },
    { 
      id: 'github', 
      name: 'GitHub', 
      icon: Github, 
      color: 'bg-gray-800',
      baseUrl: 'https://github.com/',
      placeholder: 'yourusername'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: Video, 
      color: 'bg-black',
      baseUrl: 'https://tiktok.com/@',
      placeholder: 'yourusername'
    },
    { 
      id: 'website', 
      name: 'Personal Website', 
      icon: Globe, 
      color: 'bg-green-500',
      baseUrl: '',
      placeholder: 'https://yourwebsite.com'
    }
  ]

  useEffect(() => {
    loadSocialData()
  }, [])

  const loadSocialData = async () => {
    try {
      setLoading(true)
      const userData = await blink.auth.me()
      setUser(userData)

      // Load social profiles from database
      const profiles = await blink.db.socialProfiles.list({
        where: { userId: userData.id },
        orderBy: { createdAt: 'desc' }
      })

      setSocialProfiles(profiles)

      // Load sharing settings
      const settings = await blink.db.sharingSettings.list({
        where: { userId: userData.id },
        limit: 1
      })

      if (settings.length > 0) {
        setSharingSettings({
          autoShare: Number(settings[0].autoShare) > 0,
          platforms: JSON.parse(settings[0].platforms || '[]'),
          includeQR: Number(settings[0].includeQr) > 0,
          customMessage: settings[0].customMessage || 'Check out my digital business card!'
        })
      }
    } catch (error) {
      console.error('Error loading social data:', error)
      toast({
        title: "Error",
        description: "Failed to load social media data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addSocialProfile = async () => {
    if (!newProfile.platform || !newProfile.username) {
      toast({
        title: "Error",
        description: "Please select a platform and enter username",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      const platform = socialPlatforms.find(p => p.id === newProfile.platform)
      const url = platform?.baseUrl + newProfile.username

      await blink.db.socialProfiles.create({
        userId: user.id,
        platform: newProfile.platform,
        username: newProfile.username,
        url: url,
        isActive: "1",
        createdAt: new Date().toISOString()
      })

      setNewProfile({ platform: '', username: '', url: '' })
      await loadSocialData()
      
      toast({
        title: "Success",
        description: "Social profile added successfully"
      })
    } catch (error) {
      console.error('Error adding social profile:', error)
      toast({
        title: "Error",
        description: "Failed to add social profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSocialProfile = async (profileId: string, updates: Partial<SocialProfile>) => {
    try {
      await blink.db.socialProfiles.update(profileId, updates)
      await loadSocialData()
      setEditingProfile(null)
      
      toast({
        title: "Success",
        description: "Social profile updated successfully"
      })
    } catch (error) {
      console.error('Error updating social profile:', error)
      toast({
        title: "Error",
        description: "Failed to update social profile",
        variant: "destructive"
      })
    }
  }

  const deleteSocialProfile = async (profileId: string) => {
    try {
      await blink.db.socialProfiles.delete(profileId)
      await loadSocialData()
      
      toast({
        title: "Success",
        description: "Social profile deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting social profile:', error)
      toast({
        title: "Error",
        description: "Failed to delete social profile",
        variant: "destructive"
      })
    }
  }

  const saveSharingSettings = async () => {
    try {
      setSaving(true)
      
      // Check if settings exist
      const existingSettings = await blink.db.sharingSettings.list({
        where: { userId: user.id },
        limit: 1
      })

      const settingsData = {
        userId: user.id,
        autoShare: sharingSettings.autoShare ? "1" : "0",
        platforms: JSON.stringify(sharingSettings.platforms),
        includeQr: sharingSettings.includeQR ? "1" : "0",
        customMessage: sharingSettings.customMessage,
        updatedAt: new Date().toISOString()
      }

      if (existingSettings.length > 0) {
        await blink.db.sharingSettings.update(existingSettings[0].id, settingsData)
      } else {
        await blink.db.sharingSettings.create({
          ...settingsData,
          createdAt: new Date().toISOString()
        })
      }

      toast({
        title: "Success",
        description: "Sharing settings saved successfully"
      })
    } catch (error) {
      console.error('Error saving sharing settings:', error)
      toast({
        title: "Error",
        description: "Failed to save sharing settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const shareToSocialMedia = async (platform: string) => {
    const cardUrl = `${window.location.origin}/card/your-card-id` // Replace with actual card ID
    const message = sharingSettings.customMessage
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(cardUrl)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const copyProfileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied!",
      description: "Profile URL copied to clipboard"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading social integration...</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Social Media Integration
          </h1>
          <p className="text-muted-foreground">
            Connect your social media profiles and manage sharing settings for your digital business cards.
          </p>
        </div>

        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profiles">Social Profiles</TabsTrigger>
            <TabsTrigger value="sharing">Sharing Settings</TabsTrigger>
            <TabsTrigger value="analytics">Social Analytics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          {/* Social Profiles Tab */}
          <TabsContent value="profiles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Social Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Platform</Label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newProfile.platform}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, platform: e.target.value }))}
                    >
                      <option value="">Select Platform</option>
                      {socialPlatforms.map(platform => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Username/URL</Label>
                    <Input
                      placeholder={
                        newProfile.platform 
                          ? socialPlatforms.find(p => p.id === newProfile.platform)?.placeholder 
                          : "Enter username or URL"
                      }
                      value={newProfile.username}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={addSocialProfile} 
                    disabled={saving || !newProfile.platform || !newProfile.username}
                    className="w-full"
                  >
                    {saving ? 'Adding...' : 'Add Profile'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Profiles */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-medium">Your Social Profiles</h3>
                {socialProfiles.length > 0 ? (
                  <div className="grid gap-4">
                    {socialProfiles.map((profile) => {
                      const platform = socialPlatforms.find(p => p.id === profile.platform)
                      const IconComponent = platform?.icon || Globe
                      
                      return (
                        <Card key={profile.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 ${platform?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                                  <IconComponent className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{platform?.name || profile.platform}</h4>
                                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                  {profile.followers && (
                                    <p className="text-xs text-muted-foreground">
                                      {profile.followers.toLocaleString()} followers
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={Number(profile.isActive) > 0 ? "default" : "secondary"}>
                                  {Number(profile.isActive) > 0 ? "Active" : "Inactive"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyProfileUrl(profile.url)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(profile.url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingProfile(profile.id)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSocialProfile(profile.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-foreground mb-2">No Social Profiles</h3>
                      <p className="text-sm text-muted-foreground">
                        Add your social media profiles to enhance your digital business card.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sharing Settings Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sharing Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-share new cards</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically share new cards to selected platforms
                      </p>
                    </div>
                    <Switch
                      checked={sharingSettings.autoShare}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, autoShare: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Include QR Code</h3>
                      <p className="text-sm text-muted-foreground">
                        Include QR code in shared posts
                      </p>
                    </div>
                    <Switch
                      checked={sharingSettings.includeQR}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, includeQR: checked }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Custom Share Message</Label>
                    <Input
                      value={sharingSettings.customMessage}
                      onChange={(e) => 
                        setSharingSettings(prev => ({ ...prev, customMessage: e.target.value }))
                      }
                      placeholder="Check out my digital business card!"
                    />
                  </div>

                  <div>
                    <Label>Auto-share Platforms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['twitter', 'facebook', 'linkedin', 'instagram'].map(platform => {
                        const platformData = socialPlatforms.find(p => p.id === platform)
                        const IconComponent = platformData?.icon || Globe
                        
                        return (
                          <div key={platform} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={platform}
                              checked={sharingSettings.platforms.includes(platform)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSharingSettings(prev => ({
                                    ...prev,
                                    platforms: [...prev.platforms, platform]
                                  }))
                                } else {
                                  setSharingSettings(prev => ({
                                    ...prev,
                                    platforms: prev.platforms.filter(p => p !== platform)
                                  }))
                                }
                              }}
                            />
                            <IconComponent className="h-4 w-4" />
                            <Label htmlFor={platform} className="text-sm">
                              {platformData?.name}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Button onClick={saveSharingSettings} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Share</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Share your business card directly to social media platforms.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {['twitter', 'facebook', 'linkedin'].map(platform => {
                      const platformData = socialPlatforms.find(p => p.id === platform)
                      const IconComponent = platformData?.icon || Globe
                      
                      return (
                        <Button
                          key={platform}
                          variant="outline"
                          onClick={() => shareToSocialMedia(platform)}
                          className="flex items-center space-x-2"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{platformData?.name}</span>
                        </Button>
                      )
                    })}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Share URL</h4>
                    <div className="flex space-x-2">
                      <Input
                        value={`${window.location.origin}/card/your-card-id`}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => copyProfileUrl(`${window.location.origin}/card/your-card-id`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Social Shares</p>
                      <p className="text-2xl font-bold text-foreground">1,234</p>
                    </div>
                    <Share2 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Social Clicks</p>
                      <p className="text-2xl font-bold text-foreground">856</p>
                    </div>
                    <ExternalLink className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                      <p className="text-2xl font-bold text-foreground">12.5%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialProfiles.map((profile) => {
                    const platform = socialPlatforms.find(p => p.id === profile.platform)
                    const IconComponent = platform?.icon || Globe
                    
                    return (
                      <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${platform?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{platform?.name}</h4>
                            <p className="text-sm text-muted-foreground">@{profile.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">245 clicks</p>
                          <p className="text-sm text-muted-foreground">+12% this week</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Social Media Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-post card updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically post when you update your business card
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly engagement posts</h3>
                    <p className="text-sm text-muted-foreground">
                      Share networking tips and card statistics weekly
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cross-platform sharing</h3>
                    <p className="text-sm text-muted-foreground">
                      Share content across all connected platforms simultaneously
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Scheduled Posts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Weekly networking tip</p>
                        <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Card statistics update</p>
                        <p className="text-sm text-muted-foreground">Every Friday at 5:00 PM</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}