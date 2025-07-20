import { blink } from '../blink/client'

// Types for our database entities
export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  company?: string
  jobTitle?: string
  phone?: string
  website?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface DigitalCard {
  id: string
  userId: string
  name: string
  templateId: string
  isActive: string // SQLite boolean as "0"/"1"
  isPublic: string // SQLite boolean as "0"/"1"
  
  // Card content
  fullName?: string
  jobTitle?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  bio?: string
  profileImageUrl?: string
  companyLogoUrl?: string
  
  // Social media
  linkedinUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  
  // Customization
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  
  // Analytics
  viewCount: number
  shareCount: number
  contactCount: number
  
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  userId: string
  fullName: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  website?: string
  notes?: string
  sourceType: string
  sourceCardId?: string
  tags?: string // JSON array
  isFavorite: string // SQLite boolean as "0"/"1"
  lastContacted?: string
  createdAt: string
  updatedAt: string
}

export interface CardView {
  id: string
  cardId: string
  viewerIp?: string
  viewerUserAgent?: string
  viewerLocation?: string
  referrer?: string
  viewedAt: string
}

export interface CardShare {
  id: string
  cardId: string
  shareMethod: string
  sharedAt: string
}

// User service functions
export const userService = {
  async createOrUpdateUser(userData: Partial<User>) {
    const user = await blink.auth.me()
    if (!user) throw new Error('User not authenticated')

    const existingUser = await blink.db.users.list({
      where: { id: user.id },
      limit: 1
    })

    if (existingUser.length > 0) {
      return await blink.db.users.update(user.id, {
        ...userData,
        updatedAt: new Date().toISOString()
      })
    } else {
      return await blink.db.users.create({
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const user = await blink.auth.me()
    if (!user) return null

    const users = await blink.db.users.list({
      where: { id: user.id },
      limit: 1
    })

    return users[0] || null
  }
}

// Digital Cards service functions
export const cardService = {
  async createCard(cardData: Partial<DigitalCard>): Promise<DigitalCard> {
    const user = await blink.auth.me()
    if (!user) throw new Error('User not authenticated')

    const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return await blink.db.digitalCards.create({
      id: cardId,
      userId: user.id,
      name: cardData.name || 'My Business Card',
      templateId: cardData.templateId || 'modern',
      isActive: "1",
      isPublic: "1",
      backgroundColor: cardData.backgroundColor || '#2563EB',
      textColor: cardData.textColor || '#FFFFFF',
      accentColor: cardData.accentColor || '#F59E0B',
      fontFamily: cardData.fontFamily || 'Inter',
      viewCount: 0,
      shareCount: 0,
      contactCount: 0,
      ...cardData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },

  async getUserCards(): Promise<DigitalCard[]> {
    const user = await blink.auth.me()
    if (!user) return []

    return await blink.db.digitalCards.list({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  },

  async getCardById(cardId: string): Promise<DigitalCard | null> {
    const cards = await blink.db.digitalCards.list({
      where: { id: cardId },
      limit: 1
    })
    return cards[0] || null
  },

  async getPublicCard(cardId: string): Promise<DigitalCard | null> {
    const cards = await blink.db.digitalCards.list({
      where: { 
        id: cardId,
        isPublic: "1",
        isActive: "1"
      },
      limit: 1
    })
    return cards[0] || null
  },

  async updateCard(cardId: string, updates: Partial<DigitalCard>): Promise<void> {
    await blink.db.digitalCards.update(cardId, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  },

  async deleteCard(cardId: string): Promise<void> {
    await blink.db.digitalCards.delete(cardId)
  },

  async incrementViewCount(cardId: string): Promise<void> {
    const card = await this.getCardById(cardId)
    if (card) {
      await this.updateCard(cardId, {
        viewCount: card.viewCount + 1
      })
    }
  },

  async incrementShareCount(cardId: string): Promise<void> {
    const card = await this.getCardById(cardId)
    if (card) {
      await this.updateCard(cardId, {
        shareCount: card.shareCount + 1
      })
    }
  }
}

// Contacts service functions
export const contactService = {
  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    const user = await blink.auth.me()
    if (!user) throw new Error('User not authenticated')

    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return await blink.db.contacts.create({
      id: contactId,
      userId: user.id,
      fullName: contactData.fullName || 'Unknown Contact',
      sourceType: contactData.sourceType || 'manual',
      isFavorite: "0",
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },

  async getUserContacts(): Promise<Contact[]> {
    const user = await blink.auth.me()
    if (!user) return []

    return await blink.db.contacts.list({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  },

  async searchContacts(query: string): Promise<Contact[]> {
    const user = await blink.auth.me()
    if (!user) return []

    // Note: This is a simple implementation. In a real app, you'd want full-text search
    const allContacts = await this.getUserContacts()
    return allContacts.filter(contact => 
      contact.fullName.toLowerCase().includes(query.toLowerCase()) ||
      contact.email?.toLowerCase().includes(query.toLowerCase()) ||
      contact.company?.toLowerCase().includes(query.toLowerCase())
    )
  },

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<void> {
    await blink.db.contacts.update(contactId, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  },

  async deleteContact(contactId: string): Promise<void> {
    await blink.db.contacts.delete(contactId)
  },

  async toggleFavorite(contactId: string): Promise<void> {
    const contacts = await blink.db.contacts.list({
      where: { id: contactId },
      limit: 1
    })
    
    if (contacts[0]) {
      const isFavorite = Number(contacts[0].isFavorite) > 0 ? "0" : "1"
      await this.updateContact(contactId, { isFavorite })
    }
  }
}

// Analytics service functions
export const analyticsService = {
  async recordCardView(cardId: string, viewerData?: Partial<CardView>): Promise<void> {
    const viewId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await blink.db.cardViews.create({
      id: viewId,
      cardId,
      ...viewerData,
      viewedAt: new Date().toISOString()
    })

    // Increment view count on the card
    await cardService.incrementViewCount(cardId)
  },

  async recordCardShare(cardId: string, shareMethod: string): Promise<void> {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await blink.db.cardShares.create({
      id: shareId,
      cardId,
      shareMethod,
      sharedAt: new Date().toISOString()
    })

    // Increment share count on the card
    await cardService.incrementShareCount(cardId)
  },

  async getCardAnalytics(cardId: string) {
    const [views, shares] = await Promise.all([
      blink.db.cardViews.list({
        where: { cardId },
        orderBy: { viewedAt: 'desc' }
      }),
      blink.db.cardShares.list({
        where: { cardId },
        orderBy: { sharedAt: 'desc' }
      })
    ])

    // Group views by date for chart data
    const viewsByDate = views.reduce((acc, view) => {
      const date = new Date(view.viewedAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group shares by method
    const sharesByMethod = shares.reduce((acc, share) => {
      acc[share.shareMethod] = (acc[share.shareMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalViews: views.length,
      totalShares: shares.length,
      viewsByDate,
      sharesByMethod,
      recentViews: views.slice(0, 10),
      recentShares: shares.slice(0, 10)
    }
  },

  async getUserAnalytics() {
    const user = await blink.auth.me()
    if (!user) return null

    const cards = await cardService.getUserCards()
    const contacts = await contactService.getUserContacts()

    const totalViews = cards.reduce((sum, card) => sum + card.viewCount, 0)
    const totalShares = cards.reduce((sum, card) => sum + card.shareCount, 0)
    const totalContacts = contacts.length

    return {
      totalCards: cards.length,
      totalViews,
      totalShares,
      totalContacts,
      activeCards: cards.filter(card => Number(card.isActive) > 0).length,
      publicCards: cards.filter(card => Number(card.isPublic) > 0).length
    }
  }
}