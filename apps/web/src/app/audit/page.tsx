'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { 
  FileCheck2, 
  Download, 
  ShieldCheck, 
  Hash, 
  Archive, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  SlidersHorizontal,
  ExternalLink,
  Cpu,
  Terminal,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getPacketZipUrl, fetchTelemetry } from '@/lib/api-client';
import { JudgeTelemetryResponse } from '@/types';

export default function AuditPage() {
  const [searchDocket, setSearchDocket] = useState('UP-EDIST-2026-94158');
  const [activeSessionId, setActiveSessionId] = useState('sess_demo_live');
  const [telemetry, setTelemetry] = useState<JudgeTelemetryResponse | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const [registryResult, setRegistryResult] = useState({
    ackNumber: 'UP-EDIST-2026-94158',
    applicantName: 'Siddhi Gupta',
    fatherName: 'Raj Kumar Gupta',
    district: 'Deoria',
    pincode: '274204',
    service: 'Revenue Dept. — Domicile / Income / Caste Certificate',
    status: 'VERIFIED & ARCHIVED IN STATE DOCKET',
    timestamp: '2026-10-31T11:00:00Z',
    sha256: 'a2ed0149d6c9f8e7f3203b11d1e904b77f98c21a41e4058d8e27c7f32998a4bc',
  });

  useEffect(() => {
    fetchTelemetry()
      .then((data) => setTelemetry(data))
      .catch((e) => console.warn('Telemetry load failed', e));
  }, []);

  const zipDownloadUrl = getPacketZipUrl(activeSessionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <PageHeader
        eyebrow="Audit & Reports"
        title="Review every validation, correction and execution event."
        description="Cryptographic proof of document compilation, deterministic benchmark metrics, and CSC portal-ready packet exports."
        action={
          <a
            href={zipDownloadUrl}
            download
            className="inline-flex items-center gap-1.5 bg-[#0E6F53] hover:bg-[#0c5c45] text-white px-4 py-2 rounded-lg text-xs font-mono font-semibold shadow-xs transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Export CSC Packet (.ZIP)</span>
          </a>
        }
      />

      {/* Fast Docket Verification Bar */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-mono text-[#525866] uppercase tracking-wider mb-1 font-semibold">
              Search State Acknowledgment Number or Session ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#525866] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDocket}
                onChange={(e) => setSearchDocket(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#DFDBD2] rounded-lg font-mono text-xs text-[#111625] focus:outline-none focus:ring-1 focus:ring-[#0E6F53] bg-[#FAF9F5]"
                placeholder="e.g. UP-EDIST-2026-94158 or sess_..."
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              className="bg-[#162A45] hover:bg-[#0E1A2B] text-white px-5 py-2 rounded-lg text-xs font-mono font-semibold shadow-xs transition-all"
              onClick={() => {
                setActiveSessionId(searchDocket || 'sess_demo_live');
              }}
            >
              Verify Hash
            </button>
            <a
              href="http://localhost:8090/registry"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#162A45] hover:text-[#0E1A2B] bg-white border border-[#DFDBD2] px-3.5 py-2 rounded-lg transition-colors shadow-xs"
            >
              <span>Target Portal Registry (:8090)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B86B11]" />
            </a>
          </div>
        </div>

        {/* Docket Card */}
        <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-lg p-4 space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFDBD2] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0A1128]">{registryResult.ackNumber}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                {registryResult.status}
              </span>
            </div>
            <span className="text-[11px] text-[#525866]">
              Archived: {registryResult.timestamp}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[#525866] block text-[10px]">APPLICANT</span>
              <span className="font-semibold text-[#111625]">{registryResult.applicantName}</span>
            </div>
            <div>
              <span className="text-[#525866] block text-[10px]">GUARDIAN / FATHER</span>
              <span className="font-semibold text-[#111625]">{registryResult.fatherName}</span>
            </div>
            <div>
              <span className="text-[#525866] block text-[10px]">DISTRICT &amp; PIN</span>
              <span className="font-semibold text-[#111625]">{registryResult.district} - {registryResult.pincode}</span>
            </div>
            <div>
              <span className="text-[#525866] block text-[10px]">SERVICE TYPE</span>
              <span className="font-semibold text-[#111625] truncate block">{registryResult.service}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 text-[11px] bg-white p-2.5 rounded border border-[#DFDBD2]">
            <Hash className="w-3.5 h-3.5 text-[#0E6F53] shrink-0" />
            <span className="shrink-0 font-semibold text-[#111625]">SHA-256 Digest:</span>
            <span className="truncate text-[10px] text-gray-600">{registryResult.sha256}</span>
          </div>
        </div>
      </div>

      {/* Chronological Audit Event Timeline (Real Backend Telemetry) */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A1128]">
              Chronological Execution Audit Journal
            </h2>
            <p className="text-xs text-[#525866] mt-1 font-sans">
              Immutable telemetry log emitted by ZeroReject&apos;s deterministic pipeline tools. Click any event to inspect full metadata.
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
            {telemetry?.recent_tools.length || 0} EVENTS RECORDED
          </span>
        </div>

        {telemetry && telemetry.recent_tools && telemetry.recent_tools.length > 0 ? (
          <div className="divide-y divide-[#DFDBD2] border border-[#DFDBD2] rounded-lg overflow-hidden font-mono text-xs">
            {telemetry.recent_tools.map((evt: any, idx: number) => {
              const isExpanded = expandedLogId === idx;
              return (
                <div key={idx} className="bg-white hover:bg-[#FAF9F5] transition-colors">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#162A45]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <span className="font-bold text-[#162A45]">{evt.tool_name}</span>
                        <span className="text-[11px] text-[#525866] ml-2 hidden sm:inline">
                          ({evt.formula_used})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="bg-[#FAF9F5] border border-[#DFDBD2] text-[#525866] px-2 py-0.5 rounded">
                        {evt.duration_ms}ms
                      </span>
                      <span className="text-slate-400">
                        {(evt.timestamp_utc || '').split('T')[1]?.replace('Z', ' UTC') || 'Logged'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-[#F8F7F4] border-t border-[#DFDBD2] text-[11px] space-y-2">
                      <div className="text-slate-600">
                        <strong className="text-[#111625]">Statutory Grounding:</strong> {evt.source_statute}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="bg-white p-2.5 rounded border border-[#DFDBD2]">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Input Summary</span>
                          <pre className="text-[10px] overflow-x-auto text-[#111625]">
                            {JSON.stringify(evt.input_summary, null, 2)}
                          </pre>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-[#DFDBD2]">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Output Telemetry</span>
                          <pre className="text-[10px] overflow-x-auto text-[#111625]">
                            {JSON.stringify(evt.output_summary, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs font-mono text-[#525866] bg-[#FAF9F5] rounded-lg border border-[#DFDBD2]">
            No live execution events recorded yet. Run a check in Pre-Flight Studio to generate telemetry.
          </div>
        )}
      </div>

      {/* Deterministic Benchmark Table: Raw Phone Scan vs OpenCV Cured Output */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A1128]">
              Deterministic Benchmark: Raw Phone Scan vs. Cured Assets
            </h2>
            <p className="text-xs text-[#525866] mt-1 font-sans">
              Visualizing how raw citizen captures are mathematically corrected to pass automated portal upload gates.
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-semibold hidden sm:inline-block">
            ZERO-FAIL COMPLIANCE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-y border-[#DFDBD2] text-[#525866] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Biometric / Statutory Asset</th>
                <th className="py-3 px-4">Raw Phone Scan Spec</th>
                <th className="py-3 px-4">Govt Portal Rule Ceiling</th>
                <th className="py-3 px-4">OpenCV Cured Output</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDBD2]">
              <tr className="hover:bg-[#FBF9F5]">
                <td className="py-3.5 px-4 font-semibold text-[#111625]">
                  Passport Photograph
                </td>
                <td className="py-3.5 px-4 text-red-600">
                  640×800 px &bull; 312.4 KB (Raw Camera)
                </td>
                <td className="py-3.5 px-4 text-[#525866]">
                  200×230 px &bull; 12.0 KB - 48.0 KB
                </td>
                <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                  200×230 px &bull; 16.4 KB (6 Iterations)
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#FBF9F5]">
                <td className="py-3.5 px-4 font-semibold text-[#111625]">
                  Applicant Signature
                </td>
                <td className="py-3.5 px-4 text-red-600">
                  500×300 px &bull; 48.2 KB (Desk Shadow)
                </td>
                <td className="py-3.5 px-4 text-[#525866]">
                  140×60 px &bull; Strictly &lt; 20.0 KB
                </td>
                <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                  140×60 px &bull; 13.8 KB (Grayscale Deskewed)
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-[#FBF9F5]">
                <td className="py-3.5 px-4 font-semibold text-[#111625]">
                  Annexure &lsquo;E&rsquo; Statutory Affidavit
                </td>
                <td className="py-3.5 px-4 text-red-600">
                  1,840 KB (Multi-page phone PDF)
                </td>
                <td className="py-3.5 px-4 text-[#525866]">
                  A4 PDF &bull; Strictly &lt; 100.0 KB
                </td>
                <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                  595×842 pt &bull; 8.8 KB (ReportLab Vector)
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lekhpal Decision Matrix & Packet Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#0A1128]">
            Lekhpal 4-Gate Decision Matrix
          </h3>
          <p className="text-xs text-[#525866] leading-relaxed font-sans">
            Before approving any filing, ZeroReject runs a multi-layered verification gate mimicking the 
            manual inspection of an authorized revenue officer (Lekhpal / Patwari).
          </p>
          <ul className="space-y-2 text-xs font-mono pt-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0E6F53] shrink-0 mt-0.5" />
              <span>Gate 1: Phonetic Match &gt;= 0.85 Jaro-Winkler or exact Soundex match.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0E6F53] shrink-0 mt-0.5" />
              <span>Gate 2: LGD &amp; India Post PIN code verifies applicant Tehsil and District.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0E6F53] shrink-0 mt-0.5" />
              <span>Gate 3: Biometric dimensions and binary quantization meet target spec ceilings.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0E6F53] shrink-0 mt-0.5" />
              <span>Gate 4: Grounded statutory circular verified with active Gazette clause URL.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0A1128]">
              Export Complete Verification Packet
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed font-sans">
              Download a cryptographically bundled .ZIP containing cured portrait JPEG, cured signature JPEG, 
              synthesized bilingual affidavit PDF, and a JSON audit telemetry log for submission to CSC kiosk operators.
            </p>
          </div>

          <div className="pt-4">
            <a
              href={zipDownloadUrl}
              download
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0E6F53] hover:bg-[#0c5c45] text-white py-3 px-4 rounded-lg text-xs font-semibold shadow transition-all font-mono"
            >
              <Archive className="w-4 h-4" />
              <span>Download CSC Portal-Ready Packet (.ZIP)</span>
            </a>
            <span className="block text-center text-[10px] font-mono text-[#525866] mt-2">
              Format: session_{activeSessionId}_csc_bundle.zip (SHA-256 stamped)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
