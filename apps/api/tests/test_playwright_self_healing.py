import multiprocessing
import os
import time

import httpx
import pytest
import uvicorn
from apps.api.agents.playwright_executor import playwright_agent
from apps.api.core.config import settings
from apps.gov_portal_target.app import app as gov_app


def run_gov_server():
    uvicorn.run(gov_app, host="127.0.0.1", port=8099, log_level="warning")

@pytest.fixture(scope="module")
def gov_portal_server():
    # Spin up standalone portal on test port 8099
    proc = multiprocessing.Process(target=run_gov_server, daemon=True)
    proc.start()
    time.sleep(1.5) # Wait for server startup
    yield "http://127.0.0.1:8099"
    proc.terminate()
    proc.join()

@pytest.mark.asyncio
async def test_playwright_survives_502_chaos(gov_portal_server):
    # Enable chaos mode via API endpoint on the running server
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{gov_portal_server}/api/chaos/toggle", json={"enable": True})
        assert res.status_code == 200
        assert res.json().get("chaos_mode") is True

    session_id = "test_playwright_chaos_session"
    target_url = f"{gov_portal_server}/"

    applicant_data = {
        "applicant_name": "Ramesh Kumar Sharma",
        "father_name": "Dina Nath Sharma",
        "dob": "14/08/1996",
        "gender": "MALE",
        "address_line": "Vill. Bakewar, Bharthana Road",
        "pincode": "206124",
        "district": "Etawah",
        "state": "Uttar Pradesh"
    }

    asset_paths = {
        "portrait": os.path.join(settings.SAMPLE_DOCS_DIR, "portrait_raw.jpg"),
        "signature": os.path.join(settings.SAMPLE_DOCS_DIR, "signature_raw.png"),
        "affidavit": os.path.join(settings.AFFIDAVITS_DIR, f"{session_id}_statutory_affidavit.pdf")
    }

    # Ensure sample affidavit exists
    from apps.api.services.affidavit_generator import affidavit_generator
    affidavit_generator.generate_affidavit(
        session_id=session_id,
        applicant_name_aadhaar="Ramesh Kumar Sharma",
        applicant_name_secondary="RAMESH K SHARMA",
        father_name="Dina Nath Sharma",
        dob="14/08/1996",
        address="Vill. Bakewar, Bharthana Road, Dist. Etawah, UP - 206124",
        id_numbers={"aadhaar": "4892 7104 3829"},
        citations=[{"statute": "Passport Seva Annexure E", "clause": "Rule 4(b)"}]
    )

    events_received = []
    async for event in playwright_agent.execute_portal_workflow(
        session_id=session_id,
        target_url=target_url,
        applicant_data=applicant_data,
        asset_paths=asset_paths,
        chaos_enabled=True
    ):
        events_received.append(event)
        if event.get("status") == "AWAITING_OTP":
            break

    # Verify that chaos was intercepted and self-healed
    event_names = [e.get("step_name") for e in events_received]
    assert "AGENT_INITIALIZATION" in event_names
    assert "STEP1_SUBMITTED" in event_names
    assert "STEP2_COMPLETED" in event_names
    assert "CHAOS_502_DETECTED" in event_names
    assert "SELF_HEALING_RETRY" in event_names
    assert "HUMAN_IN_THE_LOOP_OTP_GATE" in event_names

    # Verify final OTP submission
    otp_res = await playwright_agent.submit_otp_and_finalize(
        session_id=session_id,
        otp_code="719340"
    )
    assert otp_res["status"] == "SUBMITTED"
    assert "UP-EDIST-2026" in otp_res["acknowledgement_number"]
