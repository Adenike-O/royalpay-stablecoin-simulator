export type KYCStatus = 'pending' | 'verified' | 'rejected'
export type TransactionStatus = 'initiated' | 'kyc_check' | 'minting' | 'transfer' | 'conversion' | 'nibss_settlement' | 'completed' | 'failed'
export type WalletType = 'custodial' | 'non_custodial'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  bvn: string
  kycStatus: KYCStatus
  walletAddress: string
  walletType: WalletType
  ngn_balance: number
  usdc_balance: number
  created_at: string
}

export interface Transaction {
  id: string
  senderId: string
  receiverId: string
  amount_ngn: number
  amount_usdc: number
  fee: number
  status: TransactionStatus
  steps: TransactionStep[]
  created_at: string
  completed_at?: string
  nibss_ref?: string
  failure_reason?: string
}

export interface TransactionStep {
  id: string
  label: string
  description: string
  status: 'waiting' | 'processing' | 'completed' | 'failed'
  timestamp?: string
  duration_ms?: number
}

export interface NIBSSSettlement {
  id: string
  transaction_id: string
  session_code: string
  destination_bank: string
  account_number: string
  amount: number
  status: 'pending' | 'processing' | 'settled' | 'failed'
  initiated_at: string
  settled_at?: string
}

export interface DashboardStats {
  total_transactions: number
  total_volume_ngn: number
  total_volume_usdc: number
  kyc_verified: number
  avg_settlement_time_ms: number
  success_rate: number
}
