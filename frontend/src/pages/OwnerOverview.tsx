/**
 * Owner Overview Page
 * Dashboard summary and KPIs for restaurant owners
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function OwnerOverview() {
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

      {/* Alert Banner */}
      <Card className="border-amber-200 bg-amber-50/80 animate-in slide-in-from-top duration-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                Branch Creation Limit Reached
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                You've reached the maximum number of branches for your current package. 
                Please upgrade to Premium to create more branches and unlock additional features.
              </p>
            </div>
            <Button 
              size="sm" 
              className="flex-shrink-0 shadow-sm"
            >
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>

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
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Store className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              You don't have any branches for this brand. Create your first branch to start accepting orders.
            </p>
            <Button className="gap-2 shadow-sm hover:shadow-md transition-all duration-300">
              <Plus className="h-4 w-4" />
              Create First Branch
            </Button>
          </div>
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
    </div>
  );
}
