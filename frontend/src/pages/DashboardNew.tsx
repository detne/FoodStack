/**
 * Admin Dashboard Overview
 * Main dashboard with KPIs, charts, and live operations
 */

import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  MapPin,
  Plus,
  TrendingUp,
  Bell,
} from 'lucide-react';

// Mock data - replace with real API calls
const mockData = {
  stats: {
    totalRevenue: 12540.0,
    revenueChange: 12.5,
    totalOrders: 1204,
    ordersChange: 8.2,
    activeTables: 42,
    tablesChange: -2.1,
    avgServiceTime: '14m 20s',
    serviceChange: -4.3,
  },
  branches: [
    { id: 1, name: 'Downtown Branch', status: 'AVAILABLE', tables: 20, staff: 8 },
    { id: 2, name: 'Uptown Gastro', status: 'BUSY', tables: 20, staff: 12 },
    { id: 3, name: 'Airport Terminal', status: 'AVAILABLE', tables: 45, staff: 6 },
  ],
  recentActivity: [
    {
      id: 1,
      type: 'order',
      title: 'New Order Placed #402',
      branch: 'Downtown Branch',
      amount: '$45.90',
      time: '2m ago',
    },
    {
      id: 2,
      type: 'service',
      title: 'Service Request Table 4',
      branch: 'Uptown Gastro',
      time: '5m ago',
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Confirmed #398',
      branch: 'Airport Terminal',
      time: '12m ago',
    },
  ],
  topItems: [
    { name: 'Quinoa Power Bowl', sold: 342, progress: 85 },
    { name: 'Signature Wagyu Burger', sold: 289, progress: 72 },
    { name: 'Specialty Arabica Latte', sold: 215, progress: 54 },
  ],
};

export default function DashboardNew() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`$${mockData.stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{
              value: mockData.stats.revenueChange,
              isPositive: mockData.stats.revenueChange > 0,
            }}
            description="vs last month"
          />
          <MetricCard
            title="Total Orders"
            value={mockData.stats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            trend={{
              value: mockData.stats.ordersChange,
              isPositive: mockData.stats.ordersChange > 0,
            }}
            description="vs last month"
          />
          <MetricCard
            title="Active Tables"
            value={mockData.stats.activeTables}
            icon={Users}
            trend={{
              value: Math.abs(mockData.stats.tablesChange),
              isPositive: mockData.stats.tablesChange > 0,
            }}
            description="currently occupied"
          />
          <MetricCard
            title="Avg. Service Time"
            value={mockData.stats.avgServiceTime}
            icon={Clock}
            trend={{
              value: Math.abs(mockData.stats.serviceChange),
              isPositive: mockData.stats.serviceChange < 0,
            }}
            description="faster than before"
          />
        </div>

        {/* Charts and Live Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Weekly breakdown of gross earnings
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Revenue Chart</p>
                  <p className="text-sm text-muted-foreground">
                    Integration with charting library
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Operations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Live Operations</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.tables} Tables • {branch.staff} Staff
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={branch.status === 'AVAILABLE' ? 'secondary' : 'destructive'}
                    className={
                      branch.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }
                  >
                    {branch.status}
                  </Badge>
                </div>
              ))}
              <Button variant="link" className="w-full text-primary">
                View Full Map →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Top Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="link" className="text-primary p-0 h-auto">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'order'
                        ? 'bg-green-100'
                        : activity.type === 'service'
                        ? 'bg-orange-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {activity.type === 'order' ? (
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    ) : activity.type === 'service' ? (
                      <Bell className="w-5 h-5 text-orange-600" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.branch} • {activity.time}
                    </p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-semibold">{activity.amount}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Performing Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Items</CardTitle>
              <p className="text-sm text-muted-foreground">Best sellers this week</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.topItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.sold} sold</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Full Menu Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
