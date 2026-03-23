/**
 * Staff Dashboard
 * Main dashboard for restaurant staff
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Calendar,
  Grid3x3,
  Receipt,
  LogOut,
} from 'lucide-react';
import StaffReservations from './StaffReservations';
import StaffTables from './StaffTables';
import StaffOrders from './StaffOrders';
import StaffOverview from './StaffOverview';

interface NavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    subtitle: 'Dashboard summary',
    href: '/staff/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Reservations',
    subtitle: 'Manage bookings',
    href: '/staff/reservations',
    icon: Calendar,
  },
  {
    title: 'Tables',
    subtitle: 'Table status',
    href: '/staff/tables',
    icon: Grid3x3,
  },
  {
    title: 'Orders',
    subtitle: 'View orders',
    href: '/staff/orders',
    icon: Receipt,
  },
];

export default function StaffDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState('/staff/overview');
  const [branchInfo, setBranchInfo] = useState<any>(null);

  useEffect(() => {
    // Load branch info
    const branchId = localStorage.getItem('selected_branch_id');
    if (branchId) {
      fetchBranchInfo(branchId);
    }
  }, []);

  useEffect(() => {
    const currentItem = navItems.find(item => location.pathname.startsWith(item.href));
    if (currentItem) {
      setSelectedItem(currentItem.href);
    }
  }, [location.pathname]);

  const fetchBranchInfo = async (branchId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/branches/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setBranchInfo(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching branch info:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-72 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">FS</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">FoodStack</h2>
              <p className="text-xs text-muted-foreground">Staff Portal</p>
            </div>
          </div>
        </div>

        {/* Branch Info */}
        {branchInfo && (
          <div className="px-6 py-4 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Current Branch</p>
            <p className="font-medium">{branchInfo.name}</p>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedItem === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    setSelectedItem(item.href);
                    navigate(item.href);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className={cn(
                      'text-xs',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <Separator />

        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.fullName?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.fullName || 'Staff'}</p>
              <Badge variant="secondary" className="text-xs">
                Staff
              </Badge>
            </div>
          </div>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {location.pathname === '/staff' || 
             location.pathname === '/staff/' || 
             location.pathname === '/staff/overview' ? (
              <StaffOverview />
            ) : location.pathname === '/staff/reservations' ? (
              <StaffReservations />
            ) : location.pathname === '/staff/tables' ? (
              <StaffTables />
            ) : location.pathname === '/staff/orders' ? (
              <StaffOrders />
            ) : (
              <StaffOverview />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
