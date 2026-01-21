"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/hooks/useCart";

const navigation = [
  { name: "Products", href: "/products" },
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCartStore();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Announcement bar */}
      <div className="bg-primary-600 text-white text-center py-2 text-sm">
        <p>Free shipping on orders over €100 | B2B customers: Enter VAT for reverse charge</p>
      </div>

      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Acropaq</span>
              <span className="text-2xl font-light text-gray-600 ml-1">Shop</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-600 hover:text-primary-600"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="p-2 text-gray-600 hover:text-primary-600"
              aria-label="Account"
            >
              <UserIcon className="h-6 w-6" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-gray-600 hover:text-primary-600 relative"
              aria-label="Cart"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="py-4 border-t animate-fade-in">
            <form action="/search" method="GET" className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
