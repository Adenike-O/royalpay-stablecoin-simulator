import { useState, useEffect } from "react";

const D = {
  bg: "#030B16", surface: "#08121F", card: "#0D1B2F", card2: "#111F38",
  border: "#162540", border2: "#1E3050",
  teal: "#00D4AA", amber: "#F5A623", red: "#FF3B55", green: "#27AE60",
  blue: "#4A9EFF", purple: "#8B5CF6", txt: "#D0E8F5", dim: "#587298",
  muted: "#1A2E48", white: "#ffffff",
};

const PHASE_LABELS: Record<string, string> = {
  welcome: "Welcome", signup: "Sign Up", kyc: "KYC Verify",
  wallet_gen: "Wallet Gen", buy_usdt: "Buy USDT",
  use_case_selector: "Use Cases", transfer: "Transfer",
  offramp: "Off-Ramp", tx_history: "Tx History", swift_comparison: "Comparison",
};

function fmtTime(s: number | null): string {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, color = D.teal, icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: string;
}) {
  return (
    <div style={{
      background: D.card, border: `1px solid ${D.border2}`, borderRadius: 14,
      padding: "18px 20px", flex: "1 1 140px", minWidth: 130,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: D.dim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: D.dim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionHead({ title, icon, right }: { title: string; icon: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 18, background: D.teal, borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: D.txt, textTransform: "uppercase", letterSpacing: 1.2 }}>
          {icon} {title}
        </span>
      </div>
      {right}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border2}`, borderRadius: 14, padding: "20px", ...style }}>
      {children}
    </div>
  );
}

function HBar({ label, count, pct, maxCount, color = D.teal }: {
  label: string; count: number; pct: number; maxCount: number; color?: string;
}) {
  const barW = maxCount > 0 ? Math.round(count / maxCount * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 110, fontSize: 11, color: D.txt, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={label}>{label}</div>
      <div style={{ flex: 1, background: D.muted, borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${barW}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <div style={{ width: 28, fontSize: 12, fontWeight: 700, color, textAlign: "right" }}>{count}</div>
      <div style={{ width: 34, fontSize: 10, color: D.dim, textAlign: "right" }}>{pct}%</div>
    </div>
  );
}

function FunnelBar({ phase_number, phase_name, reached, pct, totalSessions }: {
  phase_number: number; phase_name: string; reached: number; pct: number; totalSessions: number;
}) {
  const label = PHASE_LABELS[phase_name] || phase_name;
  const color = pct >= 70 ? D.teal : pct >= 40 ? D.blue : pct >= 20 ? D.amber : D.red;
  const dropped = phase_number > 0 ? totalSessions - reached : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{phase_number}</div>
      <div style={{ width: 100, fontSize: 11, color: D.txt, fontWeight: 600, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: D.muted, borderRadius: 5, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <div style={{ width: 36, fontSize: 12, fontWeight: 800, color, textAlign: "right" }}>{pct}%</div>
      <div style={{ width: 44, fontSize: 11, color: D.dim, textAlign: "right" }}>{reached} users</div>
      {phase_number > 0 && dropped > 0 && (
        <div style={{ width: 52, fontSize: 10, color: D.red, textAlign: "right" }}>−{dropped} drop</div>
      )}
    </div>
  );
}

function SparkChart({ data }: { data: Array<{ day: string; count: number }> }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ fontSize: 9, color: D.dim, fontWeight: 600, minHeight: 14 }}>
              {d.count > 0 ? d.count : ""}
            </div>
            <div style={{
              width: "100%", background: d.count > 0 ? D.teal : D.muted,
              borderRadius: "3px 3px 0 0",
              height: d.count > 0 ? `${Math.max(Math.round(d.count / maxCount * 54), 4)}px` : "3px",
              opacity: d.count > 0 ? 1 : 0.3,
              transition: "height 0.6s ease",
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, fontSize: 8, color: D.dim, textAlign: "center" }}>{d.day.replace("-", "/")}</div>
        ))}
      </div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ background: color + "22", color, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{label}</span>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0", color: D.dim, fontSize: 12 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>{msg}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatsData {
  summary: {
    total_sessions: number; completed_sessions: number;
    completion_rate_percent: number; avg_time_seconds: number;
    avg_highest_phase: number; total_leads: number;
    total_use_case_events: number; total_interactions: number;
  };
  phase_funnel: Array<{ phase_number: number; phase_name: string; reached: number; pct: number }>;
  use_cases: Array<{ use_case_id: string; use_case_name: string; count: number; pct: number }>;
  traffic_sources: Array<{ source: string; count: number; pct: number }>;
  devices: Array<{ device_type: string; count: number; pct: number }>;
  browsers: Array<{ browser: string; count: number; pct: number }>;
  interactions: Array<{ event_type: string; count: number }>;
  sessions_per_day: Array<{ day: string; count: number }>;
  recent_sessions: Array<{
    token_short: string; device_type: string; browser: string;
    highest_phase: number; simulation_complete: boolean;
    total_time_seconds: number | null; started_at: string;
  }>;
  leads: Array<{
    email: string; full_name: string; role: string; company: string;
    phases_completed: number; consented_to_updates: boolean; submitted_at: string;
  }>;
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function StatsDashboard({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stats", { headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error("Unauthorized or server error");
      const json = await res.json();
      setData(json);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      setError("Failed to load stats. Check your API key or server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const s = data?.summary;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000, background: D.bg,
      overflowY: "auto", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: D.txt,
    }}>

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: D.surface, borderBottom: `1px solid ${D.border2}`,
        padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>♛</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: D.txt, letterSpacing: 0.2 }}>RoyalPay Analytics</div>
            <div style={{ fontSize: 10, color: D.dim }}>Stablecoin Simulator · Internal Dashboard</div>
          </div>
          {!loading && !error && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 16 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: D.green, boxShadow: `0 0 6px ${D.green}` }} />
              <span style={{ fontSize: 10, color: D.green, fontWeight: 600 }}>LIVE</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastRefreshed && (
            <span style={{ fontSize: 10, color: D.dim }}>Updated {lastRefreshed}</span>
          )}
          <button
            onClick={() => setAutoRefresh(a => !a)}
            style={{
              background: autoRefresh ? D.teal + "22" : D.muted, border: `1px solid ${autoRefresh ? D.teal : D.border}`,
              color: autoRefresh ? D.teal : D.dim, padding: "5px 11px", borderRadius: 8,
              fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5,
            }}
          >{autoRefresh ? "⏸ Auto-refresh ON" : "▶ Auto-refresh"}</button>
          <button
            onClick={fetchData} disabled={loading}
            style={{
              background: D.teal, border: "none", color: "#061018",
              padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit",
            }}
          >{loading ? "Loading…" : "↺ Refresh"}</button>
          <button
            onClick={onClose}
            style={{
              background: D.muted, border: `1px solid ${D.border}`, color: D.dim,
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >✕ Close</button>
        </div>
      </div>

      {/* ── Error state ────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ margin: "24px 28px", background: D.red + "15", border: `1px solid ${D.red}40`, borderRadius: 12, padding: "14px 18px", color: D.red, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────────── */}
      {loading && !data && (
        <div style={{ padding: "40px 28px", textAlign: "center", color: D.dim }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 13 }}>Fetching analytics data…</div>
        </div>
      )}

      {data && (
        <div style={{ padding: "24px 28px", maxWidth: 1240, margin: "0 auto" }}>

          {/* ── KPI Strip ─────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <KPICard icon="👥" label="Total Sessions" value={s!.total_sessions} color={D.teal} />
            <KPICard icon="✅" label="Completions" value={s!.completed_sessions} sub="Full simulation" color={D.green} />
            <KPICard icon="📈" label="Completion Rate" value={`${s!.completion_rate_percent}%`} sub="Reached phase 9" color={s!.completion_rate_percent >= 50 ? D.green : s!.completion_rate_percent >= 25 ? D.amber : D.red} />
            <KPICard icon="🎯" label="Leads Captured" value={s!.total_leads} sub="Opted-in at phase 9" color={D.purple} />
            <KPICard icon="⏱" label="Avg Duration" value={fmtTime(s!.avg_time_seconds)} sub="Per session" color={D.blue} />
            <KPICard icon="🗺" label="Avg Phase" value={`${s!.avg_highest_phase}/9`} sub="Phase depth" color={D.amber} />
            <KPICard icon="🔀" label="Use Case Events" value={s!.total_use_case_events} sub="Scenario picks" color={D.teal} />
            <KPICard icon="🖱" label="Interactions" value={s!.total_interactions} sub="Button clicks" color={D.dim} />
          </div>

          {/* ── Row 1: Funnel + Sessions Over Time ────────────────────────── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <Card style={{ flex: "2 1 400px" }}>
              <SectionHead title="Phase Drop-off Funnel" icon="🔽" />
              {data.phase_funnel.length === 0
                ? <Empty msg="No phase data yet" />
                : data.phase_funnel.map(p => (
                  <FunnelBar key={p.phase_number} {...p} totalSessions={s!.total_sessions} />
                ))
              }
            </Card>
            <Card style={{ flex: "1 1 260px" }}>
              <SectionHead title="Sessions · Last 14 Days" icon="📅"
                right={<span style={{ fontSize: 10, color: D.dim }}>Total: {data.sessions_per_day.reduce((a, d) => a + d.count, 0)}</span>}
              />
              {data.sessions_per_day.every(d => d.count === 0)
                ? <Empty msg="No sessions in the last 14 days" />
                : <SparkChart data={data.sessions_per_day} />
              }
            </Card>
          </div>

          {/* ── Row 2: Use Cases + Traffic + Devices/Browsers ─────────────── */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <Card style={{ flex: "1 1 220px" }}>
              <SectionHead title="Use Case Popularity" icon="🎯" />
              {data.use_cases.length === 0
                ? <Empty msg="No use cases selected yet" />
                : data.use_cases.map(u => (
                  <HBar key={u.use_case_id} label={u.use_case_name} count={u.count}
                    pct={u.pct} maxCount={data.use_cases[0].count} color={D.teal} />
                ))
              }
            </Card>
            <Card style={{ flex: "1 1 200px" }}>
              <SectionHead title="Traffic Sources" icon="🌐" />
              {data.traffic_sources.length === 0
                ? <Empty msg="No traffic data yet" />
                : data.traffic_sources.map(t => (
                  <HBar key={t.source} label={t.source} count={t.count}
                    pct={t.pct} maxCount={data.traffic_sources[0].count} color={D.blue} />
                ))
              }
            </Card>
            <Card style={{ flex: "1 1 200px" }}>
              <SectionHead title="Devices" icon="📱" />
              {data.devices.length === 0
                ? <Empty msg="—" />
                : data.devices.map(d => (
                  <HBar key={d.device_type} label={d.device_type} count={d.count}
                    pct={d.pct} maxCount={data.devices[0].count} color={D.amber} />
                ))
              }
              <div style={{ height: 16 }} />
              <SectionHead title="Browsers" icon="🌍" />
              {data.browsers.length === 0
                ? <Empty msg="—" />
                : data.browsers.map(b => (
                  <HBar key={b.browser} label={b.browser} count={b.count}
                    pct={b.pct} maxCount={data.browsers[0].count} color={D.purple} />
                ))
              }
            </Card>
          </div>

          {/* ── Row 3: Interaction Events ──────────────────────────────────── */}
          <Card style={{ marginBottom: 20 }}>
            <SectionHead title="Top Interaction Events" icon="🖱"
              right={<span style={{ fontSize: 10, color: D.dim }}>{s!.total_interactions} total events</span>}
            />
            {data.interactions.length === 0
              ? <Empty msg="No interactions recorded yet" />
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 32px" }}>
                  {data.interactions.map((item, i) => {
                    const maxC = data.interactions[0].count;
                    return (
                      <div key={item.event_type} style={{ flex: "1 1 300px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 20, fontSize: 10, color: D.dim, textAlign: "right", flexShrink: 0 }}>#{i + 1}</div>
                          <div style={{ width: 190, fontSize: 11, color: D.txt, fontFamily: '"Courier New", monospace', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.event_type}</div>
                          <div style={{ flex: 1, background: D.muted, borderRadius: 4, height: 6, overflow: "hidden" }}>
                            <div style={{ width: `${Math.round(item.count / maxC * 100)}%`, height: "100%", background: D.green, borderRadius: 4, transition: "width 0.7s ease" }} />
                          </div>
                          <div style={{ width: 28, fontSize: 12, fontWeight: 700, color: D.green, textAlign: "right" }}>{item.count}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </Card>

          {/* ── Recent Sessions Table ──────────────────────────────────────── */}
          <Card style={{ marginBottom: 20 }}>
            <SectionHead title="Recent Sessions" icon="🕐"
              right={<span style={{ fontSize: 10, color: D.dim }}>Latest 25</span>}
            />
            {data.recent_sessions.length === 0
              ? <Empty msg="No sessions recorded yet" />
              : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border2}` }}>
                        {["Session Token", "Started", "Device", "Browser", "Phase", "Duration", "Complete"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 9, fontWeight: 800, color: D.dim, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_sessions.map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${D.border}`, background: i % 2 === 0 ? "transparent" : D.surface }}>
                          <td style={{ padding: "9px 10px", fontFamily: '"Courier New", monospace', color: D.teal, fontSize: 10 }}>{r.token_short}…</td>
                          <td style={{ padding: "9px 10px", color: D.dim, whiteSpace: "nowrap" }}>{r.started_at}</td>
                          <td style={{ padding: "9px 10px", color: D.txt }}>{r.device_type}</td>
                          <td style={{ padding: "9px 10px", color: D.txt }}>{r.browser}</td>
                          <td style={{ padding: "9px 10px" }}>
                            <span style={{
                              background: (r.highest_phase >= 8 ? D.green : r.highest_phase >= 5 ? D.blue : D.amber) + "22",
                              color: r.highest_phase >= 8 ? D.green : r.highest_phase >= 5 ? D.blue : D.amber,
                              padding: "2px 8px", borderRadius: 6, fontWeight: 700, fontSize: 11,
                            }}>{r.highest_phase}/9</span>
                          </td>
                          <td style={{ padding: "9px 10px", color: D.dim }}>{fmtTime(r.total_time_seconds)}</td>
                          <td style={{ padding: "9px 10px" }}>
                            {r.simulation_complete
                              ? <Pill label="✓ Done" color={D.green} />
                              : <Pill label="In progress" color={D.dim} />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </Card>

          {/* ── Leads Table ───────────────────────────────────────────────── */}
          <Card style={{ marginBottom: 8 }}>
            <SectionHead title="Captured Leads" icon="🎯"
              right={<Pill label={`${s!.total_leads} total`} color={D.purple} />}
            />
            {data.leads.length === 0
              ? <Empty msg="No leads captured yet — they appear here after Phase 9 opt-in" />
              : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border2}` }}>
                        {["Email", "Full Name", "Role", "Company", "Phases", "Consented", "Submitted"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 9, fontWeight: 800, color: D.dim, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.leads.map((l, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${D.border}`, background: i % 2 === 0 ? "transparent" : D.surface }}>
                          <td style={{ padding: "9px 10px", color: D.teal, fontWeight: 600 }}>{l.email}</td>
                          <td style={{ padding: "9px 10px", color: D.txt }}>{l.full_name}</td>
                          <td style={{ padding: "9px 10px", color: D.dim }}>{l.role}</td>
                          <td style={{ padding: "9px 10px", color: D.dim }}>{l.company}</td>
                          <td style={{ padding: "9px 10px" }}>
                            <span style={{
                              background: (l.phases_completed >= 8 ? D.green : D.amber) + "22",
                              color: l.phases_completed >= 8 ? D.green : D.amber,
                              padding: "2px 7px", borderRadius: 6, fontWeight: 700,
                            }}>{l.phases_completed}/9</span>
                          </td>
                          <td style={{ padding: "9px 10px" }}>
                            {l.consented_to_updates
                              ? <Pill label="✓ Yes" color={D.green} />
                              : <Pill label="No" color={D.dim} />
                            }
                          </td>
                          <td style={{ padding: "9px 10px", color: D.dim, whiteSpace: "nowrap" }}>{l.submitted_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </Card>

          <div style={{ textAlign: "center", padding: "16px 0 8px", fontSize: 10, color: D.muted }}>
            RoyalPay Stablecoin Simulator · Analytics · Protected
          </div>
        </div>
      )}
    </div>
  );
}
