/**
 * Owner Overview Page
 * Dashboard summary and KPIs for restaurant owners
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Store,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Star,
  Plus,
  AlertCircle,
  ArrowUpRight,
  Building2,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';
import BranchEdit from './BranchEdit';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const ordersData = [
  { day: 'Mon', orders: 45 },
  { day: 'Tue', orders: 52 },
  { day: 'Wed', orders: 48 },
  { day: 'Thu', orders: 61 },
  { day: 'Fri', orders: 75 },
  { day: 'Sat', orders: 88 },
  { day: 'Sun', orders: 72 },
];

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  restaurant_id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string;
  max_branches: number;
  max_tables: number;
  created_at: string;
  updated_at: string;
}

export default function OwnerOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    console.log('OwnerOverview - User data:', user);
    if (user?.restaurant?.id) {
      fetchData();
    } else {
      console.log('No restaurant ID found in user data');
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    await Promise.all([
      fetchBranches(),
      fetchSubscription(),
    ]);
  };

  const fetchSubscription = async () => {
    try {
      console.log('Fetching subscription...');
      const response = await apiClient.getCurrentSubscription();
      console.log('Subscription response:', response);
      
      if (response.success && response.data) {
        console.log('Subscription data:', response.data);
        setSubscription(response.data);
      } else {
        console.log('No subscription data in response');
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      // Don't show error toast for subscription - it's optional
    }
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('Fetching branches for restaurant:', user?.restaurant?.id);
      
      const response = await apiClient.getBranches(user?.restaurant?.id);
      console.log('Branches response:', response);
      
      if (response.success && response.data) {
        // Handle both formats: direct array or {items: [...], pagination: {...}}
        let branchesData = [];
        if (Array.isArray(response.data)) {
          branchesData = response.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          branchesData = response.data.items;
        }
        
        console.log('OwnerOverview - Set branches:', branchesData);
        setBranches(branchesData);
      } else {
        console.error('Failed to fetch branches:', response.message);
        setBranches([]); // Set empty array on error
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      setBranches([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBranchStatus = async (branchId: string, currentStatus: string) => {
    try {
      setUpdatingStatus(branchId);
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      console.log(`Updating branch ${branchId} status from ${currentStatus} to ${newStatus}`);
      
      const response = await apiClient.updateBranch(branchId, { status: newStatus });
      
      if (response.success) {
        // Update local state
        setBranches(prev => prev.map(branch => 
          branch.id === branchId 
            ? { ...branch, status: newStatus }
            : branch
        ));
        
        toast({
          title: "Success",
          description: `Branch ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
        });
      } else {
        throw new Error(response.message || 'Failed to update branch status');
      }
    } catch (error: any) {
      console.error('Error updating branch status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update branch status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const activeBranches = branches.filter(b => b.status === 'ACTIVE');
  const inactiveBranches = branches.filter(b => b.status === 'INACTIVE');
  const displayBranches = activeTab === 'active' ? activeBranches : inactiveBranches;
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Your restaurant performance at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
          >
            Choose Another Restaurant
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Branch
          </Button>
        </div>
      </div>

      {/* Alert Banner - Show subscription info */}
      {subscription && (
        <Card className={`border-2 animate-in slide-in-from-top duration-700 ${
          subscription.plan_type.toUpperCase() === 'FREE' 
            ? 'border-amber-200 bg-amber-50/80' 
            : subscription.plan_type.toUpperCase() === 'PRO'
            ? 'border-blue-200 bg-blue-50/80'
            : 'border-purple-200 bg-purple-50/80'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                subscription.plan_type.toUpperCase() === 'FREE'
                  ? 'bg-amber-100'
                  : subscription.plan_type.toUpperCase() === 'PRO'
                  ? 'bg-blue-100'
                  : 'bg-purple-100'
              }`}>
                {subscription.plan_type.toUpperCase() === 'FREE' ? (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                ) : (
                  <Star className={`h-5 w-5 ${
                    subscription.plan_type.toUpperCase() === 'PRO' ? 'text-blue-600' : 'text-purple-600'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${
                    subscription.plan_type.toUpperCase() === 'FREE'
                      ? 'text-amber-900'
                      : subscription.plan_type.toUpperCase() === 'PRO'
                      ? 'text-blue-900'
                      : 'text-purple-900'
                  }`}>
                    Gói {subscription.plan_type.toUpperCase()}
                  </h3>
                  <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
                <p className={`text-sm mt-1 ${
                  subscription.plan_type.toUpperCase() === 'FREE'
                    ? 'text-amber-700'
                    : subscription.plan_type.toUpperCase() === 'PRO'
                    ? 'text-blue-700'
                    : 'text-purple-700'
                }`}>
                  {subscription.plan_type.toUpperCase() === 'FREE' ? (
                    <>
                      Giới hạn: {subscription.max_branches} chi nhánh, {subscription.max_tables} bàn/chi nhánh.
                      {activeBranches.length >= subscription.max_branches && 
                        ' Bạn đã đạt giới hạn chi nhánh. Nâng cấp để tạo thêm chi nhánh.'}
                    </>
                  ) : (
                    <>
                      Không giới hạn chi nhánh và bàn. Hết hạn: {new Date(subscription.end_date).toLocaleDateString('vi-VN')}
                    </>
                  )}
                </p>
              </div>
              {subscription.plan_type.toUpperCase() === 'FREE' && (
                <Button 
                  size="sm" 
                  className="flex-shrink-0 shadow-sm"
                  onClick={() => navigate('/pricing')}
                >
                  Nâng cấp
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    All branches
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold tracking-tight">VND</p>
                <div className="flex items-center gap-1 mt-3">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Per completed order
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-700 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Completed, Cancelled
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-bold tracking-tight">—</p>
                <div className="flex items-center gap-1 mt-3">
                  <Badge variant="outline" className="text-muted-foreground border-gray-200">
                    No data available
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-1000 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Per completed order
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Avg Order Value
                </p>
                <p className="text-3xl font-bold tracking-tight">VND</p>
                <div className="flex items-center gap-1 mt-3">
                  <Badge variant="outline" className="text-muted-foreground border-gray-200">
                    No comparison data
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Hidden when no data */}
      {false && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monthly revenue over the last 6 months
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Weekly Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily orders for the current week
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Branch Management Section */}
      <Card className="animate-in slide-in-from-bottom duration-1000 hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Branch Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your restaurant branches
                </p>
              </div>
            </div>
            <Button className="gap-2" onClick={() => window.location.href = '/owner/branch-setup'}>
              <Plus className="h-4 w-4" />
              Create Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Store className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                You don't have any branches for this brand. Create your first branch to start accepting orders.
              </p>
              <Button className="gap-2 shadow-sm hover:shadow-md transition-all duration-300" onClick={() => window.location.href = '/owner/branch-setup'}>
                <Plus className="h-4 w-4" />
                Create First Branch
              </Button>
            </div>
          ) : (
            <>
              {/* Branch Tabs */}
              <div className="border-b">
                <div className="flex">
                  <button 
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'active'
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('active')}
                  >
                    Active ({activeBranches.length})
                  </button>
                  <button 
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'inactive'
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('inactive')}
                  >
                    Inactive ({inactiveBranches.length})
                  </button>
                </div>
              </div>

              {/* Activate All Branches Banner (only show on inactive tab if there are inactive branches) */}
              {activeTab === 'inactive' && inactiveBranches.length > 0 && (
                <div className="p-4 bg-green-50 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Store className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">Activate All Branches</h4>
                        <p className="text-sm text-green-700">This will make all inactive branches available again.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={false}
                      onCheckedChange={async (checked) => {
                        if (checked) {
                          // Activate all inactive branches
                          for (const branch of inactiveBranches) {
                            await handleToggleBranchStatus(branch.id, branch.status);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Branch List */}
              <div className="divide-y">
                {displayBranches.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No {activeTab} branches found</p>
                  </div>
                ) : (
                  Array.isArray(displayBranches) && displayBranches.map((branch, index) => (
                    <div
                      key={branch.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                            <Store className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                              <Badge 
                                variant={branch.status === 'ACTIVE' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  branch.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {branch.status.toLowerCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{branch.address}</p>
                            {branch.phone && (
                              <p className="text-xs text-gray-400">{branch.phone}</p>
                            )}
                            <button className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-2">
                              View Public Page
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          {/* Performance Metrics */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">0</div>
                            <div className="text-xs text-gray-500">Orders Today</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">VND 0</div>
                            <div className="text-xs text-gray-500">Revenue</div>
                          </div>
                          
                          {/* Status Toggle */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {branch.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                            <Switch 
                              checked={branch.status === 'ACTIVE'}
                              disabled={updatingStatus === branch.id}
                              onCheckedChange={() => handleToggleBranchStatus(branch.id, branch.status)}
                            />
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBranch(branch.id);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Branch Performance Section */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Branch Performance</h3>
                  <select className="text-sm border rounded-md px-3 py-1">
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Daily</option>
                  </select>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <p>No branch performance data available</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Branch Performance - Hidden when no branches */}
      {false && (
        <Card className="animate-in slide-in-from-bottom duration-1000">
          <CardHeader>
            <CardTitle>Branch Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare performance across all branches
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: 'Downtown Plaza',
                  revenue: 28450,
                  orders: 456,
                  rating: 4.9,
                  growth: 15.2,
                },
                {
                  name: 'Harbor View',
                  revenue: 22340,
                  orders: 384,
                  rating: 4.7,
                  growth: 8.5,
                },
                {
                  name: 'Westside Mall',
                  revenue: 17100,
                  orders: 294,
                  rating: 4.6,
                  growth: -2.3,
                },
              ].map((branch, index) => (
                <div
                  key={branch.name}
                  className="group flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 hover:shadow-md transition-all duration-300 cursor-pointer animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{branch.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {branch.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${branch.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {branch.rating}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <Badge
                        variant={branch.growth > 0 ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {branch.growth > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {branch.growth > 0 ? '+' : ''}
                        {branch.growth}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Growth</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Edit Dialog */}
      {editingBranch && (
        <BranchEdit
          branchId={editingBranch}
          isOpen={!!editingBranch}
          onClose={() => setEditingBranch(null)}
          onSuccess={() => {
            setEditingBranch(null);
            fetchBranches(); // Refresh the list
          }}
        />
      )}
    </div>
  );
}
