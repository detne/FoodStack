/**
 * Order List
 * Danh sách orders với filters
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock orders
const mockOrders = [
  {
    id: 'ORD-001',
    timestamp: '2024-03-08 14:30',
    customer: 'Table T01',
    branch: 'Main Branch',
    total: 125.50,
    payment: 'Paid',
    status: 'completed',
  },
  {
    id: 'ORD-002',
    timestamp: '2024-03-08 14:45',
    customer: 'Table P02',
    branch: 'Main Branch',
    total: 89.00,
    payment: 'Pending',
    status: 'preparing',
  },
  {
    id: 'ORD-003',
    timestamp: '2024-03-08 15:00',
    customer: 'Table T03',
    branch: 'Main Branch',
    total: 156.75,
    payment: 'Paid',
    status: 'ready',
  },
  {
    id: 'ORD-004',
    timestamp: '2024-03-08 15:15',
    customer: 'Table V01',
    branch: 'Main Branch',
    total: 234.00,
    payment: 'Pending',
    status: 'pending',
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-700' },
  ready: { label: 'Ready', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment.toLowerCase() === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage all orders across branches
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${stats.revenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Order ID</th>
                    <th className="text-left p-4 font-medium">Time</th>
                    <th className="text-left p-4 font-medium">Customer/Table</th>
                    <th className="text-left p-4 font-medium">Branch</th>
                    <th className="text-right p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Payment</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-muted/50">
                      <td className="p-4 font-medium">{order.id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{order.timestamp}</td>
                      <td className="p-4">{order.customer}</td>
                      <td className="p-4 text-sm">{order.branch}</td>
                      <td className="p-4 text-right font-medium">${order.total.toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={order.payment === 'Paid' ? 'default' : 'secondary'}>
                          {order.payment}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusConfig[order.status as keyof typeof statusConfig].color}>
                          {statusConfig[order.status as keyof typeof statusConfig].label}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4" />
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
