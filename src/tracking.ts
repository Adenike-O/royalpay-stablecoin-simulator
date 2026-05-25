// tracking.ts — RoyalPay
// ─────────────────────────────────────────────────────────────────────────────
// Dual-layer tracking:
//   Layer 1 → Your PostgreSQL database (via /api endpoints) — unchanged
//   Layer 2 → PostHog (visual analytics, funnels, session recordings) — added
//
// Every function fires BOTH destinations. If either fails, the other still runs.
// ─────────────────────────────────────────────────────────────────────────────

import posthog from 'posthog-js';

// ── PostHog Init ──────────────────────────────────────────────────────────────
// Safe to call multiple times — PostHog deduplicates internally.
// The wizard may have already added this to main.tsx; having it here too is fine.

export function initPostHog() {
  try {
    posthog.init('phc_uGPBAD6xP7CS8Pxi5ZvtBToJvP6Sv4L8ob933PUGtvoA', {
      api_host: 'https://us.posthog.com',
      autocapture: false,        // Only fire what we explicitly define
      capture_utm: true,         // Auto-captures ?utm_source= from your LinkedIn links
      capture_referrer: true,    // Auto-captures which site sent this visitor
      session_recording: {
        maskAllInputs: true,     // Never record what users type — privacy first
      },
      persistence: 'localStorage',
    });
  } catch (e) { /* silent */ }
}

// ── PostHog helper ────────────────────────────────────────────────────────────
// Wraps every PostHog call so analytics never breaks the app

function ph(event: string, props: Record<string, unknown> = {}) {
  try {
    posthog.capture(event, {
      ...props,
      app: 'royalpay_simulator',
      version: '1.0.0',
    });
  } catch (e) { /* silent */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVERYTHING BELOW THIS LINE IS YOUR ORIGINAL tracking.ts — UNCHANGED
// PostHog calls are added alongside each function with a // ← PostHog comment
// ─────────────────────────────────────────────────────────────────────────────

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

let sessionReadyPromise: Promise<void> | null = null;
let sessionStartTime = Date.now();
const phaseEnteredAt: Record<number, number> = {};
export const useCasesTried: string[] = [];

// ── Session Start ─────────────────────────────────────────────────────────────
// PRD Metric: Total visitors, traffic sources, device breakdown

export async function trackSessionStart(): Promise<void> {
  if (sessionReadyPromise) return sessionReadyPromise;
  sessionStartTime = Date.now();

  // ← PostHog: identifies this as a new session with device + UTM context
  ph('session_started', {
    device_type:  getDeviceType(),
    browser:      getBrowser(),
    utm_source:   getUtmParam('utm_source'),
    utm_medium:   getUtmParam('utm_medium'),
    utm_campaign: getUtmParam('utm_campaign'),
    referrer:     document.referrer || null,
  });

  sessionReadyPromise = post('/session/start', {
    session_token: sessionToken,
    referrer_url:  document.referrer || null,
    utm_source:    getUtmParam('utm_source'),
    utm_medium:    getUtmParam('utm_medium'),
    utm_campaign:  getUtmParam('utm_campaign'),
    country:       null,
    city:          null,
    device_type:   getDeviceType(),
    browser:       getBrowser(),
  });
  return sessionReadyPromise;
}

// ── Phase Tracking ────────────────────────────────────────────────────────────
// PRD Metric: Completion Rate + Funnel Drop-off
// PostHog builds the visual funnel from these events automatically

export async function trackPhase(phaseNumber: number, phaseName: string): Promise<void> {
  if (sessionReadyPromise) await sessionReadyPromise;

  const now = Date.now();
  const prevPhase = phaseNumber - 1;
  const secondsOnPrev = phaseEnteredAt[prevPhase]
    ? Math.round((now - phaseEnteredAt[prevPhase]) / 1000)
    : null;
  phaseEnteredAt[phaseNumber] = now;

  // ← PostHog: each phase_entered event becomes one step in your funnel
  ph('phase_entered', {
    phase_number:       phaseNumber,
    phase_name:         phaseName,
    seconds_on_prev:    secondsOnPrev,
    // Time bucket for easy filtering in PostHog
    prev_time_bucket:   secondsOnPrev == null ? null
      : secondsOnPrev < 10  ? 'under_10s'
      : secondsOnPrev < 30  ? '10_to_30s'
      : secondsOnPrev < 60  ? '30_to_60s'
      : 'over_60s',
  });

  await post('/phase', {
    session_token:      sessionToken,
    phase_number:       phaseNumber,
    phase_name:         phaseName,
    seconds_on_prev_phase: secondsOnPrev,
  });
}

// ── Use Case Tracking ─────────────────────────────────────────────────────────
// PRD Metric: Use Case Diversity — which scenario resonates most

export async function trackUseCase(
  useCaseId: string,
  useCaseName: string,
  amountUsd: number
): Promise<void> {
  if (!useCasesTried.includes(useCaseId)) useCasesTried.push(useCaseId);

  // ← PostHog: breakdown by use_case_id shows you which scenario wins
  ph('use_case_selected', {
    use_case_id:   useCaseId,
    use_case_name: useCaseName,
    amount_usd:    amountUsd,
    // How many use cases has this session tried so far?
    total_tried:   useCasesTried.length,
  });

  await post('/usecase', {
    session_token: sessionToken,
    use_case_id:   useCaseId,
    use_case_name: useCaseName,
    amount_usd:    amountUsd,
  });
}

// ── Interaction Tracking ──────────────────────────────────────────────────────
// PRD Metric: Wrong-network lesson, network preference, restarts

export async function trackInteraction(
  eventType: string,
  phaseNumber?: number,
  useCaseId?: string,
  meta?: object
): Promise<void> {

  // ← PostHog: each event_type becomes a filterable event
  // Key ones PostHog will surface:
  //   wrong_network_clicked     → education lesson landed (target >50%)
  //   network_selected_tron     → TRON vs ETH preference split
  //   network_selected_eth
  //   transfer_confirmed        → full transfer completion
  //   offramp_completed         → full off-ramp completion
  //   simulation_restarted      → from which phase (tells you where people get stuck)
  ph(eventType, {
    phase_number: phaseNumber ?? null,
    use_case_id:  useCaseId  ?? null,
    ...(meta as Record<string, unknown> ?? {}),
  });

  await post('/interaction', {
    session_token: sessionToken,
    event_type:    eventType,
    phase_number:  phaseNumber ?? null,
    use_case_id:   useCaseId  ?? null,
    meta:          meta ?? null,
  });
}

// ── Lead Capture ──────────────────────────────────────────────────────────────
// Most valuable event — links anonymous PostHog session to a real person

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

  // ← PostHog: identify() merges ALL previous anonymous events to this email
  // From this point on PostHog knows who this session belongs to
  try {
    posthog.identify(data.email, {
      email:            data.email,
      name:             data.full_name,
      role:             data.role,
      company:          data.company,
      linkedin:         data.linkedin_url,
      phases_completed: data.phases_completed,
    });
    ph('lead_captured', {
      source:           'phase_9_completion_form',
      has_role:         !!data.role,
      has_company:      !!data.company,
      has_linkedin:     !!data.linkedin_url,
      phases_completed: data.phases_completed,
      use_cases_tried:  useCasesTried.length,
    });
  } catch (e) { /* silent */ }

  await post('/lead', {
    session_token:    sessionToken,
    use_cases_tried:  useCasesTried,
    ...data,
  });
}

// ── Session Complete ──────────────────────────────────────────────────────────
// PRD Metric: Completion Rate — fires when Phase 9 loads

export async function trackSessionComplete(
  highestPhase: number,
  complete: boolean
): Promise<void> {
  const totalSeconds = Math.round((Date.now() - sessionStartTime) / 1000);

  // ← PostHog: this is your completion rate denominator
  // In PostHog: (count of simulation_completed) / (count of session_started) = completion rate
  if (complete) {
    ph('simulation_completed', {
      highest_phase:      highestPhase,
      total_time_seconds: totalSeconds,
      use_cases_tried:    useCasesTried.length,
      use_case_ids:       useCasesTried,
      // Time bucket for the full simulation
      completion_speed:
        totalSeconds < 120  ? 'under_2_min'  :
        totalSeconds < 300  ? '2_to_5_min'   :
        totalSeconds < 600  ? '5_to_10_min'  : 'over_10_min',
    });
  }

  await post('/session/update', {
    session_token:     sessionToken,
    highest_phase:     highestPhase,
    simulation_complete: complete,
    total_time_seconds:  totalSeconds,
  });
}
