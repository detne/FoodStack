/**
 * Admin Sidebar Component
 * Left navigation for admin dashboard
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  Users,
  UtensilsCrossed,
  FolderTree,
  ShoppingCart,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  QrCode,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Branches',
    href: '/branches',
    icon: Store,
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: Users,
  },
  {
    title: 'Menu Items',
    href: '/menu-items',
    icon: UtensilsCrossed,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: FolderTree,
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Reservations',
    href: '/reservations',
    icon: Calendar,
  },
  {
    title: 'QR Codes',
    href: '/qr-codes',
    icon: QrCode,
  },
  {
    title: 'Reviews',
    href: '/reviews',
    icon: MessageSquare,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-primary text-primary-foreground transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8" />
              <span className="text-xl font-bold">QRService</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="flex items-center justify-center w-full">
              <QrCode className="h-8 w-8" />
            </Link>
          )}
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start text-primary-foreground hover:bg-primary-foreground/10',
                      isActive && 'bg-primary-foreground/20 hover:bg-primary-foreground/20',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                    {!collapsed && <span>{item.title}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto bg-primary-foreground/20 px-2 py-0.5 text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4 bg-primary-foreground/20" />

          {/* Settings */}
          <Link to="/settings">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start text-primary-foreground hover:bg-primary-foreground/10',
                collapsed && 'justify-center px-2'
              )}
            >
              <Settings className={cn('h-5 w-5', !collapsed && 'mr-3')} />
              {!collapsed && <span>Settings</span>}
            </Button>
          </Link>
        </ScrollArea>

        {/* Toggle Button */}
        {onToggle && (
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ChevronLeft
                className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
              />
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
