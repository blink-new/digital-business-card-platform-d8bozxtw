import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Mail
} from 'lucide-react'
import { contactService, type Contact } from '../services/database'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: string[]
}

export default function ImportExportModal({ isOpen, onClose, onImportComplete }: ImportExportModalProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)
    setImportProgress(0)

    try {
      const text = await file.text()
      let contacts: any[] = []

      if (file.name.endsWith('.csv')) {
        contacts = parseCSV(text)
      } else if (file.name.endsWith('.json')) {
        contacts = JSON.parse(text)
      } else if (file.name.endsWith('.vcf')) {
        contacts = parseVCard(text)
      } else {
        throw new Error('Unsupported file format. Please use CSV, JSON, or VCF files.')
      }

      const result: ImportResult = {
        total: contacts.length,
        successful: 0,
        failed: 0,
        errors: []
      }

      // Import contacts one by one with progress updates
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i]
        setImportProgress((i / contacts.length) * 100)

        try {
          await contactService.createContact({
            name: contact.name || contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
            email: contact.email || '',
            phone: contact.phone || contact.phoneNumber || '',
            company: contact.company || contact.organization || '',
            jobTitle: contact.jobTitle || contact.title || '',
            website: contact.website || contact.url || '',
            notes: contact.notes || contact.bio || '',
            tags: contact.tags ? (Array.isArray(contact.tags) ? contact.tags : [contact.tags]) : [],
            source: 'import',
            isFavorite: false
          })
          result.successful++
        } catch (error) {
          result.failed++
          result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setImportProgress(100)
      setImportResult(result)
      onImportComplete()
    } catch (error) {
      setImportResult({
        total: 0,
        successful: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Failed to import file']
      })
    } finally {
      setImporting(false)
    }
  }

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) throw new Error('CSV file must have at least a header row and one data row')

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const contacts = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const contact: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        // Map common CSV headers to our contact fields
        if (header.includes('name') && !header.includes('first') && !header.includes('last')) {
          contact.name = value
        } else if (header.includes('first') && header.includes('name')) {
          contact.firstName = value
        } else if (header.includes('last') && header.includes('name')) {
          contact.lastName = value
        } else if (header.includes('email')) {
          contact.email = value
        } else if (header.includes('phone')) {
          contact.phone = value
        } else if (header.includes('company') || header.includes('organization')) {
          contact.company = value
        } else if (header.includes('title') || header.includes('job')) {
          contact.jobTitle = value
        } else if (header.includes('website') || header.includes('url')) {
          contact.website = value
        } else if (header.includes('note') || header.includes('bio')) {
          contact.notes = value
        } else if (header.includes('tag')) {
          contact.tags = value.split(';').filter(t => t.trim())
        }
      })

      if (contact.firstName && contact.lastName && !contact.name) {
        contact.name = `${contact.firstName} ${contact.lastName}`.trim()
      }

      if (contact.name || contact.email) {
        contacts.push(contact)
      }
    }

    return contacts
  }

  const parseVCard = (text: string) => {
    const vcards = text.split('BEGIN:VCARD')
    const contacts = []

    for (const vcard of vcards) {
      if (!vcard.trim()) continue

      const contact: any = {}
      const lines = vcard.split('\n')

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()

        if (key.startsWith('FN')) {
          contact.name = value
        } else if (key.startsWith('EMAIL')) {
          contact.email = value
        } else if (key.startsWith('TEL')) {
          contact.phone = value
        } else if (key.startsWith('ORG')) {
          contact.company = value
        } else if (key.startsWith('TITLE')) {
          contact.jobTitle = value
        } else if (key.startsWith('URL')) {
          contact.website = value
        } else if (key.startsWith('NOTE')) {
          contact.notes = value
        }
      }

      if (contact.name || contact.email) {
        contacts.push(contact)
      }
    }

    return contacts
  }

  const handleExport = async (format: 'csv' | 'json' | 'vcf') => {
    setExporting(true)

    try {
      const contacts = await contactService.getAllContacts()
      let content = ''
      let filename = ''
      let mimeType = ''

      switch (format) {
        case 'csv':
          content = generateCSV(contacts)
          filename = `contacts-${new Date().toISOString().split('T')[0]}.csv`
          mimeType = 'text/csv'
          break
        case 'json':
          content = JSON.stringify(contacts, null, 2)
          filename = `contacts-${new Date().toISOString().split('T')[0]}.json`
          mimeType = 'application/json'
          break
        case 'vcf':
          content = generateVCard(contacts)
          filename = `contacts-${new Date().toISOString().split('T')[0]}.vcf`
          mimeType = 'text/vcard'
          break
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const generateCSV = (contacts: Contact[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Website', 'Notes', 'Tags', 'Source', 'Created At']
    const rows = contacts.map(contact => [
      contact.name,
      contact.email || '',
      contact.phone || '',
      contact.company || '',
      contact.jobTitle || '',
      contact.website || '',
      contact.notes || '',
      contact.tags?.join(';') || '',
      contact.source || '',
      contact.createdAt
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  const generateVCard = (contacts: Contact[]) => {
    return contacts.map(contact => {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${contact.name}`,
        contact.email ? `EMAIL:${contact.email}` : '',
        contact.phone ? `TEL:${contact.phone}` : '',
        contact.company ? `ORG:${contact.company}` : '',
        contact.jobTitle ? `TITLE:${contact.jobTitle}` : '',
        contact.website ? `URL:${contact.website}` : '',
        contact.notes ? `NOTE:${contact.notes}` : '',
        'END:VCARD'
      ].filter(line => line).join('\n')
      
      return vcard
    }).join('\n\n')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Import & Export Contacts
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Contacts</TabsTrigger>
            <TabsTrigger value="export">Export Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Import from File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium">CSV</h3>
                      <p className="text-xs text-muted-foreground">Spreadsheet format</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-medium">JSON</h3>
                      <p className="text-xs text-muted-foreground">Structured data</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-medium">VCF</h3>
                      <p className="text-xs text-muted-foreground">vCard format</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="file-upload">Choose File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json,.vcf"
                    onChange={handleFileImport}
                    disabled={importing}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: CSV, JSON, VCF (vCard)
                  </p>
                </div>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Importing contacts...</span>
                      <span className="text-sm">{Math.round(importProgress)}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                {importResult && (
                  <Card className={importResult.failed > 0 ? "border-yellow-200" : "border-green-200"}>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        {importResult.failed > 0 ? (
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <h3 className="font-medium">Import Complete</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{importResult.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                          <div className="text-xs text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                      </div>
                      {importResult.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Errors:</h4>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <p key={index} className="text-xs text-red-600">{error}</p>
                            ))}
                            {importResult.errors.length > 5 && (
                              <p className="text-xs text-muted-foreground">
                                ... and {importResult.errors.length - 5} more errors
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CSV Format Example:</h4>
                  <pre className="text-xs text-muted-foreground">
{`Name,Email,Phone,Company,Job Title,Website
John Doe,john@example.com,+1234567890,Tech Corp,Developer,https://johndoe.com
Jane Smith,jane@example.com,+0987654321,Design Co,Designer,https://janesmith.com`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Your Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Download all your contacts in your preferred format for backup or migration.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                  >
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-muted-foreground">Excel compatible</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                  >
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-muted-foreground">Developer friendly</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleExport('vcf')}
                    disabled={exporting}
                  >
                    <Users className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-medium">VCF</div>
                      <div className="text-xs text-muted-foreground">Universal format</div>
                    </div>
                  </Button>
                </div>

                {exporting && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    <span>Preparing download...</span>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Export Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All contact information and metadata</li>
                    <li>• Tags and custom fields</li>
                    <li>• Source tracking information</li>
                    <li>• Creation and update timestamps</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}