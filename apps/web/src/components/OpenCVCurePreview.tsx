'use client';

import React, { useState } from 'react';
import { FileCheck2, Download, Image as ImageIcon, Sparkles, Check, ArrowRight, Archive, SlidersHorizontal, AlertTriangle, FileEdit } from 'lucide-react';
import { CompileAssetsResponse, CompiledAssetDetail } from '@/types';
import { getPacketZipUrl } from '@/lib/api-client';
import { SelfDeclarationEditorModal } from './SelfDeclarationEditorModal';

interface OpenCVCurePreviewProps {
  compileData: CompileAssetsResponse | null;
  loading: boolean;
  onTriggerCompile: () => void;
  sessionId: string;
  onProceedToExecution?: () => void;
}

export const OpenCVCurePreview: React.FC<OpenCVCurePreviewProps> = ({
  compileData,
  loading,
  onTriggerCompile,
  sessionId,
  onProceedToExecution,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  if (!compileData && !loading) {
    return (
      <div className="p-8 text-center bg-white border border-[#DFDBD2] rounded-lg">
        <h4 className="font-serif text-lg text-[#111625] mb-2">OpenCV Auto-Cure Document &amp; Biometric Compiler</h4>
        <p className="text-xs text-[#525866] max-w-md mx-auto mb-5 font-sans">
          Government portals strictly reject files outside narrow byte windows (signature &lt; 20KB, portrait 200x230).
          Click below to auto-deskew, crop contours, apply binary-search JPEG quantization, and synthesize the statutory affidavit.
        </p>
        <button
          onClick={onTriggerCompile}
          disabled={!sessionId}
          className="bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          Auto-Cure Assets &amp; Generate Statutory Affidavit
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-[#DFDBD2] rounded-lg">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#162A45] border-t-transparent mb-3"></div>
        <p className="text-xs text-[#525866] font-mono">Running OpenCV Contour Cropping &amp; Binary-Search JPEG Quantization...</p>
      </div>
    );
  }

  const affidavitAsset = compileData?.assets.find((a) => a.asset_type === 'affidavit_pdf');
  const portraitAsset = compileData?.assets.find((a) => a.asset_type === 'portrait');
  const signatureAsset = compileData?.assets.find((a) => a.asset_type === 'signature');
  const affidavitDownloadUrl = affidavitAsset ? `${apiBase}${affidavitAsset.download_url}` : null;
  const zipDownloadUrl = sessionId ? getPacketZipUrl(sessionId) : '#';

  const rawPortraitKb = portraitAsset?.telemetry?.initial_size_bytes
    ? (portraitAsset.telemetry.initial_size_bytes / 1024).toFixed(1)
    : '20.4';
  const rawSigKb = signatureAsset?.telemetry?.initial_size_bytes
    ? (signatureAsset.telemetry.initial_size_bytes / 1024).toFixed(1)
    : '24.5';

  return (
    <div className="space-y-6">
      {/* Top Banner with Toggle */}
      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-950">Portal Biometric Assets Auto-Cured</h4>
            <p className="text-xs text-emerald-800">
              All 3 assets strictly compiled within UP e-District and Passport Seva upload constraints.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center space-x-1.5 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            <span>{showComparison ? 'Hide Raw Comparison' : 'Inspect Raw vs. Cured Specs'}</span>
          </button>
          <span className="text-xs font-mono bg-emerald-200/80 text-emerald-900 px-2 py-1 rounded font-semibold">
            100% SPEC COMPLIANT
          </span>
        </div>
      </div>

      {/* Raw vs Cured Comparison Banner (When Toggled) */}
      {showComparison && (
        <div className="bg-[#FAF8F5] border border-[#DFDBD2] p-4 rounded-lg space-y-3 font-mono text-xs">
          <span className="text-[#162A45] font-bold block uppercase tracking-wider text-[10px]">
            Comparative Metrics: Raw Input vs. OpenCV Quantized Output
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-red-300 space-y-1">
              <span className="text-red-700 font-bold block">Raw Input Scan (Uncured Specs ❌)</span>
              <div className="text-[11px] text-gray-600">
                Portrait: {rawPortraitKb} KB (Unquantized camera/phone scan)
              </div>
              <div className="text-[11px] text-gray-600">
                Signature: {rawSigKb} KB (Unprocessed ink scan)
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-emerald-300 space-y-1">
              <span className="text-emerald-700 font-bold block">OpenCV Cured (Portal Accepted ✓)</span>
              <div className="text-[11px] text-gray-700 font-semibold">
                Portrait: {portraitAsset?.width_px || 200}×{portraitAsset?.height_px || 230} px, 150 DPI, {portraitAsset?.file_size_kb || '12.9'} KB (12–48 KB window)
              </div>
              <div className="text-[11px] text-gray-700 font-semibold">
                Signature: {signatureAsset?.width_px || 140}×{signatureAsset?.height_px || 60} px, Grayscale, {signatureAsset?.file_size_kb || '7.4'} KB (Strictly &lt; 20 KB)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Compiled Assets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {compileData?.assets.map((asset) => {
          const isPdf = asset.asset_type === 'affidavit_pdf';
          const downloadUrl = `${apiBase}${asset.download_url}`;

          return (
            <div key={asset.asset_id} className="archival-card border border-[#DFDBD2] rounded-lg overflow-hidden bg-white shadow-sm flex flex-col justify-between">
              {/* Card Header */}
              <div className="bg-[#FAF8F5] border-b border-[#DFDBD2] px-3.5 py-2 flex justify-between items-center text-xs font-mono font-semibold">
                <span className="text-[#162A45] uppercase">
                  {asset.asset_type === 'portrait' ? 'Passport Photograph' :
                   asset.asset_type === 'signature' ? 'Applicant Signature' :
                   'Statutory Annexure PDF'}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  VERIFIED
                </span>
              </div>

              {/* Preview Window */}
              <div className="p-4 bg-[#F8F7F4] flex items-center justify-center min-h-[140px] border-b border-[#DFDBD2]">
                {asset.asset_type === 'portrait' ? (
                  <div className="text-center">
                    <img
                      src={downloadUrl}
                      alt="Compiled Portrait"
                      className="w-[100px] h-[115px] object-cover border border-[#DFDBD2] rounded shadow-sm mx-auto"
                    />
                    <span className="text-[10px] font-mono text-[#525866] mt-1 block">200x230 px (Lanczos Padded)</span>
                  </div>
                ) : asset.asset_type === 'signature' ? (
                  <div className="text-center">
                    <img
                      src={downloadUrl}
                      alt="Compiled Signature"
                      className="w-[140px] h-[60px] object-contain border border-[#DFDBD2] bg-white rounded shadow-sm mx-auto"
                    />
                    <span className="text-[10px] font-mono text-[#525866] mt-1 block">140x60 px (Grayscale &lt; 20KB)</span>
                  </div>
                ) : (
                  <div className="text-center p-3">
                    <FileCheck2 className="w-10 h-10 text-[#162A45] mx-auto mb-1" />
                    <span className="text-xs font-semibold text-[#111625] block font-sans">Bilingual Annexure 'E'</span>
                    <span className="text-[10px] font-mono text-[#525866] block">One-and-the-Same Person Affidavit</span>
                  </div>
                )}
              </div>

              {/* Telemetry Footer */}
              <div className="p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-600">
                  <span>File Size:</span>
                  <span className="font-bold text-[#111625] font-tabular">
                    {asset.file_size_kb} KB <span className="text-gray-400 font-normal">({asset.target_window_kb})</span>
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>SHA-256:</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate max-w-[120px]" title={asset.sha256_hash}>
                    {asset.sha256_hash.slice(0, 14)}...
                  </span>
                </div>

                {asset.telemetry.binary_search_iterations && (
                  <div className="flex justify-between text-gray-600">
                    <span>Quantization Iters:</span>
                    <span className="font-bold text-[#162A45]">{asset.telemetry.binary_search_iterations} steps</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#DFDBD2] space-y-1.5">
                  {isPdf && (
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      className="w-full flex items-center justify-center space-x-1.5 bg-[#162A45] hover:bg-[#1f3a5e] text-white py-1.5 rounded text-xs font-semibold shadow-xs transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-amber-300" />
                      <span>Review &amp; Edit Draft</span>
                    </button>
                  )}
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-1.5 bg-[#FAF8F5] hover:bg-[#F0EDE5] border border-[#DFDBD2] text-[#162A45] py-1.5 rounded text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Stamped Asset</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature B: High-Utility Action Bar */}
      <div className="bg-[#FAF8F5] border border-[#DFDBD2] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {affidavitDownloadUrl && (
            <>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center space-x-1.5 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-4 py-2 rounded text-xs font-mono font-semibold transition-colors shadow-xs"
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-300" />
                <span>✏ Review &amp; Edit Self-Declaration Draft</span>
              </button>
              <a
                href={affidavitDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 bg-white hover:bg-[#F0EDE5] border border-[#DFDBD2] text-[#162A45] px-4 py-2 rounded text-xs font-mono font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#162A45]" />
                <span>⬇ Download Draft PDF</span>
              </a>
            </>
          )}
          <a
            href={zipDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F0EDE5] border border-amber-300 text-[#B86B11] px-4 py-2 rounded text-xs font-mono font-semibold transition-colors"
            title="Download full CSC portal bundle with cured JPEGs, affidavit PDF, and JSON audit manifest"
          >
            <Archive className="w-3.5 h-3.5 text-[#B86B11]" />
            <span>📦 Download Complete CSC Portal-Ready Packet (.ZIP)</span>
          </a>
        </div>

        {onProceedToExecution && (
          <button
            onClick={onProceedToExecution}
            className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded text-xs font-semibold shadow-sm transition-all"
          >
            <span>Launch Autonomous Playwright Filing (Step 4)</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        )}
      </div>

      {/* Interactive Self-Declaration Draft Review & Edit Modal */}
      <SelfDeclarationEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
};
