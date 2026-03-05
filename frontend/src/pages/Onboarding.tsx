import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QrCode, HelpCircle, Shield, RefreshCw, Check } from "lucide-react";
import StepGeneral from "@/components/onboarding/StepGeneral";
import StepLocation from "@/components/onboarding/StepLocation";
import StepHours from "@/components/onboarding/StepHours";
import StepManager from "@/components/onboarding/StepManager";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "General", icon: "1" },
  { label: "Location", icon: "2" },
  { label: "Hours", icon: "3" },
  { label: "Manager", icon: "4" },
];

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };
  const handleFinish = () => {
    // TODO: submit data
    alert("Branch setup complete! 🎉");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <QrCode className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">QRService</span>
          </Link>
          <span className="text-sm text-muted-foreground capitalize">
            Plan: <span className="font-semibold text-accent">{plan}</span>
          </span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1">
            Set Up Your First Branch
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete all steps to get your branch ready for operation.
          </p>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2 mb-8" />

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((step, i) => (
            <button
              key={step.label}
              className="flex flex-col items-center gap-2 group"
              onClick={() => i <= currentStep && setCurrentStep(i)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < currentStep
                    ? "bg-accent text-accent-foreground"
                    : i === currentStep
                    ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {i < currentStep ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  i <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[350px]"
          >
            {currentStep === 0 && <StepGeneral data={formData} onChange={updateField} />}
            {currentStep === 1 && <StepLocation data={formData} onChange={updateField} />}
            {currentStep === 2 && <StepHours data={formData} onChange={updateField} />}
            {currentStep === 3 && <StepManager data={formData} onChange={updateField} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            ← Back
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            Save as Draft
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8"
              onClick={handleNext}
            >
              Next Step →
            </Button>
          ) : (
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8"
              onClick={handleFinish}
            >
              Complete Setup ✓
            </Button>
          )}
        </div>

        {/* Footer info cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex gap-3">
            <HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Need help?</p>
              <p className="text-xs text-muted-foreground">Contact support anytime for assistance.</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex gap-3">
            <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Data Privacy</p>
              <p className="text-xs text-muted-foreground">Your data is encrypted and secure.</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex gap-3">
            <RefreshCw className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Sync</p>
              <p className="text-xs text-muted-foreground">Changes sync automatically across devices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
