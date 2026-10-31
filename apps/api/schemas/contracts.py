from typing import Any

from pydantic import BaseModel, Field


# Ingestion Schemas
class ExtractedFieldData(BaseModel):
    full_name: str = ""
    full_name_regional: str = ""
    father_or_spouse_name: str = ""
    dob: str = ""
    gender: str = ""
    id_number: str = ""
    address: str = ""
    pincode: str = ""
    district: str = ""
    taluka: str = ""
    confidence: float = 1.0
    detected_script: str = "Devanagari/Latin"
    raw_text: str = ""

class DocumentUploadResponse(BaseModel):
    document_id: str
    session_id: str
    doc_type: str
    filename: str
    file_size_bytes: int
    sha256_hash: str
    extracted_fields: ExtractedFieldData

class LoadSamplePacketRequest(BaseModel):
    workflow_target: str = "e_district_income"

class ReconcileSessionRequest(BaseModel):
    session_id: str
    workflow_target: str = "e_district_income"

# Deterministic Phonetic & Postal Schemas
class DoubleMetaphoneMatch(BaseModel):
    name_a: str
    name_b: str
    primary_code_a: str
    primary_code_b: str
    secondary_code_a: str
    secondary_code_b: str
    match_level: str # EXACT, SECONDARY, NONE

class PhoneticBreakdown(BaseModel):
    original_a: str
    original_b: str
    transliterated_a: str
    transliterated_b: str
    normalized_tokens_a: list[str]
    normalized_tokens_b: list[str]
    double_metaphone: DoubleMetaphoneMatch
    jaro_winkler_score: float
    token_sort_ratio: float
    token_set_ratio: float
    initial_expansion_detected: bool
    reconciled_canonical_name: str
    pass_threshold: bool

class PostalValidationResult(BaseModel):
    pincode: str
    valid: bool
    taluka_or_subdistrict: str = ""
    district: str = ""
    state: str = ""
    post_offices: list[str] = []
    latency_ms: float = 0.0
    is_cached: bool = False
    source: str = "Live India Post API"
    is_fallback: bool = False
    status: str = "VERIFIED"  # "VERIFIED" | "NOT_FOUND" | "UNAVAILABLE" | "INVALID_PIN"
    message: str = ""
    verified_at: str = ""

class ReconciliationResponse(BaseModel):
    session_id: str
    workflow_target: str
    rejection_risk_score: float = Field(..., description="0 to 100% computed rejection risk")
    status: str # PASS, CURABLE_DISCREPANCY, FATAL_MISMATCH
    name_reconciliation: PhoneticBreakdown
    father_reconciliation: PhoneticBreakdown
    dob_reconciliation: dict[str, Any]
    postal_reconciliation: PostalValidationResult
    statutory_citations: list[dict[str, str]]
    curation_recommendations: list[str]
    four_gates: dict[str, Any] | None = None

# OpenCV Compiler Schemas
class CompileAssetsRequest(BaseModel):
    session_id: str
    target_portal: str = "e_district"

class CompiledAssetDetail(BaseModel):
    asset_id: str
    asset_type: str # portrait, signature, affidavit_pdf
    width_px: int
    height_px: int
    file_size_bytes: int
    file_size_kb: float
    target_window_kb: str
    sha256_hash: str
    download_url: str
    compliant: bool
    telemetry: dict[str, Any]

class CompileAssetsResponse(BaseModel):
    session_id: str
    assets: list[CompiledAssetDetail]
    execution_ready: bool

# Playwright Agent Schemas
class ExecutionStartRequest(BaseModel):
    session_id: str
    target_url: str | None = None
    chaos_mode_enabled: bool = False

class ExecutionStepEvent(BaseModel):
    step_index: int
    step_name: str
    status: str # RUNNING, COMPLETED, RETRYING, HEALED, AWAITING_OTP, SUBMITTED, FAILED
    message: str
    screenshot_base64: str | None = None
    dom_changes: str | None = None
    error_recovery_count: int = 0
    timestamp_utc: str

class OTPAuthorizationRequest(BaseModel):
    session_id: str
    otp_code: str
    citizen_consent: bool = True

class FinalSubmissionReceipt(BaseModel):
    session_id: str
    acknowledgement_number: str
    submission_timestamp: str
    receipt_pdf_url: str
    filing_status: str

# Judge Audit & Telemetry Schemas
class JudgeTelemetryResponse(BaseModel):
    system_status: str
    backend_latency_ms: float
    india_post_latency_ms: float
    db_dialect: str
    wal_enabled: bool
    recent_tools: list[dict[str, Any]]
    recent_apis: list[dict[str, Any]]
    recent_sql: list[dict[str, Any]]
    active_sessions_count: int
    free_ai_stack: dict[str, Any] = Field(default_factory=lambda: {
        "ocr_engine": "Local OpenCV + Tesseract (Active)",
        "phonetic_graph": "Indic-Transliteration + Double Metaphone (< 5ms)",
        "lgd_pincode_api": "api.postalpincode.in (Live)",
        "vector_rag": "Local BM25 Hybrid Retriever",
        "llm_mode": "Auto-Detect (Groq Free / Ollama / Deterministic Legal Compiler)"
    })

# Self-Declaration / Affidavit Studio Schemas
class VerifiedCitation(BaseModel):
    statute: str
    authority: str = "Government of India"
    effective_date: str = ""
    clause: str
    url: str

class DocumentComparisonItem(BaseModel):
    document_type: str
    name_recorded: str
    identifier_masked: str
    issuing_authority: str
    verification_status: str

class DeclarationFieldDetails(BaseModel):
    applicant_name: str
    relationship_type: str = "son/daughter/ward of"
    father_or_guardian_name: str
    dob: str
    age: int | str = ""
    address: str
    pincode: str
    place: str
    date_str: str
    discrepancy_type: str # INITIALS_EXPANSION, SPELLING_VARIATION, NAME_ORDER_INVERSION, PARENT_NAME_MISMATCH, EXACT_MATCH, RECORD_DIVERGENCE
    discrepancy_description: str
    primary_doc: DocumentComparisonItem
    secondary_doc: DocumentComparisonItem
    declaration_paragraphs: list[str]
    verified_citations: list[VerifiedCitation] = Field(default_factory=list)
    has_verified_citations: bool = True
    no_citation_note: str = ""
    disclaimer: str
    language: str = "en" # "en" or "hi"

class DeclarationDraftResponse(BaseModel):
    session_id: str
    draft: DeclarationFieldDetails
    is_complete: bool
    missing_fields: list[str]

class GenerateDeclarationPdfRequest(BaseModel):
    session_id: str
    custom_fields: DeclarationFieldDetails | None = None
    language: str = "en"
    place: str | None = None


