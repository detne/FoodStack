/**
 * UI Showcase
 * Quick navigation to all pages
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Store, Users, UtensilsCrossed, FolderTree,
  ShoppingCart, Calendar, QrCode, MessageSquare, BarChart3,
  Settings, MapPin, Grid3x3, Bell, ChefHat
} from 'lucide-react';

const pages = [
  {
    category: 'Dashboard & Core',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  },
  {
    category: 'Branch Management',
    items: [
      { name: 'Branches List', path: '/branches', icon: Store },
      { name: 'Create Branch', path: '/branches/create', icon: Store },
      { name: 'Branch Details', path: '/branches/1', icon: Store },
    ]
  },
  {
    category: 'Menu Management',
    items: [
      { name: 'Categories', path: '/categories', icon: FolderTree },
      { name: 'Create Category', path: '/categories/create', icon: FolderTree },
      { name: 'Menu Items', path: '/menu-items', icon: UtensilsCrossed },
      { name: 'Create Menu Item', path: '/menu-items/create', icon: UtensilsCrossed },
    ]
  },
  {
    category: 'Tables & Areas',
    items: [
      { name: 'Physical Sections', path: '/areas', icon: MapPin },
      { name: 'Table Management', path: '/tables', icon: Grid3x3 },
    ]
  },
  {
    category: 'Orders & Kitchen',
    items: [
      { name: 'Orders List', path: '/orders', icon: ShoppingCart },
      { name: 'Order Detail', path: '/orders/ORD-001', icon: ShoppingCart },
      { name: 'Kitchen Display', path: '/kitchen', icon: ChefHat },
    ]
  },
  {
    category: 'Operations',
    items: [
      { name: 'Service Requests', path: '/service-requests', icon: Bell },
      { name: 'QR Codes', path: '/qr-codes', icon: QrCode },
      { name: 'Staff Management', path: '/staff', icon: Users },
      { name: 'Reservations', path: '/reservations', icon: Calendar },
    ]
  },
  {
    category: 'Customer Relations',
    items: [
      { name: 'Reviews & Feedback', path: '/reviews', icon: MessageSquare },
    ]
  },
];

export default function UIShowcase() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            QRService UI Showcase
          </h1>
          <p className="text-xl text-muted-foreground">
            Navigate to any page to preview the UI
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All pages use mock data - no backend required
          </p>
        </div>

        <div className="space-y-8">
          {pages.map((section) => (
            <Card key={section.category}>
              <CardHeader>
                <CardTitle className="text-2xl">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        variant="outline"
                        className="h-auto py-4 justify-start hover:bg-purple-50 hover:border-purple-300 transition-all"
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className="h-5 w-5 mr-3 text-purple-600" />
                        <span className="font-medium">{item.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">🎉 30+ Pages Complete!</h3>
              <p className="text-muted-foreground mb-4">
                All UI pages are ready with mock data
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/dashboard')} size="lg">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/login')} variant="outline" size="lg">
                  Login Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
