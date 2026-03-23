/**
 * Customer Payment Page - Payment Checkout
 * URL: /customer/payment?order_ids=:orderIds&session_token=:sessionToken&total=:total
 * OR: /customer/payment?order_id=:orderId&session_token=:sessionToken (single order)
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle2,
  Clock,
  Receipt,
  Loader2,
  Calculator
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  payment_status: string;
  items: OrderItem[];
}

interface PaymentSummary {
  orders: Order[];
  totalItems: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  grandTotal: number;
}

export default function CustomerPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id'); // Single order (legacy)
  const orderIds = searchParams.get('order_ids'); // Multiple orders (new)
  const sessionToken = searchParams.get('session_token');
  const qrToken = searchParams.get('qr_token');
  const tableId = searchParams.get('table');
  const presetTotal = searchParams.get('total'); // Pre-calculated total from bill page

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'QR_PAY' | null>(null);

  useEffect(() => {
    if ((!orderId && !orderIds) || !sessionToken) {
      toast({
        title: 'Invalid access',
        description: 'Missing order or session information',
        variant: 'destructive',
      });
      return;
    }

    loadPaymentData();
  }, [orderId, orderIds, sessionToken]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Determine which orders to load
      const targetOrderIds = orderIds ? orderIds.split(',') : [orderId];
      
      // Load all orders
      const orderPromises = targetOrderIds.map(id => 
        fetch(`http://localhost:3000/api/v1/customer-orders/${id}?session_token=${sessionToken}`)
          .then(res => res.json())
      );
      
      const orderResponses = await Promise.all(orderPromises);
      const orders: Order[] = [];
      
      for (const response of orderResponses) {
        if (response.success) {
          orders.push(response.data.order);
        } else {
          throw new Error(response.message || 'Failed to load order');
        }
      }
      
      // Calculate totals
      const totalItems = orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
      const tax = orders.reduce((sum, order) => sum + order.tax, 0);
      const serviceCharge = orders.reduce((sum, order) => sum + order.service_charge, 0);
      const grandTotal = orders.reduce((sum, order) => sum + order.total, 0);
      
      setPaymentSummary({
        orders,
        totalItems,
        subtotal,
        tax,
        serviceCharge,
        grandTotal
      });
      
    } catch (error: any) {
      console.error('Error loading payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: 'Select payment method',
        description: 'Please choose how you want to pay',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentSummary || paymentSummary.orders.length === 0) {
      toast({
        title: 'No orders to pay',
        description: 'No valid orders found for payment',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      if (selectedMethod === 'CASH') {
        // Cash payment for multiple orders
        const orderIds = paymentSummary.orders.map(order => order.id);
        
        const response = await fetch('http://localhost:3000/api/v1/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderIds[0], // Use first order ID for now
            method: 'CASH',
            qrToken: qrToken,
            amount: paymentSummary.grandTotal
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: 'Payment request sent!',
            description: 'Please pay at the counter',
          });
          
          // Navigate to success page
          navigate(`/customer/payment-success?order_ids=${orderIds.join(',')}&method=CASH&qr_token=${qrToken}&table=${tableId}&total=${paymentSummary.grandTotal}`);
        } else {
          throw new Error(data.message || 'Failed to process payment');
        }
      } else if (selectedMethod === 'QR_PAY') {
        // QR Pay (Mock PayOS) payment
        const orderIds = paymentSummary.orders.map(order => order.id);
        
        const response = await fetch('http://localhost:3000/api/v1/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderIds[0], // Use first order ID for now
            method: 'QR_PAY',
            qrToken: qrToken,
            amount: paymentSummary.grandTotal
          }),
        });

        const data = await response.json();

        if (data.success && data.data.checkout_url) {
          // Redirect to Mock PayOS
          window.location.href = data.data.checkout_url;
        } else {
          throw new Error(data.message || 'Failed to create payment');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Orders not found</h2>
            <p className="text-gray-600 mb-4">Unable to load order details</p>
            <Button onClick={() => navigate(`/t/${qrToken}`)}>
              Back to Table Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMultipleOrders = paymentSummary.orders.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate(`/customer/bill?table=${tableId}&qr_token=${qrToken}`)} 
                variant="ghost" 
                size="sm" 
                className="p-2"
                disabled={processing}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Payment</h1>
            </div>
            <Badge className="bg-indigo-100 text-indigo-600 border-0">
              {isMultipleOrders ? `${paymentSummary.orders.length} Orders` : paymentSummary.orders[0]?.order_number}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Order Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-indigo-600" />
              <h2 className="font-bold text-lg">
                {isMultipleOrders ? 'Bill Summary' : 'Order Summary'}
              </h2>
            </div>

            {isMultipleOrders ? (
              // Multiple orders - show summary
              <div className="space-y-4">
                {paymentSummary.orders.map((order, index) => (
                  <div key={order.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{order.order_number}</span>
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-600">
                          <span>{item.name} × {item.quantity}</span>
                          <span>${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single order - show detailed items
              <div className="space-y-3 mb-4">
                {paymentSummary.orders[0].items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-3 space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items</span>
                <span>{paymentSummary.totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${paymentSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Charge (5%)</span>
                <span>${paymentSummary.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span>${paymentSummary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 border-t">
                <span>Total</span>
                <span className="text-indigo-600">${paymentSummary.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg px-1">Select Payment Method</h3>

          {/* Cash Payment */}
          <Card 
            className={`border-2 cursor-pointer transition-all ${
              selectedMethod === 'CASH' 
                ? 'border-indigo-600 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => !processing && setSelectedMethod('CASH')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMethod === 'CASH' ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                  <DollarSign className={`h-6 w-6 ${
                    selectedMethod === 'CASH' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Cash Payment</h4>
                  <p className="text-sm text-gray-600">Pay at the counter</p>
                </div>
                {selectedMethod === 'CASH' && (
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Pay Payment (PayOS) */}
          <Card 
            className={`border-2 cursor-pointer transition-all ${
              selectedMethod === 'QR_PAY' 
                ? 'border-indigo-600 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => !processing && setSelectedMethod('QR_PAY')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMethod === 'QR_PAY' ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    selectedMethod === 'QR_PAY' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">PayOS</h4>
                  <p className="text-sm text-gray-600">Bank transfer, QR code, e-wallet</p>
                </div>
                {selectedMethod === 'QR_PAY' && (
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={!selectedMethod || processing}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-bold rounded-xl"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {selectedMethod === 'CASH' ? (
                <>
                  <DollarSign className="h-5 w-5 mr-2" />
                  Request Cash Payment
                </>
              ) : selectedMethod === 'QR_PAY' ? (
                <>
                  <Wallet className="h-5 w-5 mr-2" />
                  Pay with PayOS
                </>
              ) : (
                'Select Payment Method'
              )}
            </>
          )}
        </Button>

        {/* Payment Info */}
        {selectedMethod === 'CASH' && (
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Cash Payment Instructions</h4>
                  <p className="text-sm text-blue-700">
                    Please proceed to the counter to complete your payment. 
                    {isMultipleOrders ? (
                      <>Show your table number to the staff: <span className="font-bold">Table {tableId?.slice(-4)}</span></>
                    ) : (
                      <>Show this order number to the staff: <span className="font-bold">{paymentSummary.orders[0]?.order_number}</span></>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMethod === 'QR_PAY' && (
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Wallet className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">PayOS Payment</h4>
                  <p className="text-sm text-green-700">
                    You will be redirected to PayOS payment gateway. 
                    You can pay via bank transfer, QR code, or e-wallet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
