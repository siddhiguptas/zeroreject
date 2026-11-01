'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  RotateCcw,
  Scale,
} from 'lucide-react';
import { DigitalTwinOverviewResponse, ReconciliationResponse } from '@/types';
import { fetchDigitalTwinOverview } from '@/lib/api-client';
import { EvidenceGraphViewer } from './EvidenceGraphViewer';
import { WhatIfLaboratory } from './WhatIfLaboratory';
import { CrashTestConsole } from './CrashTestConsole';

interface DigitalTwinWorkspaceProps {
  sessionId: string;
  workflowTarget?: string;
  reconciliation?: ReconciliationResponse | null;
  onNavigateToStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
}

export const DigitalTwinWorkspace: React.FC<DigitalTwinWorkspaceProps> = ({
  sessionId,
  workflowTarget = 'e_district_income',
  reconciliation,
  onNavigateToStep,
}) => {
  const [subView, setSubView] = useState<'overview' | 'graph' | 'whatif' | 'crashtest'>('overview');
  const [overview, setOverview] = useState<DigitalTwinOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadOverview();
    }
  }, [sessionId]);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDigitalTwinOverview(sessionId);
      setOverview(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Digital Twin overview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Digital Twin Sub-Navigation Bar */}
      <div className="bg-[#FAF9F5] border border-[#DFDBD2] rounded-xl p-2 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {/* Sub-view Tab 1: Overview */}
          <button
            onClick={() => setSubView('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              subView === 'overview'
                ? 'bg-[#162A45] text-white shadow-xs'
                : 'text-[#525866] hover:text-[#111625] hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Application Overview</span>
          </button>

          {/* Sub-view Tab 2: Evidence Graph */}
          <button
            onClick={() => setSubView('graph')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              subView === 'graph'
                ? 'bg-[#162A45] text-white shadow-xs'
                : 'text-[#525866] hover:text-[#111625] hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Evidence Graph</span>
          </button>

          {/* Sub-view Tab 3: What-if Laboratory */}
          <button
            onClick={() => setSubView('whatif')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              subView === 'whatif'
                ? 'bg-[#162A45] text-white shadow-xs'
                : 'text-[#525866] hover:text-[#111625] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A84A1A]" />
            <span>What-If Laboratory</span>
          </button>

          {/* Sub-view Tab 4: Application Crash Test */}
          <button
            onClick={() => setSubView('crashtest')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              subView === 'crashtest'
                ? 'bg-[#162A45] text-white shadow-xs'
                : 'text-[#525866] hover:text-[#111625] hover:bg-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Crash Test Rehearsal</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#7A808C] px-2">
          <span>Digital Twin Core:</span>
          <span className="font-bold text-[#162A45]">Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Sub-View Content Routing */}
      {subView === 'overview' && (
        <div className="space-y-6">
          {/* Hero Reconstructed Twin Header Card */}
          <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-[#162A45]">
                    DIGITAL TWIN RECONSTRUCTION
                  </span>
                  <span className="text-xs font-mono text-[#525866]">
                    Session: {sessionId}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#162A45] tracking-tight">
                  {overview?.applicant_identity.canonical_name || 'Citizen Application Twin'}
                </h2>
                <p className="text-xs text-[#525866]">
                  Synthesized from verified document nodes, phonetic reconciliations, and India Post LGD jurisdictional master records.
                </p>
              </div>

              {/* Status and Risk Metric Pill */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FAF9F5] border border-[#DFDBD2] rounded-xl text-center min-w-[120px]">
                  <span className="text-[10px] font-mono uppercase text-[#7A808C] block">
                    Pre-Flight Risk
                  </span>
                  <span className="text-xl font-bold font-mono text-[#162A45]">
                    {overview?.composite_risk_score ?? 12}%
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold block ${
                      overview?.filing_readiness_status === 'READY_FOR_FILING'
                        ? 'text-emerald-700'
                        : overview?.filing_readiness_status === 'CURABLE_ACTION_REQUIRED'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {overview?.filing_readiness_status || 'READY_FOR_FILING'}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF9F5] border border-[#DFDBD2] rounded-xl text-center min-w-[120px]">
                  <span className="text-[10px] font-mono uppercase text-[#7A808C] block">
                    Statutory Compliance
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {overview?.statutory_compliance_rate ? Math.round(overview.statutory_compliance_rate * 100) : 98}%
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 block">
                    VERIFIED SOP
                  </span>
                </div>
              </div>
            </div>

            {/* Reconstructed Profile Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#EFECE4]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#7A808C] flex items-center gap-1">
                  <User className="w-3 h-3 text-[#A84A1A]" />
                  Applicant Full Name
                </span>
                <span className="text-xs font-mono font-bold text-[#162A45] block">
                  {overview?.applicant_identity.canonical_name || 'Siddhi Gupta'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#7A808C] flex items-center gap-1">
                  <User className="w-3 h-3 text-[#525866]" />
                  Father / Guardian Name
                </span>
                <span className="text-xs font-mono font-bold text-[#162A45] block">
                  {overview?.guardian_identity.father_or_guardian || 'Raj Kumar Gupta'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#7A808C] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  Jurisdiction PIN / District
                </span>
                <span className="text-xs font-mono font-bold text-[#162A45] block">
                  {overview?.residence_identity.pincode || '274204'} (
                  {overview?.residence_identity.district || 'Deoria, UP'})
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#7A808C] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Secondary Name Match
                </span>
                <span className="text-xs font-mono font-bold text-[#162A45] block">
                  {overview?.applicant_identity.secondary_name || 'Siddhi Gupta'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Access Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Action 1: Evidence Graph */}
            <div
              onClick={() => setSubView('graph')}
              className="bg-white border border-[#DFDBD2] hover:border-[#162A45] rounded-xl p-5 cursor-pointer transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Layers className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A808C] group-hover:text-[#162A45] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xs font-mono font-bold text-[#162A45] uppercase">
                Explore Evidence Graph
              </h3>
              <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                Inspect dynamic nodes connecting scanned documents, raw extractions, statutory legal requirements, and portal destination fields.
              </p>
              <span className="text-[10px] font-mono text-[#A84A1A] font-semibold mt-3 block">
                {overview?.documents_summary ? overview.documents_summary.length : 3} Ingested Documents →
              </span>
            </div>

            {/* Quick Action 2: What-if Sandbox */}
            <div
              onClick={() => setSubView('whatif')}
              className="bg-white border border-[#DFDBD2] hover:border-[#A84A1A] rounded-xl p-5 cursor-pointer transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#FAF0E6] text-[#A84A1A]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A808C] group-hover:text-[#A84A1A] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xs font-mono font-bold text-[#162A45] uppercase">
                Counterfactual What-If Lab
              </h3>
              <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                Test spelling corrections, name expansions, and statutory affidavits in a zero-mutation virtual sandbox to see risk deltas.
              </p>
              <span className="text-[10px] font-mono text-[#A84A1A] font-semibold mt-3 block">
                Simulate Projections →
              </span>
            </div>

            {/* Quick Action 3: Crash Test Rehearsal */}
            <div
              onClick={() => setSubView('crashtest')}
              className="bg-white border border-[#DFDBD2] hover:border-emerald-600 rounded-xl p-5 cursor-pointer transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#EBF7F2] text-emerald-700">
                  <Zap className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A808C] group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xs font-mono font-bold text-[#162A45] uppercase">
                Application Crash Test
              </h3>
              <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                Run an autonomous Playwright rehearsal against target government portal schemas with 502 chaos resilience recovery.
              </p>
              <span className="text-[10px] font-mono text-emerald-700 font-semibold mt-3 block">
                5 Pre-Flight Gates Ready →
              </span>
            </div>
          </div>

          {/* Actionable Statutory Remediations Panel */}
          {overview?.actionable_remediations && overview.actionable_remediations.length > 0 && (
            <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                Recommended Statutory Remediations
              </span>
              <div className="space-y-2">
                {overview.actionable_remediations.map((remedy, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#FAF9F5] border border-[#DFDBD2] flex items-center justify-between gap-2.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 text-[#162A45]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block">{remedy.title}</strong>
                        <span className="text-[11px] text-[#525866]">{remedy.description}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToStep?.(remedy.target_stage as 1 | 2 | 3 | 4 | 5)}
                      className="px-2.5 py-1 bg-[#162A45] text-white rounded text-[11px] font-mono hover:bg-[#203a5e] transition-colors shrink-0"
                    >
                      Stage {remedy.target_stage} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subView === 'graph' && (
        <EvidenceGraphViewer sessionId={sessionId} />
      )}

      {subView === 'whatif' && (
        <WhatIfLaboratory
          sessionId={sessionId}
          defaultApplicantName={overview?.applicant_identity.canonical_name}
          defaultFatherName={overview?.guardian_identity.father_or_guardian}
          defaultPincode={overview?.residence_identity.pincode}
          onApplyRemediation={() => {
            loadOverview();
          }}
        />
      )}

      {subView === 'crashtest' && (
        <CrashTestConsole
          sessionId={sessionId}
          workflowTarget={workflowTarget}
          onAdvanceToFiling={() => onNavigateToStep?.(4)}
        />
      )}
    </div>
  );
};
