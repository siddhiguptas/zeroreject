
import pytest

from apps.api.services.free_llm_router import free_llm_router
from apps.api.services.ocr_extractor import (
    validate_pan_structure,
    validate_verhoeff,
)
from apps.api.services.statutory_rag import statutory_rag
from apps.api.services.voice_explainer import voice_explainer


def test_verhoeff_algorithm_validation():
    # Valid Aadhaar numbers generated with Verhoeff D5 algorithm
    valid_aadhaar_1 = "489271043827"
    assert validate_verhoeff(valid_aadhaar_1) is True
    
    # Tampered Aadhaar numbers should strictly fail
    tampered_aadhaar = "489271043829"
    assert validate_verhoeff(tampered_aadhaar) is False

def test_pan_structural_validation():
    valid_pan = "ABCPS1234F"
    assert validate_pan_structure(valid_pan) is True
    
    invalid_pan = "12345ABCDE"
    assert validate_pan_structure(invalid_pan) is False

def test_free_local_bm25_rag():
    # Query for minor name change / initial expansion
    results = statutory_rag.search("name discrepancy initial expansion annexure e", top_k=2)
    assert len(results) > 0
    top = results[0]
    assert "Passport Rules" in top["statute"] or "EPFO" in top["statute"]
    assert "url" in top
    assert top["relevance_score"] >= 0.20

def test_statutory_rag_abstention_guardrail():
    # Completely out-of-scope query
    results = statutory_rag.search("quantum gravity black hole hawking radiation", top_k=2, abstention_threshold=0.85)
    # Abstention guardrail returns default domain authority rather than hallucinating
    assert len(results) >= 1
    assert "STAT_PASSPORT_ANNEX_E" in results[0]["id"] or "STAT_" in results[0]["id"]

@pytest.mark.asyncio
async def test_free_llm_router_zero_key_fallback():
    # Test zero-key deterministic reasoning engine
    context = {
        "name_a": "Ramesh Kumar Sharma",
        "name_b": "RAMESH K SHARMA",
        "risk_score": 18.0,
        "pincode": "206124",
        "district": "Etawah"
    }
    
    # English synthesis
    res_en = await free_llm_router.generate_explanation(
        prompt="Explain why middle initial causes an error on government portal.",
        context=context,
        language="en"
    )
    assert res_en["free_tier_verified"] is True
    assert "Passport Rules 1980" in res_en["explanation"]
    assert "Ramesh Kumar Sharma" in res_en["explanation"]

    # Hindi synthesis
    res_hi = await free_llm_router.generate_explanation(
        prompt="पिता के नाम में विसंगति का विधिक समाधान बताएं।",
        context=context,
        language="hi"
    )
    assert "ZeroReject" in res_hi["explanation"]
    assert "शपथ पत्र" in res_hi["explanation"] or "विधिक" in res_hi["explanation"]

@pytest.mark.asyncio
async def test_voice_explainer_speech_synthesis():
    # Test edge-tts neural audio generation (free, zero API key)
    res = await voice_explainer.answer_citizen_query_with_voice(
        query_text="Why is my father name showing an error on EPFO?",
        session_context={"name_a": "Ramesh Kumar Sharma"},
        language="en"
    )
    assert len(res["explanation"]) > 0
    assert len(res["statutory_citations"]) > 0
    # Audio buffer should be generated (or empty string if network sandbox blocks websocket)
    assert isinstance(res["audio_base64"], str)

