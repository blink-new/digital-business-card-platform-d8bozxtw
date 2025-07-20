import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Copy, 
  Download, 
  Eye, 
  Palette, 
  Type, 
  Image,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navigation from '@/components/Navigation'
import blink from '@/blink/client'

interface SignatureData {
  name: string
  title: string
  company: string
  email: string
  phone: string
  website: string
  address: string
  linkedin: string
  twitter: string
  instagram: string
  facebook: string
  youtube: string
  profileImage: string
  companyLogo: string
  disclaimer: string
  quote: string
}

interface TemplateConfig {
  id: string
  name: string
  description: string
  preview: string
}

const templates: TemplateConfig[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean and contemporary design with social icons',
    preview: 'Modern layout with left-aligned text and social media icons'
  },
  {
    id: 'classic',
    name: 'Classic Business',
    description: 'Traditional business format with company logo',
    preview: 'Traditional layout with company branding'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Simple and elegant with essential information only',
    preview: 'Minimalist design with clean typography'
  },
  {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Eye-catching design with colors and graphics',
    preview: 'Bold design with accent colors and visual elements'
  },
  {
    id: 'corporate',
    name: 'Corporate Executive',
    description: 'Professional corporate style with full contact details',
    preview: 'Executive-level design with comprehensive information'
  }
]

const colorSchemes = [
  { name: 'Blue Professional', primary: '#2563EB', secondary: '#64748B' },
  { name: 'Green Business', primary: '#059669', secondary: '#6B7280' },
  { name: 'Purple Creative', primary: '#7C3AED', secondary: '#9CA3AF' },
  { name: 'Orange Bold', primary: '#EA580C', secondary: '#71717A' },
  { name: 'Gray Minimal', primary: '#374151', secondary: '#9CA3AF' },
  { name: 'Red Dynamic', primary: '#DC2626', secondary: '#6B7280' }
]

export default function EmailSignature() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [selectedColorScheme, setSelectedColorScheme] = useState(0)
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    youtube: '',
    profileImage: '',
    companyLogo: '',
    disclaimer: '',
    quote: ''
  })
  const [includeImage, setIncludeImage] = useState(false)
  const [includeLogo, setIncludeLogo] = useState(false)
  const [includeSocial, setIncludeSocial] = useState(true)
  const [includeDisclaimer, setIncludeDisclaimer] = useState(false)
  const [includeQuote, setIncludeQuote] = useState(false)
  const [fontSize, setFontSize] = useState('14')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Pre-fill with user data if available
        setSignatureData(prev => ({
          ...prev,
          name: userData.displayName || '',
          email: userData.email || ''
        }))
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (field: keyof SignatureData, value: string) => {
    setSignatureData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSignatureHTML = () => {
    const colorScheme = colorSchemes[selectedColorScheme]
    
    const socialLinks = [
      { platform: 'linkedin', url: signatureData.linkedin, icon: '🔗' },
      { platform: 'twitter', url: signatureData.twitter, icon: '🐦' },
      { platform: 'instagram', url: signatureData.instagram, icon: '📷' },
      { platform: 'facebook', url: signatureData.facebook, icon: '👥' },
      { platform: 'youtube', url: signatureData.youtube, icon: '📺' }
    ].filter(link => link.url)

    const baseStyles = `
      font-family: ${fontFamily}, sans-serif;
      font-size: ${fontSize}px;
      line-height: 1.4;
      color: ${colorScheme.secondary};
    `

    switch (selectedTemplate) {
      case 'modern':
        return `
          <div style="${baseStyles}">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                ${includeImage && signatureData.profileImage ? `
                  <td style="padding-right: 20px; vertical-align: top;">
                    <img src="${signatureData.profileImage}" alt="${signatureData.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                  </td>
                ` : ''}
                <td style="vertical-align: top;">
                  <div style="color: ${colorScheme.primary}; font-size: ${parseInt(fontSize) + 4}px; font-weight: bold; margin-bottom: 5px;">
                    ${signatureData.name}
                  </div>
                  ${signatureData.title ? `<div style="color: ${colorScheme.secondary}; margin-bottom: 3px;">${signatureData.title}</div>` : ''}
                  ${signatureData.company ? `<div style="color: ${colorScheme.primary}; font-weight: 600; margin-bottom: 8px;">${signatureData.company}</div>` : ''}
                  
                  ${signatureData.email ? `<div style="margin-bottom: 3px;"><a href="mailto:${signatureData.email}" style="color: ${colorScheme.secondary}; text-decoration: none;">📧 ${signatureData.email}</a></div>` : ''}
                  ${signatureData.phone ? `<div style="margin-bottom: 3px;"><a href="tel:${signatureData.phone}" style="color: ${colorScheme.secondary}; text-decoration: none;">📞 ${signatureData.phone}</a></div>` : ''}
                  ${signatureData.website ? `<div style="margin-bottom: 3px;"><a href="${signatureData.website}" style="color: ${colorScheme.secondary}; text-decoration: none;">🌐 ${signatureData.website}</a></div>` : ''}
                  ${signatureData.address ? `<div style="margin-bottom: 8px; color: ${colorScheme.secondary};">📍 ${signatureData.address}</div>` : ''}
                  
                  ${includeSocial && socialLinks.length > 0 ? `
                    <div style="margin-top: 10px;">
                      ${socialLinks.map(link => `<a href="${link.url}" style="margin-right: 10px; text-decoration: none; font-size: 16px;">${link.icon}</a>`).join('')}
                    </div>
                  ` : ''}
                </td>
              </tr>
            </table>
            
            ${includeQuote && signatureData.quote ? `
              <div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid ${colorScheme.primary}; font-style: italic; color: ${colorScheme.secondary};">
                "${signatureData.quote}"
              </div>
            ` : ''}
            
            ${includeDisclaimer && signatureData.disclaimer ? `
              <div style="margin-top: 15px; font-size: ${parseInt(fontSize) - 2}px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 10px;">
                ${signatureData.disclaimer}
              </div>
            ` : ''}
          </div>
        `

      case 'classic':
        return `
          <div style="${baseStyles}">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  ${includeLogo && signatureData.companyLogo ? `
                    <img src="${signatureData.companyLogo}" alt="${signatureData.company}" style="width: 120px; height: auto; margin-bottom: 10px;">
                  ` : ''}
                  
                  <div style="color: ${colorScheme.primary}; font-size: ${parseInt(fontSize) + 2}px; font-weight: bold; margin-bottom: 5px;">
                    ${signatureData.name}
                  </div>
                  ${signatureData.title ? `<div style="color: ${colorScheme.secondary}; margin-bottom: 2px;">${signatureData.title}</div>` : ''}
                  ${signatureData.company ? `<div style="color: ${colorScheme.primary}; font-weight: 600; margin-bottom: 10px;">${signatureData.company}</div>` : ''}
                  
                  <table cellpadding="0" cellspacing="0" border="0">
                    ${signatureData.email ? `<tr><td style="padding: 2px 0;"><strong>Email:</strong></td><td style="padding: 2px 0 2px 10px;"><a href="mailto:${signatureData.email}" style="color: ${colorScheme.secondary}; text-decoration: none;">${signatureData.email}</a></td></tr>` : ''}
                    ${signatureData.phone ? `<tr><td style="padding: 2px 0;"><strong>Phone:</strong></td><td style="padding: 2px 0 2px 10px;"><a href="tel:${signatureData.phone}" style="color: ${colorScheme.secondary}; text-decoration: none;">${signatureData.phone}</a></td></tr>` : ''}
                    ${signatureData.website ? `<tr><td style="padding: 2px 0;"><strong>Web:</strong></td><td style="padding: 2px 0 2px 10px;"><a href="${signatureData.website}" style="color: ${colorScheme.secondary}; text-decoration: none;">${signatureData.website}</a></td></tr>` : ''}
                    ${signatureData.address ? `<tr><td style="padding: 2px 0; vertical-align: top;"><strong>Address:</strong></td><td style="padding: 2px 0 2px 10px;">${signatureData.address}</td></tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `

      case 'minimal':
        return `
          <div style="${baseStyles}">
            <div style="color: ${colorScheme.primary}; font-size: ${parseInt(fontSize) + 2}px; font-weight: 600; margin-bottom: 5px;">
              ${signatureData.name}
            </div>
            ${signatureData.title ? `<div style="color: ${colorScheme.secondary}; margin-bottom: 10px;">${signatureData.title}</div>` : ''}
            
            <div style="color: ${colorScheme.secondary};">
              ${[signatureData.email, signatureData.phone, signatureData.website].filter(Boolean).join(' • ')}
            </div>
          </div>
        `

      default:
        return generateSignatureHTML()
    }
  }

  const copyToClipboard = async () => {
    try {
      const html = generateSignatureHTML()
      await navigator.clipboard.writeText(html)
      setCopied(true)
      toast.success('Signature copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy signature')
    }
  }

  const downloadAsHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Email Signature</title>
      </head>
      <body>
        ${generateSignatureHTML()}
      </body>
      </html>
    `
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-signature-${signatureData.name.replace(/\s+/g, '-').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Signature downloaded as HTML file!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading email signature generator...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Signature Generator</h1>
              <p className="text-muted-foreground">Create professional email signatures that make an impact</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Type className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={signatureData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={signatureData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Senior Marketing Manager"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={signatureData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={signatureData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john@company.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={signatureData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={signatureData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://company.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={signatureData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Business St, City, State 12345"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Template & Style</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Template Selection */}
                    <div>
                      <Label className="text-base font-medium">Choose Template</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTemplate === template.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{template.name}</h3>
                              {selectedTemplate === template.id && (
                                <Badge variant="default">Selected</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Color Scheme */}
                    <div>
                      <Label className="text-base font-medium">Color Scheme</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {colorSchemes.map((scheme, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedColorScheme(index)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedColorScheme === index
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: scheme.secondary }}
                              />
                            </div>
                            <p className="text-sm font-medium">{scheme.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Typography */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Calibri">Calibri</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fontSize">Font Size</Label>
                        <Select value={fontSize} onValueChange={setFontSize}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12px</SelectItem>
                            <SelectItem value="13">13px</SelectItem>
                            <SelectItem value="14">14px</SelectItem>
                            <SelectItem value="15">15px</SelectItem>
                            <SelectItem value="16">16px</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Linkedin className="h-5 w-5" />
                        <span>Social Media Links</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="includeSocial" className="text-sm">Include Social</Label>
                        <Switch
                          id="includeSocial"
                          checked={includeSocial}
                          onCheckedChange={setIncludeSocial}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin" className="flex items-center space-x-2">
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn</span>
                        </Label>
                        <Input
                          id="linkedin"
                          value={signatureData.linkedin}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/johndoe"
                          disabled={!includeSocial}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="flex items-center space-x-2">
                          <Twitter className="h-4 w-4" />
                          <span>Twitter</span>
                        </Label>
                        <Input
                          id="twitter"
                          value={signatureData.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          placeholder="https://twitter.com/johndoe"
                          disabled={!includeSocial}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram" className="flex items-center space-x-2">
                          <Instagram className="h-4 w-4" />
                          <span>Instagram</span>
                        </Label>
                        <Input
                          id="instagram"
                          value={signatureData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          placeholder="https://instagram.com/johndoe"
                          disabled={!includeSocial}
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook" className="flex items-center space-x-2">
                          <Facebook className="h-4 w-4" />
                          <span>Facebook</span>
                        </Label>
                        <Input
                          id="facebook"
                          value={signatureData.facebook}
                          onChange={(e) => handleInputChange('facebook', e.target.value)}
                          placeholder="https://facebook.com/johndoe"
                          disabled={!includeSocial}
                        />
                      </div>
                      <div>
                        <Label htmlFor="youtube" className="flex items-center space-x-2">
                          <Youtube className="h-4 w-4" />
                          <span>YouTube</span>
                        </Label>
                        <Input
                          id="youtube"
                          value={signatureData.youtube}
                          onChange={(e) => handleInputChange('youtube', e.target.value)}
                          placeholder="https://youtube.com/c/johndoe"
                          disabled={!includeSocial}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Extras Tab */}
              <TabsContent value="extras" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image className="h-5 w-5" />
                      <span>Images & Additional Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Image */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-medium">Profile Image</Label>
                        <Switch
                          checked={includeImage}
                          onCheckedChange={setIncludeImage}
                        />
                      </div>
                      <Input
                        value={signatureData.profileImage}
                        onChange={(e) => handleInputChange('profileImage', e.target.value)}
                        placeholder="https://example.com/profile.jpg"
                        disabled={!includeImage}
                      />
                    </div>

                    {/* Company Logo */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-medium">Company Logo</Label>
                        <Switch
                          checked={includeLogo}
                          onCheckedChange={setIncludeLogo}
                        />
                      </div>
                      <Input
                        value={signatureData.companyLogo}
                        onChange={(e) => handleInputChange('companyLogo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        disabled={!includeLogo}
                      />
                    </div>

                    <Separator />

                    {/* Quote */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-medium">Inspirational Quote</Label>
                        <Switch
                          checked={includeQuote}
                          onCheckedChange={setIncludeQuote}
                        />
                      </div>
                      <Textarea
                        value={signatureData.quote}
                        onChange={(e) => handleInputChange('quote', e.target.value)}
                        placeholder="Your favorite professional quote or motto"
                        disabled={!includeQuote}
                        rows={2}
                      />
                    </div>

                    {/* Disclaimer */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-medium">Legal Disclaimer</Label>
                        <Switch
                          checked={includeDisclaimer}
                          onCheckedChange={setIncludeDisclaimer}
                        />
                      </div>
                      <Textarea
                        value={signatureData.disclaimer}
                        onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                        placeholder="This email and any attachments are confidential..."
                        disabled={!includeDisclaimer}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Live Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div 
                  className="border rounded-lg p-4 bg-white min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }}
                />

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={copyToClipboard}
                    className="w-full"
                    disabled={!signatureData.name}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy HTML
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={downloadAsHTML}
                    className="w-full"
                    disabled={!signatureData.name}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download HTML
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                  <p className="font-medium">How to use:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Copy the HTML code</li>
                    <li>Open your email client settings</li>
                    <li>Find the signature section</li>
                    <li>Paste the HTML code</li>
                    <li>Save your settings</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}