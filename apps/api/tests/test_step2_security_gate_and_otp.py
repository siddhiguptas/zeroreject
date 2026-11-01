import asyncio
import io
import pytest
from starlette.testclient import TestClient
from PIL import Image, ImageDraw

from apps.api.core.database import init_db
from apps.api.main import app

client = TestClient(app)


@pytest.fixture(autouse=True, scope="module")
def setup_module_database():
    loop = asyncio.new_event_loop()
    loop.run_until_complete(init_db())
    loop.close()


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


def test_scenario_a_step2_discrepancy_proceeds_to_curing():
    """
    Scenario A: Documents contain a discrepancy (e.g. name / guardian difference).
    Step 2 verification identifies the discrepancy and rejection risk.
    User is allowed to proceed to Step 3, where the biometric compiler
    synthesizes a statutory affidavit to cure the discrepancy.
    """
    session_id = "test_gate_mismatch_session_001"

    # Upload Aadhaar with name 'Aman Sharma'
    f_front = create_synthetic_doc_img(["GOVERNMENT OF INDIA", "Aman Sharma", "DOB: 14/05/2001", "MALE", "9876 5432 1098"])
    f_back = create_synthetic_doc_img(["Address:", "S/O: Suresh Sharma", "Hazratganj, Lucknow", "Uttar Pradesh - 226001"])
    # Upload PAN with different name 'Vikram Singh'
    f_pan = create_synthetic_doc_img(["INCOME TAX DEPARTMENT", "VIKRAM SINGH", "RAMESH SINGH", "01/01/1990", "XYZPS1122K"])

    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_front"}, files={"file": ("f.png", f_front, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_back"}, files={"file": ("b.png", f_back, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "pan"}, files={"file": ("p.png", f_pan, "image/png")})

    recon_res = client.post("/api/ingestion/reconcile-session", json={"session_id": session_id})
    assert recon_res.status_code == 200
    recon = recon_res.json()

    # Step 2 calculates rejection risk
    assert recon["rejection_risk_score"] > 0

    # Step 3: Biometric curing & affidavit synthesis proceeds successfully to cure discrepancies
    comp_res = client.post("/api/compiler/compile", json={"session_id": session_id, "workflow_target": "e_district_income"})
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["session_id"] == session_id
    assert comp_data["execution_ready"] is True


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


def test_authorize_otp_schema_and_screenshot_contract(monkeypatch):
    """
    Test that authorize-otp endpoint correctly formats FinalSubmissionReceipt with
    screenshot_base64 and otp_entered_screenshot_base64 fields for live frontend rendering.
    """
    from apps.api.agents.playwright_executor import playwright_agent

    dummy_session = "test_otp_receipt_session_003"
    fake_shot_otp = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    fake_shot_receipt = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    async def mock_submit_otp(session_id: str, otp_code: str):
        return {
            "success": True,
            "acknowledgement_number": "UP-EDIST-2026-999999",
            "status": "SUBMITTED",
            "screenshot_base64": fake_shot_receipt,
            "otp_entered_screenshot_base64": fake_shot_otp,
            "message": "Official submission stamped and recorded by State Government Portal."
        }

    monkeypatch.setattr(playwright_agent, "submit_otp_and_finalize", mock_submit_otp)

    res = client.post(
        "/api/execution/authorize-otp",
        json={"session_id": dummy_session, "otp_code": "123456", "citizen_consent": True}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["session_id"] == dummy_session
    assert data["acknowledgement_number"] == "UP-EDIST-2026-999999"
    assert data["filing_status"] == "CONFIRMED_AND_STAMPED"
    assert data["screenshot_base64"] == fake_shot_receipt
    assert data["otp_entered_screenshot_base64"] == fake_shot_otp


def test_correct_demographics_flow_and_affidavit_synchronization():
    """
    Test that mismatched demographic fields (such as father's name) can be resolved
    via /api/ingestion/correct-demographics, eliminating the mismatch penalty,
    updating the reconciliation status, and synchronizing into the synthesized affidavit.
    """
    session_id = "test_demographic_correction_session_004"

    # Upload Aadhaar with name 'Siddhi Gupta', C/O 'Nur Hussain Ali'
    f_front = create_synthetic_doc_img(["GOVERNMENT OF INDIA", "Siddhi Gupta", "DOB: 28/09/2006", "FEMALE", "5372 9459 4158"])
    f_back = create_synthetic_doc_img(["Address:", "C/O: Nur Hussain Ali", "8 B DPLS ROAD", "Assam - 781003"])
    # Upload Marksheet with father 'RAJ KUMAR GUPTA'
    f_marksheet = create_synthetic_doc_img(["CENTRAL BOARD OF SECONDARY EDUCATION", "SIDDHI GUPTA", "Father's / Guardian's Name: RAJ KUMAR GUPTA", "Date of Birth: 28-09-2006", "Roll No. 23222162"])

    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_front"}, files={"file": ("f.png", f_front, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "aadhaar_back"}, files={"file": ("b.png", f_back, "image/png")})
    client.post("/api/ingestion/upload", data={"session_id": session_id, "doc_type": "marksheet"}, files={"file": ("m.png", f_marksheet, "image/png")})

    recon_res = client.post("/api/ingestion/reconcile-session", json={"session_id": session_id})
    assert recon_res.status_code == 200
    recon = recon_res.json()

    # Before correction: Father name is mismatched (Nur Hussain Ali vs RAJ KUMAR GUPTA)
    assert recon["father_reconciliation"]["pass_threshold"] is False
    initial_risk = recon["rejection_risk_score"]
    assert initial_risk > 0

    # User applies authoritative correction: selects 'RAJ KUMAR GUPTA'
    corr_res = client.post(
        "/api/ingestion/correct-demographics",
        json={
            "session_id": session_id,
            "field": "father_name",
            "corrected_value": "RAJ KUMAR GUPTA",
            "workflow_target": "e_district_income"
        }
    )
    assert corr_res.status_code == 200
    corr_data = corr_res.json()

    # After correction: Father name is marked resolved and pass_threshold is True
    assert corr_data["father_reconciliation"]["pass_threshold"] is True
    assert corr_data["father_reconciliation"]["resolved_by_user"] is True
    assert corr_data["father_reconciliation"]["corrected_value"] == "RAJ KUMAR GUPTA"
    assert corr_data["rejection_risk_score"] < initial_risk

    # Verify that the synthesized affidavit and draft use 'RAJ KUMAR GUPTA'
    draft_res = client.get(f"/api/compiler/declaration-draft/{session_id}")
    assert draft_res.status_code == 200
    draft = draft_res.json()
    assert draft["draft"]["father_or_guardian_name"] == "RAJ KUMAR GUPTA"

    # User edits residential address and place to 'Rudrapur' in Step 3 affidavit modal
    regen_res = client.post(
        "/api/compiler/declaration-draft/generate-pdf",
        json={
            "session_id": session_id,
            "place": "Rudrapur",
            "custom_fields": {
                **draft["draft"],
                "father_or_guardian_name": "RAJ KUMAR GUPTA",
                "place": "Rudrapur",
                "address": "Rudrapur"
            }
        }
    )
    assert regen_res.status_code == 200

    # Verify draft reflects edited address
    updated_draft = client.get(f"/api/compiler/declaration-draft/{session_id}").json()
    assert updated_draft["draft"]["address"] == "Rudrapur"
    assert updated_draft["draft"]["place"] == "Rudrapur"

    # Verify that resolve_session_demographics prioritizes edited address over raw Aadhaar back
    from apps.api.routers.compiler import resolve_session_demographics
    from sqlalchemy import select
    from apps.api.models.entities import ExtractedDocument, ReconciliationRecord
    from apps.api.core.database import AsyncSessionLocal
    import asyncio

    async def check_demo():
        async with AsyncSessionLocal() as db:
            docs = (await db.execute(select(ExtractedDocument).where(ExtractedDocument.session_id == session_id))).scalars().all()
            recon = (await db.execute(select(ReconciliationRecord).where(ReconciliationRecord.session_id == session_id))).scalar_one_or_none()
            return resolve_session_demographics(docs, recon)

    demo = asyncio.run(check_demo())
    assert demo["app_address"] == "Rudrapur"
    assert demo["app_place"] == "Rudrapur"
    assert "Rudrapur" in [demo["app_district"], demo["app_place"]]
