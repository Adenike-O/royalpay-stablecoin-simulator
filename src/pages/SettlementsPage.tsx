import { MOCK_SETTLEMENTS, MOCK_TRANSACTIONS } from '../data/mock'
import StatusBadge from '../components/StatusBadge'
import './SettlementsPage.css'

export default function SettlementsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">NIBSS Settlements</h1>
          <p className="page-subtitle">Nigeria Inter-Bank Settlement System — NIP finalisation records</p>
        </div>
      </div>

      <div className="nibss-info-grid">
        <div className="nibss-info-card">
          <div className="nibss-info-label">Settlement System</div>
          <div className="nibss-info-value">NIBSS NIP</div>
        </div>
        <div className="nibss-info-card">
          <div className="nibss-info-label">Processing Window</div>
          <div className="nibss-info-value">24/7 Real-time</div>
        </div>
        <div className="nibss-info-card">
          <div className="nibss-info-label">Max Settlement Time</div>
          <div className="nibss-info-value mono">~1.2s</div>
        </div>
        <div className="nibss-info-card">
          <div className="nibss-info-label">Total Settled</div>
          <div className="nibss-info-value mono">₦1,700,000</div>
        </div>
      </div>

      <div className="settlements-card">
        <div className="card-header">
          <div className="card-title">Settlement Records</div>
          <div className="nibss-powered">
            <span className="nibss-dot" />
            Powered by NIBSS NIP
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th>Transaction</th>
              <th>Session Code</th>
              <th>Destination Bank</th>
              <th>Account</th>
              <th>Amount (NGN)</th>
              <th>Status</th>
              <th>Settled At</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SETTLEMENTS.map(s => (
              <tr key={s.id}>
                <td><span className="mono text-muted">{s.id}</span></td>
                <td><span className="mono text-muted">{s.transaction_id}</span></td>
                <td><span className="mono text-muted session-code">{s.session_code}</span></td>
                <td>{s.destination_bank}</td>
                <td><span className="mono">{s.account_number}</span></td>
                <td><span className="mono">₦{s.amount.toLocaleString()}</span></td>
                <td>
                  <StatusBadge
                    label={s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    variant={s.status === 'settled' ? 'success' : s.status === 'failed' ? 'danger' : 'info'}
                  />
                </td>
                <td className="text-muted">
                  {s.settled_at ? new Date(s.settled_at).toLocaleTimeString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="nibss-explainer">
        <div className="explainer-title">How NIBSS Settlement Works</div>
        <div className="explainer-steps">
          {[
            {
              step: '01',
              title: 'Instruction Posted',
              desc: 'RoyalPay posts a debit instruction to NIBSS NIP after stablecoin conversion is complete.',
            },
            {
              step: '02',
              title: 'Real-time Processing',
              desc: 'NIBSS validates the session code, checks destination bank routing, and debits the source account.',
            },
            {
              step: '03',
              title: 'Interbank Credit',
              desc: 'NIBSS credits the destination bank\'s settlement account at CBN in real time.',
            },
            {
              step: '04',
              title: 'Finality Confirmed',
              desc: 'Destination bank posts the credit to beneficiary account. NIBSS confirms finality to RoyalPay.',
            },
          ].map((item, i) => (
            <div key={i} className="explainer-step">
              <div className="explainer-num">{item.step}</div>
              <div className="explainer-body">
                <div className="explainer-step-title">{item.title}</div>
                <div className="explainer-step-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
