/**
 * Customer My Order Page - Simple Order List
 * URL: /customer/my-order?table=:tableId&qr_token=:qrToken
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  UtensilsCrossed,
  Home,
  ShoppingCart,
  FileText,
  Bell,
  Plus,
  RefreshCw,
  CreditCard,
  Receipt
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string | null;
  notes?: string;
  description?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status?: string;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export default function CustomerMyOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tableId = searchParams.get('table');
  const qrToken = searchParams.get('qr_token');
  const branchId = searchParams.get('branch');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId || !qrToken) {
      toast({
        title: 'Invalid access',
        description: 'Missing table or QR token',
        variant: 'destructive',
      });
      return;
    }

    loadOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [tableId, qrToken]);

  const loadOrders = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/customer-orders/table/${tableId}?qr_token=${qrToken}`
      );
      const data = await response.json();
      
      if (data.success) {
        setTableInfo(data.data.table);
        setOrders(data.data.orders);
        // Get session token from first active order or create new session
        if (data.data.orders.length > 0) {
          // Assume we have session_token in localStorage or get from API
          const storedToken = localStorage.getItem(`session_token_${tableId}`);
          if (storedToken) {
            setSessionToken(storedToken);
          }
        }
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load orders',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'PENDING': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      'PREPARING': { label: 'Preparing', className: 'bg-blue-100 text-blue-700' },
      'READY': { label: 'Ready', className: 'bg-green-100 text-green-700' },
      'SERVED': { label: 'Served', className: 'bg-gray-100 text-gray-700' },
      'CANCELLED': { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
    };
    const info = statusMap[status] || statusMap['PENDING'];
    return <Badge className={`${info.className} border-0`}>{info.label}</Badge>;
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTotalItems = () => {
    return orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate(`/t/${qrToken}`)} 
                variant="ghost" 
                size="sm" 
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">My Orders</h1>
            </div>
            <Button 
              onClick={loadOrders} 
              variant="ghost" 
              size="sm"
              className="p-2"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Table Info */}
        <Card className="border-0 shadow-sm bg-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-200 uppercase mb-1">Current Table</p>
                <h2 className="text-2xl font-bold">
                  {tableInfo?.table_number || 'Table ' + tableId?.slice(-4)}
                </h2>
                <p className="text-sm text-indigo-200">{tableInfo?.area_name || 'Dining Area'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-200 uppercase mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {orders.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{getTotalItems()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ${getTotalAmount().toFixed(2)}
                  </p>
                </div>
              </div>
              
              {/* View Bill Button */}
              {orders.some(order => order.payment_status === 'UNPAID' && order.status !== 'CANCELLED') && (
                <Button
                  onClick={() => navigate(`/customer/bill?table=${tableId}&qr_token=${qrToken}&branch=${branchId}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  View Bill & Pay
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start ordering to see your orders here</p>
              <Button
                onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold text-indigo-600 mt-1">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 border-t pt-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-semibold">{item.name}</h4>
                            <span className="font-bold">×{item.quantity}</span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-500 italic mt-1">Note: {item.notes}</p>
                          )}
                          <p className="text-indigo-600 font-bold mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pay Now Button */}
                  {order.payment_status === 'UNPAID' && order.status !== 'CANCELLED' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={() => navigate(`/customer/payment?order_id=${order.id}&session_token=${sessionToken}&qr_token=${qrToken}&table=${tableId}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now - ${order.total.toFixed(2)}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add More Button */}
        {orders.length > 0 && (
          <Button
            onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)}
            variant="outline"
            className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 py-6 rounded-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Order More Items
          </Button>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={() => navigate(`/t/${qrToken}`)}
              className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Table Hub</span>
            </button>
            <button 
              onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)}
              className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mb-1" />
              <span className="text-xs">Menu</span>
            </button>
            <button className="flex flex-col items-center py-2 text-indigo-600">
              <div className="bg-indigo-600 rounded-full p-2 mb-1">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold">My Order</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5 mb-1" />
              <span className="text-xs">Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
