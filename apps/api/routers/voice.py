from apps.api.services.voice_explainer import voice_explainer
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/voice", tags=["100% Free Multilingual Voice Copilot"])

class VoiceQueryRequest(BaseModel):
    query: str
    session_id: str | None = None
    language: str = "en" # "en" or "hi"

@router.post("/explain")
async def explain_with_voice(req: VoiceQueryRequest):
    """
    100% Free Voice Copilot Endpoint:
    Accepts natural citizen questions in English or Hindi (e.g. 'Why is my father's name showing an error?'),
    retrieves grounded statutory clauses via local BM25 RAG, routes reasoning through the 4-tier
    Free AI router, and synthesizes neural audio using edge-tts with zero API keys.
    """
    res = await voice_explainer.answer_citizen_query_with_voice(
        query_text=req.query,
        session_context={"session_id": req.session_id},
        language=req.language
    )
    return res

