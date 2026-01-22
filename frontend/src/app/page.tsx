"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Slideshow data from Shopify theme
const slides = [
  {
    id: 1,
    image: "/slides/slide-1.jpg",
    heading: "Büro und\nHomeoffice-Bedarf\nin bester Qualität",
    buttonText: "Shop entdecken",
    buttonLink: "/collections",
  },
  {
    id: 2,
    image: "/slides/slide-2.jpg",
    heading: "Bürogeräte",
    buttonText: "Bürogeräte kaufen",
    buttonLink: "/collections/burogerate-und-zubehor",
  },
  {
    id: 3,
    image: "/slides/slide-3.jpg",
    heading: "Kabelzubehör",
    buttonText: "Kabelzubehör kaufen",
    buttonLink: "/collections/kabel-organisation",
  },
  {
    id: 4,
    image: "/slides/slide-4.jpg",
    heading: "Geldkassetten",
    buttonText: "Geldkassetten kaufen",
    buttonLink: "/collections/geldkassetten",
  },
];

// Trust badges
const trustBadges = [
  { icon: CheckIcon, text: "Sichere Zahlung" },
  { icon: ArrowPathIcon, text: "Einfache Rückgabe" },
  { icon: ChatBubbleLeftRightIcon, text: "Kundenservice auf deutsch" },
  { icon: StarIcon, text: "Über 3 Mio. zufriedene Kunden" },
];

// Top Categories
const topCategories = [
  { name: "Laminiergeräte", handle: "laminiergerate", image: "/categories/laminators.jpg" },
  { name: "Laminierfolien", handle: "laminierfolien", image: "/categories/pouches.jpg" },
  { name: "Geldkassetten", handle: "geldkassetten", image: "/categories/cash-boxes.jpg" },
  { name: "Ringbuch", handle: "ringbuch", image: "/categories/binders.jpg" },
  { name: "Kassenladen", handle: "kassenladen", image: "/categories/cash-drawers.jpg" },
  { name: "Taschenrechner", handle: "taschenrechner", image: "/categories/calculators.jpg" },
  { name: "Anspitzer", handle: "anspitzer", image: "/categories/sharpeners.jpg" },
  { name: "Kassenrollen", handle: "kassenrollen", image: "/categories/rolls.jpg" },
  { name: "Aktenvernichter", handle: "aktenvernichter", image: "/categories/shredders.jpg" },
  { name: "Fotoalben", handle: "fotoalben", image: "/categories/albums.jpg" },
  { name: "Schneidematten", handle: "schneidematten", image: "/categories/mats.jpg" },
  { name: "Kabel-Organisation", handle: "kabel-organisation", image: "/categories/cables.jpg" },
];

// Category cards for media grid
const categoryCards = [
  {
    title: "Bürogeräte & Zubehör",
    subtitle: "Effizienter Arbeiten",
    link: "/collections/burogerate-und-zubehor",
    image: "/categories/office-equipment.jpg",
    size: "large",
  },
  {
    title: "Cash-Handling",
    subtitle: "Sicheres Bargeldmanagement",
    link: "/collections/cash-handling",
    image: "/categories/cash-handling.jpg",
    size: "medium",
  },
  {
    title: "Ordner & Mappen",
    subtitle: "Perfekte Organisation",
    link: "/collections/ordner-und-mappen",
    image: "/categories/folders.jpg",
    size: "small",
  },
  {
    title: "Arbeitsergonomie",
    subtitle: "Komfort & Gesundheit",
    link: "/collections/arbeitsergonomie",
    image: "/categories/ergonomics.jpg",
    size: "small",
  },
];

// Customer reviews
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

// Stats
const stats = [
  { value: "7", label: "Europäischen Länder, in denen wir präsent sind" },
  { value: "23", label: "Jahre im Geschäft" },
  { value: "3.000.000", label: "Bisher verkaufte Produkte (ca.)" },
  { value: "500", label: "Neue Kunden werden täglich bedient" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="bg-body-bg">
      {/* Hero Slideshow */}
      <section className="relative h-[500px] lg:h-[650px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background placeholder - replace with actual images */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
            <div className="absolute inset-0 slide-overlay" />

            {/* Content */}
            <div className="container-acropaq h-full flex items-end pb-16 lg:pb-20 relative z-10">
              <div className="text-white max-w-xl">
                <h1 className="text-3xl lg:text-5xl font-heading font-bold mb-6 whitespace-pre-line">
                  {slide.heading}
                </h1>
                <Link href={slide.buttonLink} className="btn-accent">
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="container-acropaq">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="trust-badge">
                <badge.icon className="trust-badge-icon" />
                <span className="text-sm font-medium text-heading">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Categories Grid */}
      <section className="section-spacing">
        <div className="container-acropaq">
          <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-center mb-8">
            Top <span className="marker-green">Kategorien</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topCategories.map((category) => (
              <Link
                key={category.handle}
                href={`/collections/${category.handle}`}
                className="group block"
              >
                <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Bild</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-center font-medium text-body-text group-hover:text-accent transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Media Grid - Category Cards */}
      <section className="pb-section-mobile lg:pb-section">
        <div className="container-acropaq">
          <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-center mb-8">
            Top <span className="marker-orange">Kategorien</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[150px] lg:auto-rows-[200px]">
            {/* Large card spanning 2 rows and 2 columns */}
            <Link
              href={categoryCards[0].link}
              className="col-span-2 row-span-2 relative rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 p-6 flex flex-col justify-start items-center text-center text-white">
                <span className="text-sm opacity-80">{categoryCards[0].subtitle}</span>
                <h3 className="text-xl lg:text-2xl font-heading font-semibold mt-1">
                  {categoryCards[0].title}
                </h3>
                <span className="mt-4 text-sm underline group-hover:no-underline">
                  Jetzt entdecken
                </span>
              </div>
            </Link>

            {/* Medium card spanning 2 columns */}
            <Link
              href={categoryCards[1].link}
              className="col-span-2 relative rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-800" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 p-4 flex flex-col justify-start text-white">
                <span className="text-xs opacity-80">{categoryCards[1].subtitle}</span>
                <h3 className="text-lg font-heading font-semibold mt-1">
                  {categoryCards[1].title}
                </h3>
              </div>
            </Link>

            {/* Small cards */}
            {categoryCards.slice(2).map((card) => (
              <Link
                key={card.title}
                href={card.link}
                className="relative rounded-lg overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center text-white">
                  <span className="text-xs opacity-80">{card.subtitle}</span>
                  <h3 className="text-base font-heading font-semibold mt-1">
                    {card.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling Text Marquee */}
      <section className="py-6 overflow-hidden">
        <div className="flex animate-scroll-left whitespace-nowrap">
          <span className="text-4xl lg:text-5xl font-heading text-gray-300 mx-8">
            ACROPAQ
          </span>
          <span className="text-4xl lg:text-5xl font-heading text-gray-300 mx-8">
            &quot;Büro und Homeoffice-Bedarf in bester Qualität.&quot;
          </span>
          <span className="text-4xl lg:text-5xl font-heading text-gray-300 mx-8">
            ACROPAQ
          </span>
          <span className="text-4xl lg:text-5xl font-heading text-gray-300 mx-8">
            &quot;Büro und Homeoffice-Bedarf in bester Qualität.&quot;
          </span>
        </div>
      </section>

      {/* About Section */}
      <section className="section-spacing bg-white">
        <div className="container-acropaq">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="aspect-square bg-gray-200 rounded-lg mt-8" />
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-body-text mb-2">
                seit 2001 im Herzen Europas zuhause, mit Leidenschaft für hochwertige Büroprodukte.
              </p>
              <h2 className="text-2xl lg:text-4xl font-heading font-bold mb-6">
                DAS IST <span className="marker-orange">ACROPAQ</span>
              </h2>
              <p className="text-body-text leading-relaxed">
                Im pulsierenden Herzen Europas, in Brüssel, wurde <strong>ACROPAQ</strong> 2001
                gegründet. Seitdem stehen wir für <strong>Qualität</strong> und{" "}
                <strong>Design</strong>, um <strong>Büro</strong>- und{" "}
                <strong>Arbeitsumgebungen</strong> nicht nur funktionaler, sondern auch ästhetisch
                ansprechender zu gestalten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-body-bg">
        <div className="container-acropaq">
          <h3 className="text-xl lg:text-2xl font-heading font-semibold text-center mb-8">
            Ihr Vertrauen in Zahlen
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-heading font-bold text-heading">
                  {stat.value}
                </p>
                <p className="text-sm text-body-text mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="section-spacing bg-white">
        <div className="container-acropaq">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-heading font-semibold">
              Das sagen unsere <span className="marker-green">Kunden</span>:
            </h2>
            <p className="text-body-text mt-2">
              Bewertungen, die auf unserer Seite und auf Marktplätze für unsere Produkte hinterlegt sind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerReviews.map((review, index) => (
              <div key={index} className="bg-body-bg rounded-lg p-6">
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.stars ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <h4 className="font-heading font-semibold text-heading mb-2">
                  {review.heading}
                </h4>
                <p className="text-sm text-body-text mb-4">{review.text}</p>
                <p className="text-sm font-medium text-heading">— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
