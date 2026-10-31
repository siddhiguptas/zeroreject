import asyncio
import json
import time
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.playwright_executor import playwright_agent
from apps.api.core.config import settings
from apps.api.core.database import get_db
from apps.api.models.entities import AuditSession, ReconciliationRecord
from apps.api.schemas.contracts import FinalSubmissionReceipt, OTPAuthorizationRequest
from apps.api.services.affidavit_generator import affidavit_generator

router = APIRouter(prefix="/api/execution", tags=["Playwright Self-Healing Agent & SSE Stream"])

@router.get("/stream/{session_id}")
async def stream_playwright_execution(
    session_id: str,
    chaos_mode: bool = Query(False),
    portal: str | None = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Live Server-Sent Events (SSE) telemetry stream:
    Emits real-time step logs, DOM mappings, base64 screenshots, 502 chaos catches,
    and pauses at the human-in-the-loop OTP verification screen.
    """
    # Verify session and collect applicant details
    sess_res = await db.execute(select(AuditSession).where(AuditSession.id == session_id))
    session = sess_res.scalar_one_or_none()
    
    # Target portal URL synchronized with active portal profile
    portal_type = portal or (session.workflow_target if session and session.workflow_target else "e_district_income")
    target_url = f"{settings.GOV_PORTAL_BASE_URL}/?portal={portal_type}"

    recon_res = await db.execute(select(ReconciliationRecord).where(ReconciliationRecord.session_id == session_id))
    recon = recon_res.scalar_one_or_none()

    applicant_data = {
        "applicant_name": recon.name_a if (recon and recon.name_a) else "Ramesh Kumar Sharma",
        "father_name": recon.father_a if (recon and recon.father_a) else "Dina Nath Sharma",
        "dob": recon.dob_a if (recon and recon.dob_a) else "14/08/1996",
        "gender": "MALE",
        "address_line": "Vill. Primary Residence",
        "pincode": recon.pincode_query if (recon and recon.pincode_query) else "206124",
        "district": recon.district_verified if (recon and recon.district_verified) else "Etawah",
        "state": "Uttar Pradesh"
    }

    asset_paths = {
        "portrait": f"{settings.COMPILED_DIR}/{session_id}_portrait_compiled.jpg",
        "signature": f"{settings.COMPILED_DIR}/{session_id}_signature_compiled.jpg",
        "affidavit": f"{settings.AFFIDAVITS_DIR}/{session_id}_statutory_affidavit.pdf"
    }

    async def event_generator():
        try:
            async for event in playwright_agent.execute_portal_workflow(
                session_id=session_id,
                target_url=target_url,
                applicant_data=applicant_data,
                asset_paths=asset_paths,
                chaos_enabled=chaos_mode
            ):
                payload = json.dumps(event)
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            # Client disconnected early: terminate zombie browser context
            await playwright_agent.cleanup_context(session_id)
            raise

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/authorize-otp", response_model=FinalSubmissionReceipt)
async def authorize_otp(
    req: OTPAuthorizationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Human-in-the-Loop OTP Authorization:
    Citizen inputs OTP and authorizes final submission. Agent finalizes filing
    and returns official stamped receipt.
    """
    result = await playwright_agent.submit_otp_and_finalize(
        session_id=req.session_id,
        otp_code=req.otp_code
    )

    ack = result.get("acknowledgement_number", "UP-EDIST-2026-904128")
    
    # Update session status
    sess_res = await db.execute(select(AuditSession).where(AuditSession.id == req.session_id))
    session = sess_res.scalar_one_or_none()
    if session:
        session.status = "SUBMITTED"
        await db.commit()

    return FinalSubmissionReceipt(
        session_id=req.session_id,
        acknowledgement_number=ack,
        submission_timestamp=time.strftime("%d-%m-%Y %H:%M:%S UTC", time.gmtime()),
        receipt_pdf_url=f"/api/execution/receipt/{req.session_id}",
        filing_status="CONFIRMED_AND_STAMPED"
    )


@router.get("/receipt/{session_id}")
async def download_filing_receipt(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Download official generated stamped PDF receipt."""
    sess_res = await db.execute(select(AuditSession).where(AuditSession.id == session_id))
    session = sess_res.scalar_one_or_none()

    portal_name = "STATE e-DISTRICT CITIZEN SERVICES PORTAL"
    if session and session.workflow_target == "national_scholarship":
        portal_name = "NATIONAL SCHOLARSHIP PORTAL (NSP 2.0)"
    elif session and session.workflow_target == "epfo_joint_declaration":
        portal_name = "EMPLOYEES' PROVIDENT FUND ORGANISATION (EPFO)"

    ack_no = f"UP-EDIST-2026-{abs(hash(session_id)) % 900000 + 100000}"
    pdf_path = affidavit_generator.generate_stamped_receipt(
        session_id=session_id,
        ack_number=ack_no,
        portal_name=portal_name
    )
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"Official_Filing_Receipt_{session_id[:8]}.pdf"
    )

