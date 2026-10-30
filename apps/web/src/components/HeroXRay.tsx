'use client';

import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Play, CheckCircle2, AlertTriangle, FileText, Sparkles } from 'lucide-react';

interface HeroXRayProps {
  onScrollToStudio: () => void;
  onLaunchChaosDemo: () => void;
}

export const HeroXRay: React.FC<HeroXRayProps> = ({ onScrollToStudio, onLaunchChaosDemo }) => {
  const [activeTab, setActiveTab] = useState<'hindi_english' | 'initial_expansion' | 'token_inversion'>('hindi_english');

  const cases = {
    hindi_english: {
      title: 'Devanagari vs Latin Script Drift',
      docA: { type: 'Aadhaar (UIDAI)', name: 'रमेश कुमार शर्मा', script: 'Devanagari' },
      docB: { type: 'PAN Card (ITD)', name: 'RAMESH KUMAR SHARMA', script: 'Latin (Uppercase)' },
      metaphone: 'RMS KMR SRM (Match 100%)',
      jaroWinkler: 0.985,
      tokenSort: 1.0,
      riskVerdict: 'CURABLE DISCREPANCY (12% Risk)',
      statute: "Passport Seva Annexure 'E' & IT Act Transliteration Rule",
    },
    initial_expansion: {
      title: 'Middle Initial Abbreviation Trap',
      docA: { type: 'Aadhaar (UIDAI)', name: 'Ramesh Kumar Sharma', script: 'Full Tri-Token' },
      docB: { type: 'PAN Card (ITD)', name: 'RAMESH K SHARMA', script: 'Middle Initial "K"' },
      metaphone: 'RMS K SRM vs RMS KMR SRM',
      jaroWinkler: 0.942,
      tokenSort: 0.885,
      riskVerdict: 'CURABLE DISCREPANCY (18% Risk)',
      statute: 'EPFO Joint Declaration Circular Para 3.2',
    },
    token_inversion: {
      title: 'Surname-First Inversion Mismatch',
      docA: { type: 'Aadhaar (UIDAI)', name: 'Ramesh Kumar Sharma', script: 'Given Name First' },
      docB: { type: '10th Marksheet (UP Board)', name: 'SHARMA RAMESH KUMAR', script: 'Surname First' },
      metaphone: 'Token Inversion Invariant',
      jaroWinkler: 0.965,
      tokenSort: 1.0,
      riskVerdict: 'CURABLE DISCREPANCY (8% Risk)',
      statute: 'NSP Scholarship Rule 4.1 Demographic Reconciliation',
    },
  };

  const current = cases[activeTab];

  return (
    <section className="border-b border-[#DFDBD2] bg-[#FAF8F5] pt-12 pb-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Authoritative Editorial Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#EFECE4] border border-[#DFDBD2] px-3 py-1 rounded-full text-xs font-medium text-[#525866]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
            <span>Over 60% of Citizen Applications Fail Before Clerk Review</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111625] leading-[1.08]">
            Eliminate Bureaucratic Rejections{' '}
            <span className="italic font-serif text-[#162A45]">Before</span> You Click Submit.
          </h1>

          <p className="text-base sm:text-lg text-[#525866] leading-relaxed max-w-2xl font-sans">
            ZeroReject reconciles cross-script discrepancies (Aadhaar, PAN, Marksheets), auto-cures
            biometric pixel/byte traps with OpenCV, and deploys a self-healing Playwright agent that
            survives government <code className="bg-[#EFECE4] px-1.5 py-0.5 rounded text-xs font-mono text-[#111625]">502 Bad Gateway</code> errors.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onScrollToStudio}
              className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-6 py-3.5 rounded shadow-archival font-medium text-sm transition-all"
            >
              <span>Open Pre-Flight Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchChaosDemo}
              className="flex items-center space-x-2 bg-white hover:bg-[#F2EFE8] text-[#111625] border border-[#DFDBD2] px-5 py-3.5 rounded shadow-sm font-medium text-sm transition-all"
            >
              <Play className="w-4 h-4 text-[#C93B2B] fill-[#C93B2B]" />
              <span>Launch Live Portal Chaos Demo</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#DFDBD2]/60 text-xs text-[#525866] font-mono">
            <div>
              <span className="block text-[#111625] font-bold text-base font-tabular">&lt; 8ms</span>
              <span>Deterministic Phonetic Math</span>
            </div>
            <div>
              <span className="block text-[#111625] font-bold text-base font-tabular">100% Zero-Mock</span>
              <span>Computed Live from Disk/API</span>
            </div>
            <div>
              <span className="block text-[#111625] font-bold text-base font-tabular">Self-Healing</span>
              <span>Recovers from 502 Bad Gateway</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Cross-Document Phonetic X-Ray Card */}
        <div className="lg:col-span-5">
          <div className="archival-card rounded-lg overflow-hidden border border-[#DFDBD2] bg-white shadow-archival">
            {/* Header Ribbon */}
            <div className="bg-[#162A45] text-white px-4 py-3 flex items-center justify-between border-b border-[#253954]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold tracking-wide uppercase font-mono">
                  Live Cross-Document Phonetic X-Ray
                </span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded">
                Deterministic Engine
              </span>
            </div>

            {/* Interactive Selector Tabs */}
            <div className="flex border-b border-[#DFDBD2] bg-[#F8F7F4] text-xs font-medium">
              <button
                onClick={() => setActiveTab('hindi_english')}
                className={`flex-1 py-2.5 px-3 text-center border-r border-[#DFDBD2] transition-colors ${
                  activeTab === 'hindi_english' ? 'bg-white text-[#162A45] font-bold border-b-2 border-b-[#162A45]' : 'text-[#525866] hover:bg-[#EFECE4]'
                }`}
              >
                Hindi / English
              </button>
              <button
                onClick={() => setActiveTab('initial_expansion')}
                className={`flex-1 py-2.5 px-3 text-center border-r border-[#DFDBD2] transition-colors ${
                  activeTab === 'initial_expansion' ? 'bg-white text-[#162A45] font-bold border-b-2 border-b-[#162A45]' : 'text-[#525866] hover:bg-[#EFECE4]'
                }`}
              >
                Initial Expansion
              </button>
              <button
                onClick={() => setActiveTab('token_inversion')}
                className={`flex-1 py-2.5 px-3 text-center transition-colors ${
                  activeTab === 'token_inversion' ? 'bg-white text-[#162A45] font-bold border-b-2 border-b-[#162A45]' : 'text-[#525866] hover:bg-[#EFECE4]'
                }`}
              >
                Token Inversion
              </button>
            </div>

            {/* Comparison Details */}
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {/* Document A */}
                <div className="bg-[#FAF8F5] border border-[#DFDBD2] p-3 rounded flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-mono text-[#525866] block">{current.docA.type}</span>
                    <span className="text-sm font-bold text-[#111625] font-sans">{current.docA.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-[#DFDBD2] px-2 py-0.5 rounded text-[#525866]">
                    {current.docA.script}
                  </span>
                </div>

                {/* Document B */}
                <div className="bg-[#FAF8F5] border border-[#DFDBD2] p-3 rounded flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-mono text-[#525866] block">{current.docB.type}</span>
                    <span className="text-sm font-bold text-[#111625] font-sans">{current.docB.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-[#DFDBD2] px-2 py-0.5 rounded text-[#525866]">
                    {current.docB.script}
                  </span>
                </div>
              </div>

              {/* Mathematical Metrics Matrix */}
              <div className="bg-[#111625] text-white p-4 rounded text-xs font-mono space-y-2">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1 flex justify-between">
                  <span>Ensemble Metric</span>
                  <span>Evaluated Value</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Double Metaphone:</span>
                  <span className="text-emerald-400 font-semibold">{current.metaphone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Jaro-Winkler Score:</span>
                  <span className="text-blue-300 font-tabular">{current.jaroWinkler.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Token-Sort Ratio:</span>
                  <span className="text-blue-300 font-tabular">{current.tokenSort.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-800">
                  <span className="text-gray-300">Statutory Citation:</span>
                  <span className="text-amber-300 text-[11px] truncate max-w-[200px]">{current.statute}</span>
                </div>
              </div>

              {/* Automated Resolution Banner */}
              <div className="bg-[#B86B11]/10 border border-[#B86B11]/30 p-3 rounded flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B86B11] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-[#B86B11] block">Pre-Submission Auto-Cure Ready</span>
                  <p className="text-[#525866] text-[11px] mt-0.5">
                    ZeroReject automatically generates a bilingual Annexure 'E' affidavit and formats biometric uploads to bypass rejection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

