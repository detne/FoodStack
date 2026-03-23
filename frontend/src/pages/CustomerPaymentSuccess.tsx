/**
 * Customer Payment Success Page
 * URL: /customer/payment-success?order_id=:orderId&method=:method
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Home,
  Receipt,
  Download,
  Clock
} from 'lucide-react';

export default function CustomerPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');
  const method = searchParams.get('method');
  const qrToken = searchParams.get('qr_token');
  const tableId = searchParams.get('table');

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/t/${qrToken}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, qrToken]);

  const getMessage = () => {
    if (method === 'CASH') {
      return {
        title: 'Payment Request Sent!',
        description: 'Please proceed to the counter to complete your payment',
        icon: <Clock className="h-16 w-16 text-blue-600" />
      };
    } else {
      return {
        title: 'Payment Successful!',
        description: 'Your payment has been processed successfully',
        icon: <CheckCircle2 className="h-16 w-16 text-green-600" />
      };
    }
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            {message.icon}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-3 text-gray-900">
            {message.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {message.description}
          </p>

          {/* Order Info */}
          {orderId && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Order Number</span>
                <Badge className="bg-indigo-100 text-indigo-700 border-0">
                  {orderId.slice(-8).toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm font-semibold">
                  {method === 'CASH' ? 'Cash' : 'PayOS'}
                </span>
              </div>
            </div>
          )}

          {/* Cash Payment Instructions */}
          {method === 'CASH' && (
            <Card className="border-0 shadow-sm bg-blue-50 mb-6">
              <CardContent className="p-4">
                <div className="flex gap-3 text-left">
                  <Receipt className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1 text-sm">Next Steps</h4>
                    <p className="text-xs text-blue-700">
                      1. Go to the counter<br />
                      2. Show your order number<br />
                      3. Complete the payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate(`/customer/my-order?table=${tableId}&qr_token=${qrToken}`)}
              variant="outline"
              className="w-full py-6 text-base"
            >
              <Receipt className="h-5 w-5 mr-2" />
              View My Orders
            </Button>

            <Button
              onClick={() => navigate(`/t/${qrToken}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Table Hub
            </Button>
          </div>

          {/* Auto redirect countdown */}
          <p className="text-sm text-gray-500 mt-6">
            Redirecting to Table Hub in {countdown} seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
