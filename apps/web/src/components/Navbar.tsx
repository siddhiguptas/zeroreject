'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  FileCheck2,
  Cpu,
  BookOpen,
  Terminal,
  FileText,
  Info,
  Menu,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: ShieldCheck },
    { name: 'Pre-Flight Studio', href: '/studio', icon: FileCheck2 },
    { name: 'Document Intelligence', href: '/intelligence', icon: Cpu },
    { name: 'Rules & Jurisdiction', href: '/rules', icon: BookOpen },
    { name: 'Automation Lab', href: '/automation', icon: Terminal },
    { name: 'Audit & Reports', href: '/audit', icon: FileText },
    { name: 'About', href: '/about', icon: Info },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#DFDBD2] transition-all">
      {/* Top micro-announcement banner */}
      <div className="bg-[#162A45] text-white text-[11px] font-mono py-1 px-4 text-center tracking-wide flex items-center justify-center space-x-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-amber-200 font-semibold">ZeroReject (PramaanFix)</span>
        <span className="text-slate-400">|</span>
        <span className="hidden sm:inline">100% On-Device Sovereign Architecture • $0 Cloud Leakage •</span>
        <span className="text-emerald-300 font-bold">&quot;Fix it before you file it&quot;</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Hindi Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#162A45] flex items-center justify-center shadow-xs border border-[#0F1E33] group-hover:bg-[#0E1A2B] transition-colors">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold tracking-tight text-[#111625]">
                ZeroReject
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#EFECE4] text-[#162A45] px-1.5 py-0.5 rounded border border-[#DFDBD2]">
                प्रमाण फिक्स
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#525866] -mt-1 hidden sm:block">
              Pre-Submission Civic Assurance
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden xl:flex items-center space-x-1">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all flex items-center space-x-1.5 ${
                  active
                    ? 'bg-[#162A45] text-white shadow-xs'
                    : 'text-[#525866] hover:text-[#111625] hover:bg-[#EFECE4]'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-[#7C776B]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Actions CTA & Mobile Hamburger */}
        <div className="flex items-center space-x-3">
          <Link
            href="/studio"
            className="hidden sm:inline-flex items-center space-x-2 bg-[#162A45] hover:bg-[#0E1A2B] text-white text-xs font-mono font-semibold px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </Link>

          {/* Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg border border-[#DFDBD2] text-[#111625] hover:bg-[#EFECE4] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#DFDBD2] bg-[#FBF9F5] px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  active
                    ? 'bg-[#162A45] text-white font-bold'
                    : 'text-[#525866] hover:text-[#111625] hover:bg-[#EFECE4]'
                }`}
              >
                <item.icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-[#7C776B]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#DFDBD2]">
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-[#162A45] text-white text-xs font-mono font-semibold py-2.5 rounded-lg shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch Pre-Flight Studio →</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

