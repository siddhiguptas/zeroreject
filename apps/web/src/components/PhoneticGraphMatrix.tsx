'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, MapPin, CheckCircle2, BookOpen, Hash } from 'lucide-react';
import { ReconciliationResponse } from '@/types';

interface PhoneticGraphMatrixProps {
  reconciliation: ReconciliationResponse | null;
  loading: boolean;
}

export const PhoneticGraphMatrix: React.FC<PhoneticGraphMatrixProps> = ({ reconciliation, loading }) => {
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
                <span className="font-semibold text-[#C93B2B]">{name_reconciliation.original_b}</span>
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
                <span className="text-amber-700 font-bold">
                  {name_reconciliation.initial_expansion_detected ? 'DETECTED (Curable)' : 'EXACT'}
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
                <span className="font-semibold text-[#162A45]">{father_reconciliation.original_b}</span>
              </div>
            </div>

            <div className="md:col-span-4 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Jaro-Winkler:</span>
                <span className="font-semibold text-[#111625] font-tabular">{father_reconciliation.jaro_winkler_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pass Threshold:</span>
                <span className="text-emerald-700 font-bold">
                  {father_reconciliation.pass_threshold ? 'PASSED (>= 0.85)' : 'FAILED'}
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
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-lg p-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold font-mono text-[#162A45]">
          <BookOpen className="w-4 h-4 text-[#162A45]" />
          <span>STATUTORY GROUNDING & OFFICIAL CIRCULAR CITATIONS</span>
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
    </div>
  );
};
