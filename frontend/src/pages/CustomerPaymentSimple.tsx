/**
 * Customer Payment Simple - Clean payment interface
 * URL: /customer/payment?order_ids=:orderIds&qr_token=:qrToken&table=:tableId&total=:total
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Calculator,
  UtensilsCrossed
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

export default function CustomerPaymentSimple() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderIds = searchParams.get('order_ids');
  const qrToken = searchParams.get('qr_token');
  const tableId = searchParams.get('table');
  const presetTotal = searchParams.get('total');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'QR_PAY' | null>(null);

  useEffect(() => {
    if (!orderIds || !qrToken) {
      toast({
        title: 'Invalid access',
        description: 'Missing order information',
        variant: 'destructive',
      });
      return;
    }

    loadPaymentData();
  }, [orderIds, qrToken]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Use preset total if available, otherwise calculate from orders
      if (presetTotal) {
        // Simple mode - just use preset total
        setPaymentSummary({
          orders: [],
          totalItems: 0,
          subtotal: parseFloat(presetTotal) / 1.15, // Reverse calculate
          tax: parseFloat(presetTotal) * 0.1 / 1.15,
          serviceCharge: parseFloat(presetTotal) * 0.05 / 1.15,
          grandTotal: parseFloat(presetTotal)
        });
      } else {
        // Load actual order data
        const targetOrderIds = orderIds.split(',');
        const orderPromises = targetOrderIds.map(id => 
          fetch(`http://localhost:3000/api/v1/customer-orders/${id}`)
            .then(res => res.json())
        );
        
        const orderResponses = await Promise.all(orderPromises);
        const orders: Order[] = [];
        
        for (const response of orderResponses) {
          if (response.success) {
            orders.push(response.data.order);
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
      }
      
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

    if (!paymentSummary) {
      toast({
        title: 'No payment data',
        description: 'Payment information not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      const targetOrderIds = orderIds?.split(',') || [];
      
      const response = await fetch('http://localhost:3000/api/v1/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: targetOrderIds[0], // Use first order ID
          method: selectedMethod,
          qrToken: qrToken,
          amount: paymentSummary.grandTotal
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (selectedMethod === 'CASH') {
          toast({
            title: 'Payment request sent!',
            description: 'Please pay at the counter',
          });
          
          navigate(`/payment/success?orderCode=${targetOrderIds.join(',')}&method=CASH&qr_token=${qrToken}&table=${tableId}&total=${paymentSummary.grandTotal}`);
        } else if (selectedMethod === 'QR_PAY' && data.data.checkout_url) {
          // Redirect to PayOS
          window.location.href = data.data.checkout_url;
        }
      } else {
        throw new Error(data.message || 'Failed to process payment');
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
            <h2 className="text-xl font-bold mb-2">Payment not available</h2>
            <p className="text-gray-600 mb-4">Unable to load payment details</p>
            <Button onClick={() => navigate(`/t/${qrToken}`)}>
              Back to Table Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Table {tableId?.slice(-4)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Payment Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${paymentSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charge (5%)</span>
              <span className="font-medium">${paymentSummary.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">${paymentSummary.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total Amount</span>
              <span className="text-indigo-600">${paymentSummary.grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-4">
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
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedMethod === 'CASH' ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                  <DollarSign className={`h-8 w-8 ${
                    selectedMethod === 'CASH' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">Cash Payment</h4>
                  <p className="text-gray-600">Pay at the counter with cash</p>
                </div>
                {selectedMethod === 'CASH' && (
                  <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* PayOS Payment */}
          <Card 
            className={`border-2 cursor-pointer transition-all ${
              selectedMethod === 'QR_PAY' 
                ? 'border-indigo-600 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => !processing && setSelectedMethod('QR_PAY')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedMethod === 'QR_PAY' ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                  <CreditCard className={`h-8 w-8 ${
                    selectedMethod === 'QR_PAY' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">PayOS</h4>
                  <p className="text-gray-600">Bank transfer, QR code, e-wallet</p>
                </div>
                {selectedMethod === 'QR_PAY' && (
                  <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={!selectedMethod || processing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-xl font-bold rounded-xl"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {selectedMethod === 'CASH' ? (
                <>
                  <DollarSign className="h-6 w-6 mr-2" />
                  Pay Cash - ${paymentSummary.grandTotal.toFixed(2)}
                </>
              ) : selectedMethod === 'QR_PAY' ? (
                <>
                  <Wallet className="h-6 w-6 mr-2" />
                  Pay with PayOS - ${paymentSummary.grandTotal.toFixed(2)}
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
                    Show your table number: <span className="font-bold">Table {tableId?.slice(-4)}</span>
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