'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck2,
  Cpu,
  BookOpen,
  Terminal,
  FileText,
  Lock,
  CheckCircle,
  ExternalLink,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#DFDBD2] bg-[#EFECE4] text-[#111625] pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand & Core Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#162A45] flex items-center justify-center text-amber-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#111625]">
                ZeroReject <span className="text-sm font-mono font-normal text-[#525866]">(प्रमाण फिक्स)</span>
              </span>
            </div>
            <p className="text-sm text-[#525866] leading-relaxed max-w-sm">
              Sovereign pre-flight document reconciliation and self-healing bureaucracy engine. 
              Eliminating over 60% of avoidable citizen rejections across India&apos;s digital governance portals.
            </p>
            <div className="inline-flex items-center space-x-2 bg-emerald-100/70 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-md text-xs font-mono font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>&quot;Fix it before you file it.&quot;</span>
            </div>
          </div>

          {/* Col 3: Product Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#162A45]">
              Product Workspaces
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#525866]">
              <li>
                <Link href="/studio" className="hover:text-[#111625] transition-colors flex items-center space-x-1.5">
                  <FileCheck2 className="w-3 h-3 text-[#B86B11]" />
                  <span>Pre-Flight Studio</span>
                </Link>
              </li>
              <li>
                <Link href="/intelligence" className="hover:text-[#111625] transition-colors flex items-center space-x-1.5">
                  <Cpu className="w-3 h-3 text-[#B86B11]" />
                  <span>Document Intelligence</span>
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[#111625] transition-colors flex items-center space-x-1.5">
                  <BookOpen className="w-3 h-3 text-[#B86B11]" />
                  <span>Rules &amp; Jurisdiction</span>
                </Link>
              </li>
              <li>
                <Link href="/automation" className="hover:text-[#111625] transition-colors flex items-center space-x-1.5">
                  <Terminal className="w-3 h-3 text-[#B86B11]" />
                  <span>Automation Lab</span>
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-[#111625] transition-colors flex items-center space-x-1.5">
                  <FileText className="w-3 h-3 text-[#B86B11]" />
                  <span>Audit &amp; Reports</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory Integrations */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#162A45]">
              Supported Portals
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#525866]">
              <li>
                <a href="http://localhost:8090/?portal=national_scholarship" target="_blank" rel="noopener noreferrer" className="hover:text-[#111625] transition-colors flex items-center justify-between">
                  <span>National Scholarship (NSP)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="http://localhost:8090/?portal=passport_seva" target="_blank" rel="noopener noreferrer" className="hover:text-[#111625] transition-colors flex items-center justify-between">
                  <span>Passport Seva 2.0</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="http://localhost:8090/?portal=e_district_income" target="_blank" rel="noopener noreferrer" className="hover:text-[#111625] transition-colors flex items-center justify-between">
                  <span>UP e-District (eSathi)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="http://localhost:8090/?portal=epfo_joint_declaration" target="_blank" rel="noopener noreferrer" className="hover:text-[#111625] transition-colors flex items-center justify-between">
                  <span>EPFO Joint Declaration</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Security & Sovereignty */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#162A45]">
              Sovereignty &amp; Privacy
            </h4>
            <div className="bg-[#FAF9F5] border border-[#DFDBD2] rounded-lg p-3 space-y-2 text-xs font-mono text-[#525866]">
              <div className="flex items-center space-x-2 text-[#162A45] font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero Cloud Leakage</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Optical parsing and biometric compression execute on-device. Citizen identity documents are never streamed to third-party commercial LLM endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#DFDBD2] text-xs text-[#525866] leading-relaxed space-y-1 font-mono">
          <p className="font-bold text-[#111625]">Statutory Advisory &amp; Transparency Notice:</p>
          <p>
            ZeroReject (PramaanFix) is an assistive pre-flight discrepancy detector, document optimizer, and statutory draft synthesizer. 
            Generated affidavits and self-declarations are provisional drafts provided for citizen review and notarization where statutory rules require physical execution. 
            ZeroReject is not an issuing authority and does not manufacture statutory authority numbers.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#DFDBD2] pt-6 flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-[#525866]">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} ZeroReject (PramaanFix). Built with</span>
            <Heart className="w-3.5 h-3.5 text-[#C93B2B] fill-[#C93B2B]" />
            <span>for Indian Digital Governance &amp; Civic Assurance.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>ISO-15919 Transliteration</span>
            <span>•</span>
            <span>OpenCV 2026 Engine</span>
            <span>•</span>
            <span>Playwright Chromium 130</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

