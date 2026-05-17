import './StatusBadge.css'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'muted'

interface StatusBadgeProps {
  label: string
  variant: Variant
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant}`}>
      <span className="status-dot" />
      {label}
    </span>
  )
}

export function kycBadge(status: string) {
  if (status === 'verified') return <StatusBadge label="Verified" variant="success" />
  if (status === 'pending') return <StatusBadge label="Pending" variant="warning" />
  return <StatusBadge label="Rejected" variant="danger" />
}

export function txnBadge(status: string) {
  if (status === 'completed') return <StatusBadge label="Completed" variant="success" />
  if (status === 'failed') return <StatusBadge label="Failed" variant="danger" />
  if (status === 'initiated') return <StatusBadge label="Initiated" variant="muted" />
  return <StatusBadge label={status} variant="info" />
}
