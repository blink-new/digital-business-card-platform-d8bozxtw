import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  CreditCard, 
  Users, 
  BarChart3, 
  Eye,
  Share2,
  TrendingUp,
  Calendar,
  Settings,
  Mail
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import blink from '@/blink/client'
import Navigation from '@/components/Navigation'
import { cardService, contactService, analyticsService, type DigitalCard } from '../services/database'

interface DashboardStats {
  totalCards: number
  totalViews: number
  totalContacts: number
  thisMonthViews: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCards: 0,
    totalViews: 0,
    totalContacts: 0,
    thisMonthViews: 0
  })
  const [recentCards, setRecentCards] = useState<DigitalCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)

        // Load real data from database
        const [userCards, userAnalytics, userContacts] = await Promise.all([
          cardService.getUserCards(),
          analyticsService.getUserAnalytics(),
          contactService.getUserContacts()
        ])

        // Set real stats
        if (userAnalytics) {
          setStats({
            totalCards: userAnalytics.totalCards,
            totalViews: userAnalytics.totalViews,
            totalContacts: userAnalytics.totalContacts,
            thisMonthViews: Math.floor(userAnalytics.totalViews * 0.3) // Approximate this month's views
          })
        }

        // Set recent cards (limit to 3 most recent)
        setRecentCards(userCards.slice(0, 3))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const quickActions = [
    {
      title: 'Create New Card',
      description: 'Design a new digital business card',
      icon: Plus,
      action: () => navigate('/builder'),
      color: 'bg-primary'
    },
    {
      title: 'View Analytics',
      description: 'See your networking insights',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: 'bg-accent'
    },
    {
      title: 'Manage Contacts',
      description: 'Organize your network',
      icon: Users,
      action: () => navigate('/contacts'),
      color: 'bg-green-500'
    },
    {
      title: 'My Cards',
      description: 'View all your cards',
      icon: CreditCard,
      action: () => navigate('/cards'),
      color: 'bg-purple-500'
    },
    {
      title: 'Email Signature',
      description: 'Create professional signatures',
      icon: Mail,
      action: () => navigate('/email-signature'),
      color: 'bg-blue-500'
    },
    {
      title: 'Social Media',
      description: 'Connect social profiles',
      icon: Share2,
      action: () => navigate('/social'),
      color: 'bg-purple-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your digital business cards today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCards}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalContacts}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{stats.thisMonthViews}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+12%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={action.action}
                    className="flex items-center p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Cards */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Cards</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/cards')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCards.length > 0 ? (
                    recentCards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{card.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {card.templateId}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {card.viewCount} views
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={Number(card.isActive) > 0 ? "default" : "secondary"}>
                            {Number(card.isActive) > 0 ? "Active" : "Draft"}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/card/${card.id}`)}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/builder?edit=${card.id}`)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-foreground mb-2">No cards yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first digital business card to get started
                      </p>
                      <Button onClick={() => navigate('/builder')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Card
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}