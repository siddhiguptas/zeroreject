"""
Tests for 4-Gate Virtual Lekhpal Pre-Flight Audit, Verhoeff D5 Checksum,
PAN Entity Verification, CSC Packet Exporter (.ZIP), Benchmark Validation,
and Gov Portal Rule 18-A Server-Side Enforcer.
"""

import io
import json
import zipfile

from fastapi.testclient import TestClient

from apps.api.main import app as api_app
from apps.api.services.qr_verifier import QRVerifierService, qr_verifier
from apps.gov_portal_target.app import app as gov_app


def test_verhoeff_checksum_d5_rigorous():
    """
    Validates the pure-Python Verhoeff Dihedral Group D5 implementation.
    Tests valid numbers, invalid numbers, and single-digit / transposition mutations.
    """
    # 1. Valid 12-digit Aadhaar number
    valid_aadhaar = "489271043827"
    assert QRVerifierService.validate_verhoeff(valid_aadhaar) is True
    assert qr_verifier.validate_verhoeff("4892 7104 3827") is True

    # 2. Tampered check digit
    tampered_aadhaar = "489271043829"
    assert QRVerifierService.validate_verhoeff(tampered_aadhaar) is False

    # 3. Wrong length
    assert QRVerifierService.validate_verhoeff("12345") is False
    assert QRVerifierService.validate_verhoeff("1234567890123") is False

    # 4. Single-digit mutation detection across every position
    for pos in range(12):
        original_digit = int(valid_aadhaar[pos])
        for mutated_digit in range(10):
            if mutated_digit != original_digit:
                mutated = valid_aadhaar[:pos] + str(mutated_digit) + valid_aadhaar[pos + 1:]
                assert QRVerifierService.validate_verhoeff(mutated) is False, (
                    f"Verhoeff failed to catch single-digit mutation at pos {pos}: {mutated}"
                )

    # 5. Adjacent transposition detection
    transposed = valid_aadhaar[1] + valid_aadhaar[0] + valid_aadhaar[2:]
    assert QRVerifierService.validate_verhoeff(transposed) is False


def test_pan_entity_type_analysis():
    """
    Validates 10-character PAN syntax and individual citizenship entity analysis (4th character).
    """
    # Valid individual PAN
    ind_res = QRVerifierService.validate_pan("ABCPS1234F")
    assert ind_res["valid"] is True
    assert ind_res["is_individual"] is True
    assert ind_res["entity_code"] == "P"
    assert ind_res["entity_description"] == "Individual Citizen / Person"

    # Valid company PAN
    comp_res = QRVerifierService.validate_pan("AAACC9999Z")
    assert comp_res["valid"] is True
    assert comp_res["is_individual"] is False
    assert comp_res["entity_code"] == "C"
    assert "Company" in comp_res["entity_description"]

    # Valid Trust PAN
    trust_res = QRVerifierService.validate_pan("DELTT0001K")
    assert trust_res["valid"] is True
    assert trust_res["is_individual"] is False
    assert trust_res["entity_code"] == "T"

    # Malformed PAN strings
    bad_res1 = QRVerifierService.validate_pan("12345ABCDE")
    assert bad_res1["valid"] is False
    assert bad_res1["is_individual"] is False

    bad_res2 = QRVerifierService.validate_pan("ABCDE12345")  # 5th numeric instead of letter
    assert bad_res2["valid"] is False

    bad_res3 = QRVerifierService.validate_pan("ABCD12345F")  # Only 4 initial letters
    assert bad_res3["valid"] is False


def test_qr_cross_verifier_optical_matching():
    """
    Tests optical OCR vs. decoded QR code cross-verification.
    """
    # Case 1: Matching payload
    payload = "UIDAI://Ramesh Kumar Sharma/489271043827/1996"
    match_res = QRVerifierService.cross_verify_qr_vs_ocr(
        qr_payload=payload,
        ocr_name="Ramesh Kumar Sharma",
        ocr_id="4892 7104 3827",
    )
    assert match_res["matched"] is True
    assert match_res["status"] == "VERIFIED"
    assert match_res["confidence"] >= 0.95

    # Case 2: Mismatched identity
    mismatch_res = QRVerifierService.cross_verify_qr_vs_ocr(
        qr_payload="UIDAI://Suresh Verma/111122223333/1985",
        ocr_name="Ramesh Kumar Sharma",
        ocr_id="4892 7104 3827",
    )
    assert mismatch_res["matched"] is False
    assert mismatch_res["status"] == "MISMATCH_FLAGGED"

    # Case 3: Empty/Unchecked fallback
    fallback_res = QRVerifierService.cross_verify_qr_vs_ocr(
        qr_payload="",
        ocr_name="Ramesh Kumar Sharma",
        ocr_id="4892 7104 3827",
    )
    assert fallback_res["status"] == "UNCHECKED"


def test_zip_packet_export_streaming_endpoint():
    """
    Tests GET /api/compiler/export-packet/{session_id} and /api/v1/export-packet/{session_id}.
    Verifies valid ZIP archive format, manifest schema, and HTTP headers.
    """
    client = TestClient(api_app)
    session_id = "test_export_sess_001"

    # Test main endpoint
    res = client.get(f"/api/compiler/export-packet/{session_id}")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/zip"
    assert "attachment; filename=ZeroReject_CSC_Packet_" in res.headers["content-disposition"]

    # Verify zip content
    zip_buf = io.BytesIO(res.content)
    with zipfile.ZipFile(zip_buf, "r") as zf:
        namelist = zf.namelist()
        assert "04_pre_flight_audit_manifest.json" in namelist

        # Inspect manifest JSON
        manifest_raw = zf.read("04_pre_flight_audit_manifest.json").decode("utf-8")
        manifest = json.loads(manifest_raw)

        assert manifest["lekhpal_pre_flight_audit"]["status"] == "PRE_FLIGHT_PASSED_100_PERCENT"
        assert "gate1_phonetic_graph" in manifest["four_gate_audit"]
        assert "gate2_checksum_qr" in manifest["four_gate_audit"]
        assert "gate3_statutory_rules" in manifest["four_gate_audit"]
        assert "gate4_lgd_jurisdiction" in manifest["four_gate_audit"]
        assert manifest["applicant"]["canonical_name"] == "Ramesh Kumar Sharma"

    # Test alias route /api/v1/export-packet/{session_id}
    res_v1 = client.get(f"/api/v1/export-packet/{session_id}")
    assert res_v1.status_code == 200
    assert res_v1.headers["content-type"] == "application/zip"


def test_benchmark_raw_vs_cured_endpoint():
    """
    Tests POST /api/audit/benchmark-validation (Feature D - Before vs. After Rejection Simulator).
    Verifies 422 rejected raw status with 3 violations vs 200 accepted cured status with 0 violations.
    """
    client = TestClient(api_app)
    res = client.post("/api/audit/benchmark-validation")
    assert res.status_code == 200
    data = res.json()

    # Raw packet benchmark checks
    raw = data["raw_uncured"]
    assert raw["http_status"] == 422
    assert raw["status"] == "REJECTED_BY_PORTAL"
    assert raw["violations_count"] == 3
    violation_codes = [v["code"] for v in raw["violations"]]
    assert "ERR_SIGNATURE_EXCEEDS_20KB" in violation_codes
    assert "ERR_NAME_TOKEN_MISMATCH" in violation_codes
    assert "ERR_MISSING_ANNEXURE_E" in violation_codes

    # Cured packet benchmark checks
    cured = data["zeroreject_cured"]
    assert cured["http_status"] == 200
    assert cured["status"] == "ACCEPTED_AND_REGISTERED"
    assert cured["violations_count"] == 0
    assert len(cured["violations"]) == 0
    assert len(cured["four_gates_passed"]) == 4

    # Quantitative delta check
    assert "100%" in data["delta_risk_reduction"]


def test_gov_portal_rule_18a_validation():
    """
    Tests the standalone Gov Target Portal Rule 18-A Server-Side Enforcer (POST /portal/validate-upload).
    Verifies 422 rejections on uncured files and 200 acceptance on cured files.
    """
    client = TestClient(gov_app)

    # 1. Rejection: Signature exceeds 20KB (> 20480 bytes)
    oversized_sig = b"A" * 25000  # 25 KB
    res_bad_sig = client.post(
        "/portal/validate-upload",
        files={"signature_file": ("sig.jpg", oversized_sig, "image/jpeg")},
        data={"applicant_name": "Ramesh Kumar Sharma"},
    )
    assert res_bad_sig.status_code == 422
    bad_sig_data = res_bad_sig.json()
    assert any(v["code"] == "ERR_SIGNATURE_EXCEEDS_20KB" for v in bad_sig_data["violations"])

    # 2. Rejection: Photo exceeds 50KB (> 51200 bytes)
    oversized_photo = b"B" * 60000  # 60 KB
    res_bad_photo = client.post(
        "/portal/validate-upload",
        files={"photo_file": ("photo.jpg", oversized_photo, "image/jpeg")},
        data={"applicant_name": "Ramesh Kumar Sharma"},
    )
    assert res_bad_photo.status_code == 422
    bad_photo_data = res_bad_photo.json()
    assert any(v["code"] == "ERR_PHOTO_EXCEEDS_50KB" for v in bad_photo_data["violations"])

    # 3. Rejection: Name mismatch without Annexure 'E'
    res_bad_name = client.post(
        "/portal/validate-upload",
        data={
            "applicant_name": "Ramesh Kumar Sharma",
            "secondary_name": "RAMESH K SHARMA",
            "has_annexure_e": "false",
        },
    )
    assert res_bad_name.status_code == 422
    bad_name_data = res_bad_name.json()
    assert any(v["code"] == "ERR_NAME_TOKEN_MISMATCH" for v in bad_name_data["violations"])
    assert any(v["code"] == "ERR_MISSING_ANNEXURE_E" for v in bad_name_data["violations"])

    # 4. Acceptance: Cured assets under limits with Annexure 'E'
    cured_photo = b"JPEG_PHOTO" * 1000  # ~10 KB
    cured_sig = b"JPEG_SIG" * 1000  # ~8 KB
    cured_affidavit = b"%PDF-1.4..." * 1000  # ~11 KB

    res_cured = client.post(
        "/portal/validate-upload",
        files={
            "photo_file": ("photo.jpg", cured_photo, "image/jpeg"),
            "signature_file": ("sig.jpg", cured_sig, "image/jpeg"),
            "affidavit_file": ("affidavit.pdf", cured_affidavit, "application/pdf"),
        },
        data={
            "applicant_name": "Ramesh Kumar Sharma",
            "secondary_name": "RAMESH K SHARMA",
            "has_annexure_e": "true",
        },
    )
    assert res_cured.status_code == 200
    cured_data = res_cured.json()
    assert cured_data["status"] == "ACCEPTED"
    assert cured_data["rule_18a_compliant"] is True


def test_gov_portal_public_docket_verification_registry():
    """
    Tests GET /verify?ref=... on the Gov Target Portal registry.
    """
    client = TestClient(gov_app)

    # 1. Query verified reference
    ref_num = "UP-EDIST-2026-TEST8888"
    res = client.get(f"/verify?ref={ref_num}")
    assert res.status_code == 200
    assert "Application Filing Verification Certificate" in res.text
    assert ref_num in res.text
    assert "VERIFIED &amp; REGISTERED IN STATE ARCHIVE" in res.text or "VERIFIED & REGISTERED" in res.text

    # 2. Registry empty lookup form
    res_empty = client.get("/verify")
    assert res_empty.status_code == 200
    assert "Public Docket Verification Registry" in res_empty.text
