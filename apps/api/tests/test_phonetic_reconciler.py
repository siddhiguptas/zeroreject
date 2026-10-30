import pytest
from apps.api.services.phonetic_reconciler import phonetic_reconciler


def test_transliterate_indic_to_latin():
    devanagari_name = "रमेश कुमार शर्मा"
    latin = phonetic_reconciler.transliterate_indic_to_latin(devanagari_name)
    assert "Ramesh" in latin or "Ramesa" in latin
    assert "Sharma" in latin or "Sarma" in latin

def test_token_inversion_and_jaro_winkler():
    name_a = "Ramesh Kumar Sharma"
    name_b = "Sharma Ramesh Kumar"
    breakdown = phonetic_reconciler.reconcile_names(name_a, name_b)
    
    assert breakdown.pass_threshold is True
    assert breakdown.jaro_winkler_score >= 0.90
    assert breakdown.token_sort_ratio >= 0.90

def test_middle_initial_expansion():
    name_a = "Ramesh Kumar Sharma"
    name_b = "RAMESH K SHARMA"
    breakdown = phonetic_reconciler.reconcile_names(name_a, name_b)
    
    assert breakdown.pass_threshold is True
    assert breakdown.initial_expansion_detected is True

def test_double_metaphone_match():
    # Spelling variation: Choudhary vs Chaudhuri
    dm = phonetic_reconciler.compute_double_metaphone("CHOUDHARY", "CHAUDHURI")
    assert dm.match_level in ["EXACT", "SECONDARY"]

@pytest.mark.asyncio
async def test_validate_pincode_live():
    # Test Bakewar / Etawah PIN code
    res = await phonetic_reconciler.validate_pincode_live("206124")
    assert res.valid is True
    assert "Etawah" in res.district or "Uttar Pradesh" in res.state

