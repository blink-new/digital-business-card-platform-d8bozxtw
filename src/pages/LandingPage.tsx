import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  QrCode, 
  BarChart3, 
  Users, 
  Smartphone, 
  Globe, 
  Zap, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'
import blink from '@/blink/client'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      await blink.auth.login('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: CreditCard,
      title: 'Digital Business Cards',
      description: 'Create stunning, professional digital business cards that make lasting impressions.'
    },
    {
      icon: QrCode,
      title: 'QR Code & NFC Sharing',
      description: 'Share your contact info instantly with QR codes and NFC technology.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track views, shares, and engagement to optimize your networking strategy.'
    },
    {
      icon: Users,
      title: 'Contact Management',
      description: 'Organize and manage your professional network with powerful CRM tools.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience across all devices - mobile, tablet, and desktop.'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'Share your cards worldwide with instant, real-time updates.'
    }
  ]

  const benefits = [
    'Eco-friendly alternative to paper cards',
    'Real-time updates to all shared cards',
    'Professional templates and customization',
    'Lead capture and follow-up tools',
    'Team collaboration features',
    'Advanced analytics and reporting'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CardConnect</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <Button variant="outline" onClick={handleGetStarted} disabled={isLoading}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              <Zap className="h-3 w-3 mr-1" />
              The Future of Business Networking
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Your Digital
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Business Card</span>
              <br />Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Create, share, and manage professional digital business cards with advanced networking features. 
              Make meaningful connections and grow your network effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 gradient-bg hover:opacity-90 transition-opacity"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Free to start
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to network professionally
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you create, share, and manage your professional network.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why choose CardConnect?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of professionals who have transformed their networking with our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="card-shadow border-0">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mr-4">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Professional Impact</h3>
                      <p className="text-sm text-muted-foreground">Make lasting impressions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Card Views</span>
                      <span className="font-semibold text-foreground">2,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Contacts Added</span>
                      <span className="font-semibold text-foreground">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement Rate</span>
                      <span className="font-semibold text-green-600">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your networking?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals using CardConnect to build meaningful business relationships.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-white text-foreground hover:bg-gray-100 transition-colors"
            onClick={handleGetStarted}
            disabled={isLoading}
          >
            Start Building Your Card
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CardConnect</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 CardConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}