import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Crown, Sparkles } from 'lucide-react';

export default function PaymentSubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  const orderCode = searchParams.get('orderCode');
  const resultCode = searchParams.get('code');

  useEffect(() => {
    // Check payment status
    if (resultCode === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công! Gói của bạn đã được nâng cấp.');
      
      // Redirect to owner dashboard after 3 seconds
      setTimeout(() => {
        navigate('/owner');
      }, 3000);
    } else {
      setStatus('failed');
      setMessage('Thanh toán không thành công. Vui lòng thử lại.');
    }
  }, [resultCode, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
                <h2 className="text-2xl font-bold">Đang xử lý...</h2>
                <p className="text-muted-foreground">
                  Vui lòng đợi trong giây lát
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="relative">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <div className="absolute -top-2 -right-2">
                    <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-600">
                  Thanh toán thành công!
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800">
                    Mã đơn hàng: <span className="font-mono font-semibold">{orderCode}</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Đang chuyển hướng về trang chủ...
                </p>
              </>
            )}

            {status === 'failed' && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h2 className="text-2xl font-bold text-red-600">
                  Thanh toán thất bại
                </h2>
                <p className="text-muted-foreground">{message}</p>
                {orderCode && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-red-800">
                      Mã đơn hàng: <span className="font-mono font-semibold">{orderCode}</span>
                    </p>
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                    className="flex-1"
                  >
                    Thử lại
                  </Button>
                  <Button
                    onClick={() => navigate('/owner')}
                    className="flex-1"
                  >
                    Về trang chủ
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
