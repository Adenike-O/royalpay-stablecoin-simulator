const API_BASE = '/api';

function getSessionToken(): string {
  let token = sessionStorage.getItem('rp_session');
  if (!token) {
    token = 'rp_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('rp_session', token);
  }
  return token;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

function getUtmParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

async function post(path: string, body: object): Promise<void> {
  try {
    await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Silently fail — tracking should never break the app
  }
}

export const sessionToken = getSessionToken();

// Store the in-flight session start promise so StrictMode's double-invoke
// awaits the same network call instead of firing a second phase before
// the first session insert has committed.
let sessionReadyPromise: Promise<void> | null = null;
let sessionStartTime = Date.now();
const phaseEnteredAt: Record<number, number> = {};
export const useCasesTried: string[] = [];

export async function trackSessionStart(): Promise<void> {
  if (sessionReadyPromise) return sessionReadyPromise;
  sessionStartTime = Date.now();
  sessionReadyPromise = post('/session/start', {
    session_token: sessionToken,
    referrer_url: document.referrer || null,
    utm_source: getUtmParam('utm_source'),
    utm_medium: getUtmParam('utm_medium'),
    utm_campaign: getUtmParam('utm_campaign'),
    country: null,
    city: null,
    device_type: getDeviceType(),
    browser: getBrowser(),
  });
  return sessionReadyPromise;
}

export async function trackPhase(phaseNumber: number, phaseName: string): Promise<void> {
  // Always wait for the session to exist before writing a phase event
  if (sessionReadyPromise) await sessionReadyPromise;

  const now = Date.now();
  const prevPhase = phaseNumber - 1;
  const secondsOnPrev = phaseEnteredAt[prevPhase]
    ? Math.round((now - phaseEnteredAt[prevPhase]) / 1000)
    : null;
  phaseEnteredAt[phaseNumber] = now;

  await post('/phase', {
    session_token: sessionToken,
    phase_number: phaseNumber,
    phase_name: phaseName,
    seconds_on_prev_phase: secondsOnPrev,
  });
}

export async function trackUseCase(
  useCaseId: string,
  useCaseName: string,
  amountUsd: number
): Promise<void> {
  if (!useCasesTried.includes(useCaseId)) useCasesTried.push(useCaseId);
  await post('/usecase', {
    session_token: sessionToken,
    use_case_id: useCaseId,
    use_case_name: useCaseName,
    amount_usd: amountUsd,
  });
}

export async function trackInteraction(
  eventType: string,
  phaseNumber?: number,
  useCaseId?: string,
  meta?: object
): Promise<void> {
  await post('/interaction', {
    session_token: sessionToken,
    event_type: eventType,
    phase_number: phaseNumber ?? null,
    use_case_id: useCaseId ?? null,
    meta: meta ?? null,
  });
}

export async function trackLead(data: {
  email: string;
  full_name?: string;
  role?: string;
  company?: string;
  linkedin_url?: string;
  country?: string;
  phases_completed: number;
  consented_to_updates: boolean;
  consent_text: string;
}): Promise<void> {
  await post('/lead', {
    session_token: sessionToken,
    use_cases_tried: useCasesTried,
    ...data,
  });
}

export async function trackSessionComplete(
  highestPhase: number,
  complete: boolean
): Promise<void> {
  const totalSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
  await post('/session/update', {
    session_token: sessionToken,
    highest_phase: highestPhase,
    simulation_complete: complete,
    total_time_seconds: totalSeconds,
  });
}
