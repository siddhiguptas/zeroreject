'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Check,
  AlertTriangle,
  Download,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Languages,
  MapPin,
  Calendar,
  User,
  Scale
} from 'lucide-react';
import {
  DeclarationDraftResponse,
  DeclarationFieldDetails,
  CompiledAssetDetail
} from '@/types';
import {
  fetchDeclarationDraft,
  generateCustomDeclarationPdf
} from '@/lib/api-client';

interface SelfDeclarationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onPdfUpdated?: (newAsset: CompiledAssetDetail) => void;
}

export const SelfDeclarationEditorModal: React.FC<SelfDeclarationEditorModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  onPdfUpdated
}) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [draftData, setDraftData] = useState<DeclarationDraftResponse | null>(null);
  const [loadingDraft, setLoadingDraft] = useState<boolean>(false);
  const [savingPdf, setSavingPdf] = useState<boolean>(false);
  const [pdfAsset, setPdfAsset] = useState<CompiledAssetDetail | null>(null);

  // Form Fields
  const [applicantName, setApplicantName] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [place, setPlace] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (isOpen && sessionId) {
      loadDraft(language);
    }
  }, [isOpen, sessionId, language]);

  const loadDraft = async (lang: 'en' | 'hi') => {
    try {
      setLoadingDraft(true);
      setErrorMsg(null);
      const res = await fetchDeclarationDraft(sessionId, lang, place || undefined);
      setDraftData(res);
      setApplicantName(res.draft.applicant_name);
      setFatherName(res.draft.father_or_guardian_name);
      setDob(res.draft.dob);
      setPlace(res.draft.place);
      setAddress(res.draft.address);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load declaration draft');
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleSaveAndGenerate = async () => {
    if (!draftData) return;
    try {
      setSavingPdf(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const customFields: DeclarationFieldDetails = {
        ...draftData.draft,
        applicant_name: applicantName,
        father_or_guardian_name: fatherName,
        dob: dob,
        place: place,
        address: address,
        language: language
      };

      const result = await generateCustomDeclarationPdf({
        session_id: sessionId,
        custom_fields: customFields,
        language: language,
        place: place
      });

      // Reload fresh draft with updated details so on-screen preview reflects the edits
      const freshDraft = await fetchDeclarationDraft(sessionId, language, place || undefined);
      setDraftData(freshDraft);
      setPdfAsset(result);
      setSuccessMsg(
        language === 'hi'
          ? '✓ संशोधित विवरण के साथ स्व-घोषणा पत्र सफलतापूर्वक जनरेट हुआ!'
          : '✓ Affidavit regenerated with your updated details!'
      );

      if (onPdfUpdated) {
        onPdfUpdated(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate updated affidavit PDF');
    } finally {
      setSavingPdf(false);
    }
  };

  if (!isOpen) return null;

  const pdfDownloadUrl = pdfAsset
    ? `${apiBase}${pdfAsset.download_url}`
    : `${apiBase}/api/compiler/download/affidavit_pdf/${sessionId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-[#DFDBD2] rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#111625]">
        {/* Header */}
        <div className="bg-[#FAF8F5] border-b border-[#DFDBD2] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#162A45] text-amber-300 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-base text-[#162A45]">
                  {language === 'hi' ? 'स्व-घोषणा / शपथ पत्र प्रारूप समीक्षा' : 'Draft Self-Declaration Studio'}
                </h3>
                <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                  DRAFT FOR REVIEW
                </span>
              </div>
              <p className="text-xs text-[#525866]">
                {language === 'hi'
                  ? 'अभिलेखों से निष्कर्षित वास्तविक विवरण • शून्य काल्पनिक सूचना'
                  : 'Derived strictly from extracted documents & verified statutory guidance.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="inline-flex rounded-md shadow-xs bg-[#F0EDE5] p-0.5 border border-[#DFDBD2]">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  language === 'en'
                    ? 'bg-[#162A45] text-white shadow-xs'
                    : 'text-[#525866] hover:text-[#111625]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  language === 'hi'
                    ? 'bg-[#162A45] text-white shadow-xs'
                    : 'text-[#525866] hover:text-[#111625]'
                }`}
              >
                हिंदी
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Legal Status Notice Banner */}
          <div className="bg-amber-50/80 border border-amber-300/80 p-3.5 rounded-lg text-xs text-amber-950 space-y-1">
            <div className="font-semibold flex items-center space-x-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>
                {language === 'hi'
                  ? 'समीक्षा प्रारूप सूचना (शपथ पत्र गारंटी नहीं है):'
                  : 'Draft Self-Declaration Notice (No Acceptance Guarantee):'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90 font-sans">
              {draftData?.draft.disclaimer ||
                'This draft self-declaration is prepared for citizen review and physical submission. It must be executed on non-judicial stamp paper before an authorized Notary Public / Oath Commissioner where mandated. A self-declaration does not guarantee administrative waiver.'}
            </p>
          </div>

          {loadingDraft ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#162A45]" />
              Loading dynamic document reconciliation draft...
            </div>
          ) : (
            draftData && (
              <>
                {/* Form Controls: Dynamic Demographics */}
                <div className="bg-[#FAF8F5] border border-[#DFDBD2] p-4 rounded-lg space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#162A45] flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span>
                      {language === 'hi' ? 'शपथकर्ता का विवरण (समीक्षा एवं संपादन)' : 'Deponent Personal Details (Editable Review)'}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#525866] mb-1">
                        {language === 'hi' ? 'आवेदक का नाम (प्राथमिक आधार)' : "Applicant Full Name (Primary ID)"}
                      </label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#DFDBD2] rounded focus:outline-none focus:ring-1 focus:ring-[#162A45]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#525866] mb-1">
                        {language === 'hi' ? 'पिता / संरक्षक का नाम' : "Father / Guardian Name"}
                      </label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#DFDBD2] rounded focus:outline-none focus:ring-1 focus:ring-[#162A45]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#525866] mb-1">
                        {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth (DOB)'}
                      </label>
                      <input
                        type="text"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#DFDBD2] rounded focus:outline-none focus:ring-1 focus:ring-[#162A45]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#525866] mb-1 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber-700" />
                        <span>{language === 'hi' ? 'निष्पादन स्थान / जिला' : 'Place of Execution / District'}</span>
                      </label>
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="e.g. Deoria, Lucknow, Gorakhpur"
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#DFDBD2] rounded focus:outline-none focus:ring-1 focus:ring-[#162A45]"
                      />
                      <span className="text-[10px] text-gray-500 font-mono">
                        {language === 'hi' ? 'कोई स्वतः पूर्व-निर्धारित शहर नहीं' : 'Never hardcoded'}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#525866] mb-1">
                        {language === 'hi' ? 'स्थाई पता' : 'Residential Address'}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#DFDBD2] rounded focus:outline-none focus:ring-1 focus:ring-[#162A45]"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Comparison Matrix */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#162A45] flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>
                      {language === 'hi' ? 'दस्तावेज तुलना तालिका (पहचान संख्या सुरक्षित)' : 'Cross-Document Reconciliation Matrix'}
                    </span>
                  </h4>

                  <div className="border border-[#DFDBD2] rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#162A45] text-white text-[11px]">
                        <tr>
                          <th className="py-2 px-3 font-semibold">
                            {language === 'hi' ? 'दस्तावेज का प्रकार' : 'Document Type'}
                          </th>
                          <th className="py-2 px-3 font-semibold">
                            {language === 'hi' ? 'अंकित नाम' : 'Inscribed Name'}
                          </th>
                          <th className="py-2 px-3 font-semibold">
                            {language === 'hi' ? 'पहचान संख्या (सुरक्षित)' : 'Identifier (Masked)'}
                          </th>
                          <th className="py-2 px-3 font-semibold">
                            {language === 'hi' ? 'जारीकर्ता प्राधिकारी' : 'Issuing Authority'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFDBD2] bg-white font-mono text-[11px]">
                        <tr>
                          <td className="py-2 px-3 font-semibold text-[#162A45]">
                            {draftData.draft.primary_doc.document_type}
                          </td>
                          <td className="py-2 px-3">{applicantName}</td>
                          <td className="py-2 px-3 text-emerald-800 font-bold">
                            {draftData.draft.primary_doc.identifier_masked}
                          </td>
                          <td className="py-2 px-3 text-gray-600">
                            {draftData.draft.primary_doc.issuing_authority}
                          </td>
                        </tr>
                        <tr className="bg-[#F8F7F4]">
                          <td className="py-2 px-3 font-semibold text-[#162A45]">
                            {draftData.draft.secondary_doc.document_type}
                          </td>
                          <td className="py-2 px-3">
                            {draftData.draft.secondary_doc.name_recorded}
                          </td>
                          <td className="py-2 px-3 text-emerald-800 font-bold">
                            {draftData.draft.secondary_doc.identifier_masked}
                          </td>
                          <td className="py-2 px-3 text-gray-600">
                            {draftData.draft.secondary_doc.issuing_authority}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Discrepancy & Paragraph Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#162A45]">
                      {language === 'hi'
                        ? `स्व-घोषणा बिंदु (${draftData.draft.discrepancy_type})`
                        : `Declaration Paragraphs (${draftData.draft.discrepancy_type})`}
                    </h4>
                    <span className="text-[11px] font-sans text-gray-600">
                      {draftData.draft.discrepancy_description}
                    </span>
                  </div>

                  <div className="bg-white border border-[#DFDBD2] p-4 rounded-lg space-y-2 font-serif text-xs leading-relaxed text-[#111625]">
                    {draftData.draft.declaration_paragraphs.map((p, idx) => (
                      <div key={idx} className="p-1 rounded bg-[#FAF8F5]/60 border border-gray-100">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Statutory Guidance Section */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#162A45] flex items-center space-x-2">
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    <span>
                      {language === 'hi' ? 'सत्यापित वैधानिक संदर्भ (केवल आधिकारिक स्रोत)' : 'Verified Statutory Citations (Official Sources Only)'}
                    </span>
                  </h4>

                  {draftData.draft.has_verified_citations && draftData.draft.verified_citations.length > 0 ? (
                    <div className="space-y-2">
                      {draftData.draft.verified_citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-emerald-950">
                            <span>{c.statute}</span>
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-mono text-[10px]"
                              >
                                <span>Official Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-700">
                            <b>Authority:</b> {c.authority} {c.effective_date ? `• Effective: ${c.effective_date}` : ''}
                          </div>
                          <div className="text-[11px] text-gray-800 font-serif italic">
                            "{c.clause}"
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs text-gray-700 italic">
                      {draftData.draft.no_citation_note ||
                        'No statutory citation was verified for this specific discrepancy. Acceptance is subject to the sole discretion of the verifying officer.'}
                    </div>
                  )}
                </div>

                {/* Notary Endorsement Note */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-mono">
                  <b>Execution Section:</b> Physical signature, seal, and notarial endorsement areas are strictly kept blank on the generated A4 PDF for real physical execution on non-judicial stamp paper.
                </div>
              </>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F5] border-t border-[#DFDBD2] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-mono">
            {language === 'hi' ? 'भाषा: हिंदी (Nirmala UI)' : 'Language: English (A4 Standard)'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveAndGenerate}
              disabled={savingPdf || loadingDraft}
              className="flex items-center space-x-1.5 bg-[#162A45] hover:bg-[#1f3a5e] text-white px-4 py-2 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {savingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi' ? 'संपादित स्व-घोषणा PDF बनाएं' : 'Update & Regenerate PDF'}
                  </span>
                </>
              )}
            </button>

            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {language === 'hi' ? 'PDF डाउनलोड करें' : 'Download Draft PDF'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

