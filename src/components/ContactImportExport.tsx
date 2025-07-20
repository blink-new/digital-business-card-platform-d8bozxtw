import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { contactService, type Contact } from '../services/database'

interface ContactImportExportProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (contacts: Contact[]) => void
  mode: 'import' | 'export'
  contacts?: Contact[]
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export default function ContactImportExport({ 
  isOpen, 
  onClose, 
  onImportComplete,
  mode,
  contacts = []
}: ContactImportExportProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    await processImport(file)
  }

  const processImport = async (file: File) => {
    try {
      setImporting(true)
      setProgress(0)
      setImportResult(null)

      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        throw new Error('File is empty')
      }

      // Parse CSV header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      const dataLines = lines.slice(1)

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      }

      // Process each contact
      for (let i = 0; i < dataLines.length; i++) {
        try {
          const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const contactData: any = {}

          // Map CSV columns to contact fields
          headers.forEach((header, index) => {
            const value = values[index] || ''
            switch (header) {
              case 'name':
              case 'full name':
              case 'fullname':
                contactData.fullName = value
                break
              case 'email':
              case 'email address':
                contactData.email = value
                break
              case 'phone':
              case 'phone number':
                contactData.phone = value
                break
              case 'company':
              case 'organization':
                contactData.company = value
                break
              case 'job title':
              case 'title':
              case 'position':
                contactData.jobTitle = value
                break
              case 'website':
              case 'url':
                contactData.website = value
                break
              case 'notes':
              case 'note':
                contactData.notes = value
                break
            }
          })

          // Validate required fields
          if (!contactData.fullName) {
            result.failed++
            result.errors.push(`Row ${i + 2}: Missing name`)
            continue
          }

          // Set default values
          contactData.sourceType = 'import'
          contactData.tags = JSON.stringify([])

          // Create contact
          await contactService.createContact(contactData)
          result.success++

        } catch (error) {
          result.failed++
          result.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Update progress
        setProgress(((i + 1) / dataLines.length) * 100)
      }

      setImportResult(result)

      // Refresh contacts list if successful imports
      if (result.success > 0) {
        const updatedContacts = await contactService.getUserContacts()
        onImportComplete(updatedContacts)
      }

    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Import failed']
      })
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      setProgress(0)

      if (contacts.length === 0) {
        alert('No contacts to export')
        return
      }

      let content: string
      let filename: string
      let mimeType: string

      if (exportFormat === 'csv') {
        // Generate CSV
        const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Website', 'Notes', 'Source', 'Created']
        const csvRows = [headers.join(',')]

        contacts.forEach((contact, index) => {
          const row = [
            `"${contact.fullName || ''}"`,
            `"${contact.email || ''}"`,
            `"${contact.phone || ''}"`,
            `"${contact.company || ''}"`,
            `"${contact.jobTitle || ''}"`,
            `"${contact.website || ''}"`,
            `"${contact.notes || ''}"`,
            `"${contact.sourceType || ''}"`,
            `"${new Date(contact.createdAt).toLocaleDateString()}"`
          ]
          csvRows.push(row.join(','))
          setProgress(((index + 1) / contacts.length) * 100)
        })

        content = csvRows.join('\\n')
        filename = `contacts-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      } else {
        // Generate JSON
        const exportData = contacts.map((contact, index) => {
          setProgress(((index + 1) / contacts.length) * 100)
          return {
            fullName: contact.fullName,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            jobTitle: contact.jobTitle,
            website: contact.website,
            notes: contact.notes,
            sourceType: contact.sourceType,
            tags: contact.tags ? JSON.parse(contact.tags) : [],
            createdAt: contact.createdAt
          }
        })

        content = JSON.stringify(exportData, null, 2)
        filename = `contacts-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      }

      // Download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Close dialog after successful export
      setTimeout(() => {
        onClose()
      }, 1000)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
      setProgress(0)
    }
  }

  const resetImport = () => {
    setImportResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {mode === 'import' ? (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Import Contacts
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Export Contacts
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {mode === 'import' ? (
            <>
              {!importResult ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>CSV File Format</Label>
                      <Alert className="mt-2">
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          Your CSV file should include columns: Name, Email, Phone, Company, Job Title, Website, Notes
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div>
                      <Label>Select CSV File</Label>
                      <div className="mt-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleFileSelect}
                          disabled={importing}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose CSV File
                        </Button>
                      </div>
                    </div>

                    {importing && (
                      <div className="space-y-2">
                        <Label>Importing contacts...</Label>
                        <Progress value={progress} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                          Processing contacts: {Math.round(progress)}%
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    {importResult.success > 0 ? (
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    ) : (
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    )}
                    <h3 className="text-lg font-medium">Import Complete</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                      <p className="text-sm text-green-700">Successful</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                      <p className="text-sm text-red-700">Failed</p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <Label>Errors:</Label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </p>
                        ))}
                        {importResult.errors.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            ... and {importResult.errors.length - 5} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                      <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    {exportFormat === 'csv' 
                      ? 'CSV format is compatible with Excel, Google Sheets, and most contact management systems.'
                      : 'JSON format preserves all data structure and is ideal for technical use or re-importing.'
                    }
                  </AlertDescription>
                </Alert>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-lg font-medium">{contacts.length} contacts</p>
                  <p className="text-sm text-muted-foreground">will be exported</p>
                </div>

                {exporting && (
                  <div className="space-y-2">
                    <Label>Exporting contacts...</Label>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Processing: {Math.round(progress)}%
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={importing || exporting}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {mode === 'import' ? (
            importResult ? (
              <Button onClick={resetImport}>
                Import Another File
              </Button>
            ) : null
          ) : (
            <Button 
              onClick={handleExport}
              disabled={exporting || contacts.length === 0}
              className="gradient-bg hover:opacity-90 transition-opacity"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}