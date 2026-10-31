import {
  JudgeTelemetryResponse,
  ReconciliationResponse,
  DocumentUploadResponse,
  CompileAssetsResponse,
  ExecutionStepEvent,
  BenchmarkSimulationResponse
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const GOV_PORTAL_BASE = process.env.NEXT_PUBLIC_GOV_PORTAL_URL || 'http://localhost:8090';

export async function fetchTelemetry(): Promise<JudgeTelemetryResponse> {
  const res = await fetch(`${API_BASE}/api/audit/telemetry`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Telemetry fetch failed: ${res.statusText}`);
  return res.json();
}

export async function loadSamplePacket(workflowTarget: string = 'e_district_income'): Promise<ReconciliationResponse> {
  const res = await fetch(`${API_BASE}/api/ingestion/load-sample-packet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow_target: workflowTarget }),
  });
  if (!res.ok) throw new Error(`Sample packet load failed: ${res.statusText}`);
  return res.json();
}

export async function uploadDocument(
  sessionId: string,
  docType: string,
  file: File
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('doc_type', docType);
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/ingestion/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || err?.detail || `Upload failed: ${res.statusText}`);
  }
  return res.json();
}

export async function reconcileSession(
  sessionId: string,
  workflowTarget: string = 'e_district_income'
): Promise<ReconciliationResponse> {
  const res = await fetch(`${API_BASE}/api/ingestion/reconcile-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, workflow_target: workflowTarget }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || err?.detail || `Reconciliation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function compileAssets(
  sessionId: string,
  targetPortal: string = 'e_district'
): Promise<CompileAssetsResponse> {
  const res = await fetch(`${API_BASE}/api/compiler/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, target_portal: targetPortal }),
  });
  if (!res.ok) throw new Error(`Asset compilation failed: ${res.statusText}`);
  return res.json();
}

export async function authorizeOtp(
  sessionId: string,
  otpCode: string
): Promise<{ acknowledgement_number: string; filing_status: string }> {
  const res = await fetch(`${API_BASE}/api/execution/authorize-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, otp_code: otpCode, citizen_consent: true }),
  });
  if (!res.ok) throw new Error(`OTP authorization failed: ${res.statusText}`);
  return res.json();
}

export async function toggleChaos(enable?: boolean): Promise<{ chaos_mode: boolean }> {
  const res = await fetch(`${GOV_PORTAL_BASE}/api/chaos/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enable !== undefined ? { enable } : {}),
  });
  if (!res.ok) throw new Error('Chaos toggle failed');
  return res.json();
}

export async function getChaosStatus(): Promise<{ enabled: boolean; failure_count: number }> {
  const res = await fetch(`${GOV_PORTAL_BASE}/api/chaos/status`, { cache: 'no-store' });
  if (!res.ok) return { enabled: false, failure_count: 0 };
  return res.json();
}

export async function runBenchmarkSimulation(): Promise<BenchmarkSimulationResponse> {
  const res = await fetch(`${API_BASE}/api/audit/benchmark-validation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Benchmark simulation failed');
  return res.json();
}

export function getPacketZipUrl(sessionId: string): string {
  return `${API_BASE}/api/compiler/export-packet/${sessionId}`;
}

export function getReceiptPdfUrl(sessionId: string): string {
  return `${API_BASE}/api/execution/receipt/${sessionId}`;
}

export async function askVoiceCopilot(
  query: string,
  sessionId?: string,
  language: string = 'en'
): Promise<{
  query: string;
  explanation: string;
  audio_base64: string;
  language: string;
  statutory_citations: Array<{ statute: string; clause: string; url: string }>;
}> {
  const res = await fetch(`${API_BASE}/api/voice/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, session_id: sessionId, language }),
  });
  if (!res.ok) throw new Error('Voice copilot query failed');
  return res.json();
}

export function createExecutionEventSource(
  sessionId: string,
  chaosMode: boolean,
  onEvent: (event: ExecutionStepEvent) => void,
  onError?: (err: any) => void,
  autoReconnect: boolean = true,
  portal?: string
): () => void {
  const portalParam = portal ? `&portal=${encodeURIComponent(portal)}` : '';
  const url = `${API_BASE}/api/execution/stream/${sessionId}?chaos_mode=${chaosMode}${portalParam}`;
  let eventSource: EventSource | null = null;
  let retryCount = 0;
  let isClosedManually = false;
  const maxRetries = 3;

  function connect() {
    eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      try {
        const data: ExecutionStepEvent = JSON.parse(e.data);
        onEvent(data);
        retryCount = 0; // reset retry counter on healthy message
      } catch (err) {
        console.error('Failed to parse SSE payload', err);
      }
    };

    eventSource.onerror = (err) => {
      if (isClosedManually) return;
      if (autoReconnect && retryCount < maxRetries) {
        retryCount++;
        const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 4000);
        console.warn(`SSE stream disconnected. Reconnecting attempt ${retryCount}/${maxRetries} in ${backoffMs}ms...`);
        eventSource?.close();
        setTimeout(() => {
          if (!isClosedManually) connect();
        }, backoffMs);
      } else {
        if (onError) onError(err);
        eventSource?.close();
      }
    };
  }

  connect();

  return () => {
    isClosedManually = true;
    eventSource?.close();
  };
}

