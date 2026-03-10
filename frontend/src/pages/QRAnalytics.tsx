/**
 * QR Performance Analytics Dashboard
 * Advanced analytics for QR ordering system
 */

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  QrCode,
  Clock,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useState } from 'react';

// Mock data for usage trends
const usageTrendsData = [
  { date: 'Oct 01', qrOrdering: 320, manualOrdering: 180 },
  { date: 'Oct 08', qrOrdering: 450, manualOrdering: 220 },
  { date: 'Oct 15', qrOrdering: 380, manualOrdering: 190 },
  { date: 'Oct 22', qrOrdering: 620, manualOrdering: 240 },
  { date: 'Oct 31', qrOrdering: 580, manualOrdering: 210 },
];

// Mock data for branches
const branchesData = [
  {
    id: 1,
    name: 'Downtown Plaza',
    totalScans: 4281,
    avgTime: '5m 12s',
    orders: 312,
    revenue: 12450,
    status: 'High Perform.',
    statusColor: 'success'
  },
  {
    id: 2,
    name: 'Harbor View',
    totalScans: 2940,
    avgTime: '4m 05s',
    orders: 184,
    revenue: 8120,
    status: 'Stable',
    statusColor: 'info'
  },
  {
    id: 3,
    name: 'Westside Mall',
    totalScans: 1822,
    avgTime: '3m 50s',
    orders: 96,
    revenue: 4980,
    status: 'Declining',
    statusColor: 'warning'
  },
  {
    id: 4,
    name: 'Airport Terminal 2',
    totalScans: 3797,
    avgTime: '2m 45s',
    orders: 250,
    revenue: 10200,
    status: 'High Perform.',
    statusColor: 'success'
  },
];

// Popular services data
const popularServices = [
  { name: 'Bill Payment', percentage: 45, color: 'bg-purple-600' },
  { name: 'Menu Viewing', percentage: 32, color: 'bg-purple-500' },
  { name: 'Waiter Call', percentage: 18, color: 'bg-purple-400' },
  { name: 'Water Request', percentage: 5, color: 'bg-purple-300' },
];

export default function QRAnalytics() {
  const [dateRange, setDateRange] = useState('oct-2023');
  const [orderingType, setOrderingType] = useState('qr');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QR Performance Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze QR ordering performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Oct 1, 2023 - Oct 31, 2023
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total QR Scans */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <QrCode className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      TOTAL QR SCANS
                    </p>
                    <p className="text-3xl font-bold mt-1">12,840</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  12.5%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Interaction Time */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      AVG. INTERACTION TIME
                    </p>
                    <p className="text-3xl font-bold mt-1">4m 32s</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                  <TrendingDown className="h-4 w-4" />
                  2.1%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordering Volume */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      ORDERING VOLUME
                    </p>
                    <p className="text-3xl font-bold mt-1">842</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  5.4%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      CONVERSION RATE
                    </p>
                    <p className="text-3xl font-bold mt-1">14.2%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  1.2%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage Trends Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage Trends</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Daily QR scans over the last 30 days
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={orderingType === 'qr' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderingType('qr')}
                    className={orderingType === 'qr' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                  >
                    QR Ordering
                  </Button>
                  <Button
                    variant={orderingType === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderingType('manual')}
                  >
                    Manual Ordering
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={usageTrendsData}>
                  <defs>
                    <linearGradient id="colorQR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={orderingType === 'qr' ? 'qrOrdering' : 'manualOrdering'}
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fill="url(#colorQR)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Services */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <p className="text-sm text-muted-foreground">
                Most requested actions via QR
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {popularServices.map((service) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm font-bold">{service.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${service.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View Detailed Breakdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branch Breakdown Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Branch Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Performance comparison across locations
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      LOCATION NAME
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      TOTAL SCANS
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      AVG. TIME
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      ORDERS
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      REV. CONTRIBUTION
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      STATUS
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {branchesData.map((branch) => (
                    <tr key={branch.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-medium">{branch.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">{branch.totalScans.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-muted-foreground">{branch.avgTime}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">{branch.orders}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">${branch.revenue.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={
                            branch.statusColor === 'success' ? 'default' : 
                            branch.statusColor === 'warning' ? 'secondary' : 
                            'outline'
                          }
                          className={
                            branch.statusColor === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                            branch.statusColor === 'warning' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                            'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          }
                        >
                          {branch.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
