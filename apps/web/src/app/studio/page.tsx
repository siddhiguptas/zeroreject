'use client';

import React, { useState, useEffect } from 'react';
import { StudioWorkspace } from '@/components/StudioWorkspace';
import { JudgeAuditDrawer } from '@/components/JudgeAuditDrawer';
import { PageHeader } from '@/components/PageHeader';
import { JudgeTelemetryResponse } from '@/types';
import { fetchTelemetry } from '@/lib/api-client';
import { Terminal, ShieldCheck } from 'lucide-react';

export default function StudioPage() {
  const [telemetry, setTelemetry] = useState<JudgeTelemetryResponse | null>(null);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [playwrightStatus, setPlaywrightStatus] = useState<
    'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED'
  >('IDLE');

  const loadTelemetry = async () => {
    try {
      const data = await fetchTelemetry();
      setTelemetry(data);
    } catch (e) {
      console.warn('Backend telemetry polling', e);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        eyebrow="Pre-Flight Studio"
        title="Check your documents before you submit."
        description="Detect discrepancies, cure file sizes and synthesize statutory declarations before portal upload."
        action={
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#162A45] hover:text-[#0E1A2B] bg-white border border-[#DFDBD2] px-3.5 py-2 rounded-lg hover:bg-[#F0EDE5] transition-colors shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-[#B86B11]" />
            <span>Inspector Drawer</span>
          </button>
        }
      />

      {/* Main Interactive Studio Workspace */}
      <StudioWorkspace
        onPlaywrightStatusChange={(status) => setPlaywrightStatus(status)}
      />

      {/* Slide-over Inspection Drawer */}
      <JudgeAuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        telemetry={telemetry}
        onRefreshTelemetry={loadTelemetry}
      />
    </div>
  );
}

