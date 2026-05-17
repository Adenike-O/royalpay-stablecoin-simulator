import { DASHBOARD_STATS, MOCK_TRANSACTIONS, MOCK_CUSTOMERS, VOLUME_CHART_DATA, FX_RATE } from '../data/mock'
import { Page } from '../App'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { kycBadge, txnBadge } from '../components/StatusBadge'
import './Dashboard.css'

interface DashboardProps {
  onNavigate: (page: Page) => void
}

function formatNGN(val: number) {
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`
  return `₦${val.toLocaleString()}`
}

function formatUSDC(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`
  return `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const stats = DASHBOARD_STATS
  const recentTxns = MOCK_TRANSACTIONS.slice(0, 3)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">End-to-end stablecoin payment lifecycle overview</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('simulator')}>
          New Simulation
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{stats.total_transactions.toLocaleString()}</div>
          <div className="stat-delta positive">+12.4% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Volume (NGN)</div>
          <div className="stat-value">{formatNGN(stats.total_volume_ngn)}</div>
          <div className="stat-delta positive">+18.7% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Volume (USDC)</div>
          <div className="stat-value">{formatUSDC(stats.total_volume_usdc)}</div>
          <div className="stat-delta positive">+18.7% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">KYC Verified</div>
          <div className="stat-value">{stats.kyc_verified.toLocaleString()}</div>
          <div className="stat-delta neutral">of {(stats.kyc_verified + 342).toLocaleString()} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Settlement Time</div>
          <div className="stat-value">{(stats.avg_settlement_time_ms / 1000).toFixed(1)}s</div>
          <div className="stat-delta positive">-0.4s from last month</div>
        </div>
        <div className="stat-card stat-card--highlight">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value stat-value--success">{stats.success_rate}%</div>
          <div className="stat-delta positive">+0.3% this month</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <div className="card-header">
            <div className="card-title">Transaction Volume</div>
            <div className="chart-legend">
              <span className="legend-item legend-ngn">NGN (M)</span>
              <span className="legend-item legend-usdc">USDC (K)</span>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={VOLUME_CHART_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ngnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="usdcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.6)" />
                <XAxis dataKey="month" tick={{ fill: '#4a5d7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a5d7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#131929', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e8edf5', fontSize: 12 }}
                  cursor={{ stroke: 'rgba(37,99,235,0.3)' }}
                />
                <Area type="monotone" dataKey="ngn" stroke="#2563eb" strokeWidth={2} fill="url(#ngnGrad)" name="NGN (M)" />
                <Area type="monotone" dataKey="usdc" stroke="#10b981" strokeWidth={2} fill="url(#usdcGrad)" name="USDC (K)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="info-card">
          <div className="card-header">
            <div className="card-title">Payment Flow</div>
          </div>
          <div className="flow-steps">
            {[
              { n: '01', label: 'KYC Onboarding', desc: 'BVN verification & identity check', color: '#2563eb' },
              { n: '02', label: 'NGN → USDC', desc: 'Fiat locked in escrow, stablecoin minted', color: '#7c3aed' },
              { n: '03', label: 'Blockchain Transfer', desc: 'On-chain USDC movement between wallets', color: '#db2777' },
              { n: '04', label: 'USDC → NGN', desc: 'Stablecoin burned, fiat released', color: '#ea580c' },
              { n: '05', label: 'NIBSS Settlement', desc: 'Interbank finality via NIP rails', color: '#10b981' },
            ].map((step, i) => (
              <div key={i} className="flow-step">
                <div className="flow-step-num" style={{ color: step.color, borderColor: step.color + '40', background: step.color + '15' }}>{step.n}</div>
                <div className="flow-step-info">
                  <div className="flow-step-label">{step.label}</div>
                  <div className="flow-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-full">
        <div className="card-header">
          <div className="card-title">Recent Transactions</div>
          <button className="btn-link" onClick={() => onNavigate('transactions')}>View all</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount (NGN)</th>
              <th>Amount (USDC)</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTxns.map(txn => {
              const sender = MOCK_CUSTOMERS.find(c => c.id === txn.senderId)
              const receiver = MOCK_CUSTOMERS.find(c => c.id === txn.receiverId)
              return (
                <tr key={txn.id}>
                  <td><span className="mono text-muted">{txn.id}</span></td>
                  <td>{sender?.name ?? '—'}</td>
                  <td>{receiver?.name ?? '—'}</td>
                  <td><span className="mono">₦{txn.amount_ngn.toLocaleString()}</span></td>
                  <td><span className="mono">${txn.amount_usdc.toFixed(2)}</span></td>
                  <td>{txnBadge(txn.status)}</td>
                  <td className="text-muted">{new Date(txn.created_at).toLocaleDateString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="fx-banner">
        <div className="fx-banner-item">
          <span className="fx-banner-label">Current FX Rate</span>
          <span className="fx-banner-value mono">1 USDC = ₦{FX_RATE.toLocaleString()}</span>
        </div>
        <div className="fx-divider" />
        <div className="fx-banner-item">
          <span className="fx-banner-label">Network</span>
          <span className="fx-banner-value">Ethereum (ERC-20)</span>
        </div>
        <div className="fx-divider" />
        <div className="fx-banner-item">
          <span className="fx-banner-label">Stablecoin</span>
          <span className="fx-banner-value">USDC (Circle)</span>
        </div>
        <div className="fx-divider" />
        <div className="fx-banner-item">
          <span className="fx-banner-label">Settlement Rail</span>
          <span className="fx-banner-value">NIBSS NIP</span>
        </div>
      </div>
    </div>
  )
}
