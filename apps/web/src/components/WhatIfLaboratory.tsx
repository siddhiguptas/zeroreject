'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
  Scale,
  Layers,
  Check,
  TrendingDown,
  FileCheck,
} from 'lucide-react';
import { WhatIfSimulateResponse } from '@/types';
import { simulateWhatIf } from '@/lib/api-client';

interface WhatIfLaboratoryProps {
  sessionId: string;
  defaultApplicantName?: string;
  defaultFatherName?: string;
  defaultPincode?: string;
  onApplyRemediation?: (remediations: string[]) => void;
}

export const WhatIfLaboratory: React.FC<WhatIfLaboratoryProps> = ({
  sessionId,
  defaultApplicantName = 'Siddhi Gupta',
  defaultFatherName = 'Raj Kumar Gupta',
  defaultPincode = '274204',
  onApplyRemediation,
}) => {
  // Input simulation states
  const [applicantName, setApplicantName] = useState(defaultApplicantName);
  const [fatherName, setFatherName] = useState(defaultFatherName);
  const [pincode, setPincode] = useState(defaultPincode);

  // Selected statutory remediations
  const [selectedRemediations, setSelectedRemediations] = useState<string[]>([
    'annexure_e_affidavit',
  ]);

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Sync defaults if props change
  useEffect(() => {
    if (defaultApplicantName) setApplicantName(defaultApplicantName);
    if (defaultFatherName) setFatherName(defaultFatherName);
    if (defaultPincode) setPincode(defaultPincode);
  }, [defaultApplicantName, defaultFatherName, defaultPincode]);

  // Run initial simulation when session is ready
  useEffect(() => {
    if (sessionId) {
      handleRunSimulation();
    }
  }, [sessionId]);

  const toggleRemediation = (remediationId: string) => {
    setSelectedRemediations((prev) =>
      prev.includes(remediationId)
        ? prev.filter((id) => id !== remediationId)
        : [...prev, remediationId]
    );
  };

  const handleRunSimulation = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    setAppliedNotice(false);

    try {
      const overrides: Record<string, string> = {
        applicant_name: applicantName,
        father_name: fatherName,
        pincode: pincode,
      };

      const res = await simulateWhatIf(sessionId, {
        field_overrides: overrides,
        selected_remediations: selectedRemediations,
      });
      setSimulationResult(res);
    } catch (err: any) {
      setError(err?.message || 'Simulation execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApplicantName(defaultApplicantName);
    setFatherName(defaultFatherName);
    setPincode(defaultPincode);
    setSelectedRemediations(['annexure_e_affidavit']);
    setAppliedNotice(false);
    setTimeout(() => {
      handleRunSimulation();
    }, 50);
  };

  const handleApply = () => {
    setAppliedNotice(true);
    onApplyRemediation?.(selectedRemediations);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FAF0E6] text-[#A84A1A] border border-[#ECD9C6]">
                <Sparkles className="w-5 h-5 text-[#A84A1A]" />
              </span>
              <h2 className="text-base font-bold text-[#162A45] tracking-tight">
                Counterfactual What-If Sandbox
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#DFDBD2] text-[#525866]">
                ZERO-MUTATION SANDBOX
              </span>
            </div>
            <p className="text-xs text-[#525866] mt-1 max-w-2xl">
              Hypothetically test how modifying discrepant name tokens, expanding initials, correcting PIN codes, or appending statutory legal affidavits affects your application rejection risk before submitting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-2 text-xs font-mono font-medium text-[#525866] bg-[#FAF9F5] hover:bg-[#EFECE4] border border-[#DFDBD2] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Actual
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="px-4 py-2 text-xs font-mono font-bold text-white bg-[#162A45] hover:bg-[#203a5e] rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? 'Simulating Impact...' : 'Simulate What-If'}
            </button>
          </div>
        </div>

        {/* Zero-Mutation Assurance Notice */}
        <div className="mt-4 pt-3 border-t border-[#EFECE4] flex items-center gap-2 text-[11px] font-mono text-[#7A808C]">
          <Info className="w-3.5 h-3.5 text-[#525866] shrink-0" />
          <span>
            <strong>Immutable Projection:</strong> All changes are evaluated in an isolated virtual overlay. No changes are committed to actual ingested scans or government registers.
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Controls on Left, Live Impact On Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: What-If Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#EFECE4] pb-3">
              <span className="text-xs font-mono font-bold text-[#162A45] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#A84A1A]" />
                1. Test Demographic Variations
              </span>
            </div>

            {/* Applicant Name Override */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#162A45] mb-1">
                Candidate / Applicant Name
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Siddhi Gupta"
                className="w-full bg-[#FAF9F5] border border-[#DFDBD2] focus:border-[#162A45] rounded-lg px-3 py-2 text-xs font-mono text-[#111625] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#7A808C] font-mono mt-0.5 block">
                Simulate removing trailing initials or spelling variations across secondary scans.
              </span>
            </div>

            {/* Father Name Override */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#162A45] mb-1">
                Father / Guardian Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Raj Kumar Gupta"
                className="w-full bg-[#FAF9F5] border border-[#DFDBD2] focus:border-[#162A45] rounded-lg px-3 py-2 text-xs font-mono text-[#111625] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#7A808C] font-mono mt-0.5 block">
                Expand abbreviated middle name or resolve father token mismatch.
              </span>
            </div>

            {/* Postal PIN Code Override */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#162A45] mb-1">
                Jurisdiction Postal PIN Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 274204"
                className="w-full bg-[#FAF9F5] border border-[#DFDBD2] focus:border-[#162A45] rounded-lg px-3 py-2 text-xs font-mono text-[#111625] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#7A808C] font-mono mt-0.5 block">
                Verify India Post LGD mapping against target tehsil jurisdiction.
              </span>
            </div>
          </div>

          {/* Statutory Remediations Selector */}
          <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#EFECE4] pb-3">
              <span className="text-xs font-mono font-bold text-[#162A45] uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                2. Counterfactual Legal Remedies
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Statutory Annexure E Affidavit */}
              <label
                onClick={() => toggleRemediation('annexure_e_affidavit')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedRemediations.includes('annexure_e_affidavit')
                    ? 'bg-[#EBF7F2] border-emerald-300'
                    : 'bg-[#FAF9F5] border-[#DFDBD2] hover:bg-[#F2EFE8]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRemediations.includes('annexure_e_affidavit')}
                  onChange={() => {}}
                  className="mt-0.5 accent-emerald-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#162A45]">
                      Statutory Annexure &apos;E&apos; Self-Declaration
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      RULE 4A(1)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#525866] leading-tight">
                    Cures minor spelling differences and initial abbreviations through sworn legal declaration under IT Act 2000 Section 43A.
                  </p>
                </div>
              </label>

              {/* Option 2: State Gazette Notification */}
              <label
                onClick={() => toggleRemediation('gazette_notification')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedRemediations.includes('gazette_notification')
                    ? 'bg-[#EBF7F2] border-emerald-300'
                    : 'bg-[#FAF9F5] border-[#DFDBD2] hover:bg-[#F2EFE8]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRemediations.includes('gazette_notification')}
                  onChange={() => {}}
                  className="mt-0.5 accent-emerald-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#162A45]">
                      Official State Gazette Notification
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                      PART-IV
                    </span>
                  </div>
                  <p className="text-[11px] text-[#525866] leading-tight">
                    Recommended when candidate surname or phonetic root differs fundamentally across secondary education records.
                  </p>
                </div>
              </label>

              {/* Option 3: LGD Postal Tehsil Alignment */}
              <label
                onClick={() => toggleRemediation('postal_tehsil_sync')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedRemediations.includes('postal_tehsil_sync')
                    ? 'bg-[#EBF7F2] border-emerald-300'
                    : 'bg-[#FAF9F5] border-[#DFDBD2] hover:bg-[#F2EFE8]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRemediations.includes('postal_tehsil_sync')}
                  onChange={() => {}}
                  className="mt-0.5 accent-emerald-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#162A45]">
                      LGD Postal Tehsil Re-alignment
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                      GEO-VALID
                    </span>
                  </div>
                  <p className="text-[11px] text-[#525866] leading-tight">
                    Harmonizes mismatching PIN with the Local Government Directory subdistrict to avert jurisdictional bouncing.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Impact Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {simulationResult ? (
            <>
              {/* Risk Delta Comparison Card */}
              <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#162A45] uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    Simulated Rejection Risk Delta
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                        simulationResult.risk_delta > 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {simulationResult.risk_delta > 0
                        ? `▼ ${simulationResult.risk_delta}% Risk Reduction`
                        : 'No Risk Reduction'}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side State Matrix */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Before State */}
                  <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#DFDBD2] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EFECE4] pb-2">
                      <span className="text-[11px] font-mono font-bold text-[#7A808C] uppercase">
                        Baseline Actual State
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          simulationResult.before_state.status === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : simulationResult.before_state.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {simulationResult.before_state.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#7A808C] block">Risk Probability:</span>
                        <span className="text-base font-bold text-[#162A45]">
                          {simulationResult.before_state.risk_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A808C] block">Candidate / Father:</span>
                        <span className="font-semibold text-[#111625] truncate block">
                          {simulationResult.before_state.name_a || '—'}
                        </span>
                        <span className="text-[11px] text-[#525866] truncate block">
                          F: {simulationResult.before_state.father_name || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A808C] block">Phonetic Similarity:</span>
                        <span className="font-semibold text-[#111625]">
                          {simulationResult.before_state.name_similarity}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A808C] block">Gate 1 Token Match:</span>
                        <span
                          className={`font-semibold ${
                            simulationResult.before_state.gate_1 === 'PASS'
                              ? 'text-emerald-700'
                              : simulationResult.before_state.gate_1 === 'WARN'
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {simulationResult.before_state.gate_1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated After State */}
                  <div className="p-4 rounded-xl bg-[#F0FAF5] border border-emerald-300 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
                      SIMULATED
                    </div>

                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-900 uppercase">
                        Projected Post-Remedy
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          simulationResult.after_state.status === 'READY'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {simulationResult.after_state.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-emerald-700 block">Projected Risk:</span>
                        <span className="text-base font-bold text-emerald-800">
                          {simulationResult.after_state.risk_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block">Candidate / Father:</span>
                        <span className="font-semibold text-emerald-950 truncate block">
                          {simulationResult.after_state.name_a || applicantName}
                        </span>
                        <span className="text-[11px] text-emerald-800 truncate block">
                          F: {simulationResult.after_state.father_name || fatherName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block">Phonetic Similarity:</span>
                        <span className="font-semibold text-emerald-900">
                          {simulationResult.after_state.name_similarity}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block">Gate 1 Token Match:</span>
                        <span className="font-semibold text-emerald-800">
                          {simulationResult.after_state.gate_1} ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolved vs Unresolved Findings */}
              <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 space-y-4 shadow-xs">
                <span className="text-xs font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                  Simulated Impact Analysis &amp; Resolved Inconsistencies
                </span>

                <div className="space-y-2">
                  {simulationResult.impact_summary.map((summary, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#DFDBD2] flex items-center gap-2 text-xs font-mono text-[#162A45]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{summary}</span>
                    </div>
                  ))}
                </div>

                {/* Discrepancy Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-mono font-bold text-emerald-900 block mb-1">
                      Cured Discrepancies ({simulationResult.resolved_discrepancies.length})
                    </span>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      {simulationResult.resolved_discrepancies.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#DFDBD2]">
                    <span className="text-[11px] font-mono font-bold text-[#525866] block mb-1">
                      Remaining Residuals ({simulationResult.unresolved_discrepancies.length})
                    </span>
                    <ul className="text-xs text-[#525866] space-y-1">
                      {simulationResult.unresolved_discrepancies.length === 0 ? (
                        <li className="text-[11px] text-emerald-700 italic">
                          No pending blocking discrepancies detected!
                        </li>
                      ) : (
                        simulationResult.unresolved_discrepancies.map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-[#EFECE4] flex items-center justify-between">
                  <div className="text-[11px] font-mono text-[#7A808C]">
                    Affected Graph Entities:{' '}
                    <strong className="text-[#162A45]">
                      {simulationResult.affected_nodes.length} nodes
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {appliedNotice && (
                      <span className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Remedy Applied to Filing
                      </span>
                    )}
                    <button
                      onClick={handleApply}
                      className="px-4 py-2 text-xs font-mono font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Apply Statutory Remediation
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-12 text-center shadow-xs">
              <Sparkles className="w-8 h-8 text-[#A84A1A] mx-auto mb-2 animate-bounce" />
              <h3 className="text-sm font-mono font-bold text-[#162A45]">
                What-If Sandbox Initializing
              </h3>
              <p className="text-xs text-[#525866] mt-1">
                Calculating counterfactual application states and projecting risk curves...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

