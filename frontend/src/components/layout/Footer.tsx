import Link from "next/link";

// Footer menus from Shopify
const footerMenus = {
  acropaq: {
    title: "ACROPAQ",
    items: [
      { name: "Über uns", href: "/pages/uber-uns" },
      { name: "Kontakt", href: "/pages/contact" },
    ],
  },
  information: {
    title: "Information",
    items: [
      { name: "Impressum", href: "/policies/legal-notice" },
      { name: "AGB", href: "/policies/terms-of-service" },
      { name: "Datenschutz", href: "/policies/privacy-policy" },
      { name: "Versandinformationen", href: "/policies/shipping-policy" },
      { name: "Haftungsausschluss", href: "/policies/refund-policy" },
    ],
  },
  quicklinks: {
    title: "Quicklinks & Tipps",
    items: [
      { name: "Laminiergeräte", href: "/collections/laminiergerate" },
      { name: "Ringbücher und Ordner", href: "/collections/ordner" },
      { name: "Kassenladen", href: "/collections/kassenladen" },
      { name: "Geldkassetten", href: "/collections/geldkassetten" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="container-acropaq py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-heading font-bold text-white">
                ACROPAQ
              </span>
            </Link>
            <p className="text-sm text-footer-link mb-4">
              Büro und Homeoffice-Bedarf in bester Qualität. Seit 2001 im Herzen
              Europas zuhause.
            </p>
            <div className="space-y-1 text-sm text-footer-link">
              <p>Acropaq NV</p>
              <p>Brüssel, Belgien</p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-4">
              <a
                href="https://www.youtube.com/@acropaq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-footer-link hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ACROPAQ Menu */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">
              {footerMenus.acropaq.title}
            </h3>
            <ul className="space-y-2">
              {footerMenus.acropaq.items.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-footer-link hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Menu */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">
              {footerMenus.information.title}
            </h3>
            <ul className="space-y-2">
              {footerMenus.information.items.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-footer-link hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quicklinks Menu */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">
              {footerMenus.quicklinks.title}
            </h3>
            <ul className="space-y-2">
              {footerMenus.quicklinks.items.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-footer-link hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* B2B Notice */}
        <div className="mt-10 pt-8 border-t border-footer-border">
          <div className="bg-white/5 rounded-lg p-4 text-sm">
            <h4 className="text-white font-heading font-semibold mb-2">
              B2B-Kunden
            </h4>
            <p className="text-footer-link">
              Geschäftskunden mit gültiger EU-USt-IdNr. profitieren von Reverse
              Charge (0% USt.). Geben Sie Ihre USt-IdNr. an der Kasse ein für
              automatische Validierung.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-footer-border flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-footer-link">
            © {new Date().getFullYear()} ACROPAQ. All rights reserved.
          </p>

          {/* Language Selector */}
          <div className="flex items-center gap-4">
            <select className="bg-transparent border border-footer-border text-footer-link text-sm rounded px-3 py-1 focus:outline-none focus:border-white">
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="nl">Nederlands</option>
            </select>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center space-x-3">
            <img
              src="/payment-visa.svg"
              alt="Visa"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              src="/payment-mastercard.svg"
              alt="Mastercard"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              src="/payment-bancontact.svg"
              alt="Bancontact"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              src="/payment-ideal.svg"
              alt="iDEAL"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
