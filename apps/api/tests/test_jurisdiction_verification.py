import pytest
from httpx import ASGITransport, AsyncClient
from apps.api.main import app


@pytest.mark.asyncio
async def test_jurisdiction_verification_valid_pins():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. UP PIN: 274204 (Deoria / Rudrapur)
        res1 = await ac.get("/api/jurisdiction/verify?pin=274204")
        assert res1.status_code == 200
        d1 = res1.json()
        assert d1["valid"] is True
        assert d1["status"] == "VERIFIED"
        assert d1["district"] == "Deoria"
        assert d1["state"] == "Uttar Pradesh"
        assert "Rudrapur" in d1["taluka_or_subdistrict"]
        assert len(d1["post_offices"]) >= 2

        # 2. Delhi PIN: 110001 (New Delhi / Connaught Place)
        res2 = await ac.get("/api/jurisdiction/verify?pin=110001")
        assert res2.status_code == 200
        d2 = res2.json()
        assert d2["valid"] is True
        assert d2["status"] == "VERIFIED"
        assert d2["district"] == "New Delhi"
        assert d2["state"] == "Delhi"
        assert "Connaught Place H.O" in d2["post_offices"]

        # 3. Maharashtra PIN: 400001 (Mumbai GPO)
        res3 = await ac.get("/api/jurisdiction/verify?pin=400001")
        assert res3.status_code == 200
        d3 = res3.json()
        assert d3["valid"] is True
        assert d3["district"] == "Mumbai"
        assert d3["state"] == "Maharashtra"
        assert "Mumbai G.P.O" in d3["post_offices"]

        # 4. Karnataka PIN: 560001 (Bangalore GPO)
        res4 = await ac.get("/api/jurisdiction/verify?pin=560001")
        assert res4.status_code == 200
        d4 = res4.json()
        assert d4["valid"] is True
        assert d4["district"] == "Bangalore"
        assert d4["state"] == "Karnataka"


@pytest.mark.asyncio
async def test_jurisdiction_verification_invalid_and_unknown_pins():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Invalid format: 3 digits
        res_short = await ac.get("/api/jurisdiction/verify?pin=123")
        assert res_short.status_code == 400
        assert "6 digits" in res_short.json()["detail"]

        # Invalid format: characters
        res_alpha = await ac.get("/api/jurisdiction/verify?pin=27420A")
        assert res_alpha.status_code == 400

        # Unknown / unassigned PIN: 999999
        res_unknown = await ac.get("/api/jurisdiction/verify?pin=999999")
        assert res_unknown.status_code == 200
        d_unknown = res_unknown.json()
        assert d_unknown["valid"] is False
        assert d_unknown["district"] == ""
        assert d_unknown["status"] in ["NOT_FOUND", "UNAVAILABLE"]

