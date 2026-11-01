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
    aadhaar_dob?: string;
    pan_dob?: string;
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

// ==============================================================================
// APPLICATION DIGITAL TWIN TYPES
// ==============================================================================

export type DigitalTwinNodeCategory =
  | 'document'
  | 'field'
  | 'entity'
  | 'requirement'
  | 'portal_field'
  | 'validation'
  | 'remediation';

export type DigitalTwinNodeStatus =
  | 'VERIFIED'
  | 'WARNING'
  | 'CONFLICT'
  | 'PENDING'
  | 'SATISFIED'
  | 'UNSATISFIED';

export interface DigitalTwinGraphNode {
  id: string;
  label: string;
  category: DigitalTwinNodeCategory;
  status: DigitalTwinNodeStatus;
  value?: string | null;
  confidence?: number | null;
  source_doc?: string | null;
  provenance: Record<string, any>;
}

export interface DigitalTwinGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  status: 'ACTIVE' | 'PROPOSED' | 'CONFLICT';
  details?: string | null;
}

export interface DigitalTwinGraphResponse {
  session_id: string;
  nodes: DigitalTwinGraphNode[];
  edges: DigitalTwinGraphEdge[];
  summary: {
    total_nodes: number;
    total_edges: number;
    verified_nodes: number;
    conflict_nodes: number;
    risk_score?: number;
    workflow_target?: string;
    status?: string;
  };
}

export interface DigitalTwinOverviewResponse {
  session_id: string;
  workflow_target: string;
  applicant_identity: {
    canonical_name: string;
    secondary_name: string;
    confidence_score: number;
    is_consistent: boolean;
  };
  guardian_identity: {
    father_or_guardian: string;
    confidence_score: number;
    is_consistent: boolean;
  };
  residence_identity: {
    pincode: string;
    district: string;
    lgd_status: string;
    address: string;
  };
  composite_risk_score: number;
  filing_readiness_status: 'READY_FOR_FILING' | 'CURABLE_ACTION_REQUIRED' | 'FATAL_MISMATCH';
  statutory_compliance_rate: number;
  documents_summary: Array<{
    doc_type: string;
    filename: string;
    sha256: string;
    ocr_confidence: number;
    fields_extracted: number;
  }>;
  portal_schema_requirements: Array<{
    field_name: string;
    label: string;
    required: boolean;
    satisfied: boolean;
    source_value?: string;
    rule_citation?: string;
  }>;
  actionable_remediations: Array<{
    action_type: string;
    title: string;
    description: string;
    target_stage: number;
  }>;
}

export interface WhatIfSimulateRequest {
  field_overrides: Record<string, string>;
  selected_remediations?: string[];
}

export interface WhatIfSimulateResponse {
  session_id: string;
  before_state: {
    name_a: string;
    name_b: string;
    father_name: string;
    pincode: string;
    risk_score: number;
    status: string;
    name_similarity: number;
    postal_verified: boolean;
    gate_1: string;
    gate_4: string;
  };
  after_state: {
    name_a: string;
    name_b: string;
    father_name: string;
    pincode: string;
    risk_score: number;
    status: string;
    name_similarity: number;
    postal_verified: boolean;
    gate_1: string;
    gate_4: string;
  };
  risk_delta: number;
  impact_summary: string[];
  affected_nodes: string[];
  resolved_discrepancies: string[];
  unresolved_discrepancies: string[];
}

export interface CrashTestRehearsalRequest {
  workflow_target?: string;
  simulate_chaos?: boolean;
}

export interface CrashTestRehearsalResponse {
  session_id: string;
  workflow_target: string;
  passed_preflight_checks: boolean;
  checklist: Array<{
    id: string;
    label: string;
    passed: boolean;
    details: string;
  }>;
  portal_steps: Array<{
    step_index: number;
    step_name: string;
    target_url: string;
    status: string;
    latency_ms: number;
    message: string;
  }>;
  overall_verdict: 'REHEARSAL_PASSED' | 'REHEARSAL_WARNING' | 'REHEARSAL_FAILED';
  execution_time_ms: number;
  recommendations: string[];
}

