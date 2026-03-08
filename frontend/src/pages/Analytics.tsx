/**
 * Analytics Dashboard
 * QR Usage, Revenue, Service Analytics
 */

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download,
  TrendingUp,
  Users,
  QrCode,
  DollarSign
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Analytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Business intelligence and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="7days">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <QrCode className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">QR Scans</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">$45,678</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.3%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +15.2%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Check</p>
                  <p className="text-2xl font-bold">$51.23</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +5.7%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Chart: Revenue over time</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Scan Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Chart: Daily scan frequency</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'QR Ordering', usage: 85, color: 'bg-purple-500' },
                { name: 'Call Staff', usage: 65, color: 'bg-blue-500' },
                { name: 'Request Bill', usage: 45, color: 'bg-green-500' },
                { name: 'Feedback', usage: 30, color: 'bg-yellow-500' },
              ].map((service) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{service.name}</span>
                    <span className="text-sm text-muted-foreground">{service.usage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${service.color} h-2 rounded-full transition-all`}
                      style={{ width: `${service.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Branch Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Branch</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Orders</th>
                    <th className="text-right p-3 font-medium">Avg Check</th>
                    <th className="text-right p-3 font-medium">QR Adoption</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Main Branch', revenue: 25678, orders: 456, avg: 56.31, qr: 92 },
                    { name: 'Patio', revenue: 12345, orders: 234, avg: 52.76, qr: 88 },
                    { name: 'VIP Lounge', revenue: 7655, orders: 102, avg: 75.05, qr: 95 },
                  ].map((branch) => (
                    <tr key={branch.name} className="border-t">
                      <td className="p-3 font-medium">{branch.name}</td>
                      <td className="p-3 text-right">${branch.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right">{branch.orders}</td>
                      <td className="p-3 text-right">${branch.avg.toFixed(2)}</td>
                      <td className="p-3 text-right">{branch.qr}%</td>
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
