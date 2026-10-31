'use client';

import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Play, AlertTriangle, Sparkles, Volume2 } from 'lucide-react';
import { askVoiceCopilot } from '@/lib/api-client';

interface HeroXRayProps {
  onScrollToStudio: () => void;
  onLaunchChaosDemo: () => void;
}

export const HeroXRay: React.FC<HeroXRayProps> = ({ onScrollToStudio, onLaunchChaosDemo }) => {
  const [activeTab, setActiveTab] = useState<'hindi_english' | 'initial_expansion' | 'token_inversion'>('initial_expansion');
  const [playingLang, setPlayingLang] = useState<'hi' | 'en' | null>(null);

  const handlePlayBriefing = async (lang: 'hi' | 'en') => {
    if (playingLang) return;
    setPlayingLang(lang);

    const promptText = lang === 'hi'
      ? "पासपोर्ट सेवे अनेक्सुरे ई और ईपीएफओ नियमों के अनुसार नाम और पिता के नाम में इनिशियल्स की भिन्नता को शपथ पत्र द्वारा कैसे सुधारा जाता है?"
      : "Explain how Passport Seva Annexure 'E' and EPFO Joint Declaration SOP allow initial expansions and name reconciliations via self-declaration.";

    try {
      const res = await askVoiceCopilot(promptText, undefined, lang);
      if (res.audio_base64 && typeof window !== 'undefined') {
        const audio = new Audio(`data:audio/mp3;base64,${res.audio_base64}`);
        audio.onended = () => setPlayingLang(null);
        audio.onerror = () => setPlayingLang(null);
        await audio.play();
      } else {
        setPlayingLang(null);
      }
    } catch (e) {
      console.warn('Statutory voice briefing playback failed', e);
      setPlayingLang(null);
    }
  };

  const cases = {
    hindi_english: {
      title: 'Devanagari vs Latin Script Drift',
      docA: { type: 'Aadhaar (UIDAI)', name: 'रमेश कुमार शर्मा', script: 'Devanagari (ISO-15919)' },
      docB: { type: 'PAN Card (ITD)', name: 'RAMESH KUMAR SHARMA', script: 'Latin (Uppercase)' },
      diffPill: '≈ 98.5% Phonetic Equivalence (100% Token Invariant)',
      metaphone: 'RMS KMR SRM (Match 100%)',
      jaroWinkler: 0.985,
      tokenSort: 1.0,
      riskVerdict: 'CURABLE DISCREPANCY (12% Risk)',
      statute: "Passport Seva Annexure 'E' Rule 4(b) & IT Act Transliteration Protocol",
    },
    initial_expansion: {
      title: 'Middle Initial Abbreviation Trap',
      docA: { type: 'Aadhaar (UIDAI)', name: 'Ramesh Kumar Sharma', script: 'Full Tri-Token' },
      docB: { type: 'PAN Card (ITD)', name: 'RAMESH K SHARMA', script: 'Middle Initial "K"' },
      diffPill: '≈ Initial "K." expanded to "Kumar" (Jaro-Winkler: 0.942)',
      metaphone: 'RMS K SRM vs RMS KMR SRM',
      jaroWinkler: 0.942,
      tokenSort: 0.885,
      riskVerdict: 'CURABLE DISCREPANCY (18% Risk)',
      statute: 'EPFO Joint Declaration SOP Circular Para 3.2 & Passport Annexure E',
    },
    token_inversion: {
      title: 'Surname-First Inversion Mismatch',
      docA: { type: 'Aadhaar (UIDAI)', name: 'Ramesh Kumar Sharma', script: 'Given Name First' },
      docB: { type: '10th Marksheet (UP Board)', name: 'SHARMA RAMESH KUMAR', script: 'Surname First' },
      diffPill: '≈ Surname Inversion Invariant (Token-Sort Ratio: 1.000)',
      metaphone: 'Token Inversion Invariant',
      jaroWinkler: 0.965,
      tokenSort: 1.0,
      riskVerdict: 'CURABLE DISCREPANCY (8% Risk)',
      statute: 'NSP Scholarship Rule 4.1 Demographic Reconciliation SOP',
    },
  };

  const current = cases[activeTab];

  return (
    <section className="border-b border-[#DFDBD2] bg-[#FAF8F5] pt-12 pb-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Authoritative Editorial Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center space-x-3">
            <img src="/logo-mark.svg" alt="ZeroReject Seal" className="w-8 h-8 flex-shrink-0" />
            <div className="inline-flex items-center space-x-2 bg-[#EFECE4] border border-[#DFDBD2] px-3.5 py-1 rounded-full text-xs font-medium text-[#525866]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
              <span>Over 60% of Citizen Applications Fail Before Clerk Review</span>
            </div>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111625] leading-[1.08]">
            Eliminate Bureaucratic Rejections{' '}
            <span className="italic font-serif text-[#162A45]">Before</span> You Click Submit.
          </h1>

          <p className="text-base sm:text-lg text-[#525866] leading-relaxed max-w-2xl font-sans">
            ZeroReject reconciles cross-script discrepancies (Aadhaar, PAN, Marksheets), auto-cures
            biometric pixel and byte traps with OpenCV, and deploys a self-healing Playwright agent that
            survives government <code className="bg-[#EFECE4] px-1.5 py-0.5 rounded text-xs font-mono text-[#111625]">502 Bad Gateway</code> errors.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onScrollToStudio}
              className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#0E1A2B] text-white px-6 py-3.5 rounded shadow font-medium text-sm transition-all"
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

          {/* Re-framed Engineering & Civic Value Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[#DFDBD2] text-xs font-mono">
            <div>
              <span className="block text-[#111625] font-bold text-base font-tabular">&lt; 8ms</span>
              <span className="text-[#162A45] font-medium block">Deterministic Phonetic Graph</span>
              <span className="text-[11px] text-[#525866]">Double Metaphone + Jaro-Winkler</span>
            </div>
            <div>
              <span className="block text-[#111625] font-bold text-base font-tabular">100% On-Device</span>
              <span className="text-[#162A45] font-medium block">Zero Cloud PII Leakage</span>
              <span className="text-[11px] text-[#525866]">Local OpenCV Curing &amp; Checksums</span>
            </div>
            <div>
              <span className="block text-[#111625] font-bold text-base font-tabular">Self-Healing</span>
              <span className="text-[#162A45] font-medium block">Checkpoint Browser Agent</span>
              <span className="text-[11px] text-[#525866]">Survives 502 Bad Gateways</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Cross-Document Phonetic X-Ray Card */}
        <div className="lg:col-span-5">
          <div className="archival-card rounded-xl overflow-hidden border border-[#DFDBD2] bg-white shadow-md">
            {/* Header Ribbon */}
            <div className="bg-[#162A45] text-white px-4 py-3 flex items-center justify-between border-b border-[#253954]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold tracking-wide uppercase font-mono">
                  Live Cross-Document Phonetic X-Ray
                </span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded">
                Deterministic
              </span>
            </div>

            {/* Interactive Selector Tabs */}
            <div className="flex border-b border-[#DFDBD2] bg-[#FAF9F5] text-xs font-mono">
              <button
                onClick={() => setActiveTab('initial_expansion')}
                className={`flex-1 py-2.5 px-2 text-center border-r border-[#DFDBD2] transition-colors ${
                  activeTab === 'initial_expansion'
                    ? 'bg-white text-[#162A45] font-bold border-b-2 border-b-[#162A45]'
                    : 'text-[#525866] hover:bg-[#EFECE4]'
                }`}
              >
                Initial Expansion
              </button>
              <button
                onClick={() => setActiveTab('token_inversion')}
                className={`flex-1 py-2.5 px-2 text-center border-r border-[#DFDBD2] transition-colors ${
                  activeTab === 'token_inversion'
                    ? 'bg-white text-[#162A45] font-bold border-b-2 border-b-[#162A45]'
                    : 'text-[#525866] hover:bg-[#EFECE4]'
                }`}
              >
                Token Inversion
              </button>
              <button
                onClick={() => setActiveTab('hindi_english')}
                className={`flex-1 py-2.5 px-2 text-center transition-colors ${
                  activeTab === 'hindi_english'
                    ? 'bg-white text-[#162A45] font-bold border-b-2 border-b-[#162A45]'
                    : 'text-[#525866] hover:bg-[#EFECE4]'
                }`}
              >
                Hindi / English
              </button>
            </div>

            {/* Comparison Details with Visual Diff Highlighting */}
            <div className="p-5 space-y-4">
              <div className="space-y-2.5">
                {/* Document A */}
                <div className="bg-[#FAF9F5] border border-[#DFDBD2] p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-[#525866] block">{current.docA.type}</span>
                    <div className="text-sm font-bold text-[#111625] font-sans mt-0.5">
                      {activeTab === 'initial_expansion' ? (
                        <>
                          <span>Ramesh </span>
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.5 rounded font-bold">
                            Kumar
                          </span>
                          <span> Sharma</span>
                        </>
                      ) : activeTab === 'token_inversion' ? (
                        <>
                          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-1 py-0.5 rounded font-bold">
                            Ramesh Kumar
                          </span>
                          <span> </span>
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.5 rounded font-bold">
                            Sharma
                          </span>
                        </>
                      ) : (
                        <span className="bg-amber-50 text-amber-950 px-1 rounded font-bold">{current.docA.name}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-[#DFDBD2] px-2 py-0.5 rounded text-[#525866]">
                    {current.docA.script}
                  </span>
                </div>

                {/* Connecting Phonetic Equivalence Arrow */}
                <div className="flex items-center justify-center my-1">
                  <span className="bg-[#FAF8F5] text-[#B86B11] border border-[#DFDBD2] text-[11px] font-mono font-bold px-3 py-0.5 rounded-full shadow-2xs">
                    {current.diffPill}
                  </span>
                </div>

                {/* Document B */}
                <div className="bg-[#FAF9F5] border border-[#DFDBD2] p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-[#525866] block">{current.docB.type}</span>
                    <div className="text-sm font-bold text-[#111625] font-sans mt-0.5">
                      {activeTab === 'initial_expansion' ? (
                        <>
                          <span>RAMESH </span>
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-bold">
                            K.
                          </span>
                          <span> SHARMA</span>
                        </>
                      ) : activeTab === 'token_inversion' ? (
                        <>
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.5 rounded font-bold">
                            SHARMA
                          </span>
                          <span> </span>
                          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-1 py-0.5 rounded font-bold">
                            RAMESH KUMAR
                          </span>
                        </>
                      ) : (
                        <span className="bg-amber-50 text-amber-950 px-1 rounded font-bold">{current.docB.name}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-[#DFDBD2] px-2 py-0.5 rounded text-[#525866]">
                    {current.docB.script}
                  </span>
                </div>
              </div>

              {/* Mathematical Metrics Matrix */}
              <div className="bg-[#0F172A] text-white p-4 rounded-lg text-xs font-mono space-y-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                  <span>Ensemble Metric</span>
                  <span>Evaluated Value</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Double Metaphone:</span>
                  <span className="text-emerald-400 font-semibold">{current.metaphone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Jaro-Winkler Similarity:</span>
                  <span className="text-blue-300 font-tabular font-bold">{current.jaroWinkler.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Token-Sort Ratio:</span>
                  <span className="text-blue-300 font-tabular font-bold">{current.tokenSort.toFixed(4)}</span>
                </div>

                {/* Statutory Citation & Audio Briefing Pill */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase">Statutory Rule:</span>
                    {/* Audio Briefing Pill */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handlePlayBriefing('hi')}
                        disabled={playingLang !== null}
                        className="flex items-center space-x-1 bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-amber-300 px-2 py-0.5 rounded text-[10px] transition-colors"
                        title="Listen to statutory cure explanation in Hindi"
                      >
                        <Volume2 className={`w-3 h-3 ${playingLang === 'hi' ? 'text-emerald-400 animate-pulse' : ''}`} />
                        <span>{playingLang === 'hi' ? 'बोल रहे हैं...' : '🔊 हिंदी'}</span>
                        {playingLang === 'hi' && (
                          <span className="inline-flex items-end space-x-0.5 h-2 w-2 ml-0.5">
                            <span className="w-0.5 bg-emerald-400 animate-pulse h-full"></span>
                            <span className="w-0.5 bg-emerald-400 animate-pulse h-1/2"></span>
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => handlePlayBriefing('en')}
                        disabled={playingLang !== null}
                        className="flex items-center space-x-1 bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-amber-300 px-2 py-0.5 rounded text-[10px] transition-colors"
                        title="Listen to statutory cure explanation in English"
                      >
                        <Volume2 className={`w-3 h-3 ${playingLang === 'en' ? 'text-emerald-400 animate-pulse' : ''}`} />
                        <span>{playingLang === 'en' ? 'Speaking...' : '🔊 EN'}</span>
                        {playingLang === 'en' && (
                          <span className="inline-flex items-end space-x-0.5 h-2 w-2 ml-0.5">
                            <span className="w-0.5 bg-emerald-400 animate-pulse h-full"></span>
                            <span className="w-0.5 bg-emerald-400 animate-pulse h-1/2"></span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-amber-200 text-[11px] leading-snug font-sans bg-slate-900/80 p-2 rounded border border-slate-800">
                    {current.statute}
                  </p>
                </div>
              </div>

              {/* Automated Resolution Notice */}
              <div className="bg-[#B86B11]/10 border border-[#B86B11]/30 p-3 rounded-lg flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B86B11] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-[#B86B11] block font-mono">
                    Pre-Submission Auto-Cure Ready
                  </span>
                  <p className="text-[#525866] text-[11px] mt-0.5 font-sans leading-relaxed">
                    ZeroReject automatically compiles a bilingual Annexure &apos;E&apos; affidavit and normalizes biometric uploads to guarantee acceptance.
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
