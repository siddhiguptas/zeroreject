'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Scale, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  FileCheck2,
  Users
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <PageHeader
        eyebrow="About ZeroReject"
        title="Fix it before you file it."
        description="Minor clerical discrepancies should never deny an Indian citizen an earned scholarship, a passport, or a livelihood benefit."
        action={
          <Link
            href="/studio"
            className="inline-flex items-center space-x-1.5 bg-[#162A45] hover:bg-[#0E1A2B] text-white text-xs font-mono font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Studio &rarr;</span>
          </Link>
        }
      />

      {/* Narrative: The Invisible Social Tax */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0A1128]">
          The Invisible Social Tax on Indian Citizens
        </h2>
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#525866] leading-relaxed space-y-3 font-sans">
          <p>
            In India&rsquo;s vast digital public infrastructure, millions of citizens interact daily with portals 
            such as UP e-District, the National Scholarship Portal, Passport Seva, and EPFO. Yet, beneath 
            modern digitized interfaces lies a harsh administrative reality: automated backend validation rules 
            are strictly unforgiving.
          </p>
          <p>
            An applicant named <strong className="text-[#111625] font-mono">Siddhi Gupta</strong> on her Aadhaar card may be recorded 
            as <strong className="text-[#111625] font-mono">SIDDHI GUPTA</strong> or <strong className="text-[#111625] font-mono">S. GUPTA</strong> on her 
            CBSE marksheet. An uploaded passport photograph may be rejected because it is 22 KB instead of 20 KB. 
            A subdistrict spelling may diverge by a single vowel from the state census gazetteer.
          </p>
          <p>
            The result? Fatal portal rejection notices weeks later, missed admissions deadlines, and exhausting 
            trips to Tehsil courthouses, CSC cyber kiosks, and notary booths. This is an invisible social tax 
            levied disproportionately on students, rural applicants, and low-income families.
          </p>
        </div>
      </div>

      {/* The 4 Principles of ZeroReject */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#0A1128]">
            Our Sovereign Civic Charter
          </h2>
          <p className="text-xs text-[#525866] mt-1 font-sans">
            Core architectural principles governing ZeroReject&apos;s pre-submission audit engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E6F53] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0A1128]">
              1. Legal Grounding Over Hallucination
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed font-sans">
              ZeroReject never fabricates circular numbers, judicial precedents, or gazette notices. 
              Every legal citation synthesized into an affidavit is retrieved from verified official gazettes 
              (Passport Manual 2020, MeitY NSP guidelines, DoPT circulars) complete with direct URLs. 
              If no verified rule applies, we state so with complete transparency.
            </p>
          </div>

          <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0A1128]">
              2. Mandatory Citizen Agency (OTP Gate)
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed font-sans">
              We reject opaque &ldquo;black-box&rdquo; automation. While our browser agent handles tedious 
              field mapping and asset resizing, it is architecturally constrained by an unskippable 
              Human-in-the-Loop OTP gate. The citizen retains ultimate legal authority and authorization 
              before any application is officially committed.
            </p>
          </div>

          <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0A1128]">
              3. Zero-Cost Sovereign AI Stack
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed font-sans">
              Public digital goods should not depend on expensive foreign proprietary API tokens. 
              ZeroReject runs on an entirely free, on-device and open stack: Tesseract OCR, OpenCV image processing, 
              ReportLab vector synthesis, and local Indic phonetics algorithms (Jaro-Winkler + Soundex).
            </p>
          </div>

          <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0A1128]">
              4. Multilingual &amp; Acoustic Inclusion
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed font-sans">
              Civic tech must speak the citizen&rsquo;s language. ZeroReject provides real-time bilingual voice 
              briefings in Hindi (हिंदी) and English, explaining complex statutory discrepancies in plain, 
              reassuring spoken words without legalistic jargon.
            </p>
          </div>
        </div>
      </div>

      {/* Track 1 Architecture Card */}
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-[#0E6F53]" />
          <h3 className="font-serif text-lg font-bold text-[#0A1128]">
            Track 1: Civic Tech &amp; Public Digital Infrastructure
          </h3>
        </div>
        <p className="text-xs text-[#525866] leading-relaxed font-sans">
          ZeroReject was architected as a production-grade pre-flight verification layer designed to integrate 
          into CSC kiosks, UMANG mobile portals, and State Service Delivery Gateways (SSDG). By shifting error 
          detection from backend rejection desks to citizen pre-submission, ZeroReject drastically lowers 
          administrative appellate overhead for revenue departments.
        </p>
        <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="bg-white border border-[#DFDBD2] px-2.5 py-1 rounded text-[#162A45]">FastAPI :8000</span>
          <span className="bg-white border border-[#DFDBD2] px-2.5 py-1 rounded text-[#162A45]">Next.js 14 App Router</span>
          <span className="bg-white border border-[#DFDBD2] px-2.5 py-1 rounded text-[#162A45]">Playwright Engine</span>
          <span className="bg-white border border-[#DFDBD2] px-2.5 py-1 rounded text-[#162A45]">OpenCV + Pillow</span>
          <span className="bg-white border border-[#DFDBD2] px-2.5 py-1 rounded text-[#162A45]">India Post LGD API</span>
          <span className="bg-white border border-[#DFDBD2] px-2.5 py-1 rounded text-[#162A45]">UIDAI Verhoeff Check</span>
        </div>
      </div>
    </div>
  );
}
