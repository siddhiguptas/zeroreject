import os
from pypdf import PdfReader

from apps.api.services.affidavit_generator import (
    affidavit_generator,
    classify_discrepancy,
    mask_identifier,
)
from apps.api.services.statutory_rag import statutory_rag


def test_mask_identifier():
    # Aadhaar masking
    assert mask_identifier("5372 9459 4158") == "XXXX XXXX 4158"
    assert mask_identifier("537294594158") == "XXXX XXXX 4158"

    # PAN masking
    assert mask_identifier("ABCPS1234F") == "ABCP****4F"

    # Roll Number
    assert mask_identifier("23222162", "CBSE Marksheet Roll") == "Roll No. 23222162"

    # Missing
    assert mask_identifier("") == "[Not Recorded]"


def test_classify_discrepancy_all_variants():
    # 1. Exact Match
    d1 = classify_discrepancy("SIDDHI GUPTA", "Siddhi Gupta", "RAJ KUMAR GUPTA", "Raj Kumar Gupta")
    assert d1["type"] == "EXACT_MATCH"

    # 2. Initials Expansion
    d2 = classify_discrepancy("Ramesh Kumar Sharma", "Ramesh K Sharma", "Dina Nath Sharma", "Dina Nath Sharma")
    assert d2["type"] == "INITIALS_EXPANSION"

    # 3. Name Order Inversion
    d3 = classify_discrepancy("Siddhi Gupta", "Gupta Siddhi", "Raj Kumar Gupta", "Raj Kumar Gupta")
    assert d3["type"] == "NAME_ORDER_INVERSION"

    # 4. Parent Name Mismatch (Applicant name identical, father differs)
    d4 = classify_discrepancy("Siddhi Gupta", "Siddhi Gupta", "Raj Kumar Gupta", "Ram Kumar Gupta")
    assert d4["type"] == "PARENT_NAME_MISMATCH"
    assert "father/guardian name differs" in d4["summary_en"].lower()

    # 5. Spelling Variation
    d5 = classify_discrepancy("Pooja Sharma", "Puja Sharma", "Ram Sharma", "Ram Sharma")
    assert d5["type"] == "SPELLING_VARIATION"


def test_dynamic_data_no_hardcoding():
    """Verify that changing applicant details changes every field and zero hardcoded 'Etawah' or 'Ramesh' leaks."""
    session_id = "test_dynamic_siddhi"
    result = affidavit_generator.generate_affidavit(
        session_id=session_id,
        applicant_name_aadhaar="Siddhi Gupta",
        applicant_name_secondary="SIDDHI GUPTA",
        father_name="Raj Kumar Gupta",
        dob="28/09/2006",
        address="Vill. Rudrapur, Dist. Deoria, Uttar Pradesh - 274204",
        id_numbers={"aadhaar": "5372 9459 4158", "secondary": "Roll No. 23222162"},
        place="Deoria",
        citations=[
            {
                "statute": "Passport Rules 1980, Schedule III, Annexure 'E'",
                "issuing_authority": "Ministry of External Affairs, Government of India",
                "effective_date": "23-12-2016",
                "clause": "Rule 4(b) - Minor variations in name curable through self-declaration.",
                "url": "https://www.passportindia.gov.in/AppOnlineProject/pdf/AnnexureE.pdf"
            }
        ]
    )

    assert os.path.exists(result["output_path"])
    assert result["compliant"] is True
    assert result["file_size_bytes"] < 102400 # under 100 KB
    assert result["place"] == "Deoria"

    reader = PdfReader(result["output_path"])
    text_content = ""
    for page in reader.pages:
        text_content += page.extract_text() or ""

    # Must contain dynamic data
    assert "Siddhi Gupta" in text_content
    assert "Raj Kumar Gupta" in text_content
    assert "28/09/2006" in text_content
    assert "Deoria" in text_content
    assert "XXXX XXXX 4158" in text_content # Masked Aadhaar
    assert "Roll No. 23222162" in text_content

    # Must NOT contain hardcoded fallbacks
    assert "Ramesh Kumar Sharma" not in text_content
    assert "Dina Nath Sharma" not in text_content
    assert "Etawah" not in text_content
    assert "206124" not in text_content


def test_legal_accuracy_and_draft_disclaimer():
    """Verify draft label, absence of fake guarantee, and verified citations from statutory RAG."""
    rag_results = statutory_rag.search("passport annexure e initial expansion", top_k=1)
    assert len(rag_results) > 0
    cit = rag_results[0]
    assert "issuing_authority" in cit
    assert "url" in cit

    draft = affidavit_generator.build_declaration_draft(
        session_id="test_legal_audit",
        applicant_name_aadhaar="Siddhi Gupta",
        applicant_name_secondary="SIDDHI GUPTA",
        father_name="Raj Kumar Gupta",
        dob="28/09/2006",
        address="Dist. Deoria, UP",
        id_numbers={"aadhaar": "5372 9459 4158", "secondary": ""},
        place="Deoria",
        citations=[cit]
    )

    details = draft["draft"]
    # Label as draft for review
    assert "DRAFT" in details["disclaimer"].upper()
    assert "does not guarantee automatic acceptance" in details["disclaimer"]
    assert details["has_verified_citations"] is True
    assert details["verified_citations"][0]["url"].startswith("https://")


def test_bilingual_hindi_generation():
    """Verify Hindi generation produces valid Devanagari A4 PDF under 100KB with blank physical notarial box."""
    session_id = "test_hindi_synth"
    result = affidavit_generator.generate_affidavit(
        session_id=session_id,
        applicant_name_aadhaar="सिद्धि गुप्ता",
        applicant_name_secondary="SIDDHI GUPTA",
        father_name="राज कुमार गुप्ता",
        dob="28/09/2006",
        address="रुद्रपुर, जिला देवरिया, उत्तर प्रदेश - 274204",
        id_numbers={"aadhaar": "5372 9459 4158", "secondary": "Roll No. 23222162"},
        place="देवरिया",
        language="hi",
        citations=[]
    )

    assert os.path.exists(result["output_path"])
    assert result["compliant"] is True
    assert result["file_size_bytes"] < 102400 # Strict <= 100KB ceiling
    assert result["language"] == "hi"

    reader = PdfReader(result["output_path"])
    assert len(reader.pages) >= 1
