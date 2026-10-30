# ZeroReject (PramaanFix) — Technical Architecture & System Design

**Track 1: Civic Pulse, Digital Governance & Public Information (FORGE '26)**

---

## 1. Executive System Overview

ZeroReject (PramaanFix) is an autonomous, deterministic pre-submission audit and bureaucratic auto-curing system designed to eliminate the **>60% failure rate** of citizen and MSME applications on Indian digital governance portals (EPFO, Passport Seva, e-District Caste/Income/Domicile, PM-Kisan, National Scholarship Portal).

Applications primarily fail due to:
1. **Cross-Script & Initial Mismatches** (e.g. Aadhaar in Devanagari `"रमेश कुमार शर्मा"`, PAN card `"RAMESH K SHARMA"`, Marksheet `"Sharma Ramesh Kumar"`).
2. **Address & Pincode Drift** across document formats.
3. **Psychotic Formatting Traps** (pixel aspect ratios, DPI constraints, strict byte windows like `10KB <= signature <= 20KB`).
4. **Government Portal Flakiness** (`502 Bad Gateway` / `504 Gateway Timeout` wiping multi-step entries).

### Core Principle
> **"LLMs Reason & Explain; Deterministic Tools Compute."**
All phonetic similarity, initial expansion, transliteration, pixel metrics, byte compression, and statutory rule validation are executed strictly by deterministic Python engines producing verifiable audit objects `{ value, threshold, passed, formula_used, source_statute, timestamp_utc }`.

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Studio (Next.js 15 App Router)"]
        UI["Sovereign Archival Editorial UI (#F6F4EE)"]
        Ribbon["Live System Telemetry Ribbon"]
        XRay["Live Cross-Document Phonetic X-Ray"]
        Studio["4-Panel Pre-Flight Studio"]
        JudgeDrawer["Judge Inspection & Audit Drawer"]
    end

    subgraph APILayer["FastAPI Core Engine (Port 8000)"]
        RouterIngest["/api/ingestion"]
        RouterCompiler["/api/compiler"]
        RouterExecution["/api/execution (SSE Stream)"]
        RouterAudit["/api/audit & Telemetry"]
        
        subgraph DeterministicEngines["Deterministic Verification & Curing Engines"]
            OCR["Multimodal Vision Pipeline\n(Gemini 2.5 Flash + OpenCV/Tesseract)"]
            Phonetic["Indic Phonetic & Token-Sort Reconciler\n(indic-transliteration + Double Metaphone + Jaro-Winkler)"]
            LGD["India Post PIN & LGD Validator\n(Live api.postalpincode.in + Cache)"]
            OpenCV["OpenCV 'Auto-Cure' Asset Compiler\n(Deskew, 140x60/200x230, Binary Search KB)"]
            Affidavit["Statutory Affidavit PDF Synthesizer\n(ReportLab Bilingual Annexure 'E')"]
        end

        subgraph AgentOrchestration["LangGraph Autonomous Agent"]
            StateGraph["Bureaucracy Execution State Machine"]
            DOMMapper["DOM Accessibility Tree & Label Mapper"]
            Checkpoints["Step-Level Checkpoint Store"]
            SelfHealer["Self-Healing Retry & Chaos Handler"]
            OTPGate["Human-in-the-Loop OTP Authorization Gate"]
        end
    end

    subgraph DataLayer["Persistence & RAG"]
        DB[("PostgreSQL 16 + pgvector\n(SQLite WAL Local Fallback)")]
        AuditLog[("Live Judge Audit Logs & Traces")]
        StatuteDB[("Statutory Circulars & Portal Rule Matrix")]
    end

    subgraph GovTargetLayer["Standalone Target Portal (Port 8090)"]
        GovPortal["Legacy e-District & Scholarship Portal"]
        ChaosToggle["Judge Chaos Switch (502 / DOM Shift)"]
        StrictVal["Strict Server-side Regex & Byte Validators"]
    end

    UI --> RouterIngest
    UI --> RouterCompiler
    UI --> RouterExecution
    UI --> RouterAudit

    RouterIngest --> OCR
    OCR --> Phonetic
    Phonetic --> LGD
    Phonetic --> DB

    RouterCompiler --> OpenCV
    RouterCompiler --> Affidavit
    OpenCV --> DB
    Affidavit --> DB

    RouterExecution --> StateGraph
    StateGraph --> DOMMapper
    DOMMapper --> GovPortal
    GovPortal -.->|502 Bad Gateway / DOM Shift| SelfHealer
    SelfHealer --> Checkpoints
    SelfHealer --> StateGraph
    StateGraph --> OTPGate
    OTPGate --> UI
```

---

## 3. Deterministic Indic Phonetic Reconciler

The reconciler takes names across different document entities and evaluates matching through an explainable multi-metric ensemble:

1. **Indic Transliteration**:
   Uses `indic-transliteration` (SLP1/HK/ISO-15919) to normalize Devanagari and other regional scripts into canonical Latin phonetic tokens:
   $$\text{"रमेश कुमार शर्मा"} \rightarrow \text{"Ramesh Kumar Sharma"}$$

2. **Honorific Normalization**:
   Removes bureaucratic prefixes/titles: `Shri`, `Smt`, `Late`, `Mohd`, `Md`, `Kr`, `Kumari`, `Dr`.

3. **Weighted Phonetic & Levenshtein Ensemble**:
   - **Double Metaphone**: Computes primary and secondary metaphone phonetic keys to catch spelling drift (`"Chaudhari"` vs. `"Choudhury"`).
   - **Jaro-Winkler Distance**: Rewards shared prefixes (`"Ramesh"` vs. `"Rameshwar"`).
   - **Token Sort & Token Set Levenshtein Ratio**: Invariant to word order inversions (`"Sharma Ramesh Kumar"` vs. `"Ramesh Kumar Sharma"`).
   - **Initial Expansion Heuristic**: Detects single-letter initials matching full tokens (`"R."` matches `"Ramesh"`).

4. **Composite Rejection Risk Score**:
   $$\text{Risk Score} = 100 - \left( 0.35 \cdot S_{\text{name}} + 0.20 \cdot S_{\text{father}} + 0.20 \cdot S_{\text{dob}} + 0.15 \cdot S_{\text{address}} + 0.10 \cdot S_{\text{format}} \right)$$

---

## 4. OpenCV Auto-Cure Document & Biometric Asset Compiler

Government portals enforce rigid byte ceilings and pixel dimensions (e.g., photo: $200 \times 230\text{ px}$, $10\text{–}50\text{ KB}$; signature: $140 \times 60\text{ px}$, $< 20\text{ KB}$, grayscale).

```mermaid
flowchart LR
    Upload["Raw User Upload / Webcam"] --> Contour["Contour & Bounding Detection"]
    Contour --> Deskew["Adaptive Gaussian Threshold & Deskew"]
    Deskew --> Resize["Aspect Ratio Padding & Resizing (140x60 / 200x230)"]
    Resize --> BinSearch["Binary-Search JPEG Quantization (10KB - 20KB Target)"]
    BinSearch --> Audit["SHA-256 Checksum & Verifiable Byte Telemetry"]
```

The binary-search compression routine iterates over JPEG quality $Q \in [10, 95]$:
- If `size > max_kb`: $Q_{\text{high}} = Q_{\text{mid}} - 1$
- If `size < min_kb` and can increase: $Q_{\text{low}} = Q_{\text{mid}} + 1$
- Halts when `min_kb <= size <= max_kb` or convergence within tolerance.

---

## 5. LangGraph Self-Healing Playwright State Machine

The Playwright execution agent automates filing while handling real server crashes:

```mermaid
stateDiagram-v2
    [*] --> InitSession: Target Portal URL & Compiled Assets
    InitSession --> MapDOM: Inspect Accessibility Tree & Form Labels
    MapDOM --> FillFormStep: Auto-Fill Canonical Fields
    FillFormStep --> SaveCheckpoint: Persist Step State to DB
    SaveCheckpoint --> SubmitStep: Dispatch POST / Next Button
    
    SubmitStep --> CheckResponse: Evaluate HTTP Status & DOM
    CheckResponse --> HandleChaos: HTTP 502/504 / Selector Shift Detected
    HandleChaos --> RollbackCheckpoint: Retrieve Last Checkpoint
    RollbackCheckpoint --> ExponentialBackoff: Wait (2^k * base_ms)
    ExponentialBackoff --> MapDOM: Re-inspect & Heal Selectors
    
    CheckResponse --> OTPGate: Final Form Submission Screen
    OTPGate --> CitizenInput: Stream SSE & Await Citizen OTP
    CitizenInput --> FinalizeSubmission: Citizen Enters OTP & Authorizes
    FinalizeSubmission --> CaptureReceipt: Download Stamped Confirmation PDF
    CaptureReceipt --> [*]
```

---

## 6. Zero Mock Data Architecture & Verification

To comply with the Hackathon Hard Rules:
1. **Live OCR Ingestion**: Every document uploaded goes through real multimodal parsing (Gemini 2.5 Flash if API key provided, or local Tesseract OCR + OpenCV contour detection).
2. **Live India Post PIN Validation**: Actual HTTP GET queries to `https://api.postalpincode.in/pincode/{pin}` returning real post office names, talukas, and districts.
3. **Live Database Traces**: SQLAlchemy asynchronously executes and logs real queries in SQLite (WAL mode) / PostgreSQL.
4. **Live Target Portal on Port 8090**: A fully functional government portal running with real cookies, sessions, CSRF, and byte-level validation.
