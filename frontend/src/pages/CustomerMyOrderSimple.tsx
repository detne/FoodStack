/**
 * Customer My Order Simple - Clean order view without live tracking
 * URL: /customer/my-order?table=:tableId&qr_token=:qrToken
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  UtensilsCrossed,
  Home,
  ShoppingCart,
  FileText,
  Bell,
  Plus,
  RefreshCw,
  Receipt,
  CreditCard,
  Clock,
  CheckCircle
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

export default function CustomerMyOrderSimple() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tableId = searchParams.get('table');
  const qrToken = searchParams.get('qr_token');
  const branchId = searchParams.get('branch');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);

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

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTotalItems = () => {
    return orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
  };

  const getAllItems = () => {
    const allItems: (OrderItem & { order_number: string })[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        allItems.push({
          ...item,
          order_number: order.order_number
        });
      });
    });
    return allItems;
  };

  const hasUnpaidOrders = () => {
    return orders.some(order => 
      (order.payment_status === 'UNPAID' || !order.payment_status || order.payment_status === 'PENDING') && 
      order.status !== 'CANCELLED'
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
              <h1 className="text-lg font-bold">My Order</h1>
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Table Info */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {tableInfo?.table_number || `Table ${tableId?.slice(-4)}`}
                </h2>
                <p className="text-indigo-200">{tableInfo?.area_name || 'Dining Area'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-indigo-200">Total Items</p>
                <p className="text-3xl font-bold">{getTotalItems()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Summary */}
        {orders.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Items</span>
                <span className="font-semibold">{getTotalItems()}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-indigo-600">${getTotalAmount().toFixed(2)}</span>
              </div>
              
              {hasUnpaidOrders() && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate(`/customer/bill?table=${tableId}&qr_token=${qrToken}&branch=${branchId}`)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      size="lg"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View Bill & Pay
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items List */}
        {orders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start ordering to see your items here</p>
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Ordered Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getAllItems().map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
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
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <span className="font-bold text-indigo-600">×{item.quantity}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500 italic mb-2">Note: {item.notes}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {item.order_number}
                      </Badge>
                      <p className="font-bold text-green-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add More Button */}
        <Button
          onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)}
          variant="outline"
          className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 py-6 rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Order More Items
        </Button>
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