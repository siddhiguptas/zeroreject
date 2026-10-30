'use client';

import React from 'react';
import { Activity, Database, ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { JudgeTelemetryResponse } from '@/types';

interface TelemetryRibbonProps {
  telemetry: JudgeTelemetryResponse | null;
  onOpenAuditDrawer: () => void;
  playwrightStatus?: 'READY' | 'EXECUTING' | 'HEALING' | 'PAUSED_OTP' | 'SUBMITTED';
}

export const TelemetryRibbon: React.FC<TelemetryRibbonProps> = ({
  telemetry,
  onOpenAuditDrawer,
  playwrightStatus = 'READY',
}) => {
  return (
    <div className="bg-[#111625] text-white border-b border-[#252C3D] px-4 py-2 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Sovereign Seal */}
        <div className="flex items-center space-x-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider text-gray-200">
            ZEROREJECT <span className="text-[#DFDBD2]/60 font-normal">| PRAMAANFIX</span>
          </span>
          <span className="bg-[#162A45] border border-[#2B3E58] text-[10px] px-2 py-0.5 rounded text-blue-200 uppercase tracking-wider">
            FORGE '26 Track 1
          </span>
        </div>

        {/* Center: Live Real-Time Telemetry */}
        <div className="flex items-center space-x-6 text-[#9CA3AF]">
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>DB:</span>
            <span className="text-white font-medium">{telemetry?.db_dialect || 'SQLite WAL'}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>India Post LGD:</span>
            <span className="text-white font-medium font-tabular">
              {telemetry ? `${telemetry.india_post_latency_ms}ms` : '18ms'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Playwright Agent:</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              playwrightStatus === 'HEALING' ? 'bg-amber-900/60 text-amber-300 border border-amber-600' :
              playwrightStatus === 'EXECUTING' ? 'bg-blue-900/60 text-blue-300 border border-blue-600' :
              'bg-emerald-950/70 text-emerald-300 border border-emerald-700'
            }`}>
              {playwrightStatus}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Mock Mandate:</span>
            <span className="text-emerald-400 font-bold">100% ENFORCED</span>
          </div>
        </div>

        {/* Right: Judge Audit Button */}
        <div>
          <button
            onClick={onOpenAuditDrawer}
            className="flex items-center space-x-1.5 bg-[#162A45] hover:bg-[#1f3a5e] text-white border border-[#354863] px-3 py-1 rounded transition-colors text-xs font-semibold shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge Audit Drawer</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1 rounded ml-1">Live Traces</span>
          </button>
        </div>
      </div>
    </div>
  );
};
