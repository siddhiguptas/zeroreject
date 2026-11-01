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
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = pathname === '/';

  // Dedicated Workspace Tools navigation
  const workspaceLinks = [
    { name: 'Pre-Flight Studio', href: '/studio', icon: FileCheck2 },
    { name: 'Document Intelligence', href: '/intelligence', icon: Cpu },
    { name: 'Rules & Jurisdiction', href: '/rules', icon: BookOpen },
    { name: 'Automation Lab', href: '/automation', icon: Terminal },
    { name: 'Audit & Reports', href: '/audit', icon: FileText },
    { name: 'About', href: '/about', icon: Info },
  ];

  // Dedicated Public Homepage navigation
  const publicLinks = [
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'About ZeroReject', href: '/about' },
  ];

  const isWorkspaceActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#DFDBD2] transition-all">
      {/* Top micro-announcement banner */}
      <div className="bg-[#162A45] text-white text-[11px] font-mono py-1 px-4 text-center tracking-wide flex items-center justify-center space-x-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-amber-200 font-semibold">ZeroReject (PramaanFix)</span>
        <span className="text-slate-400">|</span>
        <span className="hidden sm:inline">100% On-Device Sovereign Architecture • $0 Cloud Leakage •</span>
        <span className="text-emerald-300 font-bold">&quot;Fix it before you file it&quot;</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ========================================================================= */}
        {/* BRAND IDENTITY LOGO (Always links to Homepage) */}
        {/* ========================================================================= */}
        <Link
          href="/"
          className="flex items-center space-x-3 group shrink-0"
          title={isHomePage ? 'ZeroReject Homepage' : 'Return to Public Homepage'}
        >
          <div className="w-9 h-9 rounded-lg bg-[#162A45] flex items-center justify-center shadow-xs border border-[#0F1E33] group-hover:bg-[#0E1A2B] transition-colors">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold tracking-tight text-[#111625]">
                ZeroReject
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isHomePage
                  ? 'bg-[#EFECE4] text-[#162A45] border-[#DFDBD2]'
                  : 'bg-[#162A45] text-amber-200 border-[#162A45]'
              }`}>
                {isHomePage ? 'प्रमाण फिक्स' : 'Studio'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#525866] -mt-1 hidden sm:block">
              {isHomePage ? 'Pre-Submission Civic Assurance' : 'Application Workspace'}
            </span>
          </div>
        </Link>

        {/* ========================================================================= */}
        {/* DESKTOP NAVIGATION: DUAL MODE */}
        {/* ========================================================================= */}
        {isHomePage ? (
          /* A. PUBLIC HOMEPAGE NAVIGATION (Clean, spacious, non-dashboard) */
          <div className="hidden md:flex items-center space-x-6">
            {publicLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs font-mono font-medium text-[#525866] hover:text-[#111625] transition-colors py-1.5"
              >
                {item.name}
              </Link>
            ))}
          </div>
        ) : (
          /* B. APPLICATION WORKSPACE NAVIGATION (Contextual tools tabs) */
          <div className="hidden lg:flex items-center space-x-1">
            {workspaceLinks.map((item) => {
              const active = isWorkspaceActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center space-x-1.5 ${
                    active
                      ? 'bg-[#162A45] text-white shadow-xs font-semibold'
                      : 'text-[#525866] hover:text-[#111625] hover:bg-[#EFECE4]'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-[#7C776B]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTIONS & CTA: DUAL MODE */}
        {/* ========================================================================= */}
        <div className="flex items-center space-x-3 shrink-0">
          {isHomePage ? (
            /* Public Homepage: Prominent "Launch Studio" CTA */
            <Link
              href="/studio"
              className="inline-flex items-center space-x-2 bg-[#162A45] hover:bg-[#0E1A2B] text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            /* Workspace: Return to Public Website + Status Indicator (NO duplicate Launch Studio) */
            <div className="flex items-center space-x-2.5">
              <span className="hidden xl:inline-flex items-center space-x-1.5 text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>100% On-Device</span>
              </span>

              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-[#525866] hover:text-[#162A45] px-3 py-1.5 rounded-lg border border-[#DFDBD2] hover:bg-[#EFECE4] transition-colors"
                title="Return to Public Homepage"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Public Site</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${isHomePage ? 'md:hidden' : 'lg:hidden'} p-2 rounded-lg border border-[#DFDBD2] text-[#111625] hover:bg-[#EFECE4] transition-colors`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER MENU: DUAL MODE */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className={`${isHomePage ? 'md:hidden' : 'lg:hidden'} border-t border-[#DFDBD2] bg-[#FBF9F5] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2`}>
          {isHomePage ? (
            /* Public Mobile Menu */
            <div className="space-y-2">
              {publicLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-mono font-medium text-[#525866] hover:text-[#111625] hover:bg-[#EFECE4]"
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-[#DFDBD2]">
                <Link
                  href="/studio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-[#162A45] text-white text-xs font-mono font-bold py-2.5 rounded-lg shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch Pre-Flight Studio →</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Workspace Mobile Menu */
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase text-[#7C776B] tracking-wider">
                Application Workspace
              </div>
              {workspaceLinks.map((item) => {
                const active = isWorkspaceActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
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
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-[#FAF9F5] border border-[#DFDBD2] text-[#162A45] text-xs font-mono font-semibold py-2 rounded-lg hover:bg-[#EFECE4]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Public Homepage</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
