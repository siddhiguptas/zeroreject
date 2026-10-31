import pytest
from apps.api.services.ocr_extractor import ocr_extractor
from apps.api.services.free_llm_router import free_llm_router

def test_marksheet_civic_entity_extraction():
    sample_marksheet_text = """
    CENTRAL BOARD OF SECONDARY EDUCATION
    MARKS STATEMENT CUM CERTIFICATE
    SECONDARY SCHOOL EXAMINATION, 2021
    
    This is to certify that   SIDDHI GUPTA
    Roll No. 23222162
    Mother's Name             RANJANA DEVI
    Father's / Guardian's Name RAJ KUMAR GUPTA
    Date of Birth 28-09-2006 28TH SEPTEMBER TWO THOUSAND SIX
    School 70899- RANI LAXMI BAI MEM SCH INDIRA NGR LUCKNOW UP
    
    SUB. CODE  SUBJECT                 MARKS
    184        ENGLISH LNG & LIT.      098
    087        SOCIAL SCIENCE          100
    
    Dated : 03-08-2021
    Controller of Examinations
    """
    extracted = ocr_extractor._parse_civic_entities(sample_marksheet_text, "marksheet", {})
    
    assert extracted.full_name == "SIDDHI GUPTA"
    assert extracted.father_or_spouse_name == "RAJ KUMAR GUPTA"
    assert extracted.dob == "28/09/2006"
    assert "23222162" in str(extracted.id_number)
    # Ensure Mother's Name was never mistaken for Candidate Name
    assert "RANJANA" not in extracted.full_name
    assert "Mothers" not in extracted.full_name

@pytest.mark.asyncio
async def test_dynamic_voice_explanation_synthesis():
    # Citizen with exact match (e.g. Siddhi Gupta across Aadhaar and Marksheet)
    ctx_exact = {
        "name_a": "Siddhi Gupta",
        "name_b": "SIDDHI GUPTA",
        "canonical_name": "Siddhi Gupta",
        "father_name": "Raj Kumar Gupta",
        "dob_a": "28/09/2006",
        "pincode": "274204",
        "district": "Deoria",
        "risk_score": 0.0,
        "initial_expansion_detected": False
    }

    res_hi = await free_llm_router.generate_explanation(
        prompt="आवेदक सिद्धि गुप्ता के दस्तावेजों के सत्यापन और वैधानिक स्थिति का विवरण दें।",
        context=ctx_exact,
        language="hi"
    )
    # Must speak about Siddhi Gupta and Raj Kumar Gupta, NOT Ramesh Kumar Sharma or K Kumar!
    assert "Siddhi Gupta" in res_hi["explanation"]
    assert "Raj Kumar Gupta" in res_hi["explanation"]
    assert "Ramesh" not in res_hi["explanation"]

    res_en = await free_llm_router.generate_explanation(
        prompt="Provide the statutory verification summary for applicant Siddhi Gupta.",
        context=ctx_exact,
        language="en"
    )
    assert "Siddhi Gupta" in res_en["explanation"]
    assert "Raj Kumar Gupta" in res_en["explanation"]
    assert "Deoria" in res_en["explanation"]
    assert "0%" in res_en["explanation"]
    assert "Ramesh" not in res_en["explanation"]

