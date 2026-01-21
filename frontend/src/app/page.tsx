import Link from "next/link";
import { ArrowRightIcon, TruckIcon, ShieldCheckIcon, CurrencyEuroIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container-custom py-20 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Quality Office Supplies for Your Business
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Professional-grade equipment and supplies with EU-wide delivery.
              B2B customers enjoy VAT reverse charge.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Shop Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/b2b" className="btn-outline border-white text-white hover:bg-white/10">
                B2B Information
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full"></div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over €100</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Checkout</h3>
                <p className="text-sm text-gray-600">Stripe & local payments</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <CurrencyEuroIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">B2B VAT Support</h3>
                <p className="text-sm text-gray-600">Reverse charge for EU businesses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our extensive range of office supplies and equipment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder collection cards - will be populated from Medusa */}
            {[
              { name: "Binding & Laminating", image: "/placeholder-collection.jpg", count: 120 },
              { name: "Paper Shredders", image: "/placeholder-collection.jpg", count: 45 },
              { name: "Office Equipment", image: "/placeholder-collection.jpg", count: 89 },
              { name: "Presentation", image: "/placeholder-collection.jpg", count: 67 },
              { name: "Storage & Organization", image: "/placeholder-collection.jpg", count: 134 },
              { name: "Accessories", image: "/placeholder-collection.jpg", count: 78 },
            ].map((collection) => (
              <Link
                key={collection.name}
                href={`/collections/${collection.name.toLowerCase().replace(/ /g, "-")}`}
                className="group card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{collection.name}</h3>
                    <p className="text-sm text-gray-200">{collection.count} products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B2B CTA */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Business Customer?
            </h2>
            <p className="text-gray-600 mb-8">
              Register your company and enjoy benefits like VAT reverse charge,
              volume discounts, and dedicated account management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/b2b" className="btn-primary">
                Learn About B2B Benefits
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter for exclusive offers and product updates.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                required
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
