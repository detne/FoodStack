import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Receipt, ArrowLeft, Download } from 'lucide-react';

interface PaymentResult {
  orderCode: string;
  amount: number;
  status: string;
  transactionId?: string;
  paidAt?: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  const orderCode = searchParams.get('orderCode');
  const code = searchParams.get('code');
  const id = searchParams.get('id');
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');

  useEffect(() => {
    if (orderCode) {
      fetchPaymentResult();
    } else {
      setLoading(false);
    }
  }, [orderCode]);

  const fetchPaymentResult = async () => {
    try {
      const response = await fetch(`/api/v1/mock-payments/payment-info/${orderCode}`);
      const result = await response.json();
      
      if (result.error === 0) {
        setPaymentResult(result.data);
      }
    } catch (error) {
      console.error('Error fetching payment result:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const isSuccess = code === '00' || status === 'PAID' || (!cancel && !code);
  const isCancelled = cancel === 'true' || status === 'CANCELLED';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span>Đang xác nhận thanh toán...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isSuccess 
        ? 'bg-gradient-to-br from-green-50 to-emerald-100' 
        : 'bg-gradient-to-br from-red-50 to-pink-100'
    }`}>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className={`text-center text-white rounded-t-lg ${
          isSuccess 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
            : 'bg-gradient-to-r from-red-600 to-pink-600'
        }`}>
          <div className="flex items-center justify-center mb-4">
            {isSuccess ? (
              <CheckCircle className="h-16 w-16 text-white" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </CardTitle>
          <p className="text-white/90 text-sm">
            {isSuccess 
              ? 'Giao dịch của bạn đã được xử lý thành công' 
              : 'Giao dịch đã bị hủy hoặc thất bại'
            }
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {paymentResult && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {paymentResult.orderCode}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Số tiền:</span>
                <span className={`text-lg font-bold ${
                  isSuccess ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {formatCurrency(paymentResult.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                <Badge variant={isSuccess ? 'default' : 'destructive'} className={
                  isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }>
                  {isSuccess ? 'Thành công' : 'Thất bại'}
                </Badge>
              </div>

              {paymentResult.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Mã giao dịch:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {paymentResult.transactionId}
                  </span>
                </div>
              )}

              {paymentResult.paidAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Thời gian:</span>
                  <span className="text-sm">
                    {new Date(paymentResult.paidAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            {isSuccess && (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  // TODO: Download invoice
                  console.log('Download invoice for:', orderCode);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Tải hóa đơn
              </Button>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay về trang chủ
            </Button>

            {isSuccess && (
              <Button 
                variant="ghost" 
                className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => navigate('/orders')}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Xem đơn hàng
              </Button>
            )}
          </div>

          {/* Mock Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-800 text-center">
              💡 Đây là kết quả từ hệ thống thanh toán mô phỏng.
              <br />
              Trong thực tế sẽ tích hợp với PayOS.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}