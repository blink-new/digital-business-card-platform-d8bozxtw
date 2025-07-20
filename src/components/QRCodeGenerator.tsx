import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  QrCode, 
  Download, 
  Copy, 
  Share2, 
  CreditCard,
  Globe,
  Mail,
  Phone,
  Wifi,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
  cardId?: string
  cardUrl?: string
  defaultData?: string
  onGenerate?: (qrCodeDataUrl: string) => void
}

interface QRCodeOptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  type: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number
  margin: number
  color: {
    dark: string
    light: string
  }
  width: number
}

interface QRTemplate {
  id: string
  name: string
  icon: React.ReactNode
  placeholder: string
  prefix?: string
  description: string
}

export default function QRCodeGenerator({ 
  cardId, 
  cardUrl, 
  defaultData = '', 
  onGenerate 
}: QRCodeGeneratorProps) {
  const [qrData, setQrData] = useState(defaultData || cardUrl || '')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('url')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [options, setOptions] = useState<QRCodeOptions>({
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  })

  const templates: QRTemplate[] = [
    {
      id: 'url',
      name: 'Website/Card URL',
      icon: <Globe className="h-4 w-4" />,
      placeholder: 'https://example.com',
      description: 'Link to your digital business card or website'
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      placeholder: 'john@example.com',
      prefix: 'mailto:',
      description: 'Email address for quick contact'
    },
    {
      id: 'phone',
      name: 'Phone',
      icon: <Phone className="h-4 w-4" />,
      placeholder: '+1234567890',
      prefix: 'tel:',
      description: 'Phone number for direct calling'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <Phone className="h-4 w-4" />,
      placeholder: '+1234567890',
      prefix: 'sms:',
      description: 'SMS number for text messaging'
    },
    {
      id: 'wifi',
      name: 'WiFi',
      icon: <Wifi className="h-4 w-4" />,
      placeholder: 'WIFI:T:WPA;S:NetworkName;P:Password;;',
      description: 'WiFi network credentials'
    },
    {
      id: 'location',
      name: 'Location',
      icon: <MapPin className="h-4 w-4" />,
      placeholder: '40.7128,-74.0060',
      prefix: 'geo:',
      description: 'Geographic coordinates'
    },
    {
      id: 'vcard',
      name: 'vCard Contact',
      icon: <CreditCard className="h-4 w-4" />,
      placeholder: 'BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nEND:VCARD',
      description: 'Complete contact information'
    },
    {
      id: 'event',
      name: 'Calendar Event',
      icon: <Calendar className="h-4 w-4" />,
      placeholder: 'BEGIN:VEVENT\\nSUMMARY:Meeting\\nEND:VEVENT',
      description: 'Calendar event details'
    }
  ]

  const colorPresets = [
    { name: 'Classic', dark: '#000000', light: '#FFFFFF' },
    { name: 'Blue', dark: '#2563EB', light: '#FFFFFF' },
    { name: 'Green', dark: '#10B981', light: '#FFFFFF' },
    { name: 'Purple', dark: '#7C3AED', light: '#FFFFFF' },
    { name: 'Red', dark: '#DC2626', light: '#FFFFFF' },
    { name: 'Dark Mode', dark: '#FFFFFF', light: '#0F172A' },
    { name: 'Gradient Blue', dark: '#1E40AF', light: '#DBEAFE' },
    { name: 'Gradient Green', dark: '#059669', light: '#D1FAE5' }
  ]

  useEffect(() => {
    if (cardUrl && !defaultData) {
      setQrData(cardUrl)
    }
  }, [cardUrl, defaultData])

  const generateQRCode = useCallback(async () => {
    if (!qrData.trim()) return

    try {
      setLoading(true)
      
      const dataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        type: options.type,
        quality: options.quality,
        margin: options.margin,
        color: options.color,
        width: options.width
      })
      
      setQrCodeDataUrl(dataUrl)
      onGenerate?.(dataUrl)
      
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }, [qrData, options, onGenerate])

  useEffect(() => {
    if (qrData.trim()) {
      generateQRCode()
    }
  }, [qrData, options, generateQRCode])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template && template.id !== 'url') {
      setQrData('')
    } else if (template?.id === 'url' && cardUrl) {
      setQrData(cardUrl)
    }
  }

  const handleDataChange = (value: string) => {
    const template = templates.find(t => t.id === selectedTemplate)
    if (template?.prefix && !value.startsWith(template.prefix)) {
      setQrData(template.prefix + value)
    } else {
      setQrData(value)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.download = `qr-code-${selectedTemplate}-${Date.now()}.png`
    link.href = qrCodeDataUrl
    link.click()
    
    toast.success('QR code downloaded successfully!')
  }

  const copyQRCode = async () => {
    if (!qrCodeDataUrl) return

    try {
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      toast.success('QR code copied to clipboard!')
    } catch (error) {
      // Fallback: copy the data URL
      await navigator.clipboard.writeText(qrCodeDataUrl)
      toast.success('QR code data copied to clipboard!')
    }
  }

  const shareQRCode = async () => {
    if (!qrCodeDataUrl) return

    try {
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      const file = new File([blob], 'qr-code.png', { type: 'image/png' })
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code',
          files: [file]
        })
      } else {
        // Fallback: copy to clipboard
        await copyQRCode()
      }
    } catch (error) {
      console.error('Failed to share QR code:', error)
      toast.error('Failed to share QR code')
    }
  }

  const generateVCard = () => {
    // This would typically use card data from props
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Company
TITLE:Software Engineer
EMAIL:john@example.com
TEL:+1234567890
URL:${cardUrl || 'https://example.com'}
END:VCARD`
    setQrData(vcard)
  }

  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>QR Code Type</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center space-x-2">
                          {template.icon}
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentTemplate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentTemplate.description}
                  </p>
                )}
              </div>

              <div>
                <Label>Content</Label>
                {selectedTemplate === 'vcard' ? (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={generateVCard}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Generate vCard from Business Card
                    </Button>
                    <textarea
                      className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      placeholder={currentTemplate.placeholder}
                    />
                  </div>
                ) : (
                  <Input
                    value={qrData.replace(currentTemplate?.prefix || '', '')}
                    onChange={(e) => handleDataChange(e.target.value)}
                    placeholder={currentTemplate?.placeholder}
                  />
                )}
              </div>

              {selectedTemplate === 'wifi' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">WiFi QR Code Format:</p>
                  <code className="text-xs">WIFI:T:WPA;S:NetworkName;P:Password;;</code>
                  <p className="text-xs text-muted-foreground mt-1">
                    T=Security type (WPA/WEP/nopass), S=Network name, P=Password
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div>
                <Label>Color Presets</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setOptions(prev => ({
                        ...prev,
                        color: { dark: preset.dark, light: preset.light }
                      }))}
                      className="h-auto p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: preset.dark }}
                        />
                        <span className="text-xs">{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foreground Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="color"
                      value={options.color.dark}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        color: { ...prev.color, dark: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={options.color.dark}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        color: { ...prev.color, dark: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="color"
                      value={options.color.light}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        color: { ...prev.color, light: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={options.color.light}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        color: { ...prev.color, light: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Size: {options.width}px</Label>
                <Slider
                  value={[options.width]}
                  onValueChange={([value]) => setOptions(prev => ({ ...prev, width: value }))}
                  min={128}
                  max={512}
                  step={32}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Margin: {options.margin}</Label>
                <Slider
                  value={[options.margin]}
                  onValueChange={([value]) => setOptions(prev => ({ ...prev, margin: value }))}
                  min={0}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Error Correction Level</Label>
                <Select 
                  value={options.errorCorrectionLevel} 
                  onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                    setOptions(prev => ({ ...prev, errorCorrectionLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (~7%)</SelectItem>
                    <SelectItem value="M">Medium (~15%)</SelectItem>
                    <SelectItem value="Q">Quartile (~25%)</SelectItem>
                    <SelectItem value="H">High (~30%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher levels can recover from more damage but create larger codes
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="space-y-4">
                    <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Generated QR Code"
                        className="max-w-full h-auto"
                        style={{ width: options.width, height: options.width }}
                      />
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      <Button onClick={downloadQRCode} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={copyQRCode} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={shareQRCode} variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Size: {options.width}×{options.width}px</p>
                      <p>Error Correction: {options.errorCorrectionLevel}</p>
                      <Badge variant="secondary" className="text-xs">
                        {selectedTemplate.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <QrCode className="h-16 w-16 mb-4" />
                    <p>Enter content to generate QR code</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}