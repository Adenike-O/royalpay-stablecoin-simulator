import { useState } from 'react'
import { MOCK_CUSTOMERS, FX_RATE } from '../data/mock'
import { kycBadge } from '../components/StatusBadge'
import './CustomerPage.css'

export default function CustomerPage() {
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = MOCK_CUSTOMERS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.bvn.includes(search)
    const matchKyc = kycFilter === 'all' || c.kycStatus === kycFilter
    return matchSearch && matchKyc
  })

  const selectedCustomer = MOCK_CUSTOMERS.find(c => c.id === selected)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{MOCK_CUSTOMERS.length} registered accounts</p>
        </div>
      </div>

      <div className="customer-layout">
        <div className="customer-list-panel">
          <div className="filter-bar">
            <input
              className="search-input"
              placeholder="Search name, email, BVN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="filter-select" value={kycFilter} onChange={e => setKycFilter(e.target.value)}>
              <option value="all">All KYC</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="customer-list">
            {filtered.map(customer => (
              <div
                key={customer.id}
                className={`customer-row ${selected === customer.id ? 'active' : ''}`}
                onClick={() => setSelected(customer.id)}
              >
                <div className="customer-avatar">{customer.name.charAt(0)}</div>
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-email">{customer.email}</div>
                </div>
                <div className="customer-kyc">{kycBadge(customer.kycStatus)}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">No customers match your filters</div>
            )}
          </div>
        </div>

        {selectedCustomer ? (
          <div className="customer-detail">
            <div className="detail-header">
              <div className="detail-avatar">{selectedCustomer.name.charAt(0)}</div>
              <div>
                <div className="detail-name">{selectedCustomer.name}</div>
                <div className="detail-id mono">{selectedCustomer.id}</div>
              </div>
              {kycBadge(selectedCustomer.kycStatus)}
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Identity</div>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedCustomer.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value mono">{selectedCustomer.phone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">BVN</div>
                  <div className="detail-value mono">{selectedCustomer.bvn}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">KYC Status</div>
                  <div className="detail-value">{selectedCustomer.kycStatus}</div>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-label">Wallet Address</div>
                  <div className="detail-value mono wallet-addr">{selectedCustomer.walletAddress}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Wallet Type</div>
                  <div className="detail-value">{selectedCustomer.walletType === 'custodial' ? 'Custodial' : 'Non-Custodial'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Joined</div>
                  <div className="detail-value">{new Date(selectedCustomer.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Balances</div>
              <div className="balance-cards">
                <div className="balance-card balance-ngn">
                  <div className="balance-currency">NGN</div>
                  <div className="balance-amount mono">₦{selectedCustomer.ngn_balance.toLocaleString()}</div>
                  <div className="balance-label">Nigerian Naira</div>
                </div>
                <div className="balance-card balance-usdc">
                  <div className="balance-currency">USDC</div>
                  <div className="balance-amount mono">${selectedCustomer.usdc_balance.toFixed(2)}</div>
                  <div className="balance-label">≈ ₦{(selectedCustomer.usdc_balance * FX_RATE).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="customer-detail customer-detail--empty">
            <div className="empty-placeholder">
              <div className="empty-icon">◎</div>
              <div className="empty-title">Select a customer</div>
              <div className="empty-desc">Click on a customer to view their details, balances, and KYC status</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
