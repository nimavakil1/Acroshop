"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedCollections, getCollections, type Collection } from "@/lib/data";

// Slideshow slides from Shopify index.json
const slides = [
  {
    id: 1,
    heading: "Büro und\nHomeoffice-Bedarf\nin bester Qualität",
    subheading: "",
    buttonText: "Shop entdecken",
    buttonLink: "/collections",
    bgColor: "from-slate-700 to-slate-900",
  },
  {
    id: 2,
    heading: "Bürogeräte",
    subheading: "Effizienz für Ihren Arbeitsplatz",
    buttonText: "Bürogeräte kaufen",
    buttonLink: "/collections/burogerate-und-zubehor",
    bgColor: "from-blue-700 to-blue-900",
  },
  {
    id: 3,
    heading: "Kabelzubehör",
    subheading: "Ordnung am Arbeitsplatz",
    buttonText: "Kabelzubehör kaufen",
    buttonLink: "/collections/kabel-organisation",
    bgColor: "from-teal-700 to-teal-900",
  },
  {
    id: 4,
    heading: "Geldkassetten",
    subheading: "Sicheres Bargeldmanagement",
    buttonText: "Geldkassetten kaufen",
    buttonLink: "/collections/geldkassetten",
    bgColor: "from-amber-700 to-amber-900",
  },
];

// Trust badges from Shopify theme
const trustBadges = [
  { icon: "price_tag", text: "Sichere Zahlung" },
  { icon: "return", text: "Einfache Rückgabe" },
  { icon: "chat", text: "Kundenservice auf deutsch" },
  { icon: "star", text: "Über 3 Mio. zufriedene Kunden" },
];

// Customer reviews from Shopify theme
const customerReviews = [
  {
    stars: 5,
    heading: "Perfekt fürs Büro – tolles Preis-Leistungs-Verhältnis",
    text: "Wir nutzen die Produkte in unserem Büro und sind wirklich begeistert! Sie sind langlebig, funktional und dabei preislich absolut fair.",
    author: "Jens M.",
  },
  {
    stars: 5,
    heading: "Schnelle Lieferung und super Qualität!",
    text: "Ich habe schon mehrfach bei dieser Firma bestellt und war jedes Mal sehr zufrieden. Die Produkte sind hochwertig und die Lieferung erfolgt zügig.",
    author: "Markus T.",
  },
  {
    stars: 4,
    heading: "Schneller Umtausch, professioneller Service",
    text: "Leider war ein Artikel defekt, aber der Kundenservice hat sofort reagiert und mir unkompliziert einen Ersatz geschickt.",
    author: "Lisa R.",
  },
  {
    stars: 5,
    heading: "Tolles Design und hohe Qualität",
    text: "Ich liebe das Design der Produkte! Sie sind nicht nur funktional, sondern sehen auch noch richtig gut aus.",
    author: "Thomas B.",
  },
];

// Stats from Shopify theme
const stats = [
  { value: "7", label: "Europäischen Länder, in denen wir präsent sind" },
  { value: "23", label: "Jahre im Geschäft" },
  { value: "3.000.000", label: "Bisher verkaufte Produkte (ca.)" },
  { value: "500", label: "Neue Kunden werden täglich bedient" },
];

// Icon component
function TrustIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "price_tag":
      return (
        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "return":
      return (
        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "star":
      return (
        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    default:
      return null;
  }
}

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  useEffect(() => {
    setFeaturedCollections(getFeaturedCollections());
    setAllCollections(getCollections().slice(0, 20));
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-body-bg">
      {/* Hero Slideshow */}
      <section className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor}`} />
            <div className="absolute inset-0 bg-black/20" />

            <div className="container-acropaq h-full flex items-end pb-16 lg:pb-24 relative z-10">
              <div className="text-white max-w-2xl">
                {slide.subheading && (
                  <p className="text-sm lg:text-base mb-2 opacity-90">{slide.subheading}</p>
                )}
                <h1 className="text-3xl lg:text-5xl xl:text-6xl font-heading font-bold mb-6 whitespace-pre-line leading-tight">
                  {slide.heading}
                </h1>
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center px-8 py-3 bg-accent text-white font-medium rounded hover:bg-opacity-90 transition-all"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 lg:py-14 bg-white border-b border-gray-100">
        <div className="container-acropaq">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex flex-col items-center text-center">
                <TrustIcon icon={badge.icon} />
                <span className="mt-3 text-sm font-medium text-heading">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Kategorien - Collection Grid */}
      <section className="py-16 lg:py-20">
        <div className="container-acropaq">
          <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-center mb-10">
            Top <span className="bg-marker-green px-1 rounded">Kategorien</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
            {featuredCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group block"
              >
                <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-gray-100">
                  {collection.image ? (
                    <img
                      src={`/images/collections/collection_${collection.id}.png`}
                      alt={collection.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Try jpg if png fails
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith('.png')) {
                          target.src = target.src.replace('.png', '.jpg');
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-xs">{collection.title[0]}</span>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-center font-medium text-body-text group-hover:text-accent transition-colors">
                  {collection.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="pb-16 lg:pb-20">
        <div className="container-acropaq">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
            {/* Large card - Bürogeräte */}
            <Link
              href="/collections/burogerate-und-zubehor"
              className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between text-white">
                <div>
                  <p className="text-sm opacity-80">Effizienter Arbeiten</p>
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold mt-1">
                    Bürogeräte &<br />Zubehör
                  </h3>
                </div>
                <span className="text-sm underline group-hover:no-underline">
                  Jetzt entdecken →
                </span>
              </div>
            </Link>

            {/* Medium card - Cash Handling */}
            <Link
              href="/collections/cash-handling"
              className="col-span-2 relative rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                <div>
                  <p className="text-xs opacity-80">Sicheres Bargeldmanagement</p>
                  <h3 className="text-xl lg:text-2xl font-heading font-bold mt-1">Cash-Handling</h3>
                </div>
                <span className="text-sm underline group-hover:no-underline">Entdecken →</span>
              </div>
            </Link>

            {/* Small card - Organisation */}
            <Link
              href="/collections/organisation-und-archivierung"
              className="relative rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center text-white">
                <p className="text-xs opacity-80">Perfekte Organisation</p>
                <h3 className="text-base lg:text-lg font-heading font-semibold mt-1">
                  Ordner & Mappen
                </h3>
              </div>
            </Link>

            {/* Small card - Ergonomie */}
            <Link
              href="/collections/arbeitsergonomie"
              className="relative rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center text-white">
                <p className="text-xs opacity-80">Komfort & Gesundheit</p>
                <h3 className="text-base lg:text-lg font-heading font-semibold mt-1">
                  Arbeitsergonomie
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee */}
      <section className="py-8 overflow-hidden bg-white">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="text-4xl lg:text-6xl font-heading font-bold text-gray-200 mx-8">
                ACROPAQ
              </span>
              <span className="text-2xl lg:text-3xl font-heading text-gray-300 mx-8">
                &quot;Büro und Homeoffice-Bedarf in bester Qualität.&quot;
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-body-bg">
        <div className="container-acropaq">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/5] bg-gray-300 rounded-2xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                </div>
                <div className="aspect-[4/5] bg-gray-300 rounded-2xl overflow-hidden mt-8">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-body-text mb-2">
                seit 2001 im Herzen Europas zuhause, mit Leidenschaft für hochwertige Büroprodukte.
              </p>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-6">
                DAS IST{" "}
                <span className="bg-marker-orange px-2 rounded">ACROPAQ</span>
              </h2>
              <p className="text-body-text leading-relaxed text-lg">
                Im pulsierenden Herzen Europas, in Brüssel, wurde <strong>ACROPAQ</strong> 2001
                gegründet. Seitdem stehen wir für <strong>Qualität</strong> und{" "}
                <strong>Design</strong>, um <strong>Büro</strong>- und{" "}
                <strong>Arbeitsumgebungen</strong> nicht nur funktionaler, sondern auch ästhetisch
                ansprechender zu gestalten.
              </p>
              <Link
                href="/pages/uber-uns"
                className="inline-flex items-center mt-6 text-accent font-medium hover:underline"
              >
                Mehr erfahren →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-acropaq">
          <h3 className="text-xl lg:text-2xl font-heading font-semibold text-center mb-10">
            Ihr Vertrauen in Zahlen
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl lg:text-5xl font-heading font-bold text-heading">
                  {stat.value}
                </p>
                <p className="text-sm text-body-text mt-2 max-w-[200px] mx-auto">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 lg:py-20 bg-body-bg">
        <div className="container-acropaq">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-heading font-semibold">
              Das sagen unsere{" "}
              <span className="bg-marker-green px-1 rounded">Kunden</span>:
            </h2>
            <p className="text-body-text mt-3 max-w-xl mx-auto">
              Bewertungen, die auf unserer Seite und auf Marktplätze für unsere Produkte hinterlegt sind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerReviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <StarRating rating={review.stars} />
                <h4 className="font-heading font-semibold text-heading mt-4 mb-2 line-clamp-2">
                  {review.heading}
                </h4>
                <p className="text-sm text-body-text mb-4 line-clamp-3">{review.text}</p>
                <p className="text-sm font-medium text-heading">— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
