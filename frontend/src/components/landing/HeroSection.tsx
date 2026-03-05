import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-restaurant.jpg";

const HeroSection = () => {
  return (
    <section className="bg-hero relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-accent/15 text-accent border border-accent/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Next-Gen Restaurant Tech
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-bold text-hero-foreground leading-[1.1] mb-6">
              Transform
              <br />
              Every Table into
              <br />
              a <span className="text-accent">Service Hub</span>
            </h1>

            <p className="text-base text-hero-muted mb-8 max-w-md leading-relaxed">
              Empower your restaurant with multi-branch management, real-time
              QR ordering, and AI-driven analytics to skyrocket revenue and
              efficiency.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-7 h-11">
                <Link to="/pricing">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-hero-muted/30 text-hero-foreground hover:bg-hero-muted/10 h-11 px-7"
              >
                <Play className="mr-2 w-4 h-4 fill-current" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={heroImage}
                alt="Restaurant table with QR ordering on smartphone"
                className="w-full h-auto rounded-2xl object-cover aspect-[4/3]"
              />
              {/* Floating live order card */}
              <div className="absolute bottom-6 left-6 bg-hero/95 backdrop-blur-sm rounded-lg px-4 py-3 border border-hero-muted/20 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success font-medium">Live Order</span>
                </div>
                <p className="text-sm font-semibold text-hero-foreground">Table 12: Pasta Carbonara</p>
                <p className="text-xs text-hero-muted">Preparing • 3 min ago</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
