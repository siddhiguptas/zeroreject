import hashlib
import re
import time
from collections import deque
from datetime import UTC, datetime
from typing import Any


def redact_pii(val: Any) -> Any:
    """
    Mask sensitive citizen identifiers in logs & telemetry:
    - Aadhaar: 12 digits (with optional spaces/hyphens) -> XXXX-XXXX-1234
    - PAN: 10 chars (5 letters, 4 digits, 1 letter) -> XXXXX1234X
    """
    if isinstance(val, str):
        # Mask Aadhaar numbers: e.g. 4892 7104 3829 or 4892-7104-3829 or 489271043829
        redacted = re.sub(r'\b\d{4}[ -]?\d{4}[ -]?(\d{4})\b', r'XXXX-XXXX-\1', val)
        # Mask PAN numbers: e.g. ABCPS1234F -> XXXXX1234X
        redacted = re.sub(r'\b[A-Z]{5}(\d{4})[A-Z]\b', r'XXXXX\1X', redacted)
        return redacted
    elif isinstance(val, dict):
        return {k: redact_pii(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [redact_pii(v) for v in val]
    return val


class JudgeAuditLogger:
    """
    In-memory ring buffer & persistence tracker recording live API requests,
    deterministic tool evaluations, SQL executions, and cryptographic hashes
    for FORGE '26 Hackathon judge inspection.
    """
    def __init__(self, max_records: int = 100):
        self._records: deque = deque(maxlen=max_records)
        self._external_api_calls: deque = deque(maxlen=50)
        self._sql_traces: deque = deque(maxlen=50)

    def log_tool_execution(
        self,
        tool_name: str,
        input_summary: dict[str, Any],
        output_summary: dict[str, Any],
        duration_ms: float,
        formula_used: str,
        source_statute: str | None = None
    ) -> dict[str, Any]:
        record = {
            "id": f"tool_{int(time.time() * 1000)}_{len(self._records)}",
            "type": "DETERMINISTIC_TOOL",
            "tool_name": tool_name,
            "formula_used": formula_used,
            "source_statute": source_statute,
            "input": redact_pii(input_summary),
            "output": redact_pii(output_summary),
            "duration_ms": round(duration_ms, 2),
            "timestamp_utc": datetime.now(UTC).isoformat()
        }
        self._records.appendleft(record)
        return record

    def log_external_api_call(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: float,
        cached: bool = False,
        response_preview: str | None = None
    ) -> dict[str, Any]:
        safe_preview = redact_pii(response_preview[:200]) if response_preview else None
        record = {
            "id": f"api_{int(time.time() * 1000)}_{len(self._external_api_calls)}",
            "type": "EXTERNAL_API",
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "cached": cached,
            "duration_ms": round(duration_ms, 2),
            "response_preview": safe_preview,
            "timestamp_utc": datetime.now(UTC).isoformat()
        }
        self._external_api_calls.appendleft(record)
        return record

    def log_sql_trace(self, statement: str, params: dict[str, Any] | None = None, duration_ms: float = 0.0) -> None:
        self._sql_traces.appendleft({
            "statement": statement,
            "params": redact_pii(params) if params else None,
            "duration_ms": round(duration_ms, 2),
            "timestamp_utc": datetime.now(UTC).isoformat()
        })

    def get_recent_audit_records(self, limit: int = 30) -> list[dict[str, Any]]:
        return list(self._records)[:limit]

    def get_external_api_telemetry(self, limit: int = 20) -> list[dict[str, Any]]:
        return list(self._external_api_calls)[:limit]

    def get_sql_traces(self, limit: int = 15) -> list[dict[str, Any]]:
        return list(self._sql_traces)[:limit]

    @staticmethod
    def compute_sha256(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

audit_logger = JudgeAuditLogger()

