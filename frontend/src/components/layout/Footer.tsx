import Link from "next/link";

const footerLinks = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "Collections", href: "/collections" },
    { name: "New Arrivals", href: "/products?sort=newest" },
    { name: "Best Sellers", href: "/products?sort=bestseller" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Returns", href: "/returns" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "B2B Information", href: "/b2b" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">Acropaq</span>
              <span className="text-2xl font-light text-gray-400 ml-1">Shop</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Quality office supplies and business equipment for professionals across Europe.
            </p>
            <div className="space-y-1 text-sm">
              <p>Acropaq NV</p>
              <p>Ternat, Belgium</p>
              <p>VAT: BE0XXX.XXX.XXX</p>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* B2B Notice */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-4 text-sm">
            <h4 className="text-white font-semibold mb-2">B2B Customers</h4>
            <p className="text-gray-400">
              Business customers with a valid EU VAT number can benefit from reverse charge
              (0% VAT). Enter your VAT number at checkout for automatic validation.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Acropaq Shop. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <img src="/payment-visa.svg" alt="Visa" className="h-8" />
            <img src="/payment-mastercard.svg" alt="Mastercard" className="h-8" />
            <img src="/payment-bancontact.svg" alt="Bancontact" className="h-8" />
            <img src="/payment-ideal.svg" alt="iDEAL" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
