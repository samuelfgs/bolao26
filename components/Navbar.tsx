"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { isAdmin } from "@/lib/actions/admin";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const admin = await isAdmin();
      setIsUserAdmin(admin);
    }
    checkAdmin();
  }, []);

  // Don't show navbar on login, register, home or onboarding pages
  if (["/login", "/register", "/", "/onboarding", "/waiting-approval"].includes(pathname)) {
    return null;
  }

  const navItems = [
    { name: "Palpites", href: "/palpites" },
    { name: "Classificação", href: "/classificacao" },
    { name: "Ranking", href: "/ranking" },
    { name: "Regulamento", href: "/regulamento" },
  ];

  if (isUserAdmin) {
    navItems.push({ name: "Aprovações", href: "/admin/approvals" });
  }

  return (
    <nav className="sticky top-0 w-full bg-stadium-green-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stadium-yellow rounded-xl flex items-center justify-center text-stadium-green-900 font-black text-lg italic shadow-lg">
            B
          </div>
          <span className="text-white font-black uppercase italic tracking-tighter text-xl">Bolão <span className="text-stadium-yellow">2026</span></span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-stadium-yellow text-stadium-green-900 shadow-md scale-105" 
                    : "text-green-100 hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center">
          <button
            onClick={() => signOut()}
            className="group flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-transparent hover:border-red-500/20"
            title="Sair"
          >
            <span>Sair</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 focus:outline-hidden"
          >
            {isMobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stadium-green-800 border-t border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top-4 fade-in duration-200">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-stadium-yellow text-stadium-green-900 shadow-md" 
                    : "text-green-100 hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={() => signOut()}
            className="w-full flex justify-between items-center px-4 py-3 mt-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm uppercase tracking-widest border border-transparent"
          >
            <span>Sair</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
}
