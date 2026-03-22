/**
 * Manager Dashboard
 * Main dashboard for branch managers
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Grid3x3,
  Users,
  Receipt,
  Tag,
  Home,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import ManagerOverview from './ManagerOverview';
import ManagerBranchInfo from './ManagerBranchInfo';
import ManagerTables from './ManagerTables';
import ManagerMenu from './ManagerMenu';
import ManagerBills from './ManagerBills';
import ManagerStaff from './ManagerStaff';
import ManagerPromotions from './ManagerPromotions';
import ManagerReservations from './ManagerReservations';

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
    href: '/manager/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Branch Info',
    subtitle: 'Branch details',
    href: '/manager/branch-info',
    icon: Store,
  },
  {
    title: 'Tables',
    subtitle: 'Table management',
    href: '/manager/tables',
    icon: Grid3x3,
  },
  {
    title: 'Reservations',
    subtitle: 'Booking management',
    href: '/manager/reservations',
    icon: Calendar,
  },
  {
    title: 'Menu',
    subtitle: 'Menu management',
    href: '/manager/menu',
    icon: UtensilsCrossed,
  },
  {
    title: 'Bills',
    subtitle: 'View bill history',
    href: '/manager/bills',
    icon: Receipt,
  },
  {
    title: 'Staff',
    subtitle: 'Staff management',
    href: '/manager/staff',
    icon: Users,
  },
  {
    title: 'Promotions',
    subtitle: 'Manage promotions',
    href: '/manager/promotions',
    icon: Tag,
  },
];

export default function ManagerDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [branchInfo, setBranchInfo] = useState<any>(null);
  const [isOwnerView, setIsOwnerView] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Check if owner is viewing (from localStorage flag)
    const ownerViewing = localStorage.getItem('owner_viewing_branch') === 'true';
    setIsOwnerView(ownerViewing);

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

      // Check for 401 Unauthorized
      if (response.status === 401) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('owner_viewing_branch');
        localStorage.removeItem('selected_branch_id');
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

  const handleReturnToOwner = () => {
    localStorage.removeItem('owner_viewing_branch');
    localStorage.removeItem('selected_branch_id');
    navigate('/owner');
  };

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

  const userInitials = user.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

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
                {branchInfo?.name || 'Branch'}
              </h1>
              <p className="text-xs text-muted-foreground">Manager Portal</p>
            </div>
          </div>
        </div>

        {/* Owner View Notice */}
        {isOwnerView && (
          <div className="px-3 pt-3">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-primary font-medium mb-2">Owner View</p>
              <p className="text-xs text-muted-foreground mb-2">
                Viewing as manager. No branch selected
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReturnToOwner}
                className="w-full text-xs h-8"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Owner Dashboard
              </Button>
            </div>
          </div>
        )}

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
                      'flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer',
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
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Manager</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {isOwnerView ? 'RESTAURANT_OWNER' : 'BRANCH_MANAGER'}
              </Badge>
            </div>
          </div>

          {branchInfo && (
            <p className="text-xs text-muted-foreground mb-3 truncate">
              {branchInfo.address}
            </p>
          )}

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
            {!isOwnerView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {location.pathname === '/manager' || location.pathname === '/manager/' || location.pathname === '/manager/overview' ? (
              <ManagerOverview />
            ) : location.pathname === '/manager/branch-info' ? (
              <ManagerBranchInfo />
            ) : location.pathname === '/manager/tables' ? (
              <ManagerTables />
            ) : location.pathname === '/manager/reservations' ? (
              <ManagerReservations />
            ) : location.pathname === '/manager/menu' ? (
              <ManagerMenu />
            ) : location.pathname === '/manager/bills' ? (
              <ManagerBills />
            ) : location.pathname === '/manager/staff' ? (
              <ManagerStaff />
            ) : location.pathname === '/manager/promotions' ? (
              <ManagerPromotions />
            ) : (
              <ManagerOverview />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
