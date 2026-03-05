import { QrCode, Twitter, Instagram } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Analytics", "QR Menus", "Service Hub"],
  Company: ["About Us", "Careers", "Press", "Contact"],
  Support: ["Help Center", "API Docs", "Guides", "Status"],
};

const Footer = () => (
  <footer className="bg-footer text-footer-foreground">
    <div className="container mx-auto px-4 py-14">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <a href="#" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <QrCode className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-footer-heading">QRService</span>
          </a>
          <p className="text-sm leading-relaxed mb-4">
            Making restaurants operate smarter, faster, and more profitable through innovative QR technology.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-footer-foreground/10 flex items-center justify-center hover:bg-footer-foreground/20 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-footer-foreground/10 flex items-center justify-center hover:bg-footer-foreground/20 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="font-heading font-semibold text-footer-heading mb-4">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-footer-heading transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-footer-foreground/15 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2024 QR Service Platform. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-footer-heading transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-footer-heading transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
