/**
 * Customer Bill Page - View Bill Summary Before Payment
 * URL: /customer/bill?table=:tableId&qr_token=:qrToken
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
  CreditCard,
  Receipt,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  Calculator
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

interface BillSummary {
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  totalItems: number;
  unpaidOrders: Order[];
}

export default function CustomerBill() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tableId = searchParams.get('table');
  const qrToken = searchParams.get('qr_token');
  const branchId = searchParams.get('branch');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
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

    loadBillData();
  }, [tableId, qrToken]);

  const loadBillData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/customer-orders/table/${tableId}?qr_token=${qrToken}`
      );
      const data = await response.json();
      
      if (data.success) {
        setTableInfo(data.data.table);
        setOrders(data.data.orders);
        
        // Calculate bill summary
        const unpaidOrders = data.data.orders.filter((order: Order) => 
          (order.payment_status === 'UNPAID' || !order.payment_status || order.payment_status === 'PENDING') && 
          order.status !== 'CANCELLED'
        );
        
        const subtotal = unpaidOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
        const tax = subtotal * 0.1; // 10% tax
        const serviceCharge = subtotal * 0.05; // 5% service charge
        const total = subtotal + tax + serviceCharge;
        const totalItems = unpaidOrders.reduce((sum: number, order: Order) => 
          sum + order.items.reduce((itemSum: number, item: OrderItem) => itemSum + item.quantity, 0), 0
        );

        setBillSummary({
          subtotal,
          tax,
          serviceCharge,
          total,
          totalItems,
          unpaidOrders
        });

        // Get session token
        const storedToken = localStorage.getItem(`session_token_${tableId}`);
        if (storedToken) {
          setSessionToken(storedToken);
        }
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load bill data',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error loading bill data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bill data',
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

  const handlePayment = () => {
    if (!billSummary || billSummary.unpaidOrders.length === 0) {
      toast({
        title: 'No unpaid orders',
        description: 'There are no orders to pay for',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to payment page with all unpaid order IDs
    const orderIds = billSummary.unpaidOrders.map(order => order.id).join(',');
    navigate(`/customer/payment?order_ids=${orderIds}&qr_token=${qrToken}&table=${tableId}&total=${billSummary.total.toFixed(2)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (!billSummary || billSummary.unpaidOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate(`/customer/my-order?table=${tableId}&qr_token=${qrToken}&branch=${branchId}`)} 
                variant="ghost" 
                size="sm" 
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Bill Summary</h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No unpaid orders</h3>
              <p className="text-gray-600 mb-6">All your orders have been paid or there are no orders yet</p>
              <Button
                onClick={() => navigate(`/customer/my-order?table=${tableId}&qr_token=${qrToken}&branch=${branchId}`)}
                variant="outline"
              >
                View My Orders
              </Button>
            </CardContent>
          </Card>
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
                onClick={() => navigate(`/customer/my-order?table=${tableId}&qr_token=${qrToken}&branch=${branchId}`)} 
                variant="ghost" 
                size="sm" 
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Bill Summary</h1>
            </div>
            <Button 
              onClick={loadBillData} 
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
        {/* Table & Restaurant Info */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm text-indigo-200">
                    {tableInfo?.areas?.branches?.restaurants?.name || 'Restaurant'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-1">
                  {tableInfo?.table_number || `Table ${tableId?.slice(-4)}`}
                </h2>
                <p className="text-indigo-200">{tableInfo?.area_name || 'Dining Area'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm text-indigo-200">Capacity</span>
                </div>
                <p className="text-xl font-bold">{tableInfo?.capacity || 4}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Bill Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Items</span>
              <span className="font-medium">{billSummary.totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${billSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">${billSummary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charge (5%)</span>
              <span className="font-medium">${billSummary.serviceCharge.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-indigo-600">${billSummary.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billSummary.unpaidOrders.map((order, orderIndex) => (
              <div key={order.id}>
                {orderIndex > 0 && <Separator className="my-4" />}
                
                {/* Order Header */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold">{order.order_number}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm font-medium mt-1">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-sm">{item.name}</h5>
                            {item.notes && (
                              <p className="text-xs text-gray-500 italic">Note: {item.notes}</p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <span className="text-gray-600">×{item.quantity}</span>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold shadow-lg"
            size="lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Pay Now - ${billSummary.total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}