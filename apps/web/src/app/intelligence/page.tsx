'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { HeroXRay } from '@/components/HeroXRay';
import { Cpu, Layers, Sparkles } from 'lucide-react';

export default function DocumentIntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <PageHeader
        eyebrow="Document Intelligence"
        title="Understand and resolve discrepancies across your documents."
        description="Explore how ZeroReject resolves Devanagari script drift, middle initials, and token-order inversions deterministically."
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

      {/* Interactive Phonetic X-Ray Sandbox */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#DFDBD2] pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#111625]">
              Live Cross-Document Phonetic X-Ray
            </h2>
            <p className="text-xs text-[#525866] mt-1 font-sans">
              Inspect simulated edge-cases across UIDAI, Income Tax Department, and CBSE formats
            </p>
          </div>
          <span className="text-[11px] font-mono bg-[#FAF9F5] border border-[#DFDBD2] text-[#162A45] px-2.5 py-1 rounded-md font-medium">
            Double Metaphone + Jaro-Winkler
          </span>
        </div>

        <HeroXRay
          onScrollToStudio={() => {}}
          onLaunchChaosDemo={() => {}}
        />
      </div>

      {/* Algorithm Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 space-y-2 shadow-xs">
          <span className="text-amber-700 font-bold text-[11px] block uppercase">Gate 1: Transliteration</span>
          <h3 className="font-serif text-base font-bold text-[#111625]">ISO-15919 Indic Script Mapping</h3>
          <p className="text-[#525866] text-[11px] leading-relaxed font-sans">
            Maps Unicode Devanagari codepoints directly to canonical Sanskrit/Hindi ITRANS Latin representation, collapsing phonetic ambiguities like &apos;दीना&apos; vs &apos;Dina&apos;.
          </p>
        </div>

        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 space-y-2 shadow-xs">
          <span className="text-blue-700 font-bold text-[11px] block uppercase">Gate 2: Double Metaphone</span>
          <h3 className="font-serif text-base font-bold text-[#111625]">Dual Phonetic Key Hashes</h3>
          <p className="text-[#525866] text-[11px] leading-relaxed font-sans">
            Generates primary and secondary 4-character phonetic keys for every token, identifying phonetic matches regardless of Indian English phonetic vowel variations.
          </p>
        </div>

        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 space-y-2 shadow-xs">
          <span className="text-emerald-700 font-bold text-[11px] block uppercase">Gate 3: Token Inversion</span>
          <h3 className="font-serif text-base font-bold text-[#111625]">1.000 Token-Sort Ratio</h3>
          <p className="text-[#525866] text-[11px] leading-relaxed font-sans">
            Alphabetically sorts tokens before running Levenshtein comparisons, preventing rejection when educational boards print Surname-first (&apos;Sharma Ramesh Kumar&apos;).
          </p>
        </div>
      </div>
    </div>
  );
}
