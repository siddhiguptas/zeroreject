import os
import io
import time
import base64
from typing import Dict, Any, Optional
import edge_tts
from apps.api.core.config import settings
from apps.api.core.audit_logger import audit_logger
from apps.api.services.free_llm_router import free_llm_router
from apps.api.services.statutory_rag import statutory_rag

VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",
    "en": "en-IN-NeerjaNeural"
}

class FreeVoiceExplainer:
    """
    100% Free Multilingual Voice & Statutory Explainer.
    Zero-credit architecture:
    - Text-to-Speech: Microsoft Edge Neural Voices (hi-IN-SwaraNeural, en-IN-NeerjaNeural) via edge-tts ($0, 0 API keys)
    - Speech-to-Text: Native Web Audio / WebkitSpeechRecognition on frontend
    - Grounded Statutory Guardrails: refuses out-of-scope queries
    """

    async def answer_citizen_query_with_voice(
        self,
        query_text: str,
        session_context: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Statutory Retrieval
        statutes = statutory_rag.search(query=query_text, top_k=2)
        statute_context = statutes[0]["clause"] if statutes else ""

        # 2. Free LLM Router Explanation
        full_context = session_context or {}
        full_context["statute_grounding"] = statute_context

        explanation_result = await free_llm_router.generate_explanation(
            prompt=query_text,
            context=full_context,
            language=language
        )
        explanation_text = explanation_result["explanation"]

        # 3. Free Edge TTS Audio Synthesis
        audio_base64 = await self.synthesize_speech_base64(explanation_text, language)

        duration_ms = (time.time() - start_time) * 1000
        audit_logger.log_tool_execution(
            tool_name="Free_Edge_TTS_Voice_Synthesizer",
            input_summary={"query": query_text, "language": language},
            output_summary={
                "voice_used": VOICE_MAP.get(language, "en-IN-NeerjaNeural"),
                "audio_bytes_generated": len(audio_base64) if audio_base64 else 0
            },
            duration_ms=duration_ms,
            formula_used="Edge-TTS Neural WebSocket Streaming (Zero Cost)",
            source_statute="IT Act 2000 & Digital Accessibility Guidelines (GIGW 3.0)"
        )

        return {
            "query": query_text,
            "explanation": explanation_text,
            "audio_base64": audio_base64,
            "language": language,
            "statutory_citations": [
                {"statute": s["statute"], "clause": s["clause"], "url": s["url"]}
                for s in statutes
            ],
            "duration_ms": round(duration_ms, 2)
        }

    async def synthesize_speech_base64(self, text: str, language: str = "en") -> str:
        """Synthesize neural audio and return base64 encoded MP3."""
        voice = VOICE_MAP.get(language, "en-IN-NeerjaNeural")
        try:
            communicate = edge_tts.Communicate(text, voice)
            audio_buffer = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.extend(chunk["data"])
            
            return base64.b64encode(audio_buffer).decode("utf-8")
        except Exception as e:
            print(f"Edge TTS synthesis error (frontend SpeechSynthesis fallback active): {e}")
            return ""

voice_explainer = FreeVoiceExplainer()
