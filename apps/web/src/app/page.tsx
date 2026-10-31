'use client';

import React, { useState, useEffect } from 'react';
import { TelemetryRibbon } from '@/components/TelemetryRibbon';
import { HeroXRay } from '@/components/HeroXRay';
import { StudioWorkspace } from '@/components/StudioWorkspace';
import { JudgeAuditDrawer } from '@/components/JudgeAuditDrawer';
import { JudgeTelemetryResponse } from '@/types';
import { fetchTelemetry } from '@/lib/api-client';

export default function HomePage() {
  const [telemetry, setTelemetry] = useState<JudgeTelemetryResponse | null>(null);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [playwrightStatus, setPlaywrightStatus] = useState<
    'READY' | 'EXECUTING' | 'HEALING' | 'PAUSED_OTP' | 'SUBMITTED'
  >('READY');

  const loadTelemetry = async () => {
    try {
      const data = await fetchTelemetry();
      setTelemetry(data);
    } catch (e) {
      console.warn('Backend not currently reachable for initial telemetry fetch', e);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToStudio = () => {
    document.getElementById('studio-workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLaunchChaosDemo = () => {
    document.getElementById('studio-workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EE] text-[#111625]">
      {/* 1. Top System Live Telemetry Ribbon */}
      <TelemetryRibbon
        telemetry={telemetry}
        onOpenAuditDrawer={() => setIsAuditDrawerOpen(true)}
        playwrightStatus={playwrightStatus}
      />

      {/* 2. Editorial Hero Section & Live Cross-Document Phonetic X-Ray */}
      <HeroXRay
        onScrollToStudio={handleScrollToStudio}
        onLaunchChaosDemo={handleLaunchChaosDemo}
      />

      {/* 3. 4-Panel ZeroReject Pre-Flight Studio */}
      <main className="flex-1">
        <StudioWorkspace
          onPlaywrightStatusChange={(status) => setPlaywrightStatus(status)}
        />
      </main>

      {/* 4. Slide-Over Judge Inspection & Architectural Tradeoffs Drawer */}
      <JudgeAuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        telemetry={telemetry}
        onRefreshTelemetry={loadTelemetry}
      />

      {/* Sovereign Archival Footer */}
      <footer className="border-t border-[#DFDBD2] bg-[#EFECE4] py-8 px-4 text-xs font-mono text-[#525866]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo-mark.svg" alt="ZeroReject Seal" className="w-6 h-6" />
            <div>
              <span className="font-bold text-[#111625]">ZeroReject (PramaanFix)</span>
              <span className="mx-2 text-[#DFDBD2]">|</span>
              <span>FORGE '26 GenAI Hackathon (Track 1: Civic Pulse &amp; Digital Governance)</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Deterministic Math: Double Metaphone + Jaro-Winkler</span>
            <span>Vision: 100% Free OCR + OpenCV</span>
            <span>Autonomous Agent: Playwright Self-Healing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

