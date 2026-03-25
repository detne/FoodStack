import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Crown, 
  Sparkles, 
  CreditCard, 
  Wallet, 
  QrCode as QrCodeIcon,
  ArrowLeft,
  Check,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const planDetails = {
  pro: {
    name: 'Pro',
    price: 4000,
    priceDisplay: '4K',
    icon: Crown,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    features: [
      'Không giới hạn chi nhánh',
      'Không giới hạn món ăn',
      'Chọn theme tùy ý',
      '8 layout options',
      'Gallery images',
      'Branch landing customization',
    ],
  },
  vip: {
    name: 'VIP',
    price: 9000,
    priceDisplay: '9K',
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    features: [
      'Tất cả tính năng Pro',
      '12 layout options (VIP exclusive)',
      'Image slider',
      '4 theme VIP độc quyền',
      'Hỗ trợ 24/7',
      'API tích hợp POS',
      'Custom domain',
    ],
  },
};

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan') as 'pro' | 'vip';
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'zalopay'>('card');
  const [processing, setProcessing] = useState(false);

  const plan = planDetails[planParam];

  useEffect(() => {
    if (!planParam || !plan) {
      toast.error('Gói không hợp lệ');
      navigate('/pricing');
    }
  }, [planParam, plan, navigate]);

  if (!plan) return null;

  const Icon = plan.icon;

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Call API to create subscription payment
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/subscription/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          planName: planParam,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment');
      }

      // Redirect to PayOS checkout URL
      if (data.payment?.checkoutUrl) {
        window.location.href = data.payment.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo thanh toán');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pricing')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Thanh toán</h1>
          <p className="text-muted-foreground mt-2">
            Hoàn tất thanh toán để nâng cấp gói {plan.name}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Thẻ tín dụng / Ghi nợ</p>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard, JCB</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Wallet className="w-5 h-5 text-pink-600" />
                        <div>
                          <p className="font-medium">Ví MoMo</p>
                          <p className="text-sm text-muted-foreground">Thanh toán qua ví điện tử MoMo</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="zalopay" id="zalopay" />
                      <Label htmlFor="zalopay" className="flex items-center gap-3 cursor-pointer flex-1">
                        <QrCodeIcon className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">ZaloPay</p>
                          <p className="text-sm text-muted-foreground">Thanh toán qua ví ZaloPay</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Thanh toán an toàn</p>
                    <p className="text-sm text-green-700 mt-1">
                      Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                  Gói {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${plan.bgColor}`}>
                  <p className="text-sm text-muted-foreground">Giá gói</p>
                  <p className="text-3xl font-bold mt-1">{plan.priceDisplay}</p>
                  <p className="text-sm text-muted-foreground">/tháng</p>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-3">Tính năng bao gồm:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tổng phụ</span>
                    <span>{plan.priceDisplay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT (10%)</span>
                    <span>{(plan.price * 0.1).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span>{(plan.price * 1.1).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-base"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Thanh toán ngay
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Bằng việc thanh toán, bạn đồng ý với{' '}
                  <a href="#" className="underline">Điều khoản dịch vụ</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
