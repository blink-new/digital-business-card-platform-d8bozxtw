import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Menu,
  X,
  LogOut,
  QrCode,
  Smartphone,
  Mail,
  Share2
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import blink from '@/blink/client'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await blink.auth.logout('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Cards',
      href: '/cards',
      icon: CreditCard
    },
    {
      name: 'QR Codes',
      href: '/qr-codes',
      icon: QrCode
    },
    {
      name: 'Contacts',
      href: '/contacts',
      icon: Users
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3
    },
    {
      name: 'NFC Manager',
      href: '/nfc',
      icon: Smartphone
    },
    {
      name: 'Email Signature',
      href: '/email-signature',
      icon: Mail
    },
    {
      name: 'Social Media',
      href: '/social',
      icon: Share2
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">CardConnect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                onClick={() => navigate(item.href)}
                className="flex items-center space-x-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/builder')}
              className="gradient-bg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Card
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  onClick={() => {
                    navigate(item.href)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full justify-start"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Button>
              ))}
              <div className="pt-4 border-t space-y-2">
                <Button 
                  onClick={() => {
                    navigate('/builder')
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full gradient-bg hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Card
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}