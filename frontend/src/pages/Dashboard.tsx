import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  TrendingUp,
  MapPin,
  Plus,
  Bell,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data - replace with real API calls
const mockData = {
  stats: {
    totalRevenue: 12540.00,
    revenueChange: 12.5,
    totalOrders: 1204,
    ordersChange: 8.2,
    activeTables: 42,
    tablesChange: -2.1,
    avgServiceTime: "14m 20s",
    serviceChange: -4.3
  },
  branches: [
    { id: 1, name: "Downtown Branch", status: "AVAILABLE", tables: 20, staff: 8 },
    { id: 2, name: "Uptown Gastro", status: "BUSY", tables: 20, staff: 12 },
    { id: 3, name: "Airport Terminal", status: "AVAILABLE", tables: 45, staff: 6 }
  ],
  recentActivity: [
    { id: 1, type: "order", title: "New Order Placed #402", branch: "Downtown Branch", amount: "$45.90", time: "2m ago" },
    { id: 2, type: "service", title: "Service Request Table 4", branch: "Uptown Gastro", time: "5m ago" },
    { id: 3, type: "payment", title: "Payment Confirmed #398", branch: "Airport Terminal", time: "12m ago" }
  ],
  topItems: [
    { name: "Quinoa Power Bowl", sold: 342, progress: 85 },
    { name: "Signature Wagyu Burger", sold: 289, progress: 72 },
    { name: "Specialty Arabica Latte", sold: 215, progress: 54 }
  ]
};

const Dashboard = () => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [user] = useState({ name: "Marco Rossi", role: "Owner" });

  // Simulate branch selection logic
  useEffect(() => {
    // If user has only 1 branch, auto-select it
    if (mockData.branches.length === 1) {
      setSelectedBranch(mockData.branches[0].name);
    }
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp className="h-3 w-3" />
          {change > 0 ? '+' : ''}{change}%
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">QRService</span>
              <span className="text-sm text-gray-500">Owner Panel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search data..." 
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button variant="default" className="w-full justify-start bg-indigo-600 text-white">
              <div className="w-4 h-4 mr-3 bg-white/20 rounded"></div>
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Branches
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Menu
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Orders
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Staff
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Feedback
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Subscriptions
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-4 h-4 mr-3 bg-gray-300 rounded"></div>
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={`$${mockData.stats.totalRevenue.toLocaleString()}`}
              change={mockData.stats.revenueChange}
              icon={DollarSign}
            />
            <StatCard
              title="Total Orders"
              value={mockData.stats.totalOrders.toLocaleString()}
              change={mockData.stats.ordersChange}
              icon={ShoppingCart}
            />
            <StatCard
              title="Active Tables"
              value={mockData.stats.activeTables}
              change={mockData.stats.tablesChange}
              icon={Users}
            />
            <StatCard
              title="Avg. Service Time"
              value={mockData.stats.avgServiceTime}
              change={mockData.stats.serviceChange}
              icon={Clock}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Performance</CardTitle>
                <p className="text-sm text-gray-600">Weekly breakdown of gross earnings</p>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Revenue Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>

            {/* Live Operations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Live Operations</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Live Map
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.branches.map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{branch.name}</p>
                        <p className="text-xs text-gray-500">
                          {branch.tables} Tables • {branch.staff} Staff
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={branch.status === 'AVAILABLE' ? 'secondary' : 'destructive'}
                      className={branch.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                    >
                      {branch.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="link" className="w-full text-indigo-600">
                  View Full Map
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="link" className="text-indigo-600">View All</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'order' ? 'bg-green-100' :
                      activity.type === 'service' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'order' ? <ShoppingCart className="w-4 h-4 text-green-600" /> :
                       activity.type === 'service' ? <Bell className="w-4 h-4 text-orange-600" /> :
                       <DollarSign className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.branch} • {activity.time}</p>
                    </div>
                    {activity.amount && (
                      <span className="text-sm font-medium">{activity.amount}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performing Items */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.topItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.sold} sold</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* User Info */}
      <div className="fixed bottom-4 left-4">
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-lg border">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">MR</span>
          </div>
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;