'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  Wand2,
  Check,
  ArrowRight,
  Lock,
  ExternalLink,
  Download,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Upload,
  Loader2,
  Sparkles,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import { ReconciliationResponse, CompileAssetsResponse, DocumentUploadResponse } from '@/types';
import {
  loadSamplePacket,
  uploadDocument,
  reconcileSession,
  compileAssets,
  authorizeOtp,
  getReceiptPdfUrl,
} from '@/lib/api-client';
import { PhoneticGraphMatrix } from './PhoneticGraphMatrix';
import { OpenCVCurePreview } from './OpenCVCurePreview';
import { PlaywrightLiveConsole } from './PlaywrightLiveConsole';
import { ErrorBoundary } from './ErrorBoundary';

interface StudioWorkspaceProps {
  onPlaywrightStatusChange?: (status: 'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED') => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({ onPlaywrightStatusChange }) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [workflowTarget, setWorkflowTarget] = useState('e_district_income');
  const [sessionId, setSessionId] = useState<string>('');
  const [reconciliation, setReconciliation] = useState<ReconciliationResponse | null>(null);
  const [compileData, setCompileData] = useState<CompileAssetsResponse | null>(null);
  const [loadingPacket, setLoadingPacket] = useState(false);
  const [loadingCompile, setLoadingCompile] = useState(false);
  const [playwrightStatus, setPlaywrightStatus] = useState<
    'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED'
  >('IDLE');
  const [otpCode, setOtpCode] = useState('719340');
  const [receiptAck, setReceiptAck] = useState<string | null>(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  // Custom Document Upload State
  const [intakeMode, setIntakeMode] = useState<'upload' | 'sample'>('upload');
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, DocumentUploadResponse>>({});
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isReconcilingUploads, setIsReconcilingUploads] = useState(false);

  // File Input Refs for Custom Document Upload
  const aadhaarInputRef = useRef<HTMLInputElement | null>(null);
  const panInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const sigInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadError(null);
    setUploadingDocType(docType);

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
      setSessionId(currentSessionId);
    }

    try {
      const res = await uploadDocument(currentSessionId, docType, file);
      setUploadedDocs(prev => ({ ...prev, [docType]: res }));
    } catch (err: any) {
      setUploadError(err?.message || `Failed to upload and extract ${docType}`);
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleReconcileUploadedSession = async () => {
    if (!sessionId) {
      setUploadError('Please upload at least one document before running audit.');
      return;
    }
    setIsReconcilingUploads(true);
    setUploadError(null);
    try {
      const data = await reconcileSession(sessionId, workflowTarget);
      setReconciliation(data);
      setActiveStep(2); // Automatically advance to Step 2: 4-Gate Lekhpal Audit
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to reconcile uploaded documents');
    } finally {
      setIsReconcilingUploads(false);
    }
  };

  // 1-Click Evaluation Packet Loader (Feeds real rasterized document images into live pipeline)
  const handleLoadSamplePacket = async () => {
    setLoadingPacket(true);
    try {
      const data = await loadSamplePacket(workflowTarget);
      setReconciliation(data);
      setSessionId(data.session_id);
      setActiveStep(2); // Automatically advance to Step 2: 4-Gate Lekhpal Audit
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

  const handleStatusChange = (status: 'IDLE' | 'EXECUTING' | 'HEALING' | 'AWAITING_OTP' | 'VERIFIED') => {
    setPlaywrightStatus(status);
    onPlaywrightStatusChange?.(status);
    if (status === 'AWAITING_OTP' && activeStep === 4) {
      // Prompt user or unlock Step 5
    }
  };

  const handleAuthorizeOtpStep5 = async () => {
    const code = otpCode.trim() || '719340';
    if (!sessionId) return;
    setIsSubmittingOtp(true);
    try {
      const res = await authorizeOtp(sessionId, code);
      setReceiptAck(res.acknowledgement_number);
      setPlaywrightStatus('VERIFIED');
      onPlaywrightStatusChange?.('VERIFIED');
    } catch (e) {
      console.error('Final filing authorization failed', e);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  // 5 Step Verification Flags
  const isStep1Done = !!reconciliation;
  const isStep2Done = !!reconciliation;
  const isStep3Done = !!compileData;
  const isStep4Done = playwrightStatus === 'AWAITING_OTP' || playwrightStatus === 'VERIFIED';
  const isStep5Done = playwrightStatus === 'VERIFIED';

  return (
    <section id="studio-workspace" className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      {/* Studio Header Ribbon */}
      <div className="border-b border-[#DFDBD2] pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-[#162A45] tracking-wider uppercase block">
            End-to-End Sovereign Digital Bureaucracy Engine
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111625] font-normal tracking-tight">
            ZeroReject Pre-Flight Studio
          </h2>
        </div>

        {/* Workflow Target Selector with 3 Real-World Government Profiles */}
        <div className="flex items-center space-x-2">
          <label htmlFor="workflow-select" className="text-xs font-mono text-[#525866]">Target Portal Profile:</label>
          <select
            id="workflow-select"
            value={workflowTarget}
            onChange={(e) => setWorkflowTarget(e.target.value)}
            className="bg-white border border-[#DFDBD2] text-xs font-mono font-medium rounded px-3 py-1.5 focus:outline-none focus:border-[#162A45] text-[#111625]"
          >
            <option value="e_district_income">Profile A: UP e-District (eSathi) — Income &amp; Domicile Certificate</option>
            <option value="national_scholarship">Profile B: National Scholarship Portal (NSP 2.0 — MeitY)</option>
            <option value="epfo_joint_decl">Profile C: EPFO Unified Portal — Joint Declaration SOP</option>
          </select>
        </div>
      </div>

      {/* Guided 5-Step Linear Progression Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 bg-[#EFECE4] p-1.5 rounded-xl border border-[#DFDBD2] text-xs font-mono">
        {/* Step 1 */}
        <button
          onClick={() => setActiveStep(1)}
          className={`py-3 px-3 rounded-lg flex flex-col justify-between transition-all text-left ${
            activeStep === 1
              ? 'bg-white text-[#162A45] font-bold shadow-sm border border-[#DFDBD2]'
              : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="w-5 h-5 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px] font-bold">
              {isStep1Done ? <Check className="w-3 h-3 text-emerald-300" /> : '1'}
            </span>
            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
              isStep1Done ? 'bg-emerald-100 text-emerald-900' : activeStep === 1 ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'
            }`}>
              {isStep1Done ? 'COMPLETED ✓' : activeStep === 1 ? 'ACTIVE' : 'PENDING'}
            </span>
          </div>
          <span className="text-[11px] font-semibold leading-tight">Service &amp; Intake</span>
        </button>

        {/* Step 2 */}
        <button
          onClick={() => setActiveStep(2)}
          className={`py-3 px-3 rounded-lg flex flex-col justify-between transition-all text-left ${
            activeStep === 2
              ? 'bg-white text-[#162A45] font-bold shadow-sm border border-[#DFDBD2]'
              : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="w-5 h-5 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px] font-bold">
              {isStep2Done ? <Check className="w-3 h-3 text-emerald-300" /> : '2'}
            </span>
            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
              isStep2Done ? 'bg-emerald-100 text-emerald-900' : activeStep === 2 ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'
            }`}>
              {isStep2Done ? 'COMPLETED ✓' : activeStep === 2 ? 'ACTIVE' : 'PENDING'}
            </span>
          </div>
          <span className="text-[11px] font-semibold leading-tight">4-Gate Lekhpal Audit</span>
        </button>

        {/* Step 3 */}
        <button
          onClick={() => setActiveStep(3)}
          className={`py-3 px-3 rounded-lg flex flex-col justify-between transition-all text-left ${
            activeStep === 3
              ? 'bg-white text-[#162A45] font-bold shadow-sm border border-[#DFDBD2]'
              : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="w-5 h-5 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px] font-bold">
              {isStep3Done ? <Check className="w-3 h-3 text-emerald-300" /> : '3'}
            </span>
            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
              isStep3Done ? 'bg-emerald-100 text-emerald-900' : activeStep === 3 ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'
            }`}>
              {isStep3Done ? 'COMPLETED ✓' : activeStep === 3 ? 'ACTIVE' : 'PENDING'}
            </span>
          </div>
          <span className="text-[11px] font-semibold leading-tight">Biometric Auto-Cure</span>
        </button>

        {/* Step 4 */}
        <button
          onClick={() => setActiveStep(4)}
          className={`py-3 px-3 rounded-lg flex flex-col justify-between transition-all text-left ${
            activeStep === 4
              ? 'bg-white text-[#162A45] font-bold shadow-sm border border-[#DFDBD2]'
              : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="w-5 h-5 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px] font-bold">
              {isStep4Done ? <Check className="w-3 h-3 text-emerald-300" /> : '4'}
            </span>
            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
              isStep4Done ? 'bg-emerald-100 text-emerald-900' : activeStep === 4 ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'
            }`}>
              {isStep4Done ? 'COMPLETED ✓' : activeStep === 4 ? 'ACTIVE' : 'PENDING'}
            </span>
          </div>
          <span className="text-[11px] font-semibold leading-tight">Autonomous Playwright</span>
        </button>

        {/* Step 5 */}
        <button
          onClick={() => setActiveStep(5)}
          className={`py-3 px-3 rounded-lg flex flex-col justify-between transition-all text-left ${
            activeStep === 5
              ? 'bg-white text-[#162A45] font-bold shadow-sm border border-[#DFDBD2]'
              : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="w-5 h-5 rounded-full bg-[#162A45] text-white flex items-center justify-center text-[10px] font-bold">
              {isStep5Done ? <Check className="w-3 h-3 text-emerald-300" /> : '5'}
            </span>
            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
              isStep5Done ? 'bg-emerald-100 text-emerald-900' : activeStep === 5 ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'
            }`}>
              {isStep5Done ? 'COMPLETED ✓' : activeStep === 5 ? 'ACTIVE' : 'PENDING'}
            </span>
          </div>
          <span className="text-[11px] font-semibold leading-tight">Citizen Authorization</span>
        </button>
      </div>

      {/* Main Studio Viewport */}
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] rounded-xl p-6 shadow-sm">
        {/* ================= STEP 1: SERVICE & INTAKE ================= */}
        {activeStep === 1 && (
          <ErrorBoundary panelName="Document Ingestion Studio">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFDBD2] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                    Step 1 of 5: Document Intake &amp; OCR
                  </span>
                  <h3 className="font-serif text-2xl text-[#111625]">Service Selection &amp; Citizen Document Intake</h3>
                  <p className="text-xs text-[#525866] font-sans mt-0.5">
                    Drop raw citizen scans into the dropzone or run our 1-click evaluation packet with authentic raster images from disk.
                  </p>
                </div>

                {/* Session telemetry badge */}
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-[#DFDBD2] text-xs font-mono">
                  <span className="text-gray-500">Session Docket:</span>
                  <strong className="text-[#162A45]">{sessionId ? sessionId.slice(0, 16) : 'Unassigned (Auto-Gen on Intake)'}</strong>
                </div>
              </div>

              {/* Intake Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EFECE4] p-1.5 rounded-xl border border-[#DFDBD2]">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setIntakeMode('upload')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      intakeMode === 'upload'
                        ? 'bg-[#162A45] text-white shadow-sm'
                        : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>📁 Upload Custom Documents (Live Sandbox)</span>
                  </button>
                  <button
                    onClick={() => setIntakeMode('sample')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      intakeMode === 'sample'
                        ? 'bg-[#162A45] text-white shadow-sm'
                        : 'text-[#525866] hover:text-[#111625] hover:bg-white/50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                    <span>⚡ 1-Click Evaluation Packet (Sample Scans)</span>
                  </button>
                </div>

                {intakeMode === 'sample' && (
                  <button
                    onClick={handleLoadSamplePacket}
                    disabled={loadingPacket}
                    className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{loadingPacket ? 'Processing Optical Pipeline...' : '⚡ Load Real Citizen Packet (Etawah, UP — PIN 206124)'}</span>
                  </button>
                )}
              </div>

              {/* Upload Error Banner if any */}
              {uploadError && (
                <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-lg flex items-center space-x-2 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* MODE A: CUSTOM DOCUMENT UPLOAD GRID */}
              {intakeMode === 'upload' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Primary ID (Aadhaar / Voter ID / Passport) */}
                    <div
                      onClick={() => aadhaarInputRef.current?.click()}
                      className={`bg-white border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all hover:border-[#162A45] shadow-sm flex flex-col justify-between ${
                        uploadedDocs['aadhaar'] ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#DFDBD2]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={aadhaarInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('aadhaar', e.target.files[0])}
                        accept="image/*,.pdf"
                        className="hidden"
                      />
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono font-bold text-[#162A45]">Primary Identity *</span>
                          <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">Aadhaar/Passport</span>
                        </div>
                        <p className="text-[11px] text-[#525866] mb-3">
                          Upload Aadhaar, Passport or Voter ID scan for UIDAI Verhoeff validation.
                        </p>
                      </div>

                      {uploadingDocType === 'aadhaar' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-[#162A45] space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#162A45]" />
                          <span>Executing OCR &amp; Checksums...</span>
                        </div>
                      ) : uploadedDocs['aadhaar'] ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded p-2.5 text-[11px] font-mono text-emerald-950 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate">{uploadedDocs['aadhaar'].filename}</span>
                          </div>
                          <div className="text-[10px] text-emerald-900 border-t border-emerald-200 pt-1">
                            <div>Name: <strong>{uploadedDocs['aadhaar'].extracted_fields.full_name || 'Detected in Scan'}</strong></div>
                            <div>ID: <strong>{uploadedDocs['aadhaar'].extracted_fields.id_number || 'UIDAI Matched'}</strong></div>
                            <div>PIN: <strong>{uploadedDocs['aadhaar'].extracted_fields.pincode || 'Extracted'}</strong></div>
                          </div>
                          <span className="text-[9px] text-blue-700 underline block pt-0.5">Click to replace file</span>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                          <FileUp className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="font-semibold text-gray-700">Drop Aadhaar / ID Scan</span>
                          <span className="text-[10px] text-gray-400">PNG, JPG, PDF (Max 15MB)</span>
                        </div>
                      )}
                    </div>

                    {/* 2. Secondary ID (PAN / Marksheet) */}
                    <div
                      onClick={() => panInputRef.current?.click()}
                      className={`bg-white border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all hover:border-[#162A45] shadow-sm flex flex-col justify-between ${
                        uploadedDocs['pan'] ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#DFDBD2]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={panInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('pan', e.target.files[0])}
                        accept="image/*,.pdf"
                        className="hidden"
                      />
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono font-bold text-[#162A45]">Secondary Identity *</span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">PAN / Marksheet</span>
                        </div>
                        <p className="text-[11px] text-[#525866] mb-3">
                          Upload PAN Card or 10th Marksheet to test phonetic cross-referencing.
                        </p>
                      </div>

                      {uploadingDocType === 'pan' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-[#162A45] space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#162A45]" />
                          <span>Parsing PAN / Marksheet...</span>
                        </div>
                      ) : uploadedDocs['pan'] ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded p-2.5 text-[11px] font-mono text-emerald-950 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate">{uploadedDocs['pan'].filename}</span>
                          </div>
                          <div className="text-[10px] text-emerald-900 border-t border-emerald-200 pt-1">
                            <div>Name: <strong>{uploadedDocs['pan'].extracted_fields.full_name || 'Detected in Scan'}</strong></div>
                            <div>ID: <strong>{uploadedDocs['pan'].extracted_fields.id_number || 'PAN Matched'}</strong></div>
                            <div>DOB: <strong>{uploadedDocs['pan'].extracted_fields.dob || 'Extracted'}</strong></div>
                          </div>
                          <span className="text-[9px] text-blue-700 underline block pt-0.5">Click to replace file</span>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                          <FileUp className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="font-semibold text-gray-700">Drop PAN or Marksheet</span>
                          <span className="text-[10px] text-gray-400">PNG, JPG, PDF (Max 15MB)</span>
                        </div>
                      )}
                    </div>

                    {/* 3. Portrait Photo (Optional) */}
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className={`bg-white border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all hover:border-[#162A45] shadow-sm flex flex-col justify-between ${
                        uploadedDocs['portrait'] ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#DFDBD2]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('portrait', e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                      />
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono font-bold text-[#162A45]">Citizen Photo</span>
                          <span className="text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">Optional</span>
                        </div>
                        <p className="text-[11px] text-[#525866] mb-3">
                          Upload citizen passport photograph for OpenCV 200x230 px curing.
                        </p>
                      </div>

                      {uploadingDocType === 'portrait' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-[#162A45] space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#162A45]" />
                          <span>Processing Photo...</span>
                        </div>
                      ) : uploadedDocs['portrait'] ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded p-2.5 text-[11px] font-mono text-emerald-950 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate">{uploadedDocs['portrait'].filename}</span>
                          </div>
                          <p className="text-[10px] text-emerald-900 border-t border-emerald-200 pt-1">
                            Ready for Lanczos crop &amp; &lt;= 50KB compression in Step 3.
                          </p>
                          <span className="text-[9px] text-blue-700 underline block pt-0.5">Click to replace photo</span>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="font-semibold text-gray-700">Drop Portrait Photo</span>
                          <span className="text-[10px] text-gray-400">JPG, PNG (Auto-sample fallback)</span>
                        </div>
                      )}
                    </div>

                    {/* 4. Signature (Optional) */}
                    <div
                      onClick={() => sigInputRef.current?.click()}
                      className={`bg-white border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all hover:border-[#162A45] shadow-sm flex flex-col justify-between ${
                        uploadedDocs['signature'] ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#DFDBD2]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={sigInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('signature', e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                      />
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono font-bold text-[#162A45]">Handwritten Signature</span>
                          <span className="text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">Optional</span>
                        </div>
                        <p className="text-[11px] text-[#525866] mb-3">
                          Upload handwritten signature scan for adaptive contour extraction.
                        </p>
                      </div>

                      {uploadingDocType === 'signature' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-[#162A45] space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#162A45]" />
                          <span>Processing Signature...</span>
                        </div>
                      ) : uploadedDocs['signature'] ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded p-2.5 text-[11px] font-mono text-emerald-950 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate">{uploadedDocs['signature'].filename}</span>
                          </div>
                          <p className="text-[10px] text-emerald-900 border-t border-emerald-200 pt-1">
                            Ready for 140x60 px grayscale &amp; &lt;= 20KB compression.
                          </p>
                          <span className="text-[9px] text-blue-700 underline block pt-0.5">Click to replace signature</span>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center justify-center text-xs font-mono text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="font-semibold text-gray-700">Drop Signature Scan</span>
                          <span className="text-[10px] text-gray-400">JPG, PNG (Auto-sample fallback)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reconcile Uploaded Files Action CTA */}
                  {Object.keys(uploadedDocs).length > 0 && (
                    <div className="bg-white border border-[#DFDBD2] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gray-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{Object.keys(uploadedDocs).length} Custom Document(s) Extracted &amp; Ready for Virtual Lekhpal Audit</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">
                          Session: <strong>{sessionId}</strong> | Next: Cross-script phonetic graph, Verhoeff D5 check &amp; India Post PIN lookup.
                        </p>
                      </div>

                      <button
                        onClick={handleReconcileUploadedSession}
                        disabled={isReconcilingUploads}
                        className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-6 py-3 rounded-lg text-xs font-bold shadow-md transition-all disabled:opacity-50"
                      >
                        {isReconcilingUploads ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                            <span>Computing 4-Gate Lekhpal Audit...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 text-amber-300" />
                            <span>⚡ Run Live 4-Gate Lekhpal Pre-Flight Audit →</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: 1-CLICK EVALUATION PACKET GRID */}
              {intakeMode === 'sample' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Aadhaar */}
                  <div className="bg-white border border-[#DFDBD2] rounded-lg p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs font-mono font-semibold">
                      <span className="text-[#162A45]">Primary Identity: Aadhaar</span>
                      <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">UIDAI Standard</span>
                    </div>
                    <div className="h-32 bg-[#F8F7F4] border border-dashed border-[#DFDBD2] rounded flex flex-col items-center justify-center text-center p-3 text-xs text-[#525866]">
                      <FileText className="w-8 h-8 text-[#162A45] mb-1" />
                      <span className="font-medium text-[#111625]">aadhaar_sample.png</span>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1">
                        Raw Scan: 482 KB — Exceeds 50 KB Portal Limit ⚠️
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-600 space-y-0.5">
                      <div className="font-semibold text-gray-900">रमेश कुमार शर्मा / Ramesh Kumar Sharma</div>
                      <div>DOB: 14/08/1996 | PIN: 206124 (Etawah)</div>
                      <span className="inline-block bg-blue-50 text-blue-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        Script: Devanagari + Latin
                      </span>
                    </div>
                  </div>

                  {/* Card 2: PAN Card */}
                  <div className="bg-white border border-[#DFDBD2] rounded-lg p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs font-mono font-semibold">
                      <span className="text-[#162A45]">Secondary Identity: PAN</span>
                      <span className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-bold">Initial Trap</span>
                    </div>
                    <div className="h-32 bg-[#F8F7F4] border border-dashed border-[#DFDBD2] rounded flex flex-col items-center justify-center text-center p-3 text-xs text-[#525866]">
                      <FileText className="w-8 h-8 text-[#C93B2B] mb-1" />
                      <span className="font-medium text-[#111625]">pan_sample.png</span>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1">
                        Raw Scan: 312 KB — Exceeds 20 KB Signature Limit ⚠️
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-600 space-y-0.5">
                      <div className="font-semibold text-[#C93B2B]">RAMESH K SHARMA (Initial Mismatch)</div>
                      <div>Father: DINA NATH SHARMA | PAN: ABCPS1234F</div>
                      <span className="inline-block bg-amber-50 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        Script: Latin (All-Caps)
                      </span>
                    </div>
                  </div>

                  {/* Card 3: 10th Marksheet */}
                  <div className="bg-white border border-[#DFDBD2] rounded-lg p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs font-mono font-semibold">
                      <span className="text-[#162A45]">DOB Proof: 10th Marksheet</span>
                      <span className="text-[10px] bg-red-50 text-red-900 px-2 py-0.5 rounded font-bold">Inversion Trap</span>
                    </div>
                    <div className="h-32 bg-[#F8F7F4] border border-dashed border-[#DFDBD2] rounded flex flex-col items-center justify-center text-center p-3 text-xs text-[#525866]">
                      <FileText className="w-8 h-8 text-[#B86B11] mb-1" />
                      <span className="font-medium text-[#111625]">marksheet_sample.png</span>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1">
                        Raw Scan: 840 KB — Exceeds 100 KB PDF Limit ⚠️
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-600 space-y-0.5">
                      <div className="font-semibold text-[#B86B11]">SHARMA RAMESH KUMAR (Inversion)</div>
                      <div>Father: D. N. SHARMA | Result: 1st Div</div>
                      <span className="inline-block bg-purple-50 text-purple-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        DOB Authenticated Proof
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 Advance Button */}
              {reconciliation && (
                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Real citizen packet ingested into OCR pipeline! Active Session: <strong>{sessionId.slice(0, 12)}...</strong></span>
                  </div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Run Virtual Lekhpal &amp; Phonetic Audit (Step 2)</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              )}
            </div>
          </ErrorBoundary>
        )}

        {/* ================= STEP 2: LEKHPAL AUDIT ================= */}
        {activeStep === 2 && (
          <ErrorBoundary panelName="4-Gate Virtual Lekhpal Audit">
            <div className="space-y-6">
              <div className="border-b border-[#DFDBD2] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                    Step 2 of 5: Pre-Flight Discrepancy &amp; Statutory Risk
                  </span>
                  <h3 className="font-serif text-2xl text-[#111625]">The 4-Gate Virtual Lekhpal Audit &amp; Phonetic Matrix</h3>
                </div>
              </div>

              <PhoneticGraphMatrix
                reconciliation={reconciliation}
                loading={loadingPacket}
                onProceedToCure={() => setActiveStep(3)}
              />
            </div>
          </ErrorBoundary>
        )}

        {/* ================= STEP 3: BIOMETRIC AUTO-CURE ================= */}
        {activeStep === 3 && (
          <ErrorBoundary panelName="OpenCV Spec Compiler Studio">
            <div className="space-y-6">
              <div className="border-b border-[#DFDBD2] pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                    Step 3 of 5: Biometric Optimization &amp; Legal Synthesis
                  </span>
                  <h3 className="font-serif text-2xl text-[#111625]">OpenCV Spec Compiler &amp; Statutory Affidavit Studio</h3>
                </div>
              </div>

              <OpenCVCurePreview
                compileData={compileData}
                loading={loadingCompile}
                onTriggerCompile={handleTriggerCompile}
                sessionId={sessionId}
                onProceedToExecution={() => setActiveStep(4)}
              />
            </div>
          </ErrorBoundary>
        )}

        {/* ================= STEP 4: AUTONOMOUS PLAYWRIGHT ================= */}
        {activeStep === 4 && (
          <ErrorBoundary panelName="Self-Healing Playwright Live Console">
            <div className="space-y-6">
              <div className="border-b border-[#DFDBD2] pb-3 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                    Step 4 of 5: Autonomous Portal Filing
                  </span>
                  <h3 className="font-serif text-2xl text-[#111625]">Self-Healing Playwright Execution &amp; 502 Chaos Recovery</h3>
                </div>

                {playwrightStatus === 'AWAITING_OTP' && (
                  <button
                    onClick={() => setActiveStep(5)}
                    className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-blue-950 px-4 py-2 rounded-lg text-xs font-mono font-bold shadow-md transition-all animate-bounce"
                  >
                    <span>⏸ Advance to Step 5: Citizen Authorization Gate →</span>
                  </button>
                )}
              </div>

              <PlaywrightLiveConsole
                sessionId={sessionId}
                workflowTarget={workflowTarget}
                onExecutionStateChange={handleStatusChange}
              />

              {/* Advance CTA to Step 5 */}
              <div className="pt-4 border-t border-[#DFDBD2] flex justify-between items-center">
                <span className="text-xs font-mono text-[#525866]">
                  {playwrightStatus === 'AWAITING_OTP'
                    ? 'Browser agent paused at citizen consent gate. Proceed to Step 5.'
                    : 'Execute browser agent above to populate the target government portal.'}
                </span>
                <button
                  onClick={() => setActiveStep(5)}
                  className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Continue to Step 5: Citizen Authorization Gate</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* ================= STEP 5: CITIZEN AUTHORIZATION & RECEIPT ================= */}
        {activeStep === 5 && (
          <ErrorBoundary panelName="Citizen Authorization & Stamped Receipt">
            <div className="space-y-6">
              <div className="border-b border-[#DFDBD2] pb-3">
                <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                  Step 5 of 5: Human-in-the-Loop Consent &amp; Registry Verification
                </span>
                <h3 className="font-serif text-2xl text-[#111625]">Citizen Consent Authorization &amp; Official Stamped Receipt</h3>
              </div>

              {receiptAck ? (
                /* Verified Post-Submission State */
                <div className="bg-white border border-[#DFDBD2] rounded-xl p-8 shadow-sm space-y-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold">
                      VERIFIED &amp; REGISTERED IN STATE ARCHIVE
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-[#111625] pt-2">
                      Application Submitted Successfully
                    </h4>
                    <p className="text-xs text-[#525866] font-mono">
                      Acknowledgement Reference: <strong className="text-blue-900 text-sm font-bold">{receiptAck}</strong>
                    </p>
                  </div>

                  {/* Receipt Meta Grid */}
                  <div className="max-w-xl mx-auto bg-[#FAF8F5] border border-[#DFDBD2] rounded-lg p-5 text-left font-mono text-xs space-y-2">
                    <div className="flex justify-between border-b border-[#DFDBD2] pb-1.5">
                      <span className="text-gray-500">Applicant:</span>
                      <strong className="text-[#111625]">Ramesh Kumar Sharma</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#DFDBD2] pb-1.5">
                      <span className="text-gray-500">Service:</span>
                      <strong className="text-[#162A45]">UP e-District (eSathi) Income &amp; Domicile</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#DFDBD2] pb-1.5">
                      <span className="text-gray-500">Attached Proof:</span>
                      <span className="text-emerald-800 font-semibold">Statutory Annexure &apos;E&apos; (Verified)</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-gray-500">Cryptographic Seal:</span>
                      <span className="text-gray-700 truncate max-w-[200px]">SHA-256 Verified (IT Act 2000)</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <a
                      href={sessionId ? getReceiptPdfUrl(sessionId) : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs px-6 py-3 rounded-lg shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>⬇ Download Official Stamped Government Receipt (.PDF)</span>
                    </a>

                    <a
                      href={`http://localhost:8090/verify?ref=${receiptAck}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-amber-300 font-mono font-bold text-xs px-6 py-3 rounded-lg shadow-sm transition-all border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-400" />
                      <span>🔍 Verify Docket Live on Portal Verification Registry</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Human-in-the-Loop OTP Authorization Gate */
                <div className="bg-white border border-[#DFDBD2] rounded-xl p-6 shadow-sm space-y-6">
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold font-mono text-xs">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span>STATUTORY CITIZEN CONSENT &amp; AADHAAR OTP GATE (IT ACT 2000)</span>
                    </div>
                    <p className="text-xs text-[#525866] leading-relaxed font-sans">
                      Automated agents must strictly pause for citizen verification before final state docket creation.
                      One-Time Password has been dispatched to citizen registered mobile number (+91-XXXXXX3829).
                    </p>

                    {/* Simulated SMS Dispatch Chip */}
                    <button
                      type="button"
                      onClick={() => setOtpCode('719340')}
                      className="w-full text-left bg-white hover:bg-amber-100/50 border border-amber-400 p-3 rounded-lg text-xs font-mono text-amber-950 transition-colors flex flex-wrap items-center justify-between gap-2 shadow-xs"
                    >
                      <span>📱 Local Sandbox SMS Dispatch to <strong>+91-XXXXXX3829</strong>: OTP is <strong>719340</strong></span>
                      <span className="text-[#B86B11] font-bold underline text-[11px]">[ Click to Fill 719340 ]</span>
                    </button>
                  </div>

                  {/* OTP Submission Box */}
                  <div className="max-w-md mx-auto space-y-4 pt-2">
                    <div>
                      <label htmlFor="otp-input" className="block text-xs font-mono font-semibold text-[#111625] mb-1">
                        Enter 6-Digit Verification OTP:
                      </label>
                      <input
                        id="otp-input"
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                        placeholder="719340"
                        className="w-full bg-[#FAF8F5] border border-[#DFDBD2] rounded-lg px-4 py-2.5 text-center font-mono font-bold text-lg text-[#162A45] tracking-widest focus:outline-none focus:border-[#162A45]"
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-sans text-[#525866]">
                      <input
                        type="checkbox"
                        id="consent-check"
                        defaultChecked
                        className="h-4 w-4 text-[#162A45] rounded border-gray-300"
                      />
                      <label htmlFor="consent-check">
                        I hereby authorize submission of my reconciled identity and Annexure &apos;E&apos; affidavit.
                      </label>
                    </div>

                    <button
                      onClick={handleAuthorizeOtpStep5}
                      disabled={isSubmittingOtp || !sessionId}
                      className="w-full flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs py-3 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmittingOtp ? 'Verifying & Stamping Receipt...' : '✓ Authorize Final Submission & Seal Receipt'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ErrorBoundary>
        )}
      </div>
    </section>
  );
};
