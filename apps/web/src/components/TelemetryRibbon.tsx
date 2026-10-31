'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
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
      {/* Left: Simple Clean Brand Logo Lockup */}
      <div className="flex items-center space-x-3 shrink-0">
        <img src="/logo-mark.svg" alt="ZeroReject Seal" className="w-6 h-6 inline-block" />
        <div className="flex items-center text-xs">
          <span className="font-bold tracking-wider text-slate-100 uppercase">ZEROREJECT</span>
          <span className="text-slate-600 mx-2">|</span>
          <span className="tracking-wider text-slate-400 uppercase font-medium">PRAMAAN·FIX</span>
        </div>
      </div>

      {/* Right: Inspection & Telemetry Trigger */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine Online</span>
        </div>

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
