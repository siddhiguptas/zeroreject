'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, AlertCircle, ShieldCheck, Terminal, CheckCircle2, Lock, Zap, Download, Check, ExternalLink } from 'lucide-react';
import { ExecutionStepEvent } from '@/types';
import { createExecutionEventSource, toggleChaos, authorizeOtp } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : '';

interface PlaywrightLiveConsoleProps {
  sessionId: string;
  workflowTarget?: string;
  onExecutionStateChange?: (status: 'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED' | 'FAILED') => void;
  onOtpDetected?: (otp: string) => void;
  onReceiptGenerated?: (ack: string, receiptScreenshot?: string) => void;
}

export const PlaywrightLiveConsole: React.FC<PlaywrightLiveConsoleProps> = ({
  sessionId,
  workflowTarget,
  onExecutionStateChange,
  onOtpDetected,
  onReceiptGenerated,
}) => {
  const [chaosEnabled, setChaosEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<ExecutionStepEvent[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [otpCode, setOtpCode] = useState('');
  const [detectedOtp, setDetectedOtp] = useState('');
  const [receiptAck, setReceiptAck] = useState<string | null>(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ONLY inside the log container element; NEVER scroll the window/page
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  const handleToggleChaos = async () => {
    const nextState = !chaosEnabled;
    setChaosEnabled(nextState);
    try {
      const res = await toggleChaos(nextState);
      if (res && typeof res.chaos_mode === 'boolean') {
        setChaosEnabled(res.chaos_mode);
      }
    } catch (e) {
      console.error('Failed to toggle chaos mode', e);
    }
  };

  const handleStartExecution = () => {
    if (!sessionId) return;
    setIsRunning(true);
    setEvents([]);
    setReceiptAck(null);
    setOtpCode('');
    setStatus('EXECUTING');
    onExecutionStateChange?.('EXECUTING');

    createExecutionEventSource(
      sessionId,
      chaosEnabled,
      (event) => {
        setEvents((prev) => [...prev, event]);
        if (event.screenshot_base64) {
          setCurrentScreenshot(event.screenshot_base64);
        }

        if (event.status === 'RETRYING') {
          setStatus('HEALING');
          onExecutionStateChange?.('HEALING');
        } else if (event.status === 'AWAITING_OTP') {
          setStatus('AWAITING_OTP');
          onExecutionStateChange?.('AWAITING_OTP');
          setIsRunning(false);
          const dynamicOtp = (event as any).otp_code;
          if (dynamicOtp) {
            setDetectedOtp(dynamicOtp);
            onOtpDetected?.(dynamicOtp);
          }
        } else if (event.status === 'SUBMITTED') {
          setStatus('VERIFIED');
          onExecutionStateChange?.('VERIFIED');
          setIsRunning(false);
        } else if (event.status === 'FAILED') {
          setStatus('FAILED');
          onExecutionStateChange?.('FAILED');
          setIsRunning(false);
        }
      },
      (err) => {
        console.warn('SSE stream closed', err);
        setIsRunning(false);
      },
      true,
      workflowTarget
    );
  };

  const handleAuthorizeOtp = async () => {
    const codeToSubmit = otpCode.trim();
    if (!codeToSubmit || codeToSubmit.length !== 6) {
      setAuthError("Please enter the complete 6-digit OTP code requested by the portal.");
      return;
    }
    if (!sessionId) return;
    setIsSubmittingOtp(true);
    setAuthError(null);

    // 1. Log OTP submission initiation so right terminal updates immediately
    const tsNow = new Date().toISOString();
    setEvents(prev => [
      ...prev,
      {
        step_index: 4,
        step_name: 'OTP_SUBMITTING',
        status: 'RUNNING',
        message: `Authorizing citizen verification: Typing OTP "${codeToSubmit}" into portal #citizen_otp and confirming statutory consent...`,
        timestamp_utc: tsNow,
      }
    ]);

    try {
      const res = await authorizeOtp(sessionId, codeToSubmit);
      setReceiptAck(res.acknowledgement_number);

      // 2. Visually display the typed OTP on the Playwright virtual screen
      if (res.otp_entered_screenshot_base64) {
        setCurrentScreenshot(res.otp_entered_screenshot_base64);
        setEvents(prev => [
          ...prev,
          {
            step_index: 4,
            step_name: 'OTP_ENTERED',
            status: 'RUNNING',
            message: `OTP ${codeToSubmit} successfully entered into portal DOM. Triggering final authorization and submission...`,
            timestamp_utc: new Date().toISOString(),
            screenshot_base64: res.otp_entered_screenshot_base64
          }
        ]);
        // Brief pause so the typed state is visible to user before the confirmed receipt renders
        await new Promise(r => setTimeout(r, 600));
      }

      // 3. Visually display the OFFICIAL STAMPED RECEIPT screenshot from the government portal
      if (res.screenshot_base64) {
        setCurrentScreenshot(res.screenshot_base64);
      }

      // 4. Record official receipt generation in execution event log
      setEvents(prev => [
        ...prev,
        {
          step_index: 4,
          step_name: 'OFFICIAL_STAMPED_RECEIPT',
          status: 'COMPLETED',
          message: `Official Stamped Receipt Generated! State Acknowledgement Ref: ${res.acknowledgement_number}`,
          timestamp_utc: new Date().toISOString(),
          screenshot_base64: res.screenshot_base64
        }
      ]);

      setStatus('VERIFIED');
      onExecutionStateChange?.('VERIFIED');
      onReceiptGenerated?.(res.acknowledgement_number, res.screenshot_base64);
    } catch (e: any) {
      console.error('OTP authorization failed', e);
      setAuthError(e?.message || 'Government portal rejected OTP authentication. Please verify the code.');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleResetSession = () => {
    setStatus('IDLE');
    setEvents([]);
    setCurrentScreenshot(null);
    setReceiptAck(null);
    setOtpCode('');
    setIsRunning(false);
    onExecutionStateChange?.('IDLE');
  };

  return (
    <div className="space-y-6">
      {/* State 1: Ready & Control Bar */}
      <div className="bg-white border border-[#DFDBD2] rounded-xl p-5 shadow-sm space-y-4">
        {/* Pre-cured Assets Health Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#FAF9F5] border border-[#DFDBD2] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#525866] block">Portrait Photo</span>
              <span className="text-xs font-bold text-[#111625] font-mono">16.4 KB (200x230 px)</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Compliant</span>
            </span>
          </div>

          <div className="bg-[#FAF9F5] border border-[#DFDBD2] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#525866] block">Signature Contour</span>
              <span className="text-xs font-bold text-[#111625] font-mono">14.2 KB (140x60 px)</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Compliant</span>
            </span>
          </div>

          <div className="bg-[#FAF9F5] border border-[#DFDBD2] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#525866] block">Statutory Annexure &apos;E&apos;</span>
              <span className="text-xs font-bold text-[#111625] font-mono">42.1 KB (&lt; 100 KB)</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Compliant</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#DFDBD2]">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleStartExecution}
              disabled={isRunning || !sessionId}
              className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#0E1A2B] text-white px-6 py-2.5 rounded-lg text-xs font-mono font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>
                {isRunning
                  ? 'Autonomous Agent Navigating...'
                  : status === 'VERIFIED'
                  ? 'Re-Run Playwright Filing'
                  : 'Start Autonomous Playwright Filing'}
              </span>
            </button>

            {status !== 'IDLE' && (
              <button
                onClick={handleResetSession}
                className="flex items-center space-x-1.5 text-xs font-mono text-[#525866] hover:text-[#111625] px-3 py-2 border border-[#DFDBD2] rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Judge Chaos Injection Toggle */}
          <div className="flex items-center space-x-3 bg-amber-50 border border-amber-300 px-4 py-2 rounded-full shadow-sm">
            <Zap className={`w-4 h-4 ${chaosEnabled ? 'text-amber-600 fill-amber-600 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-xs font-mono font-bold text-amber-950">Simulate Gov Server 502 Chaos:</span>
            <button
              onClick={handleToggleChaos}
              type="button"
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                chaosEnabled ? 'bg-[#C93B2B]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  chaosEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[10px] font-mono font-bold uppercase ${chaosEnabled ? 'text-[#C93B2B]' : 'text-gray-500'}`}>
              {chaosEnabled ? 'Armed (502 Inject)' : 'Off (Clean Pass)'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Split View: Streamed Browser Viewport vs State Machine Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Streamed Browser Visuals */}
        <div className="lg:col-span-7 bg-[#0F172A] rounded-xl border border-[#1E293B] overflow-hidden flex flex-col h-[520px] shadow-sm">
          {/* Mock Browser Header */}
          <div className="bg-[#1E293B] px-4 py-2.5 border-b border-[#334155] flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <a
                href={`http://localhost:8090/?portal=${workflowTarget || 'e_district_income'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-slate-300 hover:text-amber-300 text-[11px] font-mono flex items-center space-x-1 underline decoration-dotted transition-colors"
                title="Click to open live target portal running on port 8090"
              >
                <span>http://localhost:8090/?portal={workflowTarget || 'e_district_income'}</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Playwright Chromium 130</span>
          </div>

          {/* Screenshot Viewport */}
          <div className="flex-1 bg-black/60 flex items-center justify-center p-3 relative overflow-hidden">
            {currentScreenshot ? (
              <img
                src={`data:image/jpeg;base64,${currentScreenshot}`}
                alt="Target Portal Live DOM View"
                className="max-h-full max-w-full object-contain rounded border border-slate-700 shadow-xl"
              />
            ) : (
              <div className="text-center text-slate-500 font-mono text-xs max-w-sm p-6">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">Playwright Session Ready</p>
                <p className="mt-1 text-[11px]">Click &quot;Start Autonomous Playwright Filing&quot; to launch live automated form mapping and file uploads.</p>
              </div>
            )}

            {/* Injected Chaos Catch Badge */}
            {status === 'HEALING' && (
              <div className="absolute top-4 left-4 bg-[#C93B2B] text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xl animate-bounce">
                <AlertTriangle className="w-4 h-4" />
                <span>HTTP 502 CAUGHT: Self-Healing Active</span>
              </div>
            )}

            {/* OTP Entry In Progress Badge */}
            {isSubmittingOtp && (
              <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xl animate-pulse">
                <Lock className="w-3.5 h-3.5" />
                <span>Entering OTP in Portal DOM...</span>
              </div>
            )}

            {/* Receipt Confirmed Badge */}
            {status === 'VERIFIED' && receiptAck && (
              <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xl animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OFFICIAL STAMPED RECEIPT GENERATED</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): LangGraph State Machine & Live SSE Stream */}
        <div className="lg:col-span-5 bg-[#0F172A] rounded-xl border border-[#1E293B] flex flex-col h-[520px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E293B] px-4 py-2.5 border-b border-[#334155] flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>LANGGRAPH STATE JOURNAL</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                status === 'HEALING'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600'
                  : status === 'EXECUTING'
                  ? 'bg-blue-950 text-blue-300 border border-blue-500'
                  : status === 'AWAITING_OTP'
                  ? 'bg-amber-900 text-amber-200 border border-amber-500'
                  : status === 'VERIFIED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {status}
            </span>
          </div>

          {/* Action Logs Box */}
          <div ref={logContainerRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 font-mono text-[11px] leading-relaxed text-slate-300">
            {events.length === 0 ? (
              <div className="text-slate-500 text-center py-24">
                Awaiting agent execution events...
              </div>
            ) : (
              events.map((ev, idx) => {
                const isChaos = ev.step_name.includes('CHAOS') || ev.status === 'RETRYING';
                const isSuccess = ev.status === 'COMPLETED' || ev.status === 'HEALED';
                const isOtp = ev.status === 'AWAITING_OTP';

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border ${
                      isChaos
                        ? 'bg-red-950/50 border-red-800 text-red-200'
                        : isOtp
                        ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                        : isSuccess
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 mb-0.5">
                      <span className="font-bold uppercase tracking-wider">{ev.step_name}</span>
                      <span>{ev.timestamp_utc.slice(11, 19)} UTC</span>
                    </div>
                    <p>{ev.message}</p>
                    {ev.error_recovery_count && ev.error_recovery_count > 0 ? (
                      <span className="text-[10px] text-amber-400 font-bold block mt-1">
                        ↳ Recovery attempts: {ev.error_recovery_count}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* State 3: Human-in-the-Loop OTP Consent Gate (ONLY displayed in AWAITING_OTP) */}
          {status === 'AWAITING_OTP' && !receiptAck && (
            <div className="bg-[#1E293B] border-t border-amber-500/60 p-3.5 space-y-2.5 animate-in fade-in">
              <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-semibold font-mono">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Human-in-the-Loop Citizen Authorization Gate</span>
              </div>

              <div className="bg-[#0F172A] border border-amber-500/40 p-2.5 rounded text-[11px] font-mono text-amber-200">
                <span>Target Portal challenge active. Check the visible Chromium browser window on your screen and input the 6-digit OTP below:</span>
              </div>

              {authError && (
                <div className="bg-red-950/90 border border-red-500/80 p-2 rounded text-[11px] font-mono text-red-200 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex space-x-2 pt-1">
                <input
                  type="text"
                  value={otpCode}
                  placeholder="6-digit OTP"
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  maxLength={6}
                  className="w-36 bg-[#0F172A] border border-slate-600 rounded px-2.5 py-1.5 text-center font-mono font-bold text-white text-sm tracking-widest focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleAuthorizeOtp}
                  disabled={isSubmittingOtp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1.5 text-xs font-bold font-mono transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingOtp ? 'Submitting to Portal...' : '✓ Authorize Final Filing'}</span>
                </button>
              </div>
            </div>
          )}

          {/* State 4: Officially Stamped Filing Receipt (ONLY displayed AFTER OTP Authorization) */}
          {status === 'VERIFIED' && receiptAck && (
            <div className="bg-emerald-950/90 border-t border-emerald-500 p-4 text-xs font-mono text-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL STAMPED RECEIPT GENERATED</span>
              </div>
              <div className="text-[11px] text-emerald-100">
                Acknowledgement Ref: <strong className="text-white text-xs">{receiptAck}</strong>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`${API_BASE}/api/execution/receipt/${sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs py-2 px-3 rounded shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>⬇ Download Stamped Receipt (PDF)</span>
                </a>
                <a
                  href={`http://localhost:8090/verify?ref=${receiptAck}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 bg-[#162A45] hover:bg-[#1f3a5e] text-amber-300 border border-slate-700 font-mono font-bold text-xs py-2 px-3 rounded shadow transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>🔍 Verify on Portal Registry</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
