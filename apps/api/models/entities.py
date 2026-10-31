import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from apps.api.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())

class AuditSession(Base):
    __tablename__ = "audit_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workflow_target: Mapped[str] = mapped_column(String(64), default="e_district_income")
    status: Mapped[str] = mapped_column(String(32), default="INITIALIZED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    # Relationships
    documents = relationship("ExtractedDocument", back_populates="session", cascade="all, delete-orphan")
    reconciliation = relationship("ReconciliationRecord", back_populates="session", uselist=False, cascade="all, delete-orphan")
    compiled_assets = relationship("CompiledAsset", back_populates="session", cascade="all, delete-orphan")
    checkpoints = relationship("ExecutionCheckpoint", back_populates="session", cascade="all, delete-orphan")

class ExtractedDocument(Base):
    __tablename__ = "extracted_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("audit_sessions.id"))
    doc_type: Mapped[str] = mapped_column(String(32)) # aadhaar, pan, marksheet, other
    original_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(512))
    file_size_bytes: Mapped[int] = mapped_column(Integer)
    sha256_hash: Mapped[str] = mapped_column(String(64))
    
    # Structured OCR extraction
    full_name: Mapped[str] = mapped_column(String(255), default="")
    full_name_regional: Mapped[str] = mapped_column(String(255), default="")
    father_or_spouse_name: Mapped[str] = mapped_column(String(255), default="")
    dob: Mapped[str] = mapped_column(String(32), default="")
    gender: Mapped[str] = mapped_column(String(16), default="")
    id_number: Mapped[str] = mapped_column(String(64), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    pincode: Mapped[str] = mapped_column(String(10), default="")
    
    ocr_confidence: Mapped[float] = mapped_column(Float, default=1.0)
    extraction_details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    session = relationship("AuditSession", back_populates="documents")

class ReconciliationRecord(Base):
    __tablename__ = "reconciliation_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("audit_sessions.id"))
    
    # Risk scoring & metrics
    rejection_risk_score: Mapped[float] = mapped_column(Float, default=0.0) # 0 to 100%
    name_similarity_score: Mapped[float] = mapped_column(Float, default=1.0)
    father_similarity_score: Mapped[float] = mapped_column(Float, default=1.0)
    dob_match: Mapped[bool] = mapped_column(Boolean, default=True)
    postal_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Detailed JSON audits
    phonetic_matrix: Mapped[dict] = mapped_column(JSON, default=dict)
    postal_details: Mapped[dict] = mapped_column(JSON, default=dict)
    discrepancy_flags: Mapped[list] = mapped_column(JSON, default=list)
    curation_recommendations: Mapped[list] = mapped_column(JSON, default=list)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    session = relationship("AuditSession", back_populates="reconciliation")

class CompiledAsset(Base):
    __tablename__ = "compiled_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("audit_sessions.id"))
    asset_type: Mapped[str] = mapped_column(String(32)) # portrait_photo, signature, affidavit_pdf
    
    file_path: Mapped[str] = mapped_column(String(512))
    file_size_bytes: Mapped[int] = mapped_column(Integer)
    sha256_hash: Mapped[str] = mapped_column(String(64))
    
    # Dimensions & spec compliance
    width_px: Mapped[int] = mapped_column(Integer, default=0)
    height_px: Mapped[int] = mapped_column(Integer, default=0)
    dpi: Mapped[int] = mapped_column(Integer, default=150)
    format_type: Mapped[str] = mapped_column(String(16), default="JPEG")
    compliant_with_portal: Mapped[bool] = mapped_column(Boolean, default=True)
    audit_telemetry: Mapped[dict] = mapped_column(JSON, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    session = relationship("AuditSession", back_populates="compiled_assets")

class ExecutionCheckpoint(Base):
    __tablename__ = "execution_checkpoints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("audit_sessions.id"))
    step_index: Mapped[int] = mapped_column(Integer)
    step_name: Mapped[str] = mapped_column(String(64))
    
    form_state: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(32), default="COMPLETED") # COMPLETED, RETRYING, HEALED, FAILED
    chaos_injected: Mapped[bool] = mapped_column(Boolean, default=False)
    error_recovery_count: Mapped[int] = mapped_column(Integer, default=0)
    screenshot_path: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    session = relationship("AuditSession", back_populates="checkpoints")

class PostalCache(Base):
    __tablename__ = "postal_cache"

    pincode: Mapped[str] = mapped_column(String(10), primary_key=True)
    district: Mapped[str] = mapped_column(String(128))
    state: Mapped[str] = mapped_column(String(128))
    talukas: Mapped[list] = mapped_column(JSON, default=list)
    raw_response: Mapped[dict] = mapped_column(JSON, default=dict)
    cached_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

