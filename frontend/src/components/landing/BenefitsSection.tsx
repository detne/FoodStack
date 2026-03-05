import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const ownerBenefits = [
  { title: "Reduce Staff Costs", desc: "Optimize labor by letting guests handle the ordering process." },
  { title: "Speed Up Service", desc: "Instant order transmission reduces wait times and table turnover." },
  { title: "Centralized Control", desc: "Manage multiple branches and menus from a single cloud dashboard." },
];

const customerBenefits = [
  { title: "Zero Waiting Time", desc: "No more waiting for a waiter to take an order or bring the bill." },
  { title: "Visual Menu & Details", desc: "High-res food photography and detailed allergen information." },
  { title: "Easy Customization", desc: "Add extras or remove ingredients with a simple tap." },
];

const BenefitsSection = () => (
  <section id="benefits" className="py-20 md:py-24">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-secondary p-8 md:p-10"
        >
          <h3 className="text-2xl font-heading font-bold text-foreground mb-6">
            For Restaurant Owners
          </h3>
          <div className="space-y-5">
            {ownerBenefits.map((b) => (
              <div key={b.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{b.title}</p>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-accent text-accent-foreground p-8 md:p-10"
        >
          <h3 className="text-2xl font-heading font-bold mb-6">
            For Your Customers
          </h3>
          <div className="space-y-5">
            {customerBenefits.map((b) => (
              <div key={b.title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-foreground/80 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-accent-foreground/80">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default BenefitsSection;
