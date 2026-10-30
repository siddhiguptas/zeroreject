import os
import re
import uuid
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="State e-District & Citizen Services Portal", version="2026.1")

# In-memory session & chaos state
portal_sessions = {}
chaos_state = {"enabled": False, "failure_count": 0, "max_failures_before_recovery": 1}


# HTML Template Helper
def render_page(title: str, body_html: str, step: int = 1) -> str:
    steps_indicator = "".join(
        [
            f'<div class="flex-1 text-center py-2 border-b-4 {"border-blue-800 font-bold text-blue-900" if s == step else "border-gray-300 text-gray-500"}">Step {s}: {["Personal", "Address", "Uploads", "Verification"][s - 1]}</div>'
            for s in range(1, 5)
        ]
    )
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>{title} — State e-District Portal</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
        </style>
    </head>
    <body class="bg-gray-100 min-h-screen text-gray-900">
        <!-- Official Government Header -->
        <header class="bg-blue-900 text-white shadow">
            <div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-blue-950 text-xl border-2 border-white">GOV</div>
                    <div>
                        <h1 class="font-bold text-lg leading-tight">STATE e-DISTRICT CITIZEN SERVICES PORTAL</h1>
                        <p class="text-xs text-blue-200">Department of Revenue & Public Grievances — Government of Uttar Pradesh</p>
                    </div>
                </div>
                <div class="text-right text-xs text-blue-200">
                    <div>Session: Active</div>
                    <div>Security: 256-Bit SSL</div>
                </div>
            </div>
        </header>

        <!-- Chaos Status Banner -->
        <div class="bg-amber-100 border-b border-amber-300 px-4 py-1.5 text-xs text-amber-900 flex justify-between items-center max-w-5xl mx-auto mt-2 rounded">
            <span><strong>Target Mode B</strong>: Standalone Legacy Government Portal (Port 8090)</span>
            <span id="chaos-indicator">Chaos Mode: <strong>{"ACTIVE (Will Inject 502)" if chaos_state["enabled"] else "INACTIVE"}</strong></span>
        </div>

        <!-- Form Progress Tracker -->
        <div class="max-w-5xl mx-auto px-4 mt-4">
            <div class="bg-white rounded shadow-sm border border-gray-200 p-2 flex space-x-2">
                {steps_indicator}
            </div>
        </div>

        <!-- Main Body -->
        <main class="max-w-5xl mx-auto px-4 py-6">
            <div class="bg-white rounded shadow border border-gray-200 p-8">
                {body_html}
            </div>
        </main>

        <footer class="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-gray-500">
            © 2026 Center for Digital Governance. Designed for high-volume citizen service delivery.
        </footer>
    </body>
    </html>
    """


@app.get("/", response_class=HTMLResponse)
@app.get("/step1", response_class=HTMLResponse)
async def get_step1(request: Request):
    body = """
    <h2 class="text-xl font-bold text-gray-800 mb-2">Step 1: Applicant Demographic Details</h2>
    <p class="text-sm text-gray-600 mb-6">Enter details exactly as inscribed on official supporting documentary proofs.</p>

    <form id="step1-form" action="/step1" method="POST" class="space-y-5">
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label for="applicant_name" class="block text-sm font-semibold text-gray-700 mb-1">Full Name of Applicant *</label>
                <input type="text" id="applicant_name" name="applicant_name" required
                       placeholder="e.g. Ramesh Kumar Sharma"
                       class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
            <div>
                <label for="father_name" class="block text-sm font-semibold text-gray-700 mb-1">Father's / Husband's Name *</label>
                <input type="text" id="father_name" name="father_name" required
                       placeholder="e.g. Dina Nath Sharma"
                       class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
            <div>
                <label for="dob" class="block text-sm font-semibold text-gray-700 mb-1">Date of Birth (DD/MM/YYYY) *</label>
                <input type="text" id="dob" name="dob" required
                       placeholder="14/08/1996"
                       class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
            <div>
                <label for="gender" class="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                <select id="gender" name="gender" required
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
                    <option value="MALE">MALE / पुरुष</option>
                    <option value="FEMALE">FEMALE / महिला</option>
                    <option value="OTHER">TRANSGENDER / तृतीय लिंग</option>
                </select>
            </div>
        </div>

        <div class="pt-4 flex justify-end">
            <button type="submit" id="btn-next-step1" class="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-6 py-2.5 rounded shadow">
                Save & Proceed to Address (Step 2) →
            </button>
        </div>
    </form>
    """
    return HTMLResponse(content=render_page("Step 1 - Personal Details", body, step=1))


@app.post("/step1", response_class=HTMLResponse)
async def post_step1(
    applicant_name: str = Form(...), father_name: str = Form(...), dob: str = Form(...), gender: str = Form(...)
):
    gov_sess_id = str(uuid.uuid4())
    portal_sessions[gov_sess_id] = {
        "applicant_name": applicant_name,
        "father_name": father_name,
        "dob": dob,
        "gender": gender,
    }

    # Render Step 2
    body = f"""
    <h2 class="text-xl font-bold text-gray-800 mb-2">Step 2: Permanent Address & Jurisdiction</h2>
    <p class="text-sm text-gray-600 mb-6">Applicant: <strong>{applicant_name}</strong> | DOB: <strong>{dob}</strong></p>

    <form id="step2-form" action="/step2" method="POST" class="space-y-5">
        <input type="hidden" name="gov_sess_id" value="{gov_sess_id}">
        
        <div>
            <label for="address_line" class="block text-sm font-semibold text-gray-700 mb-1">Street / Village / Mohalla *</label>
            <input type="text" id="address_line" name="address_line" required
                   placeholder="Vill. Bakewar, Bharthana Road"
                   class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
        </div>

        <div class="grid grid-cols-3 gap-6">
            <div>
                <label for="pincode" class="block text-sm font-semibold text-gray-700 mb-1">PIN Code (6-Digit) *</label>
                <input type="text" id="pincode" name="pincode" required pattern="[1-9][0-9]{{5}}"
                       placeholder="206124"
                       class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
            <div>
                <label for="district" class="block text-sm font-semibold text-gray-700 mb-1">District *</label>
                <input type="text" id="district" name="district" required
                       placeholder="Etawah"
                       class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
            <div>
                <label for="state" class="block text-sm font-semibold text-gray-700 mb-1">State *</label>
                <input type="text" id="state" name="state" required
                       value="Uttar Pradesh"
                       class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
        </div>

        <div class="pt-4 flex justify-between">
            <a href="/step1" class="text-gray-600 hover:text-gray-900 font-medium py-2">← Back</a>
            <button type="submit" id="btn-next-step2" class="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-6 py-2.5 rounded shadow">
                Save & Proceed to Documents (Step 3) →
            </button>
        </div>
    </form>
    """
    return HTMLResponse(content=render_page("Step 2 - Address Details", body, step=2))


@app.post("/step2", response_class=HTMLResponse)
async def post_step2(
    gov_sess_id: str = Form(...),
    address_line: str = Form(...),
    pincode: str = Form(...),
    district: str = Form(...),
    state: str = Form(...),
):
    if gov_sess_id in portal_sessions:
        portal_sessions[gov_sess_id].update(
            {"address_line": address_line, "pincode": pincode, "district": district, "state": state}
        )

    # Render Step 3 (Uploads with strict specs)
    body = f"""
    <h2 class="text-xl font-bold text-gray-800 mb-2">Step 3: Biometric & Statutory Document Uploads</h2>
    <div class="bg-blue-50 border-l-4 border-blue-800 p-4 mb-6 text-xs text-blue-950 space-y-1">
        <p class="font-bold text-sm">STRICT PORTAL FILE VALIDATION CONSTRAINTS (Rule 18-A):</p>
        <p>• <strong>Photograph</strong>: JPEG format, exactly 200x230 px, between 10 KB and 50 KB.</p>
        <p>• <strong>Applicant Signature</strong>: Grayscale, exactly 140x60 px, strictly <strong>under 20 KB</strong>.</p>
        <p>• <strong>Supporting Affidavit / Proof</strong>: Merged PDF, strictly <strong>under 100 KB</strong>.</p>
    </div>

    <form id="step3-form" action="/step3" method="POST" enctype="multipart/form-data" class="space-y-6">
        <input type="hidden" name="gov_sess_id" value="{gov_sess_id}">

        <div>
            <label for="portrait_file" class="block text-sm font-semibold text-gray-700 mb-1">
                Passport Size Photograph (200x230 px, 10–50 KB) *
            </label>
            <input type="file" id="portrait_file" name="portrait_file" required accept=".jpg,.jpeg"
                   class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
        </div>

        <div>
            <label for="signature_file" class="block text-sm font-semibold text-gray-700 mb-1">
                Applicant Signature (140x60 px, strictly under 20 KB) *
            </label>
            <input type="file" id="signature_file" name="signature_file" required accept=".jpg,.jpeg,.png"
                   class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
        </div>

        <div>
            <label for="affidavit_file" class="block text-sm font-semibold text-gray-700 mb-1">
                Statutory Annexure 'E' / Joint Declaration Affidavit (PDF under 100 KB) *
            </label>
            <input type="file" id="affidavit_file" name="affidavit_file" required accept=".pdf"
                   class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
        </div>

        <div class="pt-4 flex justify-between">
            <button type="button" onclick="history.back()" class="text-gray-600 hover:text-gray-900 font-medium py-2">← Back</button>
            <button type="submit" id="btn-submit-step3" class="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-6 py-2.5 rounded shadow">
                Upload & Verify Assets (Step 3) →
            </button>
        </div>
    </form>
    """
    return HTMLResponse(content=render_page("Step 3 - Biometric Uploads", body, step=3))


@app.post("/step3", response_class=HTMLResponse)
async def post_step3(
    gov_sess_id: str = Form(...),
    portrait_file: UploadFile = File(...),
    signature_file: UploadFile = File(...),
    affidavit_file: UploadFile = File(...),
):
    # CHAOS INJECTION HOOK:
    # If chaos mode is active and failure_count < max, throw real 502 Bad Gateway
    if chaos_state["enabled"] and chaos_state["failure_count"] < chaos_state["max_failures_before_recovery"]:
        chaos_state["failure_count"] += 1
        return HTMLResponse(
            status_code=502,
            content="""
            <html>
                <head><title>502 Bad Gateway</title></head>
                <body style="font-family:sans-serif; text-align:center; padding-top:100px;">
                    <h1 style="color:#c93b2b; font-size:36px;">502 Bad Gateway</h1>
                    <p style="color:#525866; font-size:18px;">Government Gateway Node #UP-REV-GATEWAY-04 timed out handling multipart upload.</p>
                    <p style="font-family:monospace; background:#f4f4f4; display:inline-block; padding:10px 20px; border-radius:4px;">
                        Error Code: ERR_REV_UPSTREAM_TIMEOUT (Chaos Triggered)
                    </p>
                </body>
            </html>
            """,
        )

    # Read uploaded bytes
    port_bytes = await portrait_file.read()
    sig_bytes = await signature_file.read()
    aff_bytes = await affidavit_file.read()

    # STRICT VALIDATION:
    # 1. Signature must be <= 20 KB (20,480 bytes)
    if len(sig_bytes) > 20480:
        return HTMLResponse(
            status_code=400,
            content=render_page(
                "Upload Error",
                f"""
                <div class="bg-red-50 border-l-4 border-red-600 p-4">
                    <h3 class="font-bold text-red-800">REJECTION ERROR: Signature File Exceeds Ceiling</h3>
                    <p class="text-sm text-red-700 mt-1">Uploaded signature size: {len(sig_bytes)} bytes ({round(len(sig_bytes) / 1024, 2)} KB). Maximum allowed is 20 KB.</p>
                    <a href="javascript:history.back()" class="inline-block mt-4 bg-red-700 text-white px-4 py-2 rounded text-sm">← Re-upload Validated File</a>
                </div>
                """,
                step=3,
            ),
        )

    # 2. Affidavit must be <= 100 KB
    if len(aff_bytes) > 102400:
        return HTMLResponse(
            status_code=400,
            content=render_page(
                "Upload Error",
                f"""
                <div class="bg-red-50 border-l-4 border-red-600 p-4">
                    <h3 class="font-bold text-red-800">REJECTION ERROR: Supporting PDF Exceeds 100 KB</h3>
                    <p class="text-sm text-red-700 mt-1">Uploaded PDF size: {round(len(aff_bytes) / 1024, 2)} KB. Maximum allowed is 100 KB.</p>
                </div>
                """,
                step=3,
            ),
        )

    # Render Step 4: Human-in-the-Loop OTP Authorization Gate
    otp_code = "719340"
    if gov_sess_id in portal_sessions:
        portal_sessions[gov_sess_id]["otp_expected"] = otp_code
        portal_sessions[gov_sess_id]["uploads_received"] = True

    applicant = portal_sessions.get(gov_sess_id, {}).get("applicant_name", "Ramesh Kumar Sharma")

    body = f"""
    <div id="otp-gate-container">
        <h2 class="text-xl font-bold text-gray-800 mb-2">Step 4: Citizen Verification & Final Filing Authorization</h2>
        <div class="bg-emerald-50 border border-emerald-300 rounded p-4 mb-6 text-sm text-emerald-950">
            <span class="font-bold">✓ All Biometric & Statutory Assets Successfully Validated:</span>
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5">
                <li>Portrait: {round(len(port_bytes) / 1024, 1)} KB (200x230 px compliant)</li>
                <li>Signature: {round(len(sig_bytes) / 1024, 1)} KB (140x60 px, under 20 KB compliant)</li>
                <li>Annexure Affidavit: {round(len(aff_bytes) / 1024, 1)} KB (PDF under 100 KB compliant)</li>
            </ul>
        </div>

        <div class="bg-amber-50 border border-amber-300 rounded p-4 mb-6">
            <h3 class="font-bold text-amber-900 text-sm mb-1">Human-in-the-Loop OTP Authorization Gate</h3>
            <p class="text-xs text-amber-800 mb-3">
                Per UIDAI and IT Act guidelines, automated agents must strictly pause for citizen consent.
                One-Time Password (OTP) dispatched to citizen registered mobile (ending in ***3829).
            </p>
            <div class="bg-white p-3 border border-amber-200 rounded inline-block">
                <span class="text-xs text-gray-500 font-mono">DEMO OTP INJECTED:</span>
                <span id="demo-otp-val" class="font-mono font-bold text-lg text-blue-900 tracking-widest ml-2">{otp_code}</span>
            </div>
        </div>

        <form id="step4-otp-form" action="/finalize" method="POST" class="space-y-5">
            <input type="hidden" name="gov_sess_id" value="{gov_sess_id}">
            
            <div>
                <label for="citizen_otp" class="block text-sm font-semibold text-gray-700 mb-1">Enter 6-Digit Verification OTP *</label>
                <input type="text" id="citizen_otp" name="citizen_otp" required maxlength="6" pattern="[0-9]{{6}}"
                       placeholder="Enter 6-digit OTP"
                       class="w-64 px-3 py-2 border border-gray-300 rounded font-mono text-lg tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>

            <div class="flex items-center space-x-2">
                <input type="checkbox" id="citizen_consent" name="citizen_consent" required checked
                       class="h-4 w-4 text-blue-800 focus:ring-blue-500 border-gray-300 rounded">
                <label for="citizen_consent" class="text-xs text-gray-700">
                    I, {applicant}, hereby authorize submission of my application and self-declaration affidavit.
                </label>
            </div>

            <div class="pt-4 flex justify-between">
                <button type="submit" id="btn-authorize-final" class="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3 rounded shadow-lg text-sm">
                    ✓ Authorize Final Filing & Generate Stamped Receipt
                </button>
            </div>
        </form>
    </div>
    """
    return HTMLResponse(content=render_page("Step 4 - OTP Authorization", body, step=4))


@app.post("/finalize", response_class=HTMLResponse)
async def finalize_submission(
    gov_sess_id: str = Form(...), citizen_otp: str = Form(...), citizen_consent: str | None = Form(None)
):
    ack_number = f"UP-EDIST-2026-{uuid.uuid4().hex[:8].upper()}"
    applicant = portal_sessions.get(gov_sess_id, {}).get("applicant_name", "Ramesh Kumar Sharma")

    body = f"""
    <div id="receipt-container" class="text-center py-8">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Application Filed Successfully</h2>
        <p class="text-sm text-gray-600 mb-6">Government Reference & Digital Stamped Receipt</p>

        <div class="bg-gray-50 border border-gray-200 rounded p-6 max-w-lg mx-auto text-left mb-6 font-mono text-xs space-y-2">
            <div class="flex justify-between border-b pb-2">
                <span class="text-gray-500">ACKNOWLEDGEMENT NO:</span>
                <span id="ack-number" class="font-bold text-blue-900">{ack_number}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
                <span class="text-gray-500">APPLICANT NAME:</span>
                <span class="font-bold text-gray-800">{applicant}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
                <span class="text-gray-500">SERVICE:</span>
                <span class="font-bold text-gray-800">Income & Domicile Certificate (Revenue Dept)</span>
            </div>
            <div class="flex justify-between border-b pb-2">
                <span class="text-gray-500">SUPPORTING ATTACHMENT:</span>
                <span class="font-bold text-gray-800">Statutory Affidavit Annexure 'E' (Verified)</span>
            </div>
            <div class="flex justify-between pt-1">
                <span class="text-gray-500">STATUS:</span>
                <span class="font-bold text-emerald-700">SUBMITTED (INSPECTION QUEUE)</span>
            </div>
        </div>

        <a href="/" class="inline-block bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold px-6 py-2.5 rounded">
            Return to Portal Home
        </a>
    </div>
    """
    return HTMLResponse(content=render_page("Submission Receipt", body, step=4))


# Chaos Toggle Endpoints for Judges
@app.post("/api/chaos/toggle")
async def toggle_chaos(request: Request):
    data = await request.json() if request.headers.get("content-type") == "application/json" else {}
    enable = data.get("enable")
    if enable is None:
        chaos_state["enabled"] = not chaos_state["enabled"]
    else:
        chaos_state["enabled"] = bool(enable)
    chaos_state["failure_count"] = 0  # reset failures
    return {"chaos_mode": chaos_state["enabled"], "failures_injected": chaos_state["failure_count"]}


@app.get("/api/chaos/status")
async def get_chaos_status():
    return chaos_state
