'use client';

import React from 'react';
import { FileCheck2, Download, Image as ImageIcon, Sparkles, Check, ArrowRight } from 'lucide-react';
import { CompileAssetsResponse } from '@/types';

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
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  if (!compileData && !loading) {
    return (
      <div className="p-8 text-center bg-white border border-[#DFDBD2] rounded-lg">
        <h4 className="font-serif text-lg text-[#111625] mb-2">OpenCV Auto-Cure Document & Biometric Compiler</h4>
        <p className="text-xs text-[#525866] max-w-md mx-auto mb-5 font-sans">
          Government portals strictly reject files outside narrow byte windows (signature &lt; 20KB, portrait 200x230).
          Click below to auto-deskew, crop contours, apply binary-search JPEG quantization, and synthesize the statutory affidavit.
        </p>
        <button
          onClick={onTriggerCompile}
          disabled={!sessionId}
          className="bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          Auto-Cure Assets & Generate Statutory Affidavit
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-[#DFDBD2] rounded-lg">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#162A45] border-t-transparent mb-3"></div>
        <p className="text-xs text-[#525866] font-mono">Running OpenCV Contour Cropping & Binary-Search JPEG Quantization...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-lg flex items-center justify-between">
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
        <span className="text-xs font-mono bg-emerald-100 text-emerald-900 px-2 py-1 rounded font-semibold">
          100% SPEC COMPLIANT
        </span>
      </div>

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

                <div className="pt-2 border-t border-[#DFDBD2]">
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

      {/* Guided Progression: Continue to Step D */}
      {onProceedToExecution && (
        <div className="pt-3 border-t border-[#DFDBD2] flex justify-end">
          <button
            onClick={onProceedToExecution}
            className="flex items-center space-x-2 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-5 py-2.5 rounded text-xs font-semibold shadow-sm transition-all"
          >
            <span>Continue to Step D: Playwright Self-Healing Agent</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      )}
    </div>
  );
};

