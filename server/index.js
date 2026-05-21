import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── POST /api/session/start ──────────────────────────────────────────────────
app.post('/api/session/start', async (req, res) => {
  const {
    session_token, referrer_url, utm_source, utm_medium, utm_campaign,
    country, city, device_type, browser
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO sessions
         (session_token, referrer_url, utm_source, utm_medium, utm_campaign,
          country, city, device_type, browser)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (session_token) DO NOTHING`,
      [session_token, referrer_url, utm_source, utm_medium, utm_campaign,
       country, city, device_type, browser]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('session/start error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/session/update ─────────────────────────────────────────────────
app.post('/api/session/update', async (req, res) => {
  const { session_token, highest_phase, simulation_complete, total_time_seconds } = req.body;
  try {
    await pool.query(
      `UPDATE sessions
       SET highest_phase = $2,
           simulation_complete = $3,
           total_time_seconds = $4,
           last_active_at = NOW(),
           completed_at = CASE WHEN $3 = TRUE AND completed_at IS NULL THEN NOW() ELSE completed_at END
       WHERE session_token = $1`,
      [session_token, highest_phase, simulation_complete, total_time_seconds]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('session/update error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/phase ──────────────────────────────────────────────────────────
app.post('/api/phase', async (req, res) => {
  const { session_token, phase_number, phase_name, seconds_on_prev_phase } = req.body;
  try {
    await pool.query(
      `INSERT INTO phase_events (session_token, phase_number, phase_name, seconds_on_prev_phase)
       VALUES ($1,$2,$3,$4)`,
      [session_token, phase_number, phase_name, seconds_on_prev_phase]
    );
    await pool.query(
      `UPDATE sessions
       SET highest_phase = GREATEST(highest_phase, $2), last_active_at = NOW()
       WHERE session_token = $1`,
      [session_token, phase_number]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('phase error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/usecase ────────────────────────────────────────────────────────
app.post('/api/usecase', async (req, res) => {
  const { session_token, use_case_id, use_case_name, amount_usd } = req.body;
  try {
    await pool.query(
      `INSERT INTO use_case_events (session_token, use_case_id, use_case_name, amount_usd)
       VALUES ($1,$2,$3,$4)`,
      [session_token, use_case_id, use_case_name, amount_usd]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('usecase error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/interaction ────────────────────────────────────────────────────
app.post('/api/interaction', async (req, res) => {
  const { session_token, event_type, phase_number, use_case_id, meta } = req.body;
  try {
    await pool.query(
      `INSERT INTO interaction_events (session_token, event_type, phase_number, use_case_id, meta)
       VALUES ($1,$2,$3,$4,$5)`,
      [session_token, event_type, phase_number ?? null, use_case_id ?? null,
       meta ? JSON.stringify(meta) : null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('interaction error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/lead ───────────────────────────────────────────────────────────
app.post('/api/lead', async (req, res) => {
  const {
    session_token, email, full_name, role, company, linkedin_url,
    country, use_cases_tried, phases_completed, consented_to_updates,
    consent_text
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO leads
         (session_token, email, full_name, role, company, linkedin_url,
          country, use_cases_tried, phases_completed, consented_to_updates,
          consent_text, consented_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, CASE WHEN $10 THEN NOW() ELSE NULL END)
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         company = EXCLUDED.company,
         linkedin_url = EXCLUDED.linkedin_url,
         country = EXCLUDED.country,
         use_cases_tried = EXCLUDED.use_cases_tried,
         phases_completed = EXCLUDED.phases_completed,
         consented_to_updates = EXCLUDED.consented_to_updates,
         consent_text = EXCLUDED.consent_text,
         consented_at = CASE WHEN EXCLUDED.consented_to_updates THEN NOW() ELSE leads.consented_at END`,
      [session_token, email, full_name, role, company, linkedin_url,
       country, use_cases_tried, phases_completed, consented_to_updates ?? false, consent_text]
    );
    res.json({ success: true, message: 'Lead saved' });
  } catch (err) {
    console.error('lead error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/stats ───────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.STATS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [
      summaryRes, leadsCountRes, totalInteractionsRes, totalUCRes,
      funnelRes, usecasesRes, sourcesRes, devicesRes, browsersRes,
      interactionsRes, daysRes, sessionsRes, leadsTableRes,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_sessions,
          COUNT(*) FILTER (WHERE simulation_complete)::int AS completed_sessions,
          ROUND(
            COUNT(*) FILTER (WHERE simulation_complete)::numeric /
            NULLIF(COUNT(*), 0) * 100, 1
          ) AS completion_rate_percent,
          ROUND(AVG(total_time_seconds) FILTER (WHERE total_time_seconds IS NOT NULL))::int AS avg_time_seconds,
          ROUND(AVG(highest_phase)::numeric, 1) AS avg_highest_phase
        FROM sessions
      `),
      pool.query(`SELECT COUNT(*)::int AS total FROM leads`),
      pool.query(`SELECT COUNT(*)::int AS total FROM interaction_events`),
      pool.query(`SELECT COUNT(*)::int AS total FROM use_case_events`),
      pool.query(`
        SELECT phase_number,
               MAX(phase_name) AS phase_name,
               COUNT(DISTINCT session_token)::int AS reached
        FROM phase_events
        GROUP BY phase_number
        ORDER BY phase_number
      `),
      pool.query(`
        SELECT use_case_id,
               MAX(use_case_name) AS use_case_name,
               COUNT(*)::int AS count
        FROM use_case_events
        GROUP BY use_case_id
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT COALESCE(NULLIF(utm_source, ''), NULLIF(referrer_url, ''), 'direct') AS source,
               COUNT(*)::int AS count
        FROM sessions
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT COALESCE(device_type, 'unknown') AS device_type,
               COUNT(*)::int AS count
        FROM sessions
        GROUP BY device_type
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT COALESCE(browser, 'unknown') AS browser,
               COUNT(*)::int AS count
        FROM sessions
        GROUP BY browser
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT event_type, COUNT(*)::int AS count
        FROM interaction_events
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 12
      `),
      pool.query(`
        SELECT gs.day::date AS day,
               COALESCE(sub.cnt, 0)::int AS count
        FROM generate_series(
          (NOW() - INTERVAL '13 days')::date,
          NOW()::date,
          '1 day'::interval
        ) AS gs(day)
        LEFT JOIN (
          SELECT DATE(started_at) AS d, COUNT(*)::int AS cnt
          FROM sessions
          GROUP BY d
        ) sub ON sub.d = gs.day::date
        ORDER BY gs.day
      `),
      pool.query(`
        SELECT LEFT(session_token, 22) AS token_short,
               COALESCE(device_type, '?') AS device_type,
               COALESCE(browser, '?') AS browser,
               highest_phase,
               simulation_complete,
               total_time_seconds,
               TO_CHAR(started_at AT TIME ZONE 'UTC', 'MM-DD HH24:MI') AS started_at
        FROM sessions
        ORDER BY started_at DESC
        LIMIT 25
      `),
      pool.query(`
        SELECT email,
               COALESCE(full_name, '—') AS full_name,
               COALESCE(role, '—') AS role,
               COALESCE(company, '—') AS company,
               COALESCE(phases_completed, 0) AS phases_completed,
               consented_to_updates,
               TO_CHAR(submitted_at AT TIME ZONE 'UTC', 'MM-DD HH24:MI') AS submitted_at
        FROM leads
        ORDER BY submitted_at DESC
      `),
    ]);

    const s = summaryRes.rows[0];
    const totalSessions = s.total_sessions;
    const totalUCEvents = totalUCRes.rows[0].total;

    const addPct = (rows, totalKey) => rows.map(r => ({
      ...r,
      pct: totalKey > 0 ? Math.round(r.count / totalKey * 100) : 0,
    }));

    res.json({
      summary: {
        total_sessions: totalSessions,
        completed_sessions: s.completed_sessions,
        completion_rate_percent: parseFloat(s.completion_rate_percent) || 0,
        avg_time_seconds: s.avg_time_seconds || 0,
        avg_highest_phase: parseFloat(s.avg_highest_phase) || 0,
        total_leads: leadsCountRes.rows[0].total,
        total_use_case_events: totalUCEvents,
        total_interactions: totalInteractionsRes.rows[0].total,
      },
      phase_funnel: funnelRes.rows.map(r => ({
        ...r,
        pct: totalSessions > 0 ? Math.round(r.reached / totalSessions * 100) : 0,
      })),
      use_cases: addPct(usecasesRes.rows, totalUCEvents),
      traffic_sources: sourcesRes.rows.map(r => ({
        ...r,
        pct: totalSessions > 0 ? Math.round(r.count / totalSessions * 100) : 0,
      })),
      devices: devicesRes.rows.map(r => ({
        ...r,
        pct: totalSessions > 0 ? Math.round(r.count / totalSessions * 100) : 0,
      })),
      browsers: browsersRes.rows.map(r => ({
        ...r,
        pct: totalSessions > 0 ? Math.round(r.count / totalSessions * 100) : 0,
      })),
      interactions: interactionsRes.rows,
      sessions_per_day: daysRes.rows.map(r => ({
        day: (r.day instanceof Date ? r.day.toISOString() : String(r.day)).slice(5, 10),
        count: r.count,
      })),
      recent_sessions: sessionsRes.rows,
      leads: leadsTableRes.rows,
    });
  } catch (err) {
    console.error('stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`RoyalPay API server running on port ${PORT}`);
});
