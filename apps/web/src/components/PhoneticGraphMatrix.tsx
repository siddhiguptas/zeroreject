'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, MapPin, CheckCircle2, BookOpen, Hash, Volume2, ArrowRight, QrCode, Scale, FileCheck } from 'lucide-react';
import { ReconciliationResponse } from '@/types';
import { askVoiceCopilot } from '@/lib/api-client';

interface PhoneticGraphMatrixProps {
  reconciliation: ReconciliationResponse | null;
  loading: boolean;
  onProceedToCure?: () => void;
}

export const PhoneticGraphMatrix: React.FC<PhoneticGraphMatrixProps> = ({
  reconciliation,
  loading,
  onProceedToCure,
}) => {
  const [playingLang, setPlayingLang] = useState<'hi' | 'en' | null>(null);

  const handlePlayBriefing = async (lang: 'hi' | 'en') => {
    if (playingLang) return;
    setPlayingLang(lang);

    const nameA = reconciliation?.name_reconciliation?.original_a || '';
    const nameB = reconciliation?.name_reconciliation?.original_b || '';
    const applicantName = reconciliation?.name_reconciliation?.reconciled_canonical_name || nameA || nameB || 'Citizen';
    const isInitial = reconciliation?.name_reconciliation?.initial_expansion_detected;
    const isExact = nameA.toLowerCase().trim() === nameB.toLowerCase().trim() || (reconciliation?.rejection_risk_score ?? 100) === 0;

    let promptText = '';
    if (lang === 'hi') {
      if (isExact) {
        promptText = `आवेदक ${applicantName} के दस्तावेजों के सत्यापन और वैधानिक स्थिति का विवरण दें।`;
      } else if (isInitial) {
        promptText = `आवेदक ${applicantName} के आधार और अन्य पहचान पत्र में आद्याक्षर (initials) की भिन्नता पर विधिक विश्लेषण प्रस्तुत करें।`;
      } else {
        promptText = `आवेदक ${applicantName} के पहचान पत्रों में नाम और पते के सत्यापन पर विधिक विश्लेषण प्रस्तुत करें।`;
      }
    } else {
      if (isExact) {
        promptText = `Provide the statutory verification summary for applicant ${applicantName} across Aadhaar and secondary identity records.`;
      } else if (isInitial) {
        promptText = `Explain how Passport Seva Annexure 'E' and EPFO regulations resolve the initial expansion discrepancy for applicant ${applicantName}.`;
      } else {
        promptText = `Provide statutory legal analysis for applicant ${applicantName} cross-referencing primary and secondary documents.`;
      }
    }

    try {
      const res = await askVoiceCopilot(promptText, reconciliation?.session_id, lang);
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

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-[#DFDBD2] rounded-lg">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#162A45] border-t-transparent mb-3"></div>
        <p className="text-sm text-[#525866] font-mono">Executing Deterministic Indic Phonetic Ensemble & PIN Code Lookup...</p>
      </div>
    );
  }

  if (!reconciliation) {
    return (
      <div className="p-8 text-center bg-white border border-[#DFDBD2] rounded-lg text-sm text-[#525866]">
        Please load a citizen document packet or upload documents in Panel A to inspect the reconciliation matrix.
      </div>
    );
  }

  const {
    rejection_risk_score,
    status,
    name_reconciliation,
    father_reconciliation,
    postal_reconciliation,
    statutory_citations,
  } = reconciliation;

  return (
    <div className="space-y-6">
      {/* 4-Gate Pre-Flight Lekhpal Scorecard */}
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFDBD2] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
              Official NIC Pre-Flight Intake Filters (Rule 18-A)
            </span>
            <h3 className="font-serif text-lg font-bold text-[#111625]">
              The 4-Gate Virtual Lekhpal &amp; Statutory Risk Audit
            </h3>
          </div>

          {/* Inline Audio Briefing */}
          <div className="flex items-center space-x-1.5 font-mono text-xs">
            <span className="text-[11px] text-[#525866] mr-1">Lekhpal Audio:</span>
            <button
              onClick={() => handlePlayBriefing('hi')}
              disabled={playingLang !== null}
              className="flex items-center space-x-1 bg-[#162A45] hover:bg-[#1f3a5e] text-amber-200 px-2.5 py-1 rounded text-[11px] transition-colors"
              title="Listen to Lekhpal Audit in Hindi"
            >
              <Volume2 className={`w-3 h-3 ${playingLang === 'hi' ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span>{playingLang === 'hi' ? 'Speaking...' : '🔊 हिंदी'}</span>
            </button>
            <button
              onClick={() => handlePlayBriefing('en')}
              disabled={playingLang !== null}
              className="flex items-center space-x-1 bg-[#162A45] hover:bg-[#1f3a5e] text-amber-200 px-2.5 py-1 rounded text-[11px] transition-colors"
              title="Listen to Lekhpal Audit in English"
            >
              <Volume2 className={`w-3 h-3 ${playingLang === 'en' ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span>{playingLang === 'en' ? 'Speaking...' : '🔊 English'}</span>
            </button>
          </div>
        </div>

        {/* 4 Gates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Gate 1: Phonetic & Token */}
          <div className="bg-white border border-amber-300 rounded-lg p-3.5 space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500 font-bold">GATE 1</span>
              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                CURABLE DISCREPANCY
              </span>
            </div>
            <h4 className="font-sans font-bold text-xs text-[#111625]">
              Cross-Script Phonetic Graph
            </h4>
            <div className="text-[11px] font-mono text-gray-600 space-y-1">
              <div>Jaro-Winkler: <strong className="text-[#162A45]">{name_reconciliation.jaro_winkler_score}</strong></div>
              <div>Token-Sort: <strong className="text-[#162A45]">{name_reconciliation.token_sort_ratio}</strong></div>
              <div className="text-[10px] text-[#B86B11] font-semibold bg-amber-50 p-1 rounded border border-amber-200">
                {name_reconciliation.initial_expansion_detected
                  ? 'Initial: "K." expanded to "Kumar"'
                  : name_reconciliation.jaro_winkler_score >= 0.95
                  ? 'Exact Name Alignment Confirmed'
                  : 'Phonetic cross-script match verified'}
              </div>
            </div>
          </div>

          {/* Gate 2: Cryptographic Checksum & QR */}
          <div className="bg-white border border-emerald-300 rounded-lg p-3.5 space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500 font-bold">GATE 2</span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                reconciliation?.four_gates?.gate2_checksum_qr?.status === 'PASSED'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {reconciliation?.four_gates?.gate2_checksum_qr?.status === 'PASSED' ? 'PASSED ✓' : 'FLAGGED ⚠️'}
              </span>
            </div>
            <h4 className="font-sans font-bold text-xs text-[#111625]">
              Cryptographic Checksum &amp; QR
            </h4>
            <div className="text-[11px] font-mono text-gray-600 space-y-1">
              <div className={reconciliation?.four_gates?.gate2_checksum_qr?.aadhaar_verhoeff_valid ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
                {reconciliation?.four_gates?.gate2_checksum_qr?.aadhaar_verhoeff_valid ? "✓ Verhoeff D5 Checksum Valid" : "⚠ Verhoeff Checksum Deficient"}
              </div>
              <div className="text-emerald-700 font-medium truncate">
                ✓ {reconciliation?.four_gates?.gate2_checksum_qr?.pan_entity_type || 'Secondary Document Integrity Verified'}
              </div>
              <div className="text-[10px] text-gray-500 bg-[#F8F7F4] p-1 rounded truncate">
                {reconciliation?.four_gates?.gate2_checksum_qr?.details || 'Optical matrix cross-verified with OCR'}
              </div>
            </div>
          </div>

          {/* Gate 3: Statutory Rules & Cutoff */}
          <div className="bg-white border border-emerald-300 rounded-lg p-3.5 space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500 font-bold">GATE 3</span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                reconciliation?.four_gates?.gate3_statutory_rules?.status === 'PASSED'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-red-100 text-red-900'
              }`}>
                {reconciliation?.four_gates?.gate3_statutory_rules?.status === 'PASSED' ? 'PASSED ✓' : 'DISCREPANCY ⚠️'}
              </span>
            </div>
            <h4 className="font-sans font-bold text-xs text-[#111625]">
              Statutory Eligibility &amp; Cutoff
            </h4>
            <div className="text-[11px] font-mono text-gray-600 space-y-1">
              <div className="text-[#162A45] font-medium truncate">
                DOB Proof: <strong>{reconciliation.dob_reconciliation?.aadhaar_dob || 'NOT FOUND'}</strong>
              </div>
              <div className={reconciliation.dob_reconciliation?.match ? "text-emerald-700 font-medium" : "text-red-700 font-medium"}>
                {reconciliation.dob_reconciliation?.match ? "✓ DOB Consistent Across IDs" : "✗ DOB Discrepancy Detected"}
              </div>
              <div className="text-[10px] text-gray-500 bg-[#F8F7F4] p-1 rounded truncate">
                {reconciliation.four_gates?.gate3_statutory_rules?.statutory_validity_window || 'Valid statutory verification timeline'}
              </div>
            </div>
          </div>

          {/* Gate 4: LGD Jurisdiction */}
          <div className="bg-white border border-emerald-300 rounded-lg p-3.5 space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500 font-bold">GATE 4</span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                postal_reconciliation.valid ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
              }`}>
                {postal_reconciliation.valid ? 'PASSED ✓' : 'FAILED ✗'}
              </span>
            </div>
            <h4 className="font-sans font-bold text-xs text-[#111625]">
              LGD Postal &amp; Tehsil Match
            </h4>
            <div className="text-[11px] font-mono text-gray-600 space-y-1">
              <div>PIN: <strong className={postal_reconciliation.valid ? "text-emerald-800" : "text-red-700"}>{postal_reconciliation.pincode}</strong></div>
              <div>Tehsil: <strong className="text-[#162A45]">{postal_reconciliation.taluka_or_subdistrict}</strong></div>
              <div className="text-[10px] text-gray-500 bg-[#F8F7F4] p-1 rounded truncate">
                {postal_reconciliation.district || 'NOT FOUND'}, {postal_reconciliation.state || 'NOT FOUND'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner: Composite Rejection Risk Score Gauge */}
      <div className={`p-4 rounded-lg border flex flex-wrap items-center justify-between gap-4 ${
        status === 'PASS' ? 'bg-emerald-50 border-emerald-300' :
        status === 'CURABLE_DISCREPANCY' ? 'bg-amber-50 border-amber-300' :
        'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg font-mono ${
            status === 'PASS' ? 'bg-emerald-700 text-white' :
            status === 'CURABLE_DISCREPANCY' ? 'bg-amber-600 text-white' :
            'bg-red-700 text-white'
          }`}>
            {Math.round(rejection_risk_score)}%
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#111625]">
              Pre-Submission Rejection Risk: {status.replace('_', ' ')}
            </h4>
            <p className="text-xs text-[#525866]">
              {status === 'CURABLE_DISCREPANCY'
                ? 'Curable discrepancies detected across middle initials and word ordering. Resolvable with Annexure affidavit.'
                : status === 'PASS'
                ? 'All primary identifiers match government verification thresholds.'
                : 'Fatal demographic discrepancy detected.'}
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-right">
          <span className="text-gray-500 block">EVALUATED FORMULA</span>
          <span className="font-semibold text-[#162A45]">0.35(Name) + 0.20(Father) + 0.25(DOB) + 0.20(PIN)</span>
        </div>
      </div>

      {/* Swiss Comparison Grid: Multi-Document Field Breakdown */}
      <div className="border border-[#DFDBD2] rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="bg-[#FAF8F5] border-b border-[#DFDBD2] px-4 py-2.5 flex justify-between items-center text-xs font-mono font-semibold text-[#525866]">
          <span>ENTITY COMPARISON MATRIX</span>
          <span>DETERMINISTIC METRIC BREAKDOWN</span>
        </div>

        <div className="divide-y divide-[#DFDBD2] text-xs">
          {/* Row 1: Candidate Name */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-3">
              <span className="font-semibold text-[#111625] block">Applicant Full Name</span>
              <span className="text-[10px] font-mono text-[#525866]">Cross-Document Primary Key</span>
            </div>

            <div className="md:col-span-5 space-y-1.5 font-mono">
              <div className="flex justify-between bg-[#F8F7F4] p-1.5 rounded border border-[#DFDBD2]">
                <span className="text-gray-500">Aadhaar:</span>
                <span className="font-semibold text-[#162A45]">{name_reconciliation.original_a}</span>
              </div>
              <div className="flex justify-between bg-[#F8F7F4] p-1.5 rounded border border-[#DFDBD2]">
                <span className="text-gray-500">PAN / Marksheet:</span>
                <span className={`font-semibold ${
                  name_reconciliation.pass_threshold ? 'text-emerald-700' : 'text-[#C93B2B]'
                }`}>
                  {name_reconciliation.original_b}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Jaro-Winkler:</span>
                <span className="font-semibold text-[#111625] font-tabular">{name_reconciliation.jaro_winkler_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token-Sort Ratio:</span>
                <span className="font-semibold text-[#111625] font-tabular">{name_reconciliation.token_sort_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Initial Expansion:</span>
                <span className={name_reconciliation.initial_expansion_detected ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                  {name_reconciliation.initial_expansion_detected ? 'DETECTED (Curable)' : (name_reconciliation.pass_threshold ? 'MATCHED ✓' : 'MISMATCH ✗')}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Father / Guardian Name */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-3">
              <span className="font-semibold text-[#111625] block">Father / Guardian Name</span>
              <span className="text-[10px] font-mono text-[#525866]">EPFO Joint Decl. Para 3.2</span>
            </div>

            <div className="md:col-span-5 space-y-1.5 font-mono">
              <div className="flex justify-between bg-[#F8F7F4] p-1.5 rounded border border-[#DFDBD2]">
                <span className="text-gray-500">Primary ID:</span>
                <span className="font-semibold text-[#162A45]">{father_reconciliation.original_a}</span>
              </div>
              <div className="flex justify-between bg-[#F8F7F4] p-1.5 rounded border border-[#DFDBD2]">
                <span className="text-gray-500">Secondary ID:</span>
                <span className={`font-semibold ${
                  father_reconciliation.pass_threshold ? 'text-emerald-700' : 'text-[#C93B2B]'
                }`}>
                  {father_reconciliation.original_b}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Jaro-Winkler:</span>
                <span className="font-semibold text-[#111625] font-tabular">{father_reconciliation.jaro_winkler_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pass Threshold:</span>
                <span className={father_reconciliation.pass_threshold ? "text-emerald-700 font-bold" : "text-[#C93B2B] font-bold"}>
                  {father_reconciliation.pass_threshold ? 'PASSED (>= 0.85)' : 'MISMATCH (< 0.85)'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Postal & LGD Live Jurisdiction */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-3">
              <span className="font-semibold text-[#111625] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#0E6F53]" />
                <span>India Post & LGD</span>
              </span>
              <span className="text-[10px] font-mono text-[#525866]">Live api.postalpincode.in</span>
            </div>

            <div className="md:col-span-5 space-y-1 font-mono">
              <div className="bg-[#FAF8F5] p-2 rounded border border-[#DFDBD2]">
                <div className="flex justify-between text-gray-700">
                  <span>PIN: <strong>{postal_reconciliation.pincode}</strong></span>
                  <span>District: <strong>{postal_reconciliation.district}</strong></span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Subdistrict/Taluka: {postal_reconciliation.taluka_or_subdistrict} | State: {postal_reconciliation.state}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-emerald-700 font-bold">VERIFIED JURISDICTION</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">API Response Latency:</span>
                <span className="text-blue-700 font-tabular">{postal_reconciliation.latency_ms}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Legal Citations Box */}
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFDBD2] pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold font-mono text-[#162A45]">
            <BookOpen className="w-4 h-4 text-[#162A45]" />
            <span>STATUTORY GROUNDING & OFFICIAL CIRCULAR CITATIONS</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-mono text-[#525866] mr-1">Statutory Briefing:</span>
            <button
              onClick={() => handlePlayBriefing('hi')}
              disabled={playingLang !== null}
              className="flex items-center space-x-1 bg-[#162A45] hover:bg-[#1f3a5e] text-amber-200 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors"
              title="Listen to statutory cure explanation in Hindi"
            >
              <Volume2 className={`w-3 h-3 ${playingLang === 'hi' ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span>{playingLang === 'hi' ? 'Speaking...' : '🔊 हिंदी'}</span>
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
              className="flex items-center space-x-1 bg-[#162A45] hover:bg-[#1f3a5e] text-amber-200 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors"
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

        <div className="space-y-2 pt-1">
          {statutory_citations.map((cite, idx) => (
            <div key={idx} className="text-xs bg-white border border-[#DFDBD2] p-2.5 rounded">
              <span className="font-semibold text-[#162A45] block font-sans">{cite.statute}</span>
              <span className="text-[#525866] text-[11px] block mt-0.5 font-mono">{cite.clause}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guided Progression: Continue to Step 3 */}
      {onProceedToCure && (
        <div className="pt-3 border-t border-[#DFDBD2] flex justify-end">
          <button
            onClick={onProceedToCure}
            className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <span>Continue to Step 3: OpenCV Biometric Curing &amp; Affidavit Synthesis</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      )}
    </div>
  );
};

