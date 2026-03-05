import { motion } from "framer-motion";
import { Building2, QrCode, ShoppingCart, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Multi-branch Management",
    description: "Centralized control for all your restaurant locations, menus, and staff in one place.",
  },
  {
    icon: QrCode,
    title: "Real-time QR Ordering",
    description: "Enable customers to browse your menus and order instantly from their own devices.",
  },
  {
    icon: ShoppingCart,
    title: "Service Hub",
    description: "Instant staff alerts for water requests, bill requests, or personalized table assistance.",
  },
  {
    icon: BarChart3,
    title: "AI Analytics",
    description: "Predictive data-driven insights to optimize your menu, inventory, and labor operations.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-24">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
          Powerful Features for Modern Dining
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Everything you need to manage one or one hundred locations from a single dashboard.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <f.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
