import { useState, useEffect, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import ContactModal from '@/components/ContactModal'
import ImportExportModal from '@/components/ImportExportModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MoreVertical,
  Download,
  Upload,
  Star,
  StarOff,
  Trash2,
  Users,
  Edit
} from 'lucide-react'
import { contactService, type Contact } from '../services/database'

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'recent'>('all')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchQuery, filterType, filterContacts])

  const loadContacts = async () => {
    try {
      const userContacts = await contactService.getUserContacts()
      setContacts(userContacts)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = useCallback(() => {
    let filtered = contacts

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(contact => 
        contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    switch (filterType) {
      case 'favorites':
        filtered = filtered.filter(contact => Number(contact.isFavorite) > 0)
        break
      case 'recent': {
        // Show contacts added in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        filtered = filtered.filter(contact => 
          new Date(contact.createdAt) > thirtyDaysAgo
        )
        break
      }
    }

    setFilteredContacts(filtered)
  }, [contacts, searchQuery, filterType])

  const handleToggleFavorite = async (contactId: string) => {
    try {
      await contactService.toggleFavorite(contactId)
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isFavorite: Number(contact.isFavorite) > 0 ? "0" : "1" }
          : contact
      ))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.deleteContact(contactId)
        setContacts(prev => prev.filter(contact => contact.id !== contactId))
      } catch (error) {
        console.error('Failed to delete contact:', error)
      }
    }
  }

  const handleAddContact = () => {
    setModalMode('add')
    setEditingContact(null)
    setIsModalOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setModalMode('edit')
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleModalSave = (savedContact: Contact) => {
    if (modalMode === 'edit') {
      setContacts(prev => prev.map(contact => 
        contact.id === savedContact.id ? savedContact : contact
      ))
    } else {
      setContacts(prev => [savedContact, ...prev])
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingContact(null)
  }

  const handleImport = () => {
    setIsImportExportOpen(true)
  }

  const handleExport = () => {
    setIsImportExportOpen(true)
  }

  const handleImportComplete = (importedContacts: Contact[]) => {
    setContacts(importedContacts)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'card_share':
        return <Badge variant="secondary" className="text-xs">Card Share</Badge>
      case 'import':
        return <Badge variant="outline" className="text-xs">Import</Badge>
      default:
        return <Badge variant="default" className="text-xs">Manual</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const recentContacts = contacts.filter(contact => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(contact.createdAt) > thirtyDaysAgo
  })

  const favoriteContacts = contacts.filter(contact => Number(contact.isFavorite) > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your professional network and connections.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={contacts.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleAddContact}
              className="gradient-bg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        {contacts.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search contacts..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterType === 'favorites' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('favorites')}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Favorites
                  </Button>
                  <Button 
                    variant={filterType === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('recent')}
                  >
                    Recent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{recentContacts.length}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{favoriteContacts.length}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {contacts.filter(c => c.sourceType === 'card_share').length}
                </p>
                <p className="text-sm text-muted-foreground">From Cards</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filterType === 'all' && 'All Contacts'}
              {filterType === 'favorites' && 'Favorite Contacts'}
              {filterType === 'recent' && 'Recent Contacts'}
              {searchQuery && ` (${filteredContacts.length} results)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContacts.length > 0 ? (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-medium">
                        {getInitials(contact.fullName)}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{contact.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{contact.jobTitle || 'No title'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          {contact.company && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span>{contact.company}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Added {formatDate(contact.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="hidden md:flex items-center space-x-2">
                        {getSourceBadge(contact.sourceType)}
                        {Number(contact.isFavorite) > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Favorite
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {contact.email && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`mailto:${contact.email}`)}
                            title="Send email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {contact.phone && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`tel:${contact.phone}`)}
                            title="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleFavorite(contact.id)}
                          title={Number(contact.isFavorite) > 0 ? "Remove from favorites" : "Add to favorites"}
                        >
                          {Number(contact.isFavorite) > 0 ? (
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditContact(contact)}
                          title="Edit contact"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Delete contact"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {contacts.length === 0 ? (
                  <>
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">No contacts yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start building your network by adding contacts or sharing your digital business cards
                    </p>
                    <Button 
                      onClick={handleAddContact}
                      className="gradient-bg hover:opacity-90 transition-opacity"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Contact
                    </Button>
                  </>
                ) : (
                  <>
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">No contacts found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery 
                        ? `No contacts match your search for "${searchQuery}"`
                        : `No ${filterType} contacts found`
                      }
                    </p>
                    <div className="flex justify-center space-x-2">
                      {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery('')}>
                          Clear Search
                        </Button>
                      )}
                      {filterType !== 'all' && (
                        <Button variant="outline" onClick={() => setFilterType('all')}>
                          Show All Contacts
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Modal */}
        <ContactModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          contact={editingContact}
          mode={modalMode}
        />

        {/* Import/Export Modal */}
        <ImportExportModal
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          onImportComplete={loadContacts}
        />
      </main>
    </div>
  )
}