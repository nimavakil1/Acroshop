"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/hooks/useCart";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

// Main menu structure from Shopify
const mainMenu = [
  {
    title: "Bürogeräte",
    href: "/collections/burogerate-und-zubehor",
    items: [
      { title: "Laminiergeräte", href: "/collections/laminiergerate" },
      { title: "Laminierfolien", href: "/collections/laminierfolien" },
      { title: "Aktenvernichter", href: "/collections/aktenvernichter" },
      { title: "Taschenrechner", href: "/collections/taschenrechner" },
      { title: "Schneidematten", href: "/collections/schneidematten" },
      { title: "Papierschneider", href: "/collections/papierschneider" },
      { title: "Anspitzer", href: "/collections/anspitzer" },
    ],
  },
  {
    title: "Büroorganisation",
    href: "/collections/organisation-und-archivierung",
    items: [
      { title: "Fotoalben", href: "/collections/fotoalben" },
      { title: "Ordner", href: "/collections/ordner" },
      { title: "Ringbuch", href: "/collections/ringbuch" },
      { title: "Schlüsselkästen", href: "/collections/schlusselkasten" },
      { title: "Zeichnungsmappen", href: "/collections/zeichnungsmappen" },
    ],
  },
  {
    title: "Geldkassetten",
    href: "/collections/cash-handling",
    items: [
      { title: "Geldkassetten", href: "/collections/geldkassetten" },
      { title: "Kassenladen", href: "/collections/kassenladen" },
      { title: "Kassenrollen", href: "/collections/kassenrollen" },
    ],
  },
  {
    title: "Arbeitsergonomie",
    href: "/collections/arbeitsergonomie",
    items: [
      { title: "Schreibunterlagen", href: "/collections/schreibunterlagen" },
      { title: "Laptop-Ständer", href: "/collections/laptop-stander" },
      { title: "Monitor-Ständer", href: "/collections/monitor-stander" },
      { title: "Monitorarme", href: "/collections/monitorarme" },
      { title: "Fußstützen", href: "/collections/fussstutzen" },
    ],
  },
  {
    title: "Elektronikzubehör",
    href: "/collections/elektronikzubehor",
    items: [
      { title: "Kabel-Organisation", href: "/collections/kabel-organisation" },
      { title: "Steckdosenleisten", href: "/collections/steckdosenleisten" },
    ],
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCartStore();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-header">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p>Kostenloser Versand ab 100 € | B2B-Kunden: USt-IdNr. eingeben für Reverse Charge</p>
      </div>

      {/* Main Header */}
      <nav className="container-acropaq">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-body-text hover:text-accent"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <span className="text-2xl lg:text-3xl font-heading font-bold text-heading tracking-tight">
                ACROPAQ
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {mainMenu.map((item) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.title)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-2 text-sm font-medium text-body-text hover:text-accent transition-colors"
                >
                  {item.title}
                  {item.items.length > 0 && (
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  )}
                </Link>

                {/* Dropdown */}
                {item.items.length > 0 && activeDropdown === item.title && (
                  <div className="absolute left-0 top-full w-56 bg-white shadow-lg rounded-md py-2 z-50 animate-fade-in">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-body-text hover:bg-body-bg hover:text-accent transition-colors"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search */}
            <button
              type="button"
              className="p-2 text-body-text hover:text-accent transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <MagnifyingGlassIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="hidden lg:block p-2 text-body-text hover:text-accent transition-colors"
            >
              <UserIcon className="h-6 w-6" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-body-text hover:text-accent transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-medium text-white bg-accent rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="py-4 border-t border-gray-100 animate-fade-in">
            <form className="flex">
              <input
                type="search"
                placeholder="Suchen..."
                className="flex-1 border-gray-300 rounded-l-md focus:border-accent focus:ring-accent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-button-bg text-button-text rounded-r-md hover:opacity-90 transition-opacity"
              >
                Suchen
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-heading font-bold">Menu</span>
              <button
                type="button"
                className="p-2 text-body-text"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {mainMenu.map((item) => (
                <div key={item.title} className="border-b border-gray-100">
                  <Link
                    href={item.href}
                    className="block px-4 py-3 font-medium text-heading"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.items.length > 0 && (
                    <div className="bg-body-bg">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className="block px-6 py-2 text-sm text-body-text hover:text-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile account link */}
              <Link
                href="/account"
                className="block px-4 py-3 font-medium text-heading border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mein Konto
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
