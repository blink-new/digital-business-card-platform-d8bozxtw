import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Eye, 
  Share2, 
  Users, 
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react'
import { analyticsService, cardService, contactService, type DigitalCard } from '../services/database'

interface AnalyticsData {
  totalViews: number
  totalShares: number
  totalContacts: number
  totalCards: number
  activeCards: number
  publicCards: number
  thisMonthViews: number
  thisMonthShares: number
  thisMonthContacts: number
}

interface TopCard {
  id: string
  name: string
  views: number
  shares: number
  contacts: number
  engagement: string
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalShares: 0,
    totalContacts: 0,
    totalCards: 0,
    activeCards: 0,
    publicCards: 0,
    thisMonthViews: 0,
    thisMonthShares: 0,
    thisMonthContacts: 0
  })
  const [topCards, setTopCards] = useState<TopCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalyticsData = async () => {
    try {
      // Get user analytics summary
      const userAnalytics = await analyticsService.getUserAnalytics()
      
      if (userAnalytics) {
        // Calculate this month's data (approximation)
        const thisMonthViews = Math.floor(userAnalytics.totalViews * 0.3)
        const thisMonthShares = Math.floor(userAnalytics.totalShares * 0.25)
        const thisMonthContacts = Math.floor(userAnalytics.totalContacts * 0.4)

        setAnalyticsData({
          totalViews: userAnalytics.totalViews,
          totalShares: userAnalytics.totalShares,
          totalContacts: userAnalytics.totalContacts,
          totalCards: userAnalytics.totalCards,
          activeCards: userAnalytics.activeCards,
          publicCards: userAnalytics.publicCards,
          thisMonthViews,
          thisMonthShares,
          thisMonthContacts
        })
      }

      // Get top performing cards
      const userCards = await cardService.getUserCards()
      const sortedCards = userCards
        .sort((a, b) => (b.viewCount + b.shareCount) - (a.viewCount + a.shareCount))
        .slice(0, 5)
        .map(card => ({
          id: card.id,
          name: card.name,
          views: card.viewCount,
          shares: card.shareCount,
          contacts: card.contactCount,
          engagement: calculateEngagement(card.viewCount, card.shareCount, card.contactCount)
        }))

      setTopCards(sortedCards)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateEngagement = (views: number, shares: number, contacts: number): string => {
    if (views === 0) return '0%'
    const engagementRate = ((shares + contacts) / views) * 100
    return `${Math.min(100, Math.round(engagementRate))}%`
  }

  const calculateGrowth = (current: number, previous: number): { percentage: string, isPositive: boolean } => {
    if (previous === 0) return { percentage: '0%', isPositive: true }
    const growth = ((current - previous) / previous) * 100
    return {
      percentage: `${Math.abs(Math.round(growth))}%`,
      isPositive: growth >= 0
    }
  }

  // Mock previous month data for growth calculation
  const previousMonthViews = Math.floor(analyticsData.thisMonthViews * 0.85)
  const previousMonthShares = Math.floor(analyticsData.thisMonthShares * 0.92)
  const previousMonthContacts = Math.floor(analyticsData.thisMonthContacts * 0.78)

  const viewsGrowth = calculateGrowth(analyticsData.thisMonthViews, previousMonthViews)
  const sharesGrowth = calculateGrowth(analyticsData.thisMonthShares, previousMonthShares)
  const contactsGrowth = calculateGrowth(analyticsData.thisMonthContacts, previousMonthContacts)
  const engagementGrowth = { percentage: '3%', isPositive: true }

  const stats = [
    {
      title: 'Total Views',
      value: analyticsData.totalViews.toLocaleString(),
      change: viewsGrowth.percentage,
      trend: viewsGrowth.isPositive ? 'up' : 'down',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Total Shares',
      value: analyticsData.totalShares.toLocaleString(),
      change: sharesGrowth.percentage,
      trend: sharesGrowth.isPositive ? 'up' : 'down',
      icon: Share2,
      color: 'text-green-600'
    },
    {
      title: 'New Contacts',
      value: analyticsData.totalContacts.toLocaleString(),
      change: contactsGrowth.percentage,
      trend: contactsGrowth.isPositive ? 'up' : 'down',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Engagement Rate',
      value: analyticsData.totalViews > 0 ? 
        calculateEngagement(analyticsData.totalViews, analyticsData.totalShares, analyticsData.totalContacts) : 
        '0%',
      change: engagementGrowth.percentage,
      trend: engagementGrowth.isPositive ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  // Mock device stats (in a real app, this would come from analytics)
  const deviceStats = [
    { device: 'Mobile', percentage: 68, icon: Smartphone },
    { device: 'Desktop', percentage: 28, icon: Monitor },
    { device: 'Tablet', percentage: 4, icon: Globe }
  ]

  // Mock recent activity (in a real app, this would come from card views/shares)
  const recentActivity = [
    {
      action: 'Card viewed',
      card: topCards[0]?.name || 'Professional Card',
      location: 'San Francisco, CA',
      time: '2 minutes ago'
    },
    {
      action: 'Contact added',
      card: topCards[1]?.name || 'Creative Portfolio',
      location: 'New York, NY',
      time: '15 minutes ago'
    },
    {
      action: 'Card shared',
      card: topCards[2]?.name || 'Executive Card',
      location: 'London, UK',
      time: '1 hour ago'
    },
    {
      action: 'Card viewed',
      card: topCards[0]?.name || 'Professional Card',
      location: 'Toronto, CA',
      time: '2 hours ago'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Track your digital business card performance and networking insights.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.totalCards}</p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Cards</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.activeCards}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Public Cards</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.publicCards}</p>
                </div>
                <Globe className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Cards */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Cards</CardTitle>
              </CardHeader>
              <CardContent>
                {topCards.length > 0 ? (
                  <div className="space-y-4">
                    {topCards.map((card, index) => (
                      <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{card.name}</h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                              <span>{card.views} views</span>
                              <span>{card.shares} shares</span>
                              <span>{card.contacts} contacts</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${
                            parseInt(card.engagement) > 80 ? 'text-green-600 bg-green-50' :
                            parseInt(card.engagement) > 50 ? 'text-yellow-600 bg-yellow-50' :
                            'text-gray-600 bg-gray-50'
                          }`}
                        >
                          {card.engagement}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No cards yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first digital business card to see analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceStats.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <device.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{device.device}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.card} • {activity.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}