import { useState, useEffect, useRef } from 'react'
import { MOCK_CUSTOMERS, FX_RATE } from '../data/mock'
import { TransactionStep, Customer } from '../types'
import './SimulatorPage.css'

type SimState = 'idle' | 'running' | 'completed' | 'failed'

const STEP_TEMPLATES: Omit<TransactionStep, 'status' | 'timestamp' | 'duration_ms'>[] = [
  { id: 's1', label: 'KYC Verification', description: 'Querying BVN registry and running AML/compliance screening on both parties' },
  { id: 's2', label: 'NGN → USDC Mint', description: 'Locking NGN in escrow smart contract and minting equivalent USDC on Ethereum' },
  { id: 's3', label: 'Blockchain Transfer', description: 'Broadcasting signed ERC-20 transfer transaction and awaiting block confirmation' },
  { id: 's4', label: 'USDC → NGN Conversion', description: 'Burning USDC tokens and releasing equivalent NGN from escrow to receiver' },
  { id: 's5', label: 'NIBSS Settlement', description: 'Posting final settlement instruction to NIBSS NIP for interbank finality' },
]

const STEP_DURATIONS = [900, 1300, 2500, 1000, 1200]

function generateNibssRef() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
  return `NIBSS${dateStr}${rand}`
}

export default function SimulatorPage() {
  const [senderId, setSenderId] = useState(MOCK_CUSTOMERS[0].id)
  const [receiverId, setReceiverId] = useState(MOCK_CUSTOMERS[1].id)
  const [amountNgn, setAmountNgn] = useState('500000')
  const [simState, setSimState] = useState<SimState>('idle')
  const [steps, setSteps] = useState<TransactionStep[]>([])
  const [nibssRef, setNibssRef] = useState<string>('')
  const [elapsed, setElapsed] = useState(0)
  const [injectFailure, setInjectFailure] = useState(false)
  const [failStep, setFailStep] = useState(1)
  const startRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sender = MOCK_CUSTOMERS.find(c => c.id === senderId)!
  const receiver = MOCK_CUSTOMERS.find(c => c.id === receiverId)!
  const parsedNgn = parseFloat(amountNgn.replace(/,/g, '')) || 0
  const amountUsdc = parsedNgn / FX_RATE
  const fee = parsedNgn * 0.001

  const senderVerified = sender.kycStatus === 'verified'
  const receiverVerified = receiver.kycStatus === 'verified'
  const canSimulate = senderVerified && receiverVerified && parsedNgn > 0 && simState !== 'running'

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  async function runSimulation() {
    if (!canSimulate) return
    setSimState('running')
    setElapsed(0)
    setNibssRef('')
    startRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 100)

    const initialSteps: TransactionStep[] = STEP_TEMPLATES.map(t => ({
      ...t,
      status: 'waiting',
    }))
    setSteps(initialSteps)

    let failed = false
    for (let i = 0; i < STEP_TEMPLATES.length; i++) {
      setSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'processing' } : s
      ))

      await delay(STEP_DURATIONS[i])

      const shouldFail = injectFailure && (i + 1) === failStep
      if (shouldFail) {
        setSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'failed', timestamp: new Date().toISOString(), duration_ms: STEP_DURATIONS[i] } : s
        ))
        failed = true
        break
      }

      setSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'completed', timestamp: new Date().toISOString(), duration_ms: STEP_DURATIONS[i] } : s
      ))
    }

    if (timerRef.current) clearInterval(timerRef.current)

    if (failed) {
      setSimState('failed')
    } else {
      setNibssRef(generateNibssRef())
      setSimState('completed')
    }
  }

  function reset() {
    setSimState('idle')
    setSteps([])
    setElapsed(0)
    setNibssRef('')
  }

  const totalDuration = STEP_DURATIONS.reduce((a, b) => a + b, 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Simulator</h1>
          <p className="page-subtitle">Simulate the full stablecoin payment lifecycle in real time</p>
        </div>
      </div>

      <div className="sim-layout">
        <div className="sim-config-panel">
          <div className="sim-section-title">Transaction Setup</div>

          <div className="sim-field">
            <label className="sim-label">Sender</label>
            <select
              className="sim-select"
              value={senderId}
              onChange={e => setSenderId(e.target.value)}
              disabled={simState === 'running'}
            >
              {MOCK_CUSTOMERS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.kycStatus === 'verified' ? 'KYC OK' : c.kycStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-field">
            <label className="sim-label">Receiver</label>
            <select
              className="sim-select"
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              disabled={simState === 'running'}
            >
              {MOCK_CUSTOMERS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.kycStatus === 'verified' ? 'KYC OK' : c.kycStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-field">
            <label className="sim-label">Amount (NGN)</label>
            <div className="sim-input-wrap">
              <span className="sim-input-prefix">₦</span>
              <input
                className="sim-input"
                type="text"
                value={amountNgn}
                onChange={e => setAmountNgn(e.target.value)}
                placeholder="e.g. 500000"
                disabled={simState === 'running'}
              />
            </div>
          </div>

          <div className="sim-conversion-preview">
            <div className="sim-conv-row">
              <span className="sim-conv-label">USDC Equivalent</span>
              <span className="sim-conv-value mono">${amountUsdc.toFixed(4)} USDC</span>
            </div>
            <div className="sim-conv-row">
              <span className="sim-conv-label">Transaction Fee (0.1%)</span>
              <span className="sim-conv-value mono">₦{fee.toLocaleString()}</span>
            </div>
            <div className="sim-conv-row">
              <span className="sim-conv-label">FX Rate</span>
              <span className="sim-conv-value mono">1 USDC = ₦{FX_RATE.toLocaleString()}</span>
            </div>
          </div>

          <div className="sim-failure-toggle">
            <div className="sim-section-title" style={{ marginBottom: 10 }}>Failure Injection</div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={injectFailure}
                onChange={e => setInjectFailure(e.target.checked)}
                disabled={simState === 'running'}
              />
              <span>Simulate step failure</span>
            </label>
            {injectFailure && (
              <div className="sim-field" style={{ marginTop: 10 }}>
                <label className="sim-label">Fail at step</label>
                <select
                  className="sim-select"
                  value={failStep}
                  onChange={e => setFailStep(Number(e.target.value))}
                  disabled={simState === 'running'}
                >
                  {STEP_TEMPLATES.map((s, i) => (
                    <option key={s.id} value={i + 1}>{i + 1}. {s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!senderVerified && (
            <div className="sim-warning">Sender has not completed KYC verification</div>
          )}
          {!receiverVerified && (
            <div className="sim-warning">Receiver has not completed KYC verification</div>
          )}

          {simState === 'idle' && (
            <button className="btn-simulate" onClick={runSimulation} disabled={!canSimulate}>
              Run Simulation
            </button>
          )}
          {simState === 'running' && (
            <button className="btn-simulate btn-simulate--running" disabled>
              <span className="spinner" /> Simulating…
            </button>
          )}
          {(simState === 'completed' || simState === 'failed') && (
            <button className="btn-simulate btn-simulate--reset" onClick={reset}>
              Reset &amp; Run Again
            </button>
          )}
        </div>

        <div className="sim-lifecycle-panel">
          <div className="sim-section-title">Payment Lifecycle</div>

          {simState === 'idle' && (
            <div className="sim-idle-state">
              <div className="sim-idle-icon">⟳</div>
              <div className="sim-idle-text">Configure your transaction and press Run to begin</div>
            </div>
          )}

          {simState !== 'idle' && (
            <>
              <div className="sim-parties">
                <div className="sim-party">
                  <div className="sim-party-avatar">{sender.name.charAt(0)}</div>
                  <div className="sim-party-name">{sender.name}</div>
                  <div className="sim-party-role">Sender</div>
                </div>
                <div className="sim-arrow-track">
                  <div className="sim-arrow-line">
                    {(simState === 'running' || simState === 'completed') && (
                      <div className="sim-progress-fill" />
                    )}
                  </div>
                  <div className="sim-amount-label mono">
                    ₦{parsedNgn.toLocaleString()} → ${amountUsdc.toFixed(2)}
                  </div>
                </div>
                <div className="sim-party">
                  <div className="sim-party-avatar">{receiver.name.charAt(0)}</div>
                  <div className="sim-party-name">{receiver.name}</div>
                  <div className="sim-party-role">Receiver</div>
                </div>
              </div>

              <div className="sim-steps">
                {steps.map((step, i) => (
                  <div key={step.id} className={`sim-step sim-step-${step.status}`}>
                    <div className="sim-step-icon">
                      {step.status === 'completed' && <span className="icon-check">✓</span>}
                      {step.status === 'failed' && <span className="icon-x">✗</span>}
                      {step.status === 'processing' && <span className="spinner-sm" />}
                      {step.status === 'waiting' && <span className="icon-num">{i + 1}</span>}
                    </div>
                    <div className="sim-step-body">
                      <div className="sim-step-top">
                        <span className="sim-step-label">{step.label}</span>
                        {step.duration_ms && (
                          <span className="sim-step-dur mono">{step.duration_ms}ms</span>
                        )}
                        {step.status === 'processing' && (
                          <span className="sim-step-dur">processing…</span>
                        )}
                      </div>
                      <div className="sim-step-desc">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sim-result">
                {simState === 'completed' && (
                  <div className="sim-result-success">
                    <div className="sim-result-icon">✓</div>
                    <div className="sim-result-body">
                      <div className="sim-result-title">Transaction Settled</div>
                      <div className="sim-result-nibss mono">NIBSS Ref: {nibssRef}</div>
                      <div className="sim-result-time">Completed in {(elapsed / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                )}
                {simState === 'failed' && (
                  <div className="sim-result-failure">
                    <div className="sim-result-icon">✗</div>
                    <div className="sim-result-body">
                      <div className="sim-result-title">Simulation Failed</div>
                      <div className="sim-result-desc">Failure injected at step {failStep} — all pending steps were halted</div>
                      <div className="sim-result-time">Failed after {(elapsed / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}
