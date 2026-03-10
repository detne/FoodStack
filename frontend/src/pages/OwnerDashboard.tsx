/**
 * Owner Dashboard
 * Main dashboard for restaurant owners after login
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  FolderTree,
  Grid3x3,
  Users,
  Palette,
  BarChart3,
  Settings as SettingsIcon,
  Home,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import OwnerOverview from './OwnerOverview';

interface NavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    subtitle: 'Dashboard summary and KPIs',
    href: '/owner/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Restaurant Information',
    subtitle: 'Manage restaurant',
    href: '/owner/restaurant',
    icon: Store,
  },
  {
    title: 'Menu Management',
    subtitle: 'Manage menu items',
    href: '/menu-items',
    icon: UtensilsCrossed,
  },
  {
    title: 'Manage Categories',
    subtitle: 'Manage categories, toppings',
    href: '/categories',
    icon: FolderTree,
  },
  {
    title: 'Table Management',
    subtitle: 'Manage tables and QR codes',
    href: '/tables',
    icon: Grid3x3,
  },
  {
    title: 'Staff Management',
    subtitle: 'Manage staff accounts',
    href: '/staff',
    icon: Users,
  },
  {
    title: 'Branding',
    subtitle: 'Customize branch appearance',
    href: '/owner/branding',
    icon: Palette,
  },
  {
    title: 'Reports & Analytics',
    subtitle: 'View performance metrics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Manager Dashboard',
    subtitle: 'Access manager dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
];

export default function OwnerDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Set selected item based on current path
    const currentItem = navItems.find(item => location.pathname.startsWith(item.href));
    if (currentItem) {
      setSelectedItem(currentItem.href);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user initials for avatar
  const userInitials = user.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 h-screen">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">
                {user.restaurant?.name || 'FoodStack'}
              </h1>
              <p className="text-xs text-muted-foreground">Owner Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedItem === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSelectedItem(item.href)}
                >
                  <div
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer group',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mt-0.5 flex-shrink-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-primary-foreground' : 'text-foreground'
                        )}
                      >
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          'text-xs mt-0.5',
                          isActive
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        )}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        isActive && 'opacity-100'
                      )}
                    />
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground uppercase">
                {user.role || 'RESTAURANT_OWNER'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Show Overview by default or nested routes */}
            {location.pathname === '/owner' || location.pathname === '/owner/' ? (
              <OwnerOverview />
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
