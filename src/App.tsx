import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CustomerPage from './pages/CustomerPage'
import TransactionsPage from './pages/TransactionsPage'
import SimulatorPage from './pages/SimulatorPage'
import SettlementsPage from './pages/SettlementsPage'
import './App.css'

export type Page = 'dashboard' | 'customers' | 'transactions' | 'simulator' | 'settlements'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />
      case 'customers': return <CustomerPage />
      case 'transactions': return <TransactionsPage onNavigate={setCurrentPage} />
      case 'simulator': return <SimulatorPage />
      case 'settlements': return <SettlementsPage />
      default: return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  )
}
