from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.core.database import get_db
from apps.api.models.entities import ExtractedDocument, ReconciliationRecord
from apps.api.services.voice_explainer import voice_explainer

router = APIRouter(prefix="/api/voice", tags=["100% Free Multilingual Voice Copilot"])

class VoiceQueryRequest(BaseModel):
    query: str
    session_id: str | None = None
    language: str = "en" # "en" or "hi"

@router.post("/explain")
async def explain_with_voice(req: VoiceQueryRequest, db: AsyncSession = Depends(get_db)):
    """
    100% Free Voice Copilot Endpoint:
    Accepts natural citizen questions in English or Hindi (e.g. 'Why is my father's name showing an error?'),
    dynamically loads the citizen's actual session reconciliation and document fields,
    retrieves grounded statutory clauses via local BM25 RAG, routes reasoning through the 4-tier
    Free AI router, and synthesizes neural audio using edge-tts with zero API keys.
    """
    session_context = {"session_id": req.session_id}

    if req.session_id:
        try:
            # 1. Fetch reconciliation record
            recon_res = await db.execute(
                select(ReconciliationRecord)
                .where(ReconciliationRecord.session_id == req.session_id)
                .order_by(ReconciliationRecord.created_at.desc())
            )
            recon = recon_res.scalars().first()

            # 2. Fetch extracted documents
            docs_res = await db.execute(
                select(ExtractedDocument).where(ExtractedDocument.session_id == req.session_id)
            )
            docs = docs_res.scalars().all()
            doc_map = {d.doc_type: d for d in docs}

            if recon:
                matrix = recon.phonetic_matrix or {}
                postal = recon.postal_details or {}
                session_context.update({
                    "name_a": matrix.get("original_a"),
                    "name_b": matrix.get("original_b"),
                    "canonical_name": matrix.get("reconciled_canonical_name") or matrix.get("original_a") or matrix.get("original_b"),
                    "father_name": matrix.get("father_a") or matrix.get("father_b"),
                    "father_a": matrix.get("father_a"),
                    "father_b": matrix.get("father_b"),
                    "dob_a": matrix.get("dob_a"),
                    "dob_b": matrix.get("dob_b"),
                    "gender": matrix.get("gender"),
                    "pincode": postal.get("pincode") or matrix.get("pincode"),
                    "district": postal.get("district"),
                    "state": postal.get("state"),
                    "risk_score": recon.rejection_risk_score,
                    "initial_expansion_detected": matrix.get("initial_expansion_detected", False),
                    "discrepancies": recon.discrepancy_flags or [],
                    "status": "PASS" if recon.rejection_risk_score <= 25 else "FLAGGED",
                })
            elif docs:
                primary = doc_map.get("aadhaar_front") or doc_map.get("aadhaar") or docs[0]
                secondary = doc_map.get("pan") or doc_map.get("marksheet")
                back = doc_map.get("aadhaar_back")
                session_context.update({
                    "name_a": primary.full_name if primary else None,
                    "name_b": secondary.full_name if secondary else (primary.full_name if primary else None),
                    "canonical_name": primary.full_name if primary else "Citizen",
                    "father_name": (back.father_or_spouse_name if back else None) or (secondary.father_or_spouse_name if secondary else None),
                    "dob_a": primary.dob if primary else None,
                    "pincode": (back.pincode if back else None) or (primary.pincode if primary else None),
                    "risk_score": 0.0,
                    "status": "PASS",
                })
        except Exception as e:
            print(f"Error fetching voice session context: {e}")

    res = await voice_explainer.answer_citizen_query_with_voice(
        query_text=req.query,
        session_context=session_context,
        language=req.language
    )
    return res

