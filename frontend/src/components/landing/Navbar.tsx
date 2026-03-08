import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-hero border-b border-hero-muted/20">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <QrCode className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-heading font-bold text-hero-foreground">QRService</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-hero-muted hover:text-hero-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" className="text-hero-muted hover:text-hero-foreground hover:bg-hero-muted/10">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            <Link to="/pricing">Start Free Trial</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-hero-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-hero border-t border-hero-muted/20 px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm text-hero-muted hover:text-hero-foreground py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Button asChild variant="ghost" className="w-full text-hero-muted hover:text-hero-foreground">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="w-full bg-accent text-accent-foreground">
            <Link to="/pricing">Start Free Trial</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
