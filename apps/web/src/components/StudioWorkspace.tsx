'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Layers, Wand2, Shield, Play } from 'lucide-react';
import { ReconciliationResponse, CompileAssetsResponse } from '@/types';
import { loadSamplePacket, compileAssets } from '@/lib/api-client';
import { PhoneticGraphMatrix } from './PhoneticGraphMatrix';
import { OpenCVCurePreview } from './OpenCVCurePreview';
import { PlaywrightLiveConsole } from './PlaywrightLiveConsole';

interface StudioWorkspaceProps {
  onPlaywrightStatusChange?: (status: 'READY' | 'EXECUTING' | 'HEALING' | 'PAUSED_OTP' | 'SUBMITTED') => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({ onPlaywrightStatusChange }) => {
  const [activePanel, setActivePanel] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [workflowTarget, setWorkflowTarget] = useState('e_district_income');
  const [sessionId, setSessionId] = useState<string>('');
  const [reconciliation, setReconciliation] = useState<ReconciliationResponse | null>(null);
  const [compileData, setCompileData] = useState<CompileAssetsResponse | null>(null);
  const [loadingPacket, setLoadingPacket] = useState(false);
  const [loadingCompile, setLoadingCompile] = useState(false);

  // 1-Click Evaluation Packet Loader
  const handleLoadSamplePacket = async () => {
    setLoadingPacket(true);
    try {
      const data = await loadSamplePacket(workflowTarget);
      setReconciliation(data);
      setSessionId(data.session_id);
      setActivePanel('B'); // Automatically advance to Cross-Document Phonetic X-Ray
    } catch (e) {
      console.error('Failed to load sample citizen packet', e);
    } finally {
      setLoadingPacket(false);
    }
  };

  const handleTriggerCompile = async () => {
    if (!sessionId) return;
    setLoadingCompile(true);
    try {
      const data = await compileAssets(sessionId, workflowTarget);
      setCompileData(data);
    } catch (e) {
      console.error('Failed to compile assets', e);
    } finally {
      setLoadingCompile(false);
    }
  };

  return (
    <section id="studio-workspace" className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      {/* Studio Header Ribbon */}
      <div className="border-b border-[#DFDBD2] pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-[#162A45] tracking-wider uppercase block">
            Phase II Autonomous Workflow Studio
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111625] font-normal tracking-tight">
            ZeroReject Pre-Flight Studio
          </h2>
        </div>

        {/* Workflow Target Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="workflow-select" className="text-xs font-mono text-[#525866]">Target Portal Profile:</label>
          <select
            id="workflow-select"
            value={workflowTarget}
            onChange={(e) => setWorkflowTarget(e.target.value)}
            className="bg-white border border-[#DFDBD2] text-xs font-mono font-medium rounded px-3 py-1.5 focus:outline-none focus:border-[#162A45] text-[#111625]"
          >
            <option value="e_district_income">UP e-District (Income / Domicile Certificate)</option>
            <option value="national_scholarship">National Scholarship Portal (NSP MeitY)</option>
            <option value="passport_seva">Passport Seva Document Advisor Matrix</option>
            <option value="epfo_joint_decl">EPFO Joint Declaration SOP (2024)</option>
          </select>
        </div>
      </div>

      {/* 4 Synchronized Panel Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#EFECE4] p-1.5 rounded-lg border border-[#DFDBD2] text-xs font-mono">
        <button
          onClick={() => setActivePanel('A')}
          className={`py-2.5 px-3 rounded flex items-center justify-center space-x-2 font-medium transition-all ${
            activePanel === 'A' ? 'bg-white text-[#162A45] font-bold shadow-sm' : 'text-[#525866] hover:text-[#111625]'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px]">A</span>
          <span>Multi-Doc Ingestion</span>
        </button>

        <button
          onClick={() => setActivePanel('B')}
          className={`py-2.5 px-3 rounded flex items-center justify-center space-x-2 font-medium transition-all ${
            activePanel === 'B' ? 'bg-white text-[#162A45] font-bold shadow-sm' : 'text-[#525866] hover:text-[#111625]'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px]">B</span>
          <span>Phonetic Risk Matrix</span>
        </button>

        <button
          onClick={() => setActivePanel('C')}
          className={`py-2.5 px-3 rounded flex items-center justify-center space-x-2 font-medium transition-all ${
            activePanel === 'C' ? 'bg-white text-[#162A45] font-bold shadow-sm' : 'text-[#525866] hover:text-[#111625]'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px]">C</span>
          <span>OpenCV Curing Studio</span>
        </button>

        <button
          onClick={() => setActivePanel('D')}
          className={`py-2.5 px-3 rounded flex items-center justify-center space-x-2 font-medium transition-all ${
            activePanel === 'D' ? 'bg-white text-[#162A45] font-bold shadow-sm' : 'text-[#525866] hover:text-[#111625]'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px]">D</span>
          <span>Playwright Self-Healing</span>
        </button>
      </div>

      {/* Panel Contents */}
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-xl p-6 shadow-sm">
        {activePanel === 'A' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFDBD2] pb-4">
              <div>
                <h3 className="font-serif text-xl text-[#111625]">Panel A: Multi-Document Vision Ingestion</h3>
                <p className="text-xs text-[#525866] font-sans">
                  Upload arbitrary citizen IDs or execute our 1-click evaluator packet using real rasterized images from disk.
                </p>
              </div>

              {/* 1-Click Judge Demo Button */}
              <button
                onClick={handleLoadSamplePacket}
                disabled={loadingPacket}
                className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded text-xs font-semibold shadow-archival transition-all"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{loadingPacket ? 'Processing Optical Pipeline...' : 'Run Real Rasterized Test Packet'}</span>
              </button>
            </div>

            {/* Ingestion Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Aadhaar */}
              <div className="bg-white border border-[#DFDBD2] rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs font-mono font-semibold">
                  <span className="text-[#162A45]">Primary Identity: Aadhaar</span>
                  <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded">UIDAI Standard</span>
                </div>
                <div className="h-32 bg-[#F8F7F4] border border-dashed border-[#DFDBD2] rounded flex flex-col items-center justify-center text-center p-3 text-xs text-[#525866]">
                  <FileText className="w-8 h-8 text-[#162A45] mb-1" />
                  <span className="font-medium text-[#111625]">assets/real_sample_docs/aadhaar_sample.png</span>
                  <span className="text-[10px] font-mono mt-0.5">Bilingual (Devanagari + English)</span>
                </div>
                <div className="text-[11px] font-mono text-gray-500 space-y-0.5">
                  <div>Name: रमेश कुमार शर्मा / Ramesh Kumar Sharma</div>
                  <div>DOB: 14/08/1996 | PIN: 206124 (Etawah)</div>
                </div>
              </div>

              {/* Card 2: PAN Card */}
              <div className="bg-white border border-[#DFDBD2] rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs font-mono font-semibold">
                  <span className="text-[#162A45]">Secondary Identity: PAN</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded">Initial Trap</span>
                </div>
                <div className="h-32 bg-[#F8F7F4] border border-dashed border-[#DFDBD2] rounded flex flex-col items-center justify-center text-center p-3 text-xs text-[#525866]">
                  <FileText className="w-8 h-8 text-[#C93B2B] mb-1" />
                  <span className="font-medium text-[#111625]">assets/real_sample_docs/pan_sample.png</span>
                  <span className="text-[10px] font-mono mt-0.5">Initial Abbreviation: RAMESH K SHARMA</span>
                </div>
                <div className="text-[11px] font-mono text-gray-500 space-y-0.5">
                  <div>Father: DINA NATH SHARMA</div>
                  <div>PAN: ABCPS1234F</div>
                </div>
              </div>

              {/* Card 3: 10th Marksheet */}
              <div className="bg-white border border-[#DFDBD2] rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs font-mono font-semibold">
                  <span className="text-[#162A45]">DOB Proof: 10th Marksheet</span>
                  <span className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded">Inversion Trap</span>
                </div>
                <div className="h-32 bg-[#F8F7F4] border border-dashed border-[#DFDBD2] rounded flex flex-col items-center justify-center text-center p-3 text-xs text-[#525866]">
                  <FileText className="w-8 h-8 text-[#B86B11] mb-1" />
                  <span className="font-medium text-[#111625]">assets/real_sample_docs/marksheet_sample.png</span>
                  <span className="text-[10px] font-mono mt-0.5">Surname Inverted: SHARMA RAMESH KUMAR</span>
                </div>
                <div className="text-[11px] font-mono text-gray-500 space-y-0.5">
                  <div>Roll: 20612498 | Result: 1st Div</div>
                  <div>Father: D. N. SHARMA</div>
                </div>
              </div>
            </div>

            {/* Quick Advance Notice */}
            {reconciliation && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Real packet ingested! Active Session: <strong>{sessionId.slice(0, 12)}...</strong></span>
                </div>
                <button
                  onClick={() => setActivePanel('B')}
                  className="text-xs font-mono font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  View Cross-Document Entity Graph (Panel B) →
                </button>
              </div>
            )}
          </div>
        )}

        {activePanel === 'B' && (
          <PhoneticGraphMatrix
            reconciliation={reconciliation}
            loading={loadingPacket}
          />
        )}

        {activePanel === 'C' && (
          <OpenCVCurePreview
            compileData={compileData}
            loading={loadingCompile}
            onTriggerCompile={handleTriggerCompile}
            sessionId={sessionId}
          />
        )}

        {activePanel === 'D' && (
          <PlaywrightLiveConsole
            sessionId={sessionId}
            onExecutionStateChange={onPlaywrightStatusChange}
          />
        )}
      </div>
    </section>
  );
};
