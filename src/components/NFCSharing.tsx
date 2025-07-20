import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Zap,
  Share2,
  Settings
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface NFCSharingProps {
  cardId: string
  cardUrl: string
  cardTitle: string
  onNFCWrite?: (success: boolean) => void
}

interface NFCWriteOptions {
  overwrite: boolean
  makeReadOnly: boolean
}

export function NFCSharing({ cardId, cardUrl, cardTitle, onNFCWrite }: NFCSharingProps) {
  const [isNFCSupported, setIsNFCSupported] = useState<boolean | null>(null)
  const [isNFCEnabled, setIsNFCEnabled] = useState<boolean | null>(null)
  const [isWriting, setIsWriting] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [lastWriteTime, setLastWriteTime] = useState<Date | null>(null)
  const [writeOptions, setWriteOptions] = useState<NFCWriteOptions>({
    overwrite: true,
    makeReadOnly: false
  })

  // Check NFC support and permissions
  useEffect(() => {
    checkNFCSupport()
  }, [])

  const checkNFCSupport = async () => {
    try {
      if ('NDEFReader' in window) {
        setIsNFCSupported(true)
        
        // Check if NFC is enabled
        try {
          const ndef = new (window as any).NDEFReader()
          await ndef.scan()
          setIsNFCEnabled(true)
          ndef.stop()
        } catch (error: any) {
          if (error.name === 'NotAllowedError') {
            setIsNFCEnabled(false)
          } else if (error.name === 'NotSupportedError') {
            setIsNFCEnabled(false)
          } else {
            setIsNFCEnabled(null)
          }
        }
      } else {
        setIsNFCSupported(false)
      }
    } catch (error) {
      setIsNFCSupported(false)
    }
  }

  const writeToNFC = async () => {
    if (!isNFCSupported || !isNFCEnabled) {
      toast({
        title: "NFC Not Available",
        description: "NFC is not supported or enabled on this device.",
        variant: "destructive"
      })
      return
    }

    setIsWriting(true)
    
    try {
      const ndef = new (window as any).NDEFReader()
      
      // Prepare the NFC message
      const message = {
        records: [
          {
            recordType: "url",
            data: cardUrl
          },
          {
            recordType: "text",
            data: `${cardTitle} - Digital Business Card`
          }
        ]
      }

      // Write options
      const options: any = {}
      if (writeOptions.overwrite) {
        options.overwrite = true
      }
      if (writeOptions.makeReadOnly) {
        options.signal = new AbortController().signal
      }

      await ndef.write(message, options)
      
      setLastWriteTime(new Date())
      onNFCWrite?.(true)
      
      toast({
        title: "NFC Tag Written Successfully!",
        description: "Your business card has been written to the NFC tag. Tap it against another device to share.",
      })
      
    } catch (error: any) {
      console.error('NFC write error:', error)
      onNFCWrite?.(false)
      
      let errorMessage = "Failed to write to NFC tag."
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "NFC permission denied. Please enable NFC in your browser settings."
      } else if (error.name === 'NetworkError') {
        errorMessage = "No NFC tag found. Please place an NFC tag near your device."
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "NFC writing is not supported on this device."
      } else if (error.name === 'InvalidStateError') {
        errorMessage = "NFC tag is not writable or is protected."
      }
      
      toast({
        title: "NFC Write Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsWriting(false)
    }
  }

  const readFromNFC = async () => {
    if (!isNFCSupported || !isNFCEnabled) {
      toast({
        title: "NFC Not Available",
        description: "NFC is not supported or enabled on this device.",
        variant: "destructive"
      })
      return
    }

    setIsReading(true)
    
    try {
      const ndef = new (window as any).NDEFReader()
      
      toast({
        title: "Ready to Read",
        description: "Tap an NFC tag to read its contents.",
      })
      
      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        console.log(`NFC tag read, serial number: ${serialNumber}`)
        
        const records = message.records
        let url = ''
        let text = ''
        
        for (const record of records) {
          if (record.recordType === "url") {
            const decoder = new TextDecoder()
            url = decoder.decode(record.data)
          } else if (record.recordType === "text") {
            const decoder = new TextDecoder()
            text = decoder.decode(record.data)
          }
        }
        
        toast({
          title: "NFC Tag Read Successfully!",
          description: `Found: ${text || url || 'Unknown content'}`,
        })
        
        if (url) {
          window.open(url, '_blank')
        }
        
        ndef.stop()
        setIsReading(false)
      })
      
      await ndef.scan()
      
    } catch (error: any) {
      console.error('NFC read error:', error)
      
      let errorMessage = "Failed to read NFC tag."
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "NFC permission denied. Please enable NFC in your browser settings."
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "NFC reading is not supported on this device."
      }
      
      toast({
        title: "NFC Read Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      setIsReading(false)
    }
  }

  const stopReading = () => {
    setIsReading(false)
    toast({
      title: "NFC Reading Stopped",
      description: "No longer listening for NFC tags.",
    })
  }

  const requestNFCPermission = async () => {
    try {
      await navigator.permissions.query({ name: 'nfc' as any })
      checkNFCSupport()
    } catch (error) {
      toast({
        title: "Permission Request Failed",
        description: "Unable to request NFC permissions.",
        variant: "destructive"
      })
    }
  }

  const getNFCStatusBadge = () => {
    if (isNFCSupported === null) {
      return <Badge variant="secondary">Checking...</Badge>
    }
    
    if (!isNFCSupported) {
      return <Badge variant="destructive">Not Supported</Badge>
    }
    
    if (isNFCEnabled === null) {
      return <Badge variant="secondary">Unknown</Badge>
    }
    
    if (!isNFCEnabled) {
      return <Badge variant="destructive">Disabled</Badge>
    }
    
    return <Badge variant="default" className="bg-green-500">Ready</Badge>
  }

  const getNFCStatusIcon = () => {
    if (!isNFCSupported || !isNFCEnabled) {
      return <WifiOff className="h-5 w-5 text-red-500" />
    }
    return <Wifi className="h-5 w-5 text-green-500" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getNFCStatusIcon()}
            <CardTitle className="text-lg">NFC Sharing</CardTitle>
            {getNFCStatusBadge()}
          </div>
          <Smartphone className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          Share your business card instantly by tapping NFC-enabled devices together
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* NFC Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">NFC Status</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkNFCSupport}
              className="h-8"
            >
              <Settings className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          
          {!isNFCSupported && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                NFC is not supported on this device or browser. Try using Chrome on an Android device.
              </AlertDescription>
            </Alert>
          )}
          
          {isNFCSupported && !isNFCEnabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>NFC is supported but not enabled. Please:</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Enable NFC in your device settings</li>
                  <li>Grant NFC permissions to your browser</li>
                  <li>Ensure you're using HTTPS</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={requestNFCPermission}
                  className="mt-2"
                >
                  Request Permission
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {isNFCSupported && isNFCEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                NFC is ready! You can now write your business card to NFC tags.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Write Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Write Options</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="overwrite" className="text-sm">
                Overwrite existing data
              </Label>
              <Switch
                id="overwrite"
                checked={writeOptions.overwrite}
                onCheckedChange={(checked) => 
                  setWriteOptions(prev => ({ ...prev, overwrite: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="readonly" className="text-sm">
                Make tag read-only
              </Label>
              <Switch
                id="readonly"
                checked={writeOptions.makeReadOnly}
                onCheckedChange={(checked) => 
                  setWriteOptions(prev => ({ ...prev, makeReadOnly: checked }))
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={writeToNFC}
            disabled={!isNFCSupported || !isNFCEnabled || isWriting}
            className="w-full"
            size="lg"
          >
            {isWriting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Writing to NFC Tag...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Write to NFC Tag
              </>
            )}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={isReading ? stopReading : readFromNFC}
              disabled={!isNFCSupported || !isNFCEnabled}
            >
              {isReading ? (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Stop Reading
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Read NFC Tag
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigator.share?.({ 
                title: cardTitle, 
                url: cardUrl 
              })}
              disabled={!navigator.share}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Last Write Info */}
        {lastWriteTime && (
          <div className="text-xs text-muted-foreground text-center">
            Last written: {lastWriteTime.toLocaleString()}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h5 className="text-sm font-medium">How to use NFC sharing:</h5>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ensure NFC is enabled on your device</li>
            <li>Place an NFC tag near your device</li>
            <li>Click "Write to NFC Tag" button</li>
            <li>Your business card URL will be written to the tag</li>
            <li>Others can tap the tag to view your card</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}