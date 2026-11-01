from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.core.database import get_db
from apps.api.schemas.contracts import (
    CrashTestRehearsalRequest,
    CrashTestRehearsalResponse,
    DigitalTwinGraphResponse,
    DigitalTwinOverviewResponse,
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
)
from apps.api.services.digital_twin_engine import digital_twin_engine

router = APIRouter(prefix="/api/digital-twin", tags=["ZeroReject Application Digital Twin"])


@router.get("/{session_id}/overview", response_model=DigitalTwinOverviewResponse)
async def get_digital_twin_overview(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the comprehensive synthesized Digital Twin state of the application:
    - Demographic normalization status
    - Rejection risk breakdown & statutory compliance
    - Target portal schema matching
    - Actionable auto-cure remediations
    """
    try:
        return await digital_twin_engine.get_overview(session_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Digital Twin overview: {e!s}")


@router.get("/{session_id}/graph", response_model=DigitalTwinGraphResponse)
async def get_digital_twin_evidence_graph(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Constructs and returns the interactive Evidence Graph:
    - Document nodes with SHA256 hashes & file provenance
    - Extracted field nodes with OCR confidence
    - Normalized entity nodes
    - Statutory requirement nodes
    - Portal field nodes
    - Directed relationship edges (CONTAINS, NORMALIZED_TO, CONFLICTS_WITH, SATISFIES, MAPS_TO)
    """
    try:
        return await digital_twin_engine.build_evidence_graph(session_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile Evidence Graph: {e!s}")


@router.post("/{session_id}/simulate", response_model=WhatIfSimulateResponse)
async def simulate_counterfactual_what_if(
    session_id: str,
    request: WhatIfSimulateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Counterfactual What-If Sandbox:
    Executes hypothetical demographic corrections or statutory affidavit remedies in an
    isolated, immutable simulation context with ZERO database modifications.
    Returns Before vs. After rejection risk delta and gate resolution impact.
    """
    try:
        return await digital_twin_engine.simulate_what_if(session_id, request, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"What-If simulation failed: {e!s}")


@router.post("/{session_id}/crash-test", response_model=CrashTestRehearsalResponse)
async def run_application_crash_test(
    session_id: str,
    request: CrashTestRehearsalRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Rehearses application submission against target portal specifications:
    - Pre-flight checklist (Token reconciliation, LGD postal integrity, Biometric specs, Affidavit readiness)
    - Rehearsal step simulation & 502 chaos resilience
    - Final readiness verdict
    """
    try:
        return await digital_twin_engine.simulate_crash_test(session_id, request, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crash test rehearsal failed: {e!s}")

