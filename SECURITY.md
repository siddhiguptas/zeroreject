# Security Policy & Citizen Privacy Architecture

**ZeroReject (PramaanFix)** processes sensitive citizen identity credentials (Aadhaar, PAN, School Marksheets, Passports). Security, confidentiality, and data minimization are foundational design principles of our civic platform.

---

## 1. Zero-Retention & PII Privacy Guarantees

1. **In-Flight Ephemeral Processing**:
   - Uploaded citizen documents are processed in-memory or in ephemeral session-scoped directories (`storage/uploads/{session_id}_*`).
   - All session files can be permanently purged upon workflow completion or session TTL expiration.
2. **Local-First Keyless Execution**:
   - ZeroReject executes Optical Character Recognition (OCR), phonetic analysis, and asset compilation locally on CPU (`apps/api/services/ocr_extractor.py`).
   - Citizen identity cards are **NEVER uploaded to external third-party proprietary vision APIs** by default.
3. **Automated PII Redaction in Telemetry & Logs**:
   - Console logs, SQL query traces, and the Judge Audit Drawer automatically mask citizen numbers:
     - Aadhaar: `XXXX-XXXX-1234`
     - PAN: `XXXXX1234X`
   - Complete unredacted numbers remain strictly within active memory for matching and affidavit compilation.
4. **Strict Human-in-the-Loop Consent Gate**:
   - The autonomous Playwright agent fills preliminary demographic and document fields, but **ALWAYS pauses at Step 3 (Final Authorization Gate)**.
   - It requires explicit citizen biometric OTP input and statutory consent checkbox selection before final submission can execute.

---

## 2. Input Validation & Sandboxing

1. **Magic-Byte File Verification**:
   - File extensions are never trusted alone. Magic byte headers (`%PDF-`, `\x89PNG`, `\xff\xd8\xff`, `RIFF....WEBP`) are verified prior to image decoding.
2. **Strict Upload Cap**:
   - Enforces a hard ceiling of `15 MB` per file to prevent Denial-of-Service (DoS) and decompression bombs.
3. **Path Traversal Immunity**:
   - Uploaded filenames are sanitized with internal `uuid4()` keys; relative path characters (`../`), slashes, and shell metacharacters are stripped.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability or PII exposure vector in ZeroReject, please report it responsibly:

- **Email**: `security@zeroreject.gov.in` (or open a confidential security advisory on GitHub).
- **Response Timeline**:
  - Initial acknowledgement within **24 hours**.
  - Triage and mitigation assessment within **72 hours**.
  - Patch release and security advisory publication within **7 business days**.

Please do NOT report security vulnerabilities via public GitHub issues.

