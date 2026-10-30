'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Terminal, CheckCircle2, Lock, Zap } from 'lucide-react';
import { ExecutionStepEvent } from '@/types';
import { createExecutionEventSource, toggleChaos, authorizeOtp } from '@/lib/api-client';

interface PlaywrightLiveConsoleProps {
  sessionId: string;
  onExecutionStateChange?: (status: 'READY' | 'EXECUTING' | 'HEALING' | 'PAUSED_OTP' | 'SUBMITTED') => void;
}

export const PlaywrightLiveConsole: React.FC<PlaywrightLiveConsoleProps> = ({
  sessionId,
  onExecutionStateChange,
}) => {
  const [chaosEnabled, setChaosEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<ExecutionStepEvent[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('IDLE');
  const [otpCode, setOtpCode] = useState('719340');
  const [receiptAck, setReceiptAck] = useState<string | null>(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleToggleChaos = async () => {
    try {
      const nextState = !chaosEnabled;
      const res = await toggleChaos(nextState);
      setChaosEnabled(res.chaos_mode);
    } catch (e) {
      console.error('Failed to toggle chaos mode', e);
    }
  };

  const handleStartExecution = () => {
    if (!sessionId) return;
    setIsRunning(true);
    setEvents([]);
    setReceiptAck(null);
    setStatus('RUNNING');
    onExecutionStateChange?.('EXECUTING');

    const cleanup = createExecutionEventSource(
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
          onExecutionStateChange?.('PAUSED_OTP');
        } else if (event.status === 'SUBMITTED') {
          setStatus('SUBMITTED');
          onExecutionStateChange?.('SUBMITTED');
        }
      },
      (err) => {
        console.error('SSE Stream completed or disconnected', err);
        setIsRunning(false);
      }
    );
  };

  const handleAuthorizeOtp = async () => {
    if (!sessionId || !otpCode) return;
    setIsSubmittingOtp(true);
    try {
      const res = await authorizeOtp(sessionId, otpCode);
      setReceiptAck(res.acknowledgement_number);
      setStatus('SUBMITTED');
      onExecutionStateChange?.('SUBMITTED');
    } catch (e) {
      console.error('OTP authorization failed', e);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Control Bar & Judge Chaos Switch */}
      <div className="bg-white border border-[#DFDBD2] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartExecution}
            disabled={isRunning || !sessionId}
            className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Agent Filing in Progress...' : 'Launch Playwright Self-Healing Agent'}</span>
          </button>

          <span className="text-xs font-mono text-[#525866]">
            Target: <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#DFDBD2]">State e-District (Port 8090)</code>
          </span>
        </div>

        {/* Judge Chaos Injection Toggle */}
        <div className="flex items-center space-x-3 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-full">
          <Zap className={`w-4 h-4 ${chaosEnabled ? 'text-amber-600 fill-amber-600 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-xs font-mono font-bold text-amber-950">Judge Chaos Mode (Inject 502):</span>
          <button
            onClick={handleToggleChaos}
            type="button"
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              chaosEnabled ? 'bg-[#C93B2B]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                chaosEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-[10px] font-mono font-bold uppercase ${chaosEnabled ? 'text-[#C93B2B]' : 'text-gray-500'}`}>
            {chaosEnabled ? 'Armed' : 'Off'}
          </span>
        </div>
      </div>

      {/* Real-time Split View: Streamed Browser Screenshot vs LangGraph State Action Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Streamed Browser Visuals */}
        <div className="lg:col-span-7 bg-[#111625] rounded-lg border border-[#2B3E58] overflow-hidden flex flex-col h-[520px]">
          {/* Mock Browser Header */}
          <div className="bg-[#1C2538] px-4 py-2 border-b border-[#2B3E58] flex items-center justify-between text-xs text-gray-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="ml-2 text-gray-300 text-[11px]">http://localhost:8090/step3</span>
            </div>
            <span className="text-[10px] text-gray-400">Headless Chromium 156.0</span>
          </div>

          {/* Screenshot Viewport */}
          <div className="flex-1 bg-black/40 flex items-center justify-center p-2 relative overflow-hidden">
            {currentScreenshot ? (
              <img
                src={`data:image/jpeg;base64,${currentScreenshot}`}
                alt="Target Portal Live DOM View"
                className="max-h-full max-w-full object-contain rounded shadow-lg border border-gray-700"
              />
            ) : (
              <div className="text-center text-gray-500 font-mono text-xs">
                <Terminal className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <span>Playwright browser instance idle. Click launch above to start live filing stream.</span>
              </div>
            )}

            {/* Injected Status Pill */}
            {status === 'HEALING' && (
              <div className="absolute top-4 left-4 bg-[#C93B2B] text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg animate-bounce">
                <AlertTriangle className="w-4 h-4" />
                <span>502 CAUGHT: Self-Healing Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): LangGraph State Machine & Live SSE Telemetry */}
        <div className="lg:col-span-5 bg-[#111625] rounded-lg border border-[#2B3E58] flex flex-col h-[520px]">
          {/* Header */}
          <div className="bg-[#1C2538] px-4 py-2 border-b border-[#2B3E58] flex items-center justify-between text-xs font-mono text-gray-300">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>LANGGRAPH SSE STREAM</span>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
              {status}
            </span>
          </div>

          {/* Action Logs Box */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 font-mono text-[11px] leading-relaxed text-gray-300">
            {events.length === 0 ? (
              <div className="text-gray-500 text-center py-16">
                Waiting for agent execution events...
              </div>
            ) : (
              events.map((ev, idx) => {
                const isChaos = ev.step_name.includes('CHAOS') || ev.status === 'RETRYING';
                const isSuccess = ev.status === 'COMPLETED' || ev.status === 'HEALED';
                const isOtp = ev.status === 'AWAITING_OTP';

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border ${
                      isChaos ? 'bg-red-950/40 border-red-800 text-red-200' :
                      isOtp ? 'bg-amber-950/40 border-amber-700 text-amber-200' :
                      isSuccess ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200' :
                      'bg-gray-900 border-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 mb-0.5">
                      <span className="font-bold uppercase tracking-wider">{ev.step_name}</span>
                      <span>{ev.timestamp_utc.slice(11, 19)}</span>
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
            <div ref={logsEndRef} />
          </div>

          {/* Bottom Human-in-the-Loop OTP Gate Trigger */}
          {status === 'AWAITING_OTP' && (
            <div className="bg-[#1C2538] border-t border-[#2B3E58] p-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-semibold font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>Human-in-the-Loop Citizen Authorization Gate</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans">
                Agent halted. Enter demo OTP <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">719340</code> to confirm filing.
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="w-28 bg-[#111625] border border-gray-700 rounded px-2 py-1 text-center font-mono font-bold text-white text-sm tracking-widest focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAuthorizeOtp}
                  disabled={isSubmittingOtp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1 text-xs font-bold font-mono transition-colors disabled:opacity-50"
                >
                  {isSubmittingOtp ? 'Authorizing...' : 'Authorize Submission'}
                </button>
              </div>
            </div>
          )}

          {/* Stamped Receipt Confirmation */}
          {receiptAck && (
            <div className="bg-emerald-950/70 border-t border-emerald-700 p-3 text-xs font-mono text-emerald-200">
              <div className="flex items-center space-x-1.5 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL STAMPED RECEIPT GENERATED</span>
              </div>
              <div>Ref: <strong className="text-white">{receiptAck}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
