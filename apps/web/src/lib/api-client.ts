import {
  JudgeTelemetryResponse,
  ReconciliationResponse,
  DocumentUploadResponse,
  CompileAssetsResponse,
  ExecutionStepEvent
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
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
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
  onError?: (err: any) => void
): () => void {
  const url = `${API_BASE}/api/execution/stream/${sessionId}?chaos_mode=${chaosMode}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (e) => {
    try {
      const data: ExecutionStepEvent = JSON.parse(e.data);
      onEvent(data);
    } catch (err) {
      console.error('Failed to parse SSE payload', err);
    }
  };

  eventSource.onerror = (err) => {
    if (onError) onError(err);
    eventSource.close();
  };

  return () => eventSource.close();
}

