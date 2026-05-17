import { Page } from '../App'
import './Sidebar.css'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'simulator', label: 'Simulator', icon: '⟳' },
  { id: 'customers', label: 'Customers', icon: '◎' },
  { id: 'transactions', label: 'Transactions', icon: '⇄' },
  { id: 'settlements', label: 'NIBSS Settlements', icon: '✦' },
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span className="logo-r">R</span>
          <span className="logo-crown">♛</span>
        </div>
        <div className="logo-text">
          <span className="logo-name">RoyalPay</span>
          <span className="logo-sub">Stablecoin Simulator</span>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {currentPage === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="network-badge">
          <span className="network-dot" />
          <span>Ethereum Testnet</span>
        </div>
        <div className="fx-rate">
          <span className="fx-label">USD/NGN</span>
          <span className="fx-value">1,627.50</span>
        </div>
      </div>
    </aside>
  )
}
