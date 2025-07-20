import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  FileText,
  Tag,
  X
} from 'lucide-react'
import { contactService, type Contact } from '../services/database'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Contact) => void
  contact?: Contact | null
  mode: 'add' | 'edit'
}

interface ContactFormData {
  fullName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  website: string
  notes: string
  sourceType: string
  tags: string[]
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contact, 
  mode 
}: ContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    website: '',
    notes: '',
    sourceType: 'manual',
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData({
        fullName: contact.fullName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        jobTitle: contact.jobTitle || '',
        website: contact.website || '',
        notes: contact.notes || '',
        sourceType: contact.sourceType || 'manual',
        tags: contact.tags ? JSON.parse(contact.tags) : []
      })
    } else {
      // Reset form for add mode
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        website: '',
        notes: '',
        sourceType: 'manual',
        tags: []
      })
    }
    setErrors({})
  }, [contact, mode, isOpen])

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)
      
      const contactData = {
        ...formData,
        tags: JSON.stringify(formData.tags)
      }

      let savedContact: Contact

      if (mode === 'edit' && contact) {
        await contactService.updateContact(contact.id, contactData)
        savedContact = { ...contact, ...contactData, updatedAt: new Date().toISOString() }
      } else {
        savedContact = await contactService.createContact(contactData)
      }

      onSave(savedContact)
      onClose()
    } catch (error) {
      console.error('Failed to save contact:', error)
      setErrors({ general: 'Failed to save contact. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const sourceTypeOptions = [
    { value: 'manual', label: 'Manual Entry' },
    { value: 'card_share', label: 'Card Share' },
    { value: 'import', label: 'Import' },
    { value: 'networking', label: 'Networking Event' },
    { value: 'referral', label: 'Referral' },
    { value: 'social', label: 'Social Media' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {mode === 'edit' ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="Tech Corp"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="https://johndoe.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`pl-10 ${errors.website ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Additional Information</h3>
            
            <div>
              <Label htmlFor="sourceType">Source</Label>
              <Select 
                value={formData.sourceType} 
                onValueChange={(value) => handleInputChange('sourceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How did you meet this contact?" />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this contact..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.fullName.trim()}
            className="gradient-bg hover:opacity-90 transition-opacity"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                {mode === 'edit' ? 'Update Contact' : 'Add Contact'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}