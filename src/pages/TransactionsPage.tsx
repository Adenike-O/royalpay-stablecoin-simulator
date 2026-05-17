import { useState } from 'react'
import { MOCK_TRANSACTIONS, MOCK_CUSTOMERS } from '../data/mock'
import { Transaction } from '../types'
import { txnBadge } from '../components/StatusBadge'
import { Page } from '../App'
import './TransactionsPage.css'

interface Props {
  onNavigate: (page: Page) => void
}

export default function TransactionsPage({ onNavigate }: Props) {
  const [selected, setSelected] = useState<Transaction | null>(null)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{MOCK_TRANSACTIONS.length} transactions in this session</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('simulator')}>
          Simulate New
        </button>
      </div>

      <div className="txn-layout">
        <div className="txn-table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>NGN Amount</th>
                <th>USDC Amount</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map(txn => {
                const sender = MOCK_CUSTOMERS.find(c => c.id === txn.senderId)
                const receiver = MOCK_CUSTOMERS.find(c => c.id === txn.receiverId)
                return (
                  <tr
                    key={txn.id}
                    className={`txn-row ${selected?.id === txn.id ? 'selected' : ''}`}
                    onClick={() => setSelected(txn)}
                  >
                    <td><span className="mono text-muted">{txn.id}</span></td>
                    <td>{sender?.name ?? '—'}</td>
                    <td>{receiver?.name ?? '—'}</td>
                    <td><span className="mono">₦{txn.amount_ngn.toLocaleString()}</span></td>
                    <td><span className="mono">${txn.amount_usdc.toFixed(2)}</span></td>
                    <td><span className="mono text-muted">₦{txn.fee}</span></td>
                    <td>{txnBadge(txn.status)}</td>
                    <td className="text-muted">{new Date(txn.created_at).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="txn-detail">
            <div className="detail-header-row">
              <div>
                <div className="detail-ref mono">{selected.id}</div>
                {selected.nibss_ref && (
                  <div className="detail-nibss mono">NIBSS: {selected.nibss_ref}</div>
                )}
              </div>
              {txnBadge(selected.status)}
            </div>

            {selected.failure_reason && (
              <div className="failure-banner">
                <span className="failure-icon">!</span>
                {selected.failure_reason}
              </div>
            )}

            <div className="amounts-row">
              <div className="amount-box">
                <div className="amount-label">NGN Sent</div>
                <div className="amount-value mono">₦{selected.amount_ngn.toLocaleString()}</div>
              </div>
              <div className="amount-arrow">→</div>
              <div className="amount-box">
                <div className="amount-label">USDC</div>
                <div className="amount-value mono amount-usdc">${selected.amount_usdc.toFixed(2)}</div>
              </div>
              <div className="amount-arrow">→</div>
              <div className="amount-box">
                <div className="amount-label">NGN Received</div>
                <div className="amount-value mono">₦{(selected.amount_ngn - selected.fee).toLocaleString()}</div>
              </div>
            </div>

            <div className="steps-title">Payment Lifecycle</div>
            <div className="steps-list">
              {selected.steps.map((step, i) => (
                <div key={step.id} className={`step-item step-${step.status}`}>
                  <div className="step-connector">
                    <div className="step-dot" />
                    {i < selected.steps.length - 1 && <div className="step-line" />}
                  </div>
                  <div className="step-content">
                    <div className="step-top">
                      <span className="step-label">{step.label}</span>
                      {step.duration_ms && (
                        <span className="step-duration">{step.duration_ms}ms</span>
                      )}
                      {step.status === 'waiting' && <span className="step-status-tag step-waiting">Waiting</span>}
                      {step.status === 'failed' && <span className="step-status-tag step-failed">Failed</span>}
                      {step.status === 'completed' && <span className="step-status-tag step-done">Done</span>}
                    </div>
                    <div className="step-desc">{step.description}</div>
                    {step.timestamp && (
                      <div className="step-time">{new Date(step.timestamp).toLocaleTimeString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!selected && (
          <div className="txn-empty">
            <div className="empty-icon">⇄</div>
            <div className="empty-title">Select a transaction</div>
            <div className="empty-desc">Click a row to view the full payment lifecycle breakdown</div>
          </div>
        )}
      </div>
    </div>
  )
}
