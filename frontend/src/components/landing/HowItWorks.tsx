import { motion } from "framer-motion";
import { ScanLine, ShoppingCart, Utensils, CreditCard } from "lucide-react";

const steps = [
  { icon: ScanLine, label: "1. Scan", desc: "Guest scans the unique table QR code." },
  { icon: ShoppingCart, label: "2. Order", desc: "Browse visual menu and customize dishes." },
  { icon: Utensils, label: "3. Enjoy", desc: "Food is prepared and served to the table." },
  { icon: CreditCard, label: "4. Pay", desc: "Secure and instant mobile checkout." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-24 bg-muted/40">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
        Seamless Experience
      </h2>
      <p className="text-muted-foreground mb-14 max-w-lg mx-auto">
        A smooth journey from the moment they sit down.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-hero flex items-center justify-center mb-4">
              <s.icon className="w-6 h-6 text-hero-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-1">{s.label}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
