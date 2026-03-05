import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-16 md:py-24">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl bg-cta text-cta-foreground p-10 md:p-16 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Ready to revolutionize your dining
          <br />
          experience?
        </h2>
        <p className="text-cta-foreground/60 mb-8 max-w-lg mx-auto text-sm">
          Join the future of restaurant management. Start your 14-day free trial today.
          <br />
          No credit card required.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 h-11">
            <Link to="/pricing">Start Free Trial Now</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-cta-foreground/30 text-cta-foreground hover:bg-cta-foreground/10 h-11 px-8">
            Contact Sales
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
