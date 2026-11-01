'use client';

import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Terminal,
  Clock,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { CrashTestRehearsalResponse } from '@/types';
import { runCrashTestRehearsal } from '@/lib/api-client';

interface CrashTestConsoleProps {
  sessionId: string;
  workflowTarget?: string;
  onAdvanceToFiling?: () => void;
}

export const CrashTestConsole: React.FC<CrashTestConsoleProps> = ({
  sessionId,
  workflowTarget = 'e_district_income',
  onAdvanceToFiling,
}) => {
  const [chaosMode, setChaosMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [rehearsalResult, setRehearsalResult] = useState<CrashTestRehearsalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunRehearsal = async () => {
    if (!sessionId) return;
    setRunning(true);
    setError(null);

    try {
      const res = await runCrashTestRehearsal(sessionId, {
        workflow_target: workflowTarget,
        simulate_chaos: chaosMode,
      });
      setRehearsalResult(res);
    } catch (err: any) {
      setError(err?.message || 'Crash test rehearsal execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header Banner */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EBF7F2] text-emerald-800 border border-emerald-200">
                <Zap className="w-5 h-5 text-emerald-700" />
              </span>
              <h2 className="text-base font-bold text-[#162A45] tracking-tight">
                Application Crash Test Rehearsal
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                PLAYWRIGHT REHEARSAL
              </span>
            </div>
            <p className="text-xs text-[#525866] mt-1 max-w-2xl">
              Rehearse the exact end-to-end portal submission against an isolated mock harness before filing. Simulates DOM mutations, field mapping, biometric constraints, and 502 server chaos resilience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Chaos Switch */}
            <label className="flex items-center gap-2 cursor-pointer bg-[#FAF9F5] border border-[#DFDBD2] px-3 py-1.5 rounded-lg text-xs font-mono">
              <input
                type="checkbox"
                checked={chaosMode}
                onChange={(e) => setChaosMode(e.target.checked)}
                className="accent-[#A84A1A]"
              />
              <span className="text-[#162A45] font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#A84A1A]" />
                Simulate 502 Chaos
              </span>
            </label>

            {/* Run Button */}
            <button
              onClick={handleRunRehearsal}
              disabled={running || !sessionId}
              className={`px-4 py-2 text-xs font-mono font-bold text-white rounded-lg transition-all flex items-center gap-2 shadow-xs ${
                running
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#162A45] hover:bg-[#203a5e]'
              }`}
            >
              {running ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Rehearsing Application...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Crash Test Rehearsal
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Checklist & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pre-Flight Readiness Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFECE4] pb-3">
              <span className="text-xs font-mono font-bold text-[#162A45] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Pre-Flight Readiness Gates
              </span>
              <span className="text-[10px] font-mono text-[#7A808C]">
                {rehearsalResult ? `${rehearsalResult.checklist.filter(c => c.passed).length}/5 Cleared` : '5 Gates Checked'}
              </span>
            </div>

            <div className="space-y-2.5">
              {rehearsalResult ? (
                rehearsalResult.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                      item.passed
                        ? 'bg-[#F0FAF5] border-emerald-200 text-[#162A45]'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono block">
                        {item.label}
                      </span>
                      <p className="text-[11px] text-[#525866] leading-tight font-mono">
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                /* Default Preview State */
                <>
                  <div className="p-3 rounded-lg border bg-[#FAF9F5] border-[#DFDBD2] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#7A808C] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-[#162A45] block">
                        1. Cross-Document Token Reconciliation
                      </span>
                      <p className="text-[11px] text-[#525866] leading-tight font-mono">
                        Validates phonetic roots between Primary Aadhaar scan and Secondary Marksheet / PAN.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border bg-[#FAF9F5] border-[#DFDBD2] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#7A808C] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-[#162A45] block">
                        2. LGD Postal Hierarchy &amp; Pincode Registry
                      </span>
                      <p className="text-[11px] text-[#525866] leading-tight font-mono">
                        Confirms India Post subdistrict postal mapping aligns with target jurisdiction.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border bg-[#FAF9F5] border-[#DFDBD2] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#7A808C] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-[#162A45] block">
                        3. Biometric &amp; Asset Specification Compliance
                      </span>
                      <p className="text-[11px] text-[#525866] leading-tight font-mono">
                        Validates 200x230 portrait (&lt;=50KB) and 140x60 signature (&lt;=20KB).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border bg-[#FAF9F5] border-[#DFDBD2] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#7A808C] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-[#162A45] block">
                        4. Target Portal Form Schema &amp; Selectors
                      </span>
                      <p className="text-[11px] text-[#525866] leading-tight font-mono">
                        Audits target input controls, dropdown values, and step navigation anchors.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border bg-[#FAF9F5] border-[#DFDBD2] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#7A808C] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-[#162A45] block">
                        5. Statutory Annexure &apos;E&apos; Readiness
                      </span>
                      <p className="text-[11px] text-[#525866] leading-tight font-mono">
                        Confirms legal self-declaration PDF is compiled and ready to attach.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Step-by-Step Rehearsal Telemetry Log (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111625] border border-[#20293A] rounded-xl p-5 text-white shadow-md">
            <div className="flex items-center justify-between border-b border-[#20293A] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  Playwright Browser Rehearsal Journal
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {rehearsalResult ? `${rehearsalResult.execution_time_ms}ms total` : 'Ready to rehearse'}
                </span>
              </div>
            </div>

            {/* Terminal Log Items */}
            <div className="space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto pr-1">
              {rehearsalResult ? (
                rehearsalResult.portal_steps.map((step) => (
                  <div
                    key={step.step_index}
                    className="p-3 rounded-lg bg-[#162A45]/40 border border-[#203a5e] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">
                        STEP {step.step_index}: {step.step_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {step.latency_ms}ms
                      </span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {step.message}
                    </p>
                    <div className="text-[10px] text-gray-500 truncate">
                      Target URL: {step.target_url}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Cpu className="w-8 h-8 text-emerald-500/50 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-300 font-bold">
                    Rehearsal Simulator Idle
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                    Click &quot;Run Crash Test Rehearsal&quot; to test your complete application submission path in headless browser automation before filing live.
                  </p>
                </div>
              )}
            </div>

            {/* Verdict Box */}
            {rehearsalResult && (
              <div className="mt-4 pt-3 border-t border-[#20293A]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#162A45] p-3 rounded-lg border border-[#203a5e]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-400 block">
                      Crash Test Verdict
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        rehearsalResult.overall_verdict === 'REHEARSAL_PASSED'
                          ? 'text-emerald-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {rehearsalResult.overall_verdict === 'REHEARSAL_PASSED'
                        ? '✓ REHEARSAL PASSED — ZERO PORTAL CRASH RISK'
                        : '! REHEARSAL PASSED WITH WARNINGS'}
                    </span>
                  </div>

                  {onAdvanceToFiling && (
                    <button
                      onClick={onAdvanceToFiling}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>Proceed to Official Filing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Recommendations */}
                {rehearsalResult.recommendations.length > 0 && (
                  <div className="mt-2.5 text-[11px] font-mono text-gray-300 space-y-1">
                    {rehearsalResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

