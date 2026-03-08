import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, QrCode } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "0đ",
    period: "/tháng",
    description: "Dùng thử cho nhà hàng nhỏ",
    features: [
      "Tối đa 5 bàn",
      "QR Order cơ bản",
      "Gọi phục vụ",
      "1 chi nhánh",
      "Báo cáo cơ bản",
    ],
    cta: "Bắt đầu miễn phí",
    highlighted: false,
    value: "free",
  },
  {
    name: "Pro",
    price: "499K",
    period: "/tháng",
    description: "Phù hợp cho nhà hàng đang phát triển",
    features: [
      "Tối đa 30 bàn",
      "QR Order nâng cao",
      "Gọi phục vụ + tách bill",
      "Tối đa 3 chi nhánh",
      "Feedback & đánh giá",
      "Analytics chi tiết",
      "Hỗ trợ ưu tiên",
    ],
    cta: "Chọn gói Pro",
    highlighted: true,
    value: "pro",
  },
  {
    name: "VIP",
    price: "999K",
    period: "/tháng",
    description: "Giải pháp toàn diện cho chuỗi nhà hàng",
    features: [
      "Không giới hạn bàn",
      "QR Order + AI gợi ý",
      "Tách bill & thanh toán online",
      "Không giới hạn chi nhánh",
      "Feedback & đánh giá nâng cao",
      "AI Analytics & dự đoán",
      "Hỗ trợ 24/7 chuyên biệt",
      "API tích hợp POS",
    ],
    cta: "Chọn gói VIP",
    highlighted: false,
    value: "vip",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                  <CardTitle className="text-hero-foreground text-lg">{plan.name}</CardTitle>
                  <p className="text-hero-muted text-sm">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-heading font-bold text-hero-foreground">{plan.price}</span>
                    <span className="text-hero-muted text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-hero-muted">
                        <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        {f}
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
                    onClick={() => navigate(`/onboarding?plan=${plan.value}`)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
