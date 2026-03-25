import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  requiredPlan: 'pro' | 'vip';
  feature: string;
  description?: string;
}

export default function UpgradePrompt({ requiredPlan, feature, description }: UpgradePromptProps) {
  const navigate = useNavigate();

  const planInfo = {
    pro: {
      name: 'Pro',
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    vip: {
      name: 'VIP',
      icon: Sparkles,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  };

  const info = planInfo[requiredPlan];
  const Icon = info.icon;

  return (
    <Card className={`border-2 ${info.borderColor} ${info.bgColor}`}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full ${info.bgColor} flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${info.color}`} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Tính năng {info.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-1">
            <span className="font-medium">{feature}</span> chỉ có trong gói {info.name}
          </p>
          {description && (
            <p className="text-muted-foreground text-xs mt-2">
              {description}
            </p>
          )}
        </div>
        <Button 
          onClick={() => navigate('/pricing')}
          className={`w-full ${info.color}`}
          variant="outline"
        >
          Nâng cấp lên {info.name}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
