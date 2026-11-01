import pytest
from httpx import ASGITransport, AsyncClient

from apps.api.main import app


@pytest.mark.asyncio
async def test_digital_twin_overview_and_graph():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Load sample packet first to have a complete session
        load_res = await client.post("/api/ingestion/load-sample-packet", json={"workflow_target": "e_district_income"})
        assert load_res.status_code == 200
        packet_data = load_res.json()
        session_id = packet_data["session_id"]
        assert session_id

        # Test Overview
        overview_res = await client.get(f"/api/digital-twin/{session_id}/overview")
        assert overview_res.status_code == 200
        ov = overview_res.json()
        assert ov["session_id"] == session_id
        assert "composite_risk_score" in ov
        assert "portal_schema_requirements" in ov
        assert len(ov["portal_schema_requirements"]) > 0

        # Test Evidence Graph
        graph_res = await client.get(f"/api/digital-twin/{session_id}/graph")
        assert graph_res.status_code == 200
        graph = graph_res.json()
        assert len(graph["nodes"]) > 0
        assert len(graph["edges"]) > 0
        node_categories = {n["category"] for n in graph["nodes"]}
        assert "document" in node_categories
        assert "entity" in node_categories
        assert "requirement" in node_categories

        # Test What-If Simulation (Immutable - does not corrupt DB)
        sim_res = await client.post(
            f"/api/digital-twin/{session_id}/simulate",
            json={
                "field_overrides": {"name": "RAMESH KUMAR SHARMA", "pincode": "206124"},
                "selected_remediations": ["ANNEXURE_E_AFFIDAVIT"]
            }
        )
        assert sim_res.status_code == 200
        sim_data = sim_res.json()
        assert "before_state" in sim_data
        assert "after_state" in sim_data
        assert "risk_delta" in sim_data
        assert len(sim_data["affected_nodes"]) > 0

        # Test Crash Test Rehearsal
        crash_res = await client.post(
            f"/api/digital-twin/{session_id}/crash-test",
            json={"workflow_target": "e_district_income", "simulate_chaos": True}
        )
        assert crash_res.status_code == 200
        ct = crash_res.json()
        assert "checklist" in ct
        assert "portal_steps" in ct
        assert ct["overall_verdict"] in ["REHEARSAL_PASSED", "REHEARSAL_WARNING", "REHEARSAL_FAILED"]

