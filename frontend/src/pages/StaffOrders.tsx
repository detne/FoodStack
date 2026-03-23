/**
 * Staff Orders - Updated
 * Xem và quản lý đơn hàng
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Eye,
  Calendar,
} from 'lucide-react';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  menu_items?: {
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  status: string;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  payment_status: string;
  customer_count: number;
  created_at: string;
  updated_at: string;
  tables?: {
    table_number: string;
    areas?: {
      name: string;
    };
  };
  order_items?: OrderItem[];
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Clock,
  },
  ready: {
    label: 'Ready',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  served: {
    label: 'Served',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const paymentStatusConfig = {
  unpaid: {
    label: 'Unpaid',
    color: 'bg-red-100 text-red-700',
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-700',
  },
  partial: {
    label: 'Partial',
    color: 'bg-yellow-100 text-yellow-700',
  },
};

export default function StaffOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  console.log('StaffOrders component rendered');
  console.log('Orders:', orders);

  useEffect(() => {
    const timer = setTimeout(() => {
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');

      if (token && branchId) {
        fetchOrders();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      // TODO: Implement orders API
      // const result = await apiClient.orders.list(branchId!);
      
      // Mock data for now
      setOrders([]);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tables?.table_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status.toLowerCase() === 'pending').length,
    preparing: orders.filter((o) => o.status.toLowerCase() === 'preparing').length,
    ready: orders.filter((o) => o.status.toLowerCase() === 'ready').length,
  };

  return (
    <div className="space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{stats.total}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preparing</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">{stats.preparing}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.ready}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Orders List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by order number or table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="served">Served</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                const paymentInfo = paymentStatusConfig[order.payment_status.toLowerCase() as keyof typeof paymentStatusConfig] || paymentStatusConfig.unpaid;

                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">
                              {order.order_number}
                            </h3>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={paymentInfo.color}>
                              {paymentInfo.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <ShoppingBag className="w-4 h-4" />
                              <span>
                                Table {order.tables?.table_number || 'N/A'}
                                {order.tables?.areas?.name && ` - ${order.tables.areas.name}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{order.customer_count} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold text-foreground">
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Table</p>
                  <p className="font-medium">
                    {selectedOrder.tables?.table_number}
                    {selectedOrder.tables?.areas?.name && ` - ${selectedOrder.tables.areas.name}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{selectedOrder.customer_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusConfig[selectedOrder.status.toLowerCase() as keyof typeof statusConfig]?.color}>
                    {statusConfig[selectedOrder.status.toLowerCase() as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <Badge className={paymentStatusConfig[selectedOrder.payment_status.toLowerCase() as keyof typeof paymentStatusConfig]?.color}>
                    {paymentStatusConfig[selectedOrder.payment_status.toLowerCase() as keyof typeof paymentStatusConfig]?.label}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.menu_items?.name || 'Unknown Item'}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span>${selectedOrder.service_charge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
