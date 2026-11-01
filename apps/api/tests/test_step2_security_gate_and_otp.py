import io
import pytest
from starlette.testclient import TestClient
from PIL import Image, ImageDraw

from apps.api.main import app

client = TestClient(app)


def create_synthetic_doc_img(lines):
    img = Image.new("RGB", (800, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    y = 30
    for line in lines:
        draw.text((30, y), line, fill=(0, 0, 0))
        y += 40
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_scenario_a_step2_mismatch_blocks_compile_and_playwright():
    """
    Scenario A: Documents contain a mismatch (e.g. name / guardian discrepancy).
    Step 2 verification results in rejection risk > 0%.
    Calling Step 3 (/api/compiler/compile) or Step 4 (/api/execution/stream) MUST be strictly blocked
    with HTTP 403 Forbidden.
    """
    session_id = "test_gate_mismatch_session_001"

    # Upload Aadhaar with name 'Aman Sharma'
    f_front = create_synthetic_doc_img(["GOVERNMENT OF INDIA", "Aman Sharma", "DOB: 14/05/2001", "MALE", "9876 5432 1098"])
    f_back = create_synthetic_doc_img(["Address:", "S/O: Suresh Sharma", "Hazratganj, Lucknow", "Uttar Pradesh - 226001"])
    # Upload PAN with completely different name 'Vikram Singh' -> Fatal Mismatch
    f_pan = create_synthetic_doc_img(["INCOME TAX DEPARTMENT", "VIKRAM SINGH", "RAMESH SINGH", "01/01/1990", "XYZPS1122K"])

    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_front"}, files={"file": ("f.png", f_front, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_back"}, files={"file": ("b.png", f_back, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "pan"}, files={"file": ("p.png", f_pan, "image/png")})

    recon_res = client.post("/api/ingestion/reconcile-session", json={"session_id": session_id})
    assert recon_res.status_code == 200
    recon = recon_res.json()

    # Step 2 must calculate high rejection risk and flag FATAL_MISMATCH
    assert recon["rejection_risk_score"] > 0
    assert recon["status"] in ["FATAL_MISMATCH", "CURABLE_DISCREPANCY"]

    # ATTEMPT STEP 3: Compiler must reject with HTTP 403 Forbidden
    comp_res = client.post("/api/compiler/compile", json={"session_id": session_id, "workflow_target": "e_district_income"})
    assert comp_res.status_code == 403
    assert "Security Gate" in comp_res.json()["detail"]
    assert "0% rejection risk" in comp_res.json()["detail"]

    # ATTEMPT STEP 4: Execution stream must reject with HTTP 403 Forbidden
    exec_res = client.get(f"/api/execution/stream/{session_id}")
    assert exec_res.status_code == 403
    assert "Security Gate" in exec_res.json()["detail"]


def test_scenario_b_step2_pass_unlocks_compile():
    """
    Scenario B: All mandatory checks pass with 100% verification and 0% risk.
    Step 2 verification unlocks progression to Step 3.
    """
    session_id = "test_gate_pass_session_002"

    # Upload clean matching documents: Priya Sen, DOB 02/11/1998, PIN 700016
    f_front = create_synthetic_doc_img(["GOVERNMENT OF INDIA", "Priya Sen", "DOB: 02/11/1998", "FEMALE", "1234 5678 9012"])
    f_back = create_synthetic_doc_img(["Address:", "D/O: Debashis Sen", "Park Street, Kolkata", "West Bengal - 700016"])
    f_pan = create_synthetic_doc_img(["INCOME TAX DEPARTMENT", "PRIYA SEN", "DEBASHIS SEN", "02/11/1998", "XYZPS1122M"])

    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_front"}, files={"file": ("f.png", f_front, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_back"}, files={"file": ("b.png", f_back, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "pan"}, files={"file": ("p.png", f_pan, "image/png")})

    recon_res = client.post("/api/ingestion/reconcile-session", json={"session_id": session_id})
    assert recon_res.status_code == 200
    recon = recon_res.json()

    # Step 2 verification must be 100% passed with 0% risk
    assert recon["rejection_risk_score"] == 0.0
    assert recon["status"] == "PASS"

    # Step 3: Biometric curing is unlocked and executes successfully
    comp_res = client.post("/api/compiler/compile", json={"session_id": session_id, "workflow_target": "e_district_income"})
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["session_id"] == session_id
    assert comp_data["execution_ready"] is True
    assert len(comp_data["assets"]) >= 3
