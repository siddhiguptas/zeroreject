export interface ExtractedFieldData {
  full_name: string;
  full_name_regional: string;
  father_or_spouse_name: string;
  dob: string;
  gender: string;
  id_number: string;
  address: string;
  pincode: string;
  district?: string;
  taluka?: string;
  confidence: number;
  detected_script: string;
  raw_text: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  session_id: string;
  doc_type: string;
  filename: string;
  file_size_bytes: number;
  sha256_hash: string;
  extracted_fields: ExtractedFieldData;
}

export interface DoubleMetaphoneMatch {
  name_a: string;
  name_b: string;
  primary_code_a: string;
  primary_code_b: string;
  secondary_code_a: string;
  secondary_code_b: string;
  match_level: 'EXACT' | 'SECONDARY' | 'NONE';
}

export interface PhoneticBreakdown {
  original_a: string;
  original_b: string;
  transliterated_a: string;
  transliterated_b: string;
  normalized_tokens_a: string[];
  normalized_tokens_b: string[];
  double_metaphone: DoubleMetaphoneMatch;
  jaro_winkler_score: number;
  token_sort_ratio: number;
  token_set_ratio: number;
  initial_expansion_detected: boolean;
  reconciled_canonical_name: string;
  pass_threshold: boolean;
}

export interface PostalValidationResult {
  pincode: string;
  valid: boolean;
  taluka_or_subdistrict: string;
  district: string;
  state: string;
  post_offices: string[];
  latency_ms: number;
  is_cached: boolean;
}

export interface GateAuditDetail {
  gate_num: number;
  title: string;
  status: string;
  verdict: string;
  details: string;
  [key: string]: any;
}

export interface FourGateAudit {
  gate1_phonetic: GateAuditDetail;
  gate2_checksum_qr: GateAuditDetail;
  gate3_statutory_rules: GateAuditDetail;
  gate4_jurisdiction: GateAuditDetail;
}

export interface ReconciliationResponse {
  session_id: string;
  workflow_target: string;
  rejection_risk_score: number;
  status: 'PASS' | 'CURABLE_DISCREPANCY' | 'FATAL_MISMATCH';
  name_reconciliation: PhoneticBreakdown;
  father_reconciliation: PhoneticBreakdown;
  dob_reconciliation: {
    dob?: string;
    match: boolean;
  };
  postal_reconciliation: PostalValidationResult;
  statutory_citations: Array<{
    statute: string;
    clause: string;
  }>;
  curation_recommendations: string[];
  four_gates?: FourGateAudit;
}

export interface BenchmarkSimulationResponse {
  benchmark_id: string;
  tested_against: string;
  raw_uncured: {
    scenario: string;
    http_status: number;
    status: string;
    violations_count: number;
    violations: Array<{ code: string; field: string; message: string; penalty: string }>;
    estimated_citizen_delay: string;
  };
  zeroreject_cured: {
    scenario: string;
    http_status: number;
    status: string;
    violations_count: number;
    violations: Array<any>;
    four_gates_passed: string[];
    cured_asset_specs: Record<string, string>;
    estimated_citizen_delay: string;
  };
  delta_risk_reduction: string;
}

export interface CompiledAssetDetail {
  asset_id: string;
  asset_type: 'portrait' | 'signature' | 'affidavit_pdf';
  width_px: number;
  height_px: number;
  file_size_bytes: number;
  file_size_kb: number;
  target_window_kb: string;
  sha256_hash: string;
  download_url: string;
  compliant: boolean;
  telemetry: Record<string, any>;
}

export interface CompileAssetsResponse {
  session_id: string;
  assets: CompiledAssetDetail[];
  execution_ready: boolean;
}

export interface ExecutionStepEvent {
  step_index: number;
  step_name: string;
  status: 'RUNNING' | 'COMPLETED' | 'RETRYING' | 'HEALED' | 'AWAITING_OTP' | 'SUBMITTED' | 'FAILED';
  message: string;
  screenshot_base64?: string;
  dom_changes?: string;
  error_recovery_count?: number;
  timestamp_utc: string;
}

export interface JudgeTelemetryResponse {
  system_status: string;
  backend_latency_ms: number;
  india_post_latency_ms: number;
  db_dialect: string;
  wal_enabled: boolean;
  recent_tools: Array<Record<string, any>>;
  recent_apis: Array<Record<string, any>>;
  recent_sql: Array<Record<string, any>>;
  active_sessions_count: number;
  free_ai_stack?: Record<string, string>;
}

export interface VerifiedCitation {
  statute: string;
  authority: string;
  effective_date: string;
  clause: string;
  url: string;
}

export interface DocumentComparisonItem {
  document_type: string;
  name_recorded: string;
  identifier_masked: string;
  issuing_authority: string;
  verification_status: string;
}

export interface DeclarationFieldDetails {
  applicant_name: string;
  relationship_type: string;
  father_or_guardian_name: string;
  dob: string;
  age: number | string;
  address: string;
  pincode: string;
  place: string;
  date_str: string;
  discrepancy_type: string;
  discrepancy_description: string;
  primary_doc: DocumentComparisonItem;
  secondary_doc: DocumentComparisonItem;
  declaration_paragraphs: string[];
  verified_citations: VerifiedCitation[];
  has_verified_citations: boolean;
  no_citation_note: string;
  disclaimer: string;
  language: string;
}

export interface DeclarationDraftResponse {
  session_id: string;
  draft: DeclarationFieldDetails;
  is_complete: boolean;
  missing_fields: string[];
}

export interface GenerateDeclarationPdfRequest {
  session_id: string;
  custom_fields?: DeclarationFieldDetails;
  language?: string;
  place?: string;
}
