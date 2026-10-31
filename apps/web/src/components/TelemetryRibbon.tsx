'use client';

import React from 'react';
import { Activity, Lock, Cpu, Terminal } from 'lucide-react';
import { JudgeTelemetryResponse } from '@/types';

interface TelemetryRibbonProps {
  telemetry: JudgeTelemetryResponse | null;
  onOpenAuditDrawer: () => void;
  playwrightStatus?: 'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED';
}

export const TelemetryRibbon: React.FC<TelemetryRibbonProps> = ({
  telemetry,
  onOpenAuditDrawer,
  playwrightStatus = 'IDLE',
}) => {
  const postalLatency = Math.round(telemetry?.india_post_latency_ms || 18);

  return (
    <header className="h-14 px-6 flex items-center justify-between whitespace-nowrap overflow-x-auto bg-[#0F172A] border-b border-slate-800 text-xs font-mono shadow-sm">
      {/* Left: Custom Sovereign Brand Lockup (No Hackathon Pill) */}
      <div className="flex items-center space-x-3 shrink-0">
        <img src="/logo-mark.svg" alt="ZeroReject Seal" className="w-6 h-6 inline-block" />
        <div className="flex items-center text-xs">
          <span className="font-bold tracking-wider text-slate-100 uppercase">ZEROREJECT</span>
          <span className="text-slate-600 mx-2">|</span>
          <span className="tracking-wider text-slate-400 uppercase font-medium">PRAMAAN·FIX</span>
        </div>
      </div>

      {/* Center: Authoritative System Telemetry Pills */}
      <div className="hidden lg:flex items-center space-x-3 text-slate-300 shrink-0">
        <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1 rounded border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Privacy: 100% On-Device OCR &amp; Vector Engine</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1 rounded border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">⚡ LGD Postal API:</span>
          <span className="text-white font-semibold font-tabular">{postalLatency}ms</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1 rounded border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">🤖 Agent State:</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
              playwrightStatus === 'VERIFIED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : playwrightStatus === 'AWAITING_OTP'
                ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                : playwrightStatus === 'HEALING'
                ? 'bg-purple-950 text-purple-300 border border-purple-600'
                : playwrightStatus === 'EXECUTING'
                ? 'bg-blue-950 text-blue-300 border border-blue-600'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {playwrightStatus}
          </span>
        </div>
      </div>

      {/* Right: Single High-Contrast Inspection Trigger */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={onOpenAuditDrawer}
          className="flex items-center space-x-2 bg-[#1E293B] hover:bg-[#334155] text-amber-300 border border-slate-700 px-3.5 py-1.5 rounded transition-all text-xs font-semibold shadow-sm"
          title="Open Runtime Telemetry and Audit Drawer"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>&gt;_ System Telemetry &amp; Audit</span>
        </button>
      </div>
    </header>
  );
};
