'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { 
  Bot, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Cpu, 
  Lock, 
  RefreshCw,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PlaywrightLiveConsole } from '@/components/PlaywrightLiveConsole';

type PortalProfileKey = 'e_district_income' | 'national_scholarship' | 'passport_seva' | 'epfo_joint_declaration';

export default function AutomationLabPage() {
  const [selectedPortal, setSelectedPortal] = useState<PortalProfileKey>('e_district_income');
  const [sessionId, setSessionId] = useState<string>('sess_demo_live');
  const [executionStatus, setExecutionStatus] = useState<'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED' | 'FAILED'>('IDLE');

  const portalOptions: { key: PortalProfileKey; name: string; dept: string; url: string; badge: string }[] = [
    {
      key: 'e_district_income',
      name: 'UP e-District — Income & Domicile',
      dept: 'Revenue Dept., Govt. of Uttar Pradesh',
      url: 'http://localhost:8090/?portal=e_district_income',
      badge: 'Primary Showcase',
    },
    {
      key: 'national_scholarship',
      name: 'National Scholarship Portal (NSP 2.0)',
      dept: 'Ministry of Electronics & IT (MeitY)',
      url: 'http://localhost:8090/?portal=national_scholarship',
      badge: 'Central Sector',
    },
    {
      key: 'passport_seva',
      name: 'Passport Seva (Annexure E Protocol)',
      dept: 'Ministry of External Affairs (MEA)',
      url: 'http://localhost:8090/?portal=passport_seva',
      badge: 'Statutory Name Sync',
    },
    {
      key: 'epfo_joint_declaration',
      name: 'EPFO — Joint Declaration SOP',
      dept: 'Ministry of Labour & Employment',
      url: 'http://localhost:8090/?portal=epfo_joint_declaration',
      badge: 'UAN / KYC Correction',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        eyebrow="Automation Lab"
        title="Watch your application move through a controlled, recoverable browser workflow."
        description="Autonomous Playwright browser agent auto-filling multi-step state portals, recovering from HTTP 502 chaos, and pausing at the mandatory Citizen OTP Gate."
        action={
          <a
            href="http://localhost:8090"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#162A45] hover:text-[#0E1A2B] bg-white border border-[#DFDBD2] px-3.5 py-2 rounded-lg hover:bg-[#F0EDE5] transition-colors shadow-xs"
          >
            <span>Target Portal (:8090)</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#B86B11]" />
          </a>
        }
      />

      {/* Portal Profile Selector & Session Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs">
          <label className="block text-xs font-mono text-[#525866] uppercase tracking-wider mb-2 font-semibold">
            Select Target Government Portal Scheme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {portalOptions.map((p) => {
              const isSelected = selectedPortal === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPortal(p.key)}
                  className={`text-left p-3.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-[#0E6F53] bg-emerald-50/60 ring-1 ring-[#0E6F53]'
                      : 'border-[#DFDBD2] bg-[#FAF8F5] hover:bg-white hover:border-[#162A45]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-semibold text-[#111625]">{p.name}</div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#DFDBD2] text-[#525866]">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#525866] line-clamp-1">{p.dept}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <label className="block text-xs font-mono text-[#525866] uppercase tracking-wider mb-2 font-semibold">
              Execution Session Identifier
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-[#DFDBD2] rounded font-mono text-xs text-[#111625] focus:outline-none focus:ring-1 focus:ring-[#0E6F53] bg-[#FAF8F5]"
              placeholder="Enter audit session uuid..."
            />
            <p className="text-[11px] text-[#525866] mt-2">
              Use your active studio session or keep <code className="bg-[#FAF8F5] px-1 rounded">sess_demo_live</code> for sandbox evaluation.
            </p>
          </div>

          <div className="pt-3 border-t border-[#DFDBD2] mt-4 flex items-center justify-between">
            <span className="text-xs font-mono text-[#525866]">Agent Status:</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              executionStatus === 'EXECUTING' ? 'bg-amber-100 text-amber-900 animate-pulse' :
              executionStatus === 'HEALING' ? 'bg-purple-100 text-purple-900 animate-pulse' :
              executionStatus === 'AWAITING_OTP' ? 'bg-blue-100 text-blue-900' :
              executionStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900' :
              'bg-gray-100 text-gray-700'
            }`}>
              {executionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Playwright Console */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-xs">
        <PlaywrightLiveConsole
          sessionId={sessionId}
          workflowTarget={selectedPortal}
          onExecutionStateChange={setExecutionStatus}
        />
      </div>

      {/* Technical Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0E6F53] flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#0A1128]">
            Self-Healing DOM Engine
          </h3>
          <p className="text-[11px] text-[#525866] leading-relaxed font-sans">
            When government portals modify field IDs or obfuscate input names, ZeroReject recalculates label proximity and semantic bindings to heal without crashing.
          </p>
        </div>

        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#0A1128]">
            Mandatory Citizen OTP Gate
          </h3>
          <p className="text-[11px] text-[#525866] leading-relaxed font-sans">
            In strict compliance with UIDAI and IT Act directives, the autonomous agent unconditionally halts for live citizen confirmation before final submission.
          </p>
        </div>

        <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#0A1128]">
            Live Real-Time Telemetry
          </h3>
          <p className="text-[11px] text-[#525866] leading-relaxed font-sans">
            Every step, DOM mapping, payload upload, and network retry is streamed over Server-Sent Events (SSE) with live base64 viewport frames.
          </p>
        </div>
      </div>
    </div>
  );
}
