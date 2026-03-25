import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, QrCode, Crown, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "0đ",
    period: "/tháng",
    description: "Dùng thử cho nhà hàng nhỏ",
    features: [
      { text: "Upload ảnh món ăn", included: true },
      { text: "Analytics & báo cáo", included: true },
      { text: "Tối đa 3 chi nhánh", included: true },
      { text: "Tối đa 50 món ăn", included: true },
      { text: "Tối đa 5 customization/category", included: true },
      { text: "1 layout cố định", included: true },
      { text: "Không thể chọn theme", included: false },
      { text: "Gallery images", included: false },
      { text: "Image slider", included: false },
    ],
    cta: "Tiếp tục với Free",
    highlighted: false,
    value: "free",
    icon: null,
  },
  {
    name: "Pro",
    price: "4K",
    period: "/tháng",
    description: "Phù hợp cho nhà hàng đang phát triển",
    features: [
      { text: "Upload ảnh không giới hạn", included: true },
      { text: "Analytics đầy đủ", included: true },
      { text: "Không giới hạn chi nhánh", included: true },
      { text: "Không giới hạn món ăn", included: true },
      { text: "Không giới hạn customization", included: true },
      { text: "Chọn theme tùy ý", included: true },
      { text: "8 layout options", included: true },
      { text: "Gallery images", included: true },
      { text: "Branch landing customization", included: true },
      { text: "Image slider", included: false },
    ],
    cta: "Chọn gói Pro",
    highlighted: true,
    value: "pro",
    icon: Crown,
  },
  {
    name: "VIP",
    price: "9K",
    period: "/tháng",
    description: "Giải pháp toàn diện cho chuỗi nhà hàng",
    features: [
      { text: "Tất cả tính năng Pro", included: true },
      { text: "12 layout options (bao gồm VIP exclusive)", included: true },
      { text: "Image slider cho landing page", included: true },
      { text: "4 theme VIP độc quyền", included: true },
      { text: "Hỗ trợ 24/7 chuyên biệt", included: true },
      { text: "API tích hợp POS", included: true },
      { text: "White-label branding", included: true },
      { text: "Custom domain", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Chọn gói VIP",
    highlighted: false,
    value: "vip",
    icon: Sparkles,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planValue: string) => {
    if (planValue === 'free') {
      // User chọn gói free - chỉ cần quay về
      navigate(-1); // Quay về trang trước
    } else {
      // User chọn Pro hoặc VIP - chuyển đến trang thanh toán
      navigate(`/payment?plan=${planValue}`);
    }
  };

  return (
    <div className="min-h-screen bg-hero">
      {/* Navbar */}
      <nav className="border-b border-hero-muted/20">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <QrCode className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-hero-foreground">QRService</span>
          </Link>
          <Link to="/" className="text-sm text-hero-muted hover:text-hero-foreground transition-colors">
            ← Quay lại trang chủ
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-hero-foreground mb-4">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-hero-muted max-w-lg mx-auto">
            Bắt đầu miễn phí, nâng cấp khi cần. Không ràng buộc hợp đồng.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.value}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`relative h-full flex flex-col border-2 transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlighted
                    ? "border-accent bg-hero shadow-[0_0_40px_hsl(var(--accent)/0.15)]"
                    : "border-hero-muted/20 bg-hero"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1">
                    Phổ biến nhất
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-hero-foreground text-xl">{plan.name}</CardTitle>
                    {plan.icon && (
                      <plan.icon className={`w-5 h-5 ${plan.value === 'pro' ? 'text-yellow-500' : 'text-purple-500'}`} />
                    )}
                  </div>
                  <p className="text-hero-muted text-sm">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-heading font-bold text-hero-foreground">{plan.price}</span>
                    <span className="text-hero-muted text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <span className={feature.included ? "text-hero-muted" : "text-hero-muted/50 line-through"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    className={`w-full font-semibold h-11 ${
                      plan.highlighted
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-hero-muted/10 text-hero-foreground border border-hero-muted/30 hover:bg-hero-muted/20"
                    }`}
                    onClick={() => handleSelectPlan(plan.value)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-hero-foreground text-center mb-8">
            So sánh chi tiết các gói
          </h2>
          <Card className="border-hero-muted/20 bg-hero overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hero-muted/20">
                    <th className="text-left p-4 text-hero-foreground font-semibold">Tính năng</th>
                    <th className="text-center p-4 text-hero-foreground font-semibold">Free</th>
                    <th className="text-center p-4 text-hero-foreground font-semibold bg-accent/5">
                      <div className="flex items-center justify-center gap-2">
                        Pro <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                    </th>
                    <th className="text-center p-4 text-hero-foreground font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        VIP <Sparkles className="w-4 h-4 text-purple-500" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted font-medium" colSpan={4}>Giới hạn cơ bản</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Số chi nhánh</td>
                    <td className="text-center p-4 text-hero-muted">Tối đa 3</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">Không giới hạn</td>
                    <td className="text-center p-4 text-hero-muted">Không giới hạn</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Số món ăn</td>
                    <td className="text-center p-4 text-hero-muted">Tối đa 50</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">Không giới hạn</td>
                    <td className="text-center p-4 text-hero-muted">Không giới hạn</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Customization/category</td>
                    <td className="text-center p-4 text-hero-muted">Tối đa 5</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">Không giới hạn</td>
                    <td className="text-center p-4 text-hero-muted">Không giới hạn</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted font-medium" colSpan={4}>Branding & Customization</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Chọn theme</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Số theme có sẵn</td>
                    <td className="text-center p-4 text-hero-muted">1 (mặc định)</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">8 themes</td>
                    <td className="text-center p-4 text-hero-muted">12 themes (+ 4 VIP)</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Layout options</td>
                    <td className="text-center p-4 text-hero-muted">1 cố định</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">8 layouts</td>
                    <td className="text-center p-4 text-hero-muted">12 layouts (+ 4 VIP)</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Gallery images</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Image slider</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Branch landing customization</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted font-medium" colSpan={4}>Tính năng nâng cao</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Upload ảnh</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Analytics & báo cáo</td>
                    <td className="text-center p-4 text-hero-muted">Cơ bản</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">Đầy đủ</td>
                    <td className="text-center p-4 text-hero-muted">Nâng cao + AI</td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">Custom domain</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-hero-muted/10">
                    <td className="p-4 text-hero-muted">API tích hợp POS</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-accent/5"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-hero-muted">Hỗ trợ</td>
                    <td className="text-center p-4 text-hero-muted">Email</td>
                    <td className="text-center p-4 text-hero-muted bg-accent/5">Ưu tiên</td>
                    <td className="text-center p-4 text-hero-muted">24/7 chuyên biệt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
