'use client';

import React, { useState } from 'react';
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
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Layers,
  FileBadge2,
  RefreshCw,
  Compass,
  FileEdit,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { PromotionalVideoPlayer } from '@/components/PromotionalVideoPlayer';

export default function LandingPage() {
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  return (
    <div className="space-y-20 sm:space-y-32 pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
        <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle Ambient Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#EAE5D9]/50 via-transparent to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#FAF9F5] border border-[#DFDBD2] px-3.5 py-1.5 rounded-full text-xs font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-bold text-[#162A45]">National Civic Assurance Protocol</span>
              <span className="text-[#DFDBD2]">•</span>
              <span className="text-[#525866]">Fix it before you file it</span>
            </div>

            {/* Editorial Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#111625] leading-[1.08]">
              Every Application Deserves a <span className="italic font-normal text-[#162A45]">Fair Chance.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-[#525866] max-w-2xl mx-auto font-sans leading-relaxed">
              Detect document discrepancies, understand rejection risks and resolve avoidable errors before submitting your application.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/studio"
                className="inline-flex items-center space-x-2.5 bg-[#162A45] hover:bg-[#0E1A2B] text-white text-sm font-mono font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start Document Check</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center space-x-2 bg-white hover:bg-[#F6F4EE] border border-[#DFDBD2] text-[#111625] text-sm font-mono font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-xs"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#525866]">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% On-Device Parsing</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Cloud Identity Storage</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>IT Act 2000 &amp; UIDAI Verhoeff Compliant</span>
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CINEMATIC PROMOTIONAL VIDEO INTEGRATION */}
          {/* ========================================================================= */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="relative">
              {/* Elegant ambient glow behind video container */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/40 via-emerald-200/30 to-blue-200/40 rounded-3xl blur-xl opacity-70 -z-10" />

              <PromotionalVideoPlayer />

              {/* Video Caption & Storytelling Narrative */}
              <div className="mt-4 px-2 flex flex-wrap items-center justify-between text-xs font-mono text-[#525866] gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#111625]">Citizen Story:</span>
                  <span>From document heartbreak to pre-flight statutory clearance in under 3 minutes.</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span>Watch with sound for full Hindi/English narration</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. THE PROBLEM SECTION ("The Silent Rejection Trap") */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DFDBD2]">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-[#B86B11] font-bold">
              The Administrative Barrier
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#111625]">
              Over 60% of Citizen Applications Are Rejected for Avoidable Technicalities.
            </h2>
            <p className="text-base text-[#525866] leading-relaxed font-sans">
              Indian digital governance portals automatically reject citizens for minor typographic variations between Aadhaar, 
              PAN, and Marksheets — trapping families in months of bureaucratic delays.
            </p>
          </div>

          {/* 4 Critical Pitfall Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pitfall 1 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Script Transliteration Drift
              </h3>
              <p className="text-xs font-mono text-[#525866] leading-relaxed">
                Hindi Devanagari names like &apos;दीना नाथ&apos; convert to &apos;Dina Nath&apos;, &apos;Deena Nath&apos;, or &apos;D.N.&apos; across different official databases, failing rigid string equality checks.
              </p>
              <span className="inline-block text-[10px] font-mono font-bold text-[#B86B11] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Fatal in EPFO &amp; e-District
              </span>
            </div>

            {/* Pitfall 2 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Initial Abbreviation Expansion
              </h3>
              <p className="text-xs font-mono text-[#525866] leading-relaxed">
                Aadhaar lists &apos;Ramesh Kumar Sharma&apos; while PAN records &apos;RAMESH K SHARMA&apos;. Portal bots flag this as two distinct human beings rather than initials expansion.
              </p>
              <span className="inline-block text-[10px] font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Annexure &apos;E&apos; Curable
              </span>
            </div>

            {/* Pitfall 3 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-800">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Biometric Byte &amp; Pixel Ceilings
              </h3>
              <p className="text-xs font-mono text-[#525866] leading-relaxed">
                Portals silently reject passport photographs exceeding 50 KB or signatures above 20 KB with opaque error screens, blocking submission without actionable feedback.
              </p>
              <span className="inline-block text-[10px] font-mono font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Rule 18-A Gate Trap
              </span>
            </div>

            {/* Pitfall 4 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Jurisdiction &amp; PIN Ambiguity
              </h3>
              <p className="text-xs font-mono text-[#525866] leading-relaxed">
                Postal PIN codes that cross Tehsil or Subdistrict boundaries result in submission to the wrong Lekhpal jurisdiction, stalling files indefinitely.
              </p>
              <span className="inline-block text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                India Post LGD Resolved
              </span>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. HOW ZERO REJECT WORKS (4-Step Visual Walkthrough) */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DFDBD2]">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-[#162A45] font-bold">
              The Pre-Flight Protocol
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#111625]">
              How ZeroReject Guarantees Flawless Submission.
            </h2>
            <p className="text-base text-[#525866] leading-relaxed font-sans">
              A four-tier sovereign workflow that intercepts discrepancies, cures biometrics, synthesizes verified legal declarations, and navigates government portals autonomously.
            </p>
          </div>

          {/* Interactive 4-Step Walkthrough Tabs */}
          <div className="bg-white border border-[#DFDBD2] rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Step Switcher Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-[#DFDBD2] pb-6 mb-8">
              {[
                { num: 1, title: 'Upload & Parse', subtitle: 'Multimodal OCR' },
                { num: 2, title: '4-Gate Audit', subtitle: 'Indic Phonetics' },
                { num: 3, title: 'Auto-Cure & Draft', subtitle: 'Biometrics & PDF' },
                { num: 4, title: 'Authorize Filing', subtitle: 'Playwright Agent' },
              ].map((step) => {
                const isActive = activeStepTab === step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setActiveStepTab(step.num)}
                    className={`text-left p-3.5 rounded-xl transition-all border ${
                      isActive
                        ? 'bg-[#162A45] text-white border-[#162A45] shadow-xs'
                        : 'bg-[#FAF9F5] text-[#111625] border-[#DFDBD2] hover:bg-[#F2EFE8]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isActive ? 'bg-amber-300 text-[#111625]' : 'bg-[#DFDBD2] text-[#525866]'
                      }`}>
                        {step.num}
                      </span>
                      <span className="font-serif text-sm font-bold">{step.title}</span>
                    </div>
                    <span className={`text-[10px] font-mono block mt-1 ${isActive ? 'text-slate-300' : 'text-[#525866]'}`}>
                      {step.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step Content Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {activeStepTab === 1 && (
                <>
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-mono text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      Phase 1: Local Ingestion &amp; Checksums
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111625]">
                      On-Device Optical Extraction with Zero Cloud Leakage.
                    </h3>
                    <p className="text-sm text-[#525866] leading-relaxed">
                      Upload your Aadhaar (front and back), PAN card, or 10th Class Marksheet. ZeroReject performs optical character extraction and Verhoeff D5 cryptographic checksum verification 100% on-device, extracting names, parents&apos; names, DOB, address, and PIN codes.
                    </p>
                    <ul className="text-xs font-mono text-[#525866] space-y-1.5 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Verhoeff D5 Aadhaar Checksum Validation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>PAN 5th Character Entity Check (Individual &apos;P&apos;)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Aadhaar Back District &amp; Taluka Parser</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-[#0F172A] rounded-xl p-5 text-slate-300 font-mono text-xs space-y-3 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-[10px] text-amber-400">
                      <span>OPTICAL_EXTRACTION_LOG</span>
                      <span>SHA-256 VERIFIED</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="text-emerald-400">✓ Aadhaar Front: SIDDHI GUPTA (DOB: 28/09/2006)</div>
                      <div className="text-emerald-400">✓ Aadhaar Back: C/O Raj Kumar Gupta, Rudrapur, Deoria (274204)</div>
                      <div className="text-emerald-400">✓ 10th Marksheet: SIDDHI GUPTA | Father: RAJ KUMAR GUPTA</div>
                      <div className="text-slate-400 pt-2 border-t border-slate-800 text-[10px]">
                        Verhoeff Checksum: VALID • Confidence: 0.98 • OCR Engine: Tesseract + Pillow
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeStepTab === 2 && (
                <>
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Phase 2: Virtual Lekhpal Pre-Flight Audit
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111625]">
                      Deterministic Indic Phonetics &amp; Statutory RAG.
                    </h3>
                    <p className="text-sm text-[#525866] leading-relaxed">
                      Cross-references primary and secondary identity documents using Double Metaphone, Token-Sort Levenshtein, and Jaro-Winkler distance. Automatically retrieves official circulars (Annexure &apos;E&apos;, EPFO Para 3.2) to evaluate whether variations are legally curable.
                    </p>
                    <ul className="text-xs font-mono text-[#525866] space-y-1.5 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>ISO-15919 Devanagari Transliteration Equivalence</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Initial Expansion &amp; Order Inversion Invariance</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Live India Post LGD Tehsil Jurisdiction Query</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-[#0F172A] rounded-xl p-5 text-slate-300 font-mono text-xs space-y-3 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-[10px] text-emerald-400">
                      <span>4_GATE_RECONCILIATION_MATRIX</span>
                      <span>RISK SCORE: 0%</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gate 1 (Phonetic Match):</span>
                        <span className="text-emerald-400 font-bold">100% (EXACT METAPHONE)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gate 2 (Verhoeff &amp; Checksum):</span>
                        <span className="text-emerald-400 font-bold">PASS (D5 VALID)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gate 3 (Statutory Citations):</span>
                        <span className="text-blue-300 font-bold">Passport Seva Rule 4(b)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gate 4 (LGD Jurisdiction):</span>
                        <span className="text-emerald-400 font-bold">Rudrapur / Deoria (274204)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeStepTab === 3 && (
                <>
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      Phase 3: OpenCV Auto-Cure &amp; Affidavit Studio
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111625]">
                      Exact Portal Specifications &amp; Reviewable Declarations.
                    </h3>
                    <p className="text-sm text-[#525866] leading-relaxed">
                      Automatically crops the applicant&apos;s face from Aadhaar or Marksheets to exact 200x230 px and 12–48 KB. Crops signatures to 140x60 px and strictly under 20 KB. Generates a formal, bilingual self-declaration PDF with real backend verification QR codes and blanks for physical notarization.
                    </p>
                    <ul className="text-xs font-mono text-[#525866] space-y-1.5 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Lanczos Resampling &amp; Binary-Search Quantization</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Zero Fabricated Laws — Pure Official Government Circulars</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Interactive Declaration Draft Studio (Hindi &amp; English)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-[#FAF9F5] border border-[#DFDBD2] rounded-xl p-5 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-[10px] text-[#525866] border-b border-[#DFDBD2] pb-2 font-bold">
                      <span>CURED_BIOMETRIC_PACKET</span>
                      <span className="text-emerald-700">100% SPEC COMPLIANT</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="bg-white p-3 rounded border border-[#DFDBD2]">
                        <span className="text-[10px] text-[#525866] block">Portrait Photo</span>
                        <strong className="text-[#111625]">200x230 px</strong>
                        <span className="text-[10px] text-emerald-700 block">12.91 KB (Compliant)</span>
                      </div>
                      <div className="bg-white p-3 rounded border border-[#DFDBD2]">
                        <span className="text-[10px] text-[#525866] block">Signature Contour</span>
                        <strong className="text-[#111625]">140x60 px</strong>
                        <span className="text-[10px] text-emerald-700 block">7.62 KB (Compliant)</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-[#DFDBD2] text-[11px] flex items-center justify-between">
                      <span>Bilingual Annexure &apos;E&apos; Affidavit PDF</span>
                      <span className="font-bold text-[#162A45]">A4 Stamped (QR Active)</span>
                    </div>
                  </div>
                </>
              )}

              {activeStepTab === 4 && (
                <>
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                      Phase 4: Autonomous Playwright Filing &amp; Citizen Gate
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111625]">
                      Self-Healing Browser Navigation with Mandatory Human Consent.
                    </h3>
                    <p className="text-sm text-[#525866] leading-relaxed">
                      A Playwright Chromium agent navigates official government forms, populates canonical demographic fields, attaches cured biometrics, and heals automatically from HTTP 502 gateway timeouts. Strictly pauses at the UIDAI Citizen Consent Gate for OTP verification.
                    </p>
                    <ul className="text-xs font-mono text-[#525866] space-y-1.5 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>LangGraph Checkpointed State Machine</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Exponential Backoff 502 Chaos Interceptor</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Human-in-the-Loop OTP Consent Gate (IT Act Sec 43A)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-[#0F172A] rounded-xl p-5 text-slate-300 font-mono text-xs space-y-3 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-[10px] text-amber-400">
                      <span>PLAYWRIGHT_LIVE_STREAM</span>
                      <span>HALTED AT OTP GATE</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>&gt; Mapping accessibility DOM tree... (Step 1 Complete)</div>
                      <div>&gt; Populated Tehsil Rudrapur, Deoria (274204)... (Step 2 Complete)</div>
                      <div>&gt; Uploaded portrait (12.9KB), signature (7.6KB), PDF... (Step 3 Complete)</div>
                      <div className="p-2 rounded bg-amber-950/80 border border-amber-600 text-amber-200 mt-2">
                        🔒 HALTED AT CITIZEN CONSENT GATE: Awaiting citizen OTP confirmation before final digital submission.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. CORE CAPABILITIES (Interactive Grid) */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DFDBD2]">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-[#162A45] font-bold">
              Engineering Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#111625]">
              Six Pillars of Sovereign Document Assurance.
            </h2>
            <p className="text-base text-[#525866] leading-relaxed font-sans">
              Zero third-party commercial APIs. 100% deterministic, open-source stack designed for national resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EFECE4] flex items-center justify-center text-[#162A45]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Multimodal Optical Extraction
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed font-sans">
                Extracts multilingual civic entities (Aadhaar, PAN, Marksheets) using local Tesseract OCR with adaptive ROI coordinates and Verhoeff D5 cryptographic checksums.
              </p>
              <Link href="/intelligence" className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#162A45] hover:underline pt-2">
                <span>Explore Intelligence Lab &rarr;</span>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EFECE4] flex items-center justify-center text-[#162A45]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Indic Phonetic Graph Engine
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed font-sans">
                Resolves Devanagari script drift via ISO-15919 transliteration, handles middle initial expansions (&apos;K.&apos; to &apos;Kumar&apos;), and computes 1.000 Token-Sort Invariance.
              </p>
              <Link href="/intelligence" className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#162A45] hover:underline pt-2">
                <span>Test Phonetic Matrix &rarr;</span>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EFECE4] flex items-center justify-center text-[#162A45]">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Live Jurisdiction Verification
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed font-sans">
                Queries India Post Local Government Directory (LGD) in real time to map PIN codes directly to administrative Tehsils and District magistrates, preventing cross-jurisdiction drops.
              </p>
              <Link href="/rules" className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#162A45] hover:underline pt-2">
                <span>Lookup Jurisdiction &rarr;</span>
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EFECE4] flex items-center justify-center text-[#162A45]">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Deterministic Biometric Auto-Cure
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed font-sans">
                OpenCV Lanczos aspect-ratio resizer and 7-iteration binary-search JPEG quantization that guarantees portrait and signature assets hit exact pixel and byte ceilings without visual artifacts.
              </p>
              <Link href="/studio" className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#162A45] hover:underline pt-2">
                <span>Test Asset Curing &rarr;</span>
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EFECE4] flex items-center justify-center text-[#162A45]">
                <FileBadge2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Bilingual Statutory Affidavit Studio
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed font-sans">
                Generates formal A4 One-and-the-Same Person declarations in Hindi and English. Grounded strictly in official circulars with real verification QR codes and interactive draft editing.
              </p>
              <Link href="/studio" className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#162A45] hover:underline pt-2">
                <span>Preview Draft Studio &rarr;</span>
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 space-y-3 shadow-xs hover:border-[#162A45] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EFECE4] flex items-center justify-center text-[#162A45]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111625]">
                Autonomous Browser Agent
              </h3>
              <p className="text-xs text-[#525866] leading-relaxed font-sans">
                Playwright agent with LangGraph checkpoint persistence that navigates state portals, automatically recovers from HTTP 502 gateway timeouts, and pauses for citizen consent.
              </p>
              <Link href="/automation" className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#162A45] hover:underline pt-2">
                <span>Run Automation Lab &rarr;</span>
              </Link>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. SOVEREIGNTY, TRUST & PRIVACY */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DFDBD2]">
          <div className="bg-[#162A45] text-white rounded-3xl p-8 sm:p-14 shadow-xl">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Cloud Leakage Guarantee</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Designed for Sovereign Trust, Citizen Privacy, and National Security.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                Traditional AI platforms stream sensitive citizen identity documents to third-party proprietary cloud servers in foreign jurisdictions. ZeroReject runs 100% locally. Your Aadhaar number, biometric photographs, and personal details never leave your hardware.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-700 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-amber-300 font-bold block text-sm">Mandatory Consent</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Automated browser agents strictly halt at the Citizen Authorization Gate. No real filing occurs without explicit OTP input.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-300 font-bold block text-sm">Cryptographic Audit</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Every optical parsing and biometric compression produces an immutable SHA-256 hash recorded in the session audit trail.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-amber-300 font-bold block text-sm">$0 Commercial APIs</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Operates with zero recurring cloud tokens or credit card requirements, ensuring zero operational cost barriers for public centers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 6. FINAL CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#B86B11] font-bold">
            Zero Discrepancies. Zero Rejection.
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#111625]">
            Fix It Before You File It.
          </h2>
          <p className="text-base sm:text-lg text-[#525866] max-w-xl mx-auto font-sans leading-relaxed">
            Ensure your scholarship, passport, or domicile certificate gets approved on the very first attempt.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/studio"
              className="inline-flex items-center space-x-2.5 bg-[#162A45] hover:bg-[#0E1A2B] text-white text-sm font-mono font-bold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch Pre-Flight Studio Now</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center space-x-2 bg-white hover:bg-[#F6F4EE] border border-[#DFDBD2] text-[#111625] text-sm font-mono font-semibold px-6 py-4 rounded-xl transition-colors shadow-xs"
            >
              <span>Read Sovereign Philosophy</span>
            </Link>
          </div>
        </section>
      </div>
    );
}
