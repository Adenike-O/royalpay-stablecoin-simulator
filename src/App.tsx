import { useState, useEffect } from "react";
import {
  trackSessionStart, trackPhase, trackUseCase,
  trackInteraction, trackLead, trackSessionComplete,
  useCasesTried,
} from "./tracking";

const T = {
  bg: "#07101E", card: "#0D1B2F", card2: "#111F38", border: "#162540",
  teal: "#00D4AA", amber: "#F5A623", red: "#FF3B55", green: "#27AE60",
  blue: "#4A9EFF", purple: "#8B5CF6", txt: "#D0E8F5", dim: "#587298", muted: "#1A2E48",
};

// ── Reusable Components ─────────────────────────────────────────────────────

function Btn({ label, onClick, color, outline, disabled, full = true }: {
  label: string; onClick?: () => void; color?: string; outline?: boolean;
  disabled?: boolean; full?: boolean;
}) {
  const c = color || T.teal;
  const bg = disabled ? T.muted : outline ? "transparent" : c;
  const fg = disabled ? T.dim : outline ? c : c === T.red || c === T.blue || c === T.purple ? "#fff" : "#061018";
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      background: bg, color: fg, border: `1.5px solid ${disabled ? T.muted : c}`,
      padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", width: full ? "100%" : "auto",
      fontFamily: "inherit", opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s", letterSpacing: 0.2,
    }}>{label}</button>
  );
}

function Field({ label, value, onChange, placeholder, error, mono, type = "text", readOnly }: {
  label?: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  error?: string; mono?: boolean; type?: string; readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 10, color: T.dim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{label}</div>}
      <input type={type} value={value} onChange={e => !readOnly && onChange?.(e.target.value)}
        placeholder={placeholder} readOnly={readOnly} style={{
          width: "100%", padding: "10px 12px", background: T.card,
          border: `1.5px solid ${error ? T.red : T.border}`,
          borderRadius: 10, color: error ? T.red : T.txt,
          fontFamily: mono ? '"Courier New", monospace' : "inherit",
          fontSize: 12, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
        }} />
      {error && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>⚠ {error}</div>}
    </div>
  );
}

function Badge({ label, color = T.teal }: { label: string; color?: string }) {
  return <span style={{ background: color + "22", color, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.3, display: "inline-block" }}>{label}</span>;
}

function FRow({ label, value, vColor, mono }: { label: string; value: string; vColor?: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 12, color: T.dim }}>{label}</span>
      <span style={{ fontSize: 12, color: vColor || T.txt, fontWeight: 600, fontFamily: mono ? '"Courier New", monospace' : "inherit" }}>{value}</span>
    </div>
  );
}

function Alert({ type = "info", text }: { type?: "info" | "warn" | "err" | "ok"; text: string }) {
  const c = { info: T.blue, warn: T.amber, err: T.red, ok: T.green }[type] || T.blue;
  return <div style={{ background: c + "15", border: `1px solid ${c}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: c, lineHeight: 1.7 }}>{text}</div>;
}

function SecHead({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>{title}</span>
    </div>
  );
}

// ── Use Case Data ────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    id: "ecommerce", icon: "🛒", color: T.teal,
    title: "E-commerce Payment", subtitle: "Buy a product or digital service online",
    amount: 50, recipient: "DesignMaster Academy", location: "San Francisco, USA 🇺🇸",
    story: "Amaka wants to buy a Figma masterclass from a US creator for $50. Her Nigerian debit card keeps getting declined internationally — the platform doesn't accept non-US cards.",
    why: "No card declines. No 3-5 day processing holds. No 5% international card surcharge. USDT lands in 2 minutes, full amount.",
    infraNote: "For merchants, USDT payments are irreversible — no chargebacks, no dispute cycles, no Stripe fees (2.9% + 30¢). Final settlement the moment the blockchain confirms.",
  },
  {
    id: "freelancer", icon: "💼", color: T.blue,
    title: "Freelancer Invoice", subtitle: "Get paid by an international client",
    amount: 200, recipient: "Pixel & Co. Agency", location: "London, UK 🇬🇧",
    story: "Amaka completed a full brand identity for a London agency. They owe her 200 USDT. A SWIFT bank wire would take 5 days and cost $45 in correspondent bank fees — deducted from her payment.",
    why: "SWIFT: 3-5 days, $30-50 in fees, she receives less than invoiced. USDT on TRC-20: 2 minutes, ~$1 flat fee, she gets the full 200 USDT.",
    infraNote: "47% of Nigerian freelancers now request crypto payment as their primary preference for international clients. The stablecoin off-ramp via NIBSS converts their USDT to Naira in under 5 minutes.",
  },
  {
    id: "b2b", icon: "🏭", color: T.purple,
    title: "B2B Supplier Payment", subtitle: "Pay a business supplier cross-border",
    amount: 500, recipient: "Accra Textiles Ltd.", location: "Accra, Ghana 🇬🇭",
    story: "Amaka's fashion label urgently needs to pay its Ghanaian fabric supplier 500 USDT for a stock order. The shipment departs tomorrow — but a bank transfer to Ghana takes 2-5 days.",
    why: "SWIFT to Ghana: 2-5 days, $50+ fee, multiple correspondent banks. USDT: 2 minutes, $1 fee. Supplier confirms receipt, shipment proceeds.",
    infraNote: "Platforms like Quidax and Yellow Card offer B2B stablecoin APIs specifically for this use case. Businesses integrate the API once and never touch SWIFT for regional supplier payments again.",
  },
  {
    id: "remittance", icon: "❤️", color: T.red,
    title: "Family Remittance", subtitle: "Send money home — no queues, no 7% fees",
    amount: 100, recipient: "Mama Okonkwo", location: "Ibadan, Nigeria 🇳🇬",
    story: "Amaka's cousin in the UK wants to send their mum 100 USDT for rent and school fees. Western Union charges 7% + a poor exchange rate. No more queues, no more cutting slips.",
    why: "Western Union: 5-7% fee + FX markup. USDT: $1 flat fee. Mum receives the full equivalent in Naira via NIBSS within minutes of the blockchain confirmation.",
    infraNote: "The World Bank estimates $400B+ flows as remittances to developing markets annually. Stablecoins undercut traditional remittance services by 80-95% on total fees. This is the killer use case.",
  },
  {
    id: "p2p", icon: "🤝", color: T.amber,
    title: "P2P Bill Split", subtitle: "Pay a friend back — fast and borderless",
    amount: 25, recipient: "Chidi Nwosu", location: "Lagos, Nigeria 🇳🇬",
    story: "Amaka and Chidi shared a coworking space subscription this month. She owes him 25 USDT for her half. Nigerian bank transfers have been failing all morning due to scheduled maintenance.",
    why: "Works even when Nigerian bank servers are down. No need to share account numbers. Instant finality — Chidi sees the credit in real time.",
    infraNote: "P2P stablecoin transfers are growing in Nigeria as bank transfer downtimes push users toward crypto for everyday payments. The settlement is final — unlike a bank transfer that can fail and need to be re-sent.",
  },
];

// ── Infra Panel Data ─────────────────────────────────────────────────────────

const INFRA = [
  {
    title: "Why Stablecoins — Right Now", badge: "The $319B Infrastructure",
    intro: "Stablecoins have moved from niche crypto tool to global payment infrastructure. Here is why this prototype exists:",
    points: [
      { color: T.teal, label: "Volume", text: "Stablecoins processed $33 trillion in 2025 — surpassing Visa and Mastercard combined in annual settlement volume." },
      { color: T.amber, label: "Speed vs Cost", text: "Cross-border SWIFT wire: 1-3 business days, $25-50 fee + 5-7% FX spread. Stablecoin on TRC-20: ~2 minutes, ~$1 flat fee." },
      { color: T.green, label: "Africa First", text: "Nigeria leads Africa in stablecoin adoption. 70%+ of Nigerian crypto volume is USDT or USDC — used as dollar access and inflation protection." },
      { color: T.blue, label: "Regulation", text: "US GENIUS Act (July 2025) created the first comprehensive legal framework. EU MiCA fully active. Nigeria CBN has a VASP licensing regime." },
    ],
    note: null,
  },
  {
    title: "Account Registration", badge: "Server Layer",
    intro: "When you submit the sign-up form, no blockchain is involved. You are purely a database record at this stage.",
    points: [
      { color: T.teal, label: "Database Entry", text: "Your email and phone are hashed using bcrypt and stored in PostgreSQL or Firebase — encrypted at rest. No plaintext passwords are ever stored." },
      { color: T.amber, label: "User UUID", text: "A unique User ID (UUID v4) is generated in milliseconds. This is your anchor across all systems — KYC, wallets, transactions, support tickets." },
      { color: T.blue, label: "JWT Session Token", text: "A JSON Web Token is issued as your session passport. It expires after 24 hours of inactivity. Refresh tokens rotate on every use." },
      { color: T.dim, label: "OTP Verification", text: "An SMS OTP is dispatched via Termii or Twilio. Until verified, the account cannot initiate or receive any transactions." },
    ],
    note: { type: "info" as const, text: "Your blockchain wallet does not exist yet. It is generated only after KYC clearance — preventing unverified accounts from ever holding or receiving funds." },
  },
  {
    title: "The Compliance Engine", badge: "KYC / AML Layer",
    intro: "What looks like a simple selfie upload hides a sophisticated multi-layer compliance stack running in parallel.",
    points: [
      { color: T.teal, label: "BVN/NIN Check", text: "Your BVN is sent to the CBN/NIBSS API in real time — cross-checking your name, date of birth, and linked bank accounts instantly." },
      { color: T.amber, label: "Document OCR", text: "Your ID image is processed by SmileID or MetaMap — extracting text, validating hologram patterns, and detecting any tampering or photoshopping." },
      { color: T.green, label: "Liveness Check", text: "Your selfie is compared to your ID photo using facial biometric AI. A liveness check confirms you are physically present — prevents photo spoofing attacks." },
      { color: T.red, label: "Sanctions Screening", text: "You are screened against OFAC (US), UN Security Council, EU, and UK HMT sanctions lists simultaneously. This is legally mandatory — no exceptions for any user." },
    ],
    note: { type: "warn" as const, text: "Tier System (Quidax Model): Tier 1 (BVN + selfie) = ₦500k/day limit. Tier 2 (+ NIN/ID) = ₦2M/day. Tier 3 (+ proof of address) = Unlimited daily. Higher tier = higher USDT withdrawal limits." },
  },
  {
    title: "Cryptographic Wallet Generation", badge: "Blockchain Layer",
    intro: "Once KYC passes, the platform generates your wallet using military-grade cryptography — and stores the keys so you never have to manage them.",
    points: [
      { color: T.teal, label: "Key Pair Generated", text: "A private and public key pair is generated using secp256k1 elliptic curve cryptography — the same algorithm securing Bitcoin and Ethereum globally." },
      { color: T.amber, label: "Custodial Model", text: "Your private key lives inside a Hardware Security Module (HSM) — a tamper-proof certified chip. You never see it. The platform controls it on your behalf, like a bank vault." },
      { color: T.blue, label: "Multi-Network Addresses", text: "Each blockchain derives a separate deposit address. TRON, Ethereum, Solana = 3 different mailboxes for the same user account, all linked to your UUID." },
      { color: T.red, label: "Network Mismatch Risk", text: "TRON (TRC-20) and Ethereum (ERC-20) addresses look similar but are completely incompatible networks. Sending to the wrong one = permanent, unrecoverable loss of funds." },
    ],
    note: { type: "warn" as const, text: "Custodial (Quidax, Binance, RoyalPay): Platform holds your key — recoverable if you forget your password. Non-Custodial (MetaMask, Trust Wallet): YOU hold the key. Lose your seed phrase = lose all funds, forever. No exceptions." },
  },
  {
    title: "Fiat On-Ramp Engine", badge: "Payment Processing Layer",
    intro: "Buying USDT with Naira connects traditional banking rails to crypto infrastructure — often in under 60 seconds.",
    points: [
      { color: T.teal, label: "Virtual Account", text: "Paystack or Flutterwave issues a unique virtual NGN account number for your transaction. You transfer Naira to it exactly like any normal bank transfer." },
      { color: T.amber, label: "Webhook Trigger", text: "When NGN arrives at the aggregator account, a webhook fires instantly: 'Payment confirmed: ₦83,250 from GTBank.' This triggers the credit process." },
      { color: T.blue, label: "Liquidity Pool", text: "The platform does NOT go to Binance for every transaction. It maintains an internal USDT pool and rebalances in bulk overnight — enabling instant credit without a blockchain TX per trade." },
      { color: T.green, label: "Ledger Credit", text: "Your account is credited '+50 USDT' in the platform's database. This is a ledger entry — no on-chain transaction has happened for your specific wallet yet." },
    ],
    note: { type: "info" as const, text: "Rate Lock: The NGN/USDT rate is frozen at the moment you initiate the transfer. You are protected from price movement during the 2-5 minutes your bank transfer takes to clear." },
  },
  {
    title: "One Rail, Five Use Cases", badge: "Infrastructure Insight",
    intro: "The same stablecoin infrastructure powers radically different payment scenarios. The blockchain does not care who is paying whom or why.",
    points: [
      { color: T.teal, label: "E-commerce", text: "Solves the international card decline problem. No Stripe disputes, no chargebacks, no 3-5 day holds. Payment is final the moment the blockchain confirms." },
      { color: T.blue, label: "Freelancers", text: "47% of Nigerian freelancers now prefer crypto payment for international clients. USDT avoids SWIFT delays, fee deductions, and FX losses on conversion." },
      { color: T.purple, label: "B2B Payments", text: "Quidax, Yellow Card, and Busha now offer dedicated B2B APIs for stablecoin supplier settlements — businesses integrate once and bypass SWIFT permanently." },
      { color: T.red, label: "Remittance", text: "$400B+ flows to developing markets annually. Stablecoins undercut traditional remittance services (Western Union, MoneyGram) by 80-95% on total fees." },
      { color: T.amber, label: "P2P", text: "Growing in Nigeria as bank transfer downtimes push users toward crypto for everyday payments. Settlement is instant and final — no pending, no reversals." },
    ],
    note: { type: "info" as const, text: "For businesses: platforms like Quidax offer a B2B stablecoin API. Your fintech product can integrate stablecoin payment rails without building any blockchain infrastructure yourself." },
  },
  {
    title: "Blockchain Transfer: The Rails", badge: "On-Chain Layer",
    intro: "Choosing between TRC-20 and ERC-20 is like choosing logistics providers — same package, very different cost, speed, and risk profile.",
    points: [
      { color: T.green, label: "TRC-20 (TRON)", text: "Block time: 3 seconds. 19 Super Representatives validate blocks. Average confirmation: ~2 minutes. Fee: ~$1-2 flat regardless of the amount being sent." },
      { color: T.amber, label: "ERC-20 (Ethereum)", text: "Block time: ~12 seconds (Proof of Stake). Average confirmation: 12-15 minutes. Gas fee: $3-25 depending on network congestion. Better suited for very large amounts." },
      { color: T.teal, label: "Transaction Signing", text: "The platform's HSM signs the raw transaction with your wallet's private key. The signed transaction is then broadcast simultaneously to hundreds of network nodes." },
      { color: T.blue, label: "Transaction Hash", text: "Once a validator confirms the block, a unique TxHash is generated — your permanent, immutable, publicly verifiable receipt on the blockchain. It never changes." },
    ],
    note: { type: "err" as const, text: "⚠ The #1 User Error: Sending TRC-20 USDT to an Ethereum (ERC-20) address = permanent, unrecoverable loss. Addresses look similar but the networks are completely incompatible. ALWAYS match the network to the address format before confirming." },
  },
  {
    title: "Off-Ramp & NIBSS Settlement", badge: "Fiat Settlement Layer",
    intro: "Converting USDT to Naira and landing it in a physical bank account in under 5 minutes — this is where crypto meets traditional banking rails.",
    points: [
      { color: T.teal, label: "USDT Converted", text: "Your USDT moves from your internal ledger to the platform's operational settlement wallet — effectively sold at the current NGN/USDT rate." },
      { color: T.amber, label: "NIBSS NIP", text: "The platform triggers a NIBSS Instant Payment (NIP) instruction — the exact same rails your bank uses for instant interbank transfers within Nigeria." },
      { color: T.green, label: "Settlement Speed", text: "NIBSS NIP clears in under 5 minutes, 24 hours a day, 7 days a week, 365 days a year — including Sundays and public holidays. No correspondent banks needed." },
      { color: T.blue, label: "Zero FX Risk", text: "The recipient bank credits the account in Naira. The full crypto-to-fiat conversion happened inside the platform treasury — zero FX exposure for the end user." },
    ],
    note: { type: "info" as const, text: "SWIFT vs NIBSS: SWIFT = 2-5 correspondent banks, $25-50 cost, 1-3 business days, weekdays only. NIBSS NIP = ₦50 flat, under 5 minutes, 24/7/365. Same money. Completely different infrastructure." },
  },
  {
    title: "The Immutable Audit Trail", badge: "Transparency Layer",
    intro: "Every stablecoin transaction generates two parallel records — one public, one private — and neither can be altered after the fact.",
    points: [
      { color: T.teal, label: "Public Ledger", text: "All on-chain transactions are publicly visible on Tronscan.org (TRC-20) or Etherscan.io (ERC-20). Anyone in the world can verify any TxHash at any time." },
      { color: T.amber, label: "Private Ledger", text: "Off-chain transactions (fiat buys, off-ramps) live in the platform's encrypted database — accessible to regulators under a valid court order or regulatory request." },
      { color: T.red, label: "Freeze Capability", text: "Tether (USDT issuer) can globally freeze any wallet. In 2024-25, Tether froze over $1.5 billion across 2,000+ blacklisted addresses on Ethereum and TRON alone." },
      { color: T.blue, label: "Transaction Monitoring", text: "AI-powered TM systems run 24/7 — flagging unusual patterns and automatically filing Suspicious Activity Reports (SARs) with the CBN and NFIU when thresholds are breached." },
    ],
    note: { type: "warn" as const, text: "Transparency Paradox: Stablecoins are MORE transparent for regulators than traditional banking — every on-chain move is on a permanent public ledger. The blockchain never forgets and cannot be edited. This is what makes compliance both essential and enforceable." },
  },
  {
    title: "Traditional Rails vs Stablecoin Rails", badge: "Final Verdict",
    intro: "Side by side, the structural advantages are undeniable. This is why $33 trillion moved on stablecoin rails in 2025.",
    points: [
      { color: T.teal, label: "Speed", text: "SWIFT international wire: 1-3 business days. TRC-20 stablecoin: ~2 minutes. Over 1,000 times faster for the exact same cross-border transfer." },
      { color: T.green, label: "Cost", text: "SWIFT: $25-50 wire fee + 5-7% FX spread. TRC-20 stablecoin: ~$1 flat gas fee, no FX spread. Approximately 95-99% cost reduction on total transfer cost." },
      { color: T.amber, label: "Availability", text: "SWIFT: weekdays, banking hours, excludes public holidays. Stablecoin: 24 hours a day, 7 days a week, 365 days a year — no scheduled downtime, no cutoff times." },
      { color: T.blue, label: "Intermediaries", text: "SWIFT: 2-5 correspondent banks, each adding time, cost, and counterparty risk. Stablecoin: Sender to blockchain to recipient. Zero intermediaries." },
    ],
    note: { type: "ok" as const, text: "Regulation is converging: US GENIUS Act (2025), EU MiCA, Nigeria CBN VASP licensing — stablecoin infrastructure is now as regulated as traditional banking, but without the legacy inefficiencies built over 50 years." },
  },
];

// ── Phone Frame ──────────────────────────────────────────────────────────────

function PhoneFrame({ children, phase, total }: { children: React.ReactNode; phase: number; total: number }) {
  const labels = ["Welcome","Sign Up","KYC","Wallet","Buy USDT","Use Cases","Transfer","Off-Ramp","History","Compare"];
  return (
    <div style={{
      width: 358, background: "#08121E", borderRadius: 36,
      border: "2px solid #162438",
      boxShadow: "0 30px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
      display: "flex", flexDirection: "column", overflow: "hidden", height: 660,
    }}>
      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 6px", fontSize: 11, color: T.dim, background: "#07101C" }}>
        <span style={{ fontWeight: 600 }}>9:41 AM</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 10 }}>
          <span>●●●●</span><span>WiFi</span><span>🔋</span>
        </div>
      </div>
      {/* URL bar */}
      <div style={{ padding: "4px 16px 8px", background: "#07101C" }}>
        <div style={{ background: T.card, borderRadius: 8, padding: "5px 11px", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 10, color: T.green }}>🔒</span>
          <span style={{ fontSize: 10, color: T.dim }}>royalpay.app</span>
          <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>⟳</span>
        </div>
      </div>
      {/* App header */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderBottom: `1px solid ${T.border}`, gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${T.teal}, #007A8F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>♛</div>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.txt, flex: 1, letterSpacing: -0.3 }}>RoyalPay</span>
        <Badge label={labels[Math.min(phase, labels.length - 1)]} color={T.teal} />
      </div>
      {/* Phase progress bar */}
      <div style={{ display: "flex", gap: 2, padding: "0 16px 6px" }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= phase ? T.teal : T.muted, transition: "background 0.3s" }} />
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Infra Panel ──────────────────────────────────────────────────────────────

function InfraPanel({ data }: { data: typeof INFRA[0] | null }) {
  if (!data) return null;
  const alertC: Record<string, string> = { info: T.blue, warn: T.amber, err: T.red, ok: T.green };
  return (
    <div style={{ flex: 1, minWidth: 260, paddingLeft: 28, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 8 }}><Badge label={data.badge} color={T.teal} /></div>
      <div style={{ fontSize: 17, fontWeight: 800, color: T.txt, marginBottom: 6 }}>{data.title}</div>
      <p style={{ fontSize: 12, color: T.dim, lineHeight: 1.7, marginBottom: 20 }}>{data.intro}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.points.map((p, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 12, padding: "12px 16px", borderLeft: `3px solid ${p.color}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 12, color: T.txt, lineHeight: 1.7 }}>{p.text}</div>
          </div>
        ))}
      </div>
      {data.note && (
        <div style={{ marginTop: 14, background: alertC[data.note.type] + "15", border: `1px solid ${alertC[data.note.type]}40`, borderRadius: 12, padding: "12px 16px", fontSize: 12, color: alertC[data.note.type], lineHeight: 1.7 }}>
          {data.note.text}
        </div>
      )}
    </div>
  );
}

// ── Phase 0: Welcome ─────────────────────────────────────────────────────────

function Welcome({ next }: { next: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>♛</div>
      <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, marginBottom: 2 }}>RoyalPay</div>
      <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Stablecoin Simulator</div>
      <p style={{ fontSize: 12, color: T.dim, lineHeight: 1.7, marginBottom: 18 }}>
        Experience the complete end-to-end lifecycle of a stablecoin — from web sign-up to cross-border settlement. No downloads. Runs in your browser.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginBottom: 20, textAlign: "left" }}>
        {["Web Sign-Up & KYC Verification", "Generate a Custodial Wallet (TRON / ETH / SOL)", "Buy USDT with Naira via Bank Transfer", "5 Real Use Cases — E-commerce, Freelancer, B2B, Remittance, P2P", "Cash Out via NIBSS to Nigerian Bank Account"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: T.teal + "22", color: T.teal, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 11, color: T.txt }}>{item}</span>
          </div>
        ))}
      </div>
      <Btn label="Launch Simulation →" onClick={next} />
    </div>
  );
}

// ── Phase 1: Sign Up ─────────────────────────────────────────────────────────

function SignUp({ next }: { next: () => void }) {
  const [email, setEmail] = useState("amaka.okonkwo@gmail.com");
  const [phone, setPhone] = useState("+234 812 345 6789");
  const [pass, setPass] = useState("");
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (step === 2) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>✅</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.green, marginBottom: 4 }}>Account Created!</div>
      <p style={{ fontSize: 12, color: T.dim, marginBottom: 20 }}>{email} verified</p>
      <Alert type="info" text="Account is live but transactions are locked. Complete KYC to generate your wallet and unlock your daily limits." />
      <Btn label="Continue to KYC →" onClick={next} />
    </div>
  );

  if (step === 1) return (
    <div>
      <SecHead icon="📱" title="Verify Phone Number" />
      <p style={{ fontSize: 12, color: T.dim, marginBottom: 16 }}>A 6-digit OTP was sent to {phone}</p>
      <Field label="OTP Code" value={otp} onChange={setOtp} placeholder="Enter 6-digit code" />
      <Alert type="warn" text="Demo mode: enter any 6 digits to continue." />
      <Btn label={loading ? "Verifying..." : "Confirm OTP"} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setStep(2); }, 1000); }} disabled={loading || otp.length < 4} />
    </div>
  );

  return (
    <div>
      <SecHead icon="🌐" title="Create Your Account" />
      <div style={{ background: T.card, borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 10, color: T.green }}>🔒</span>
        <span style={{ fontSize: 10, color: T.dim }}>royalpay.app — No download required. Runs in your browser.</span>
      </div>
      <Field label="Email Address" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
      <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+234 8XX XXX XXXX" />
      <Field label="Password" value={pass} onChange={setPass} placeholder="Create a strong password" type="password" />
      <div style={{ fontSize: 10, color: T.dim, marginBottom: 14, lineHeight: 1.6 }}>Secured under NDPR. Encrypted at rest and in transit. Regulated by Nigeria SEC (VASP licensed).</div>
      <Btn label={loading ? "Creating account..." : "Create Account"} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setStep(1); }, 1500); }} disabled={loading || !email || !pass} />
      <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: T.dim }}>Already registered? <span style={{ color: T.teal, cursor: "pointer" }}>Sign in</span></div>
    </div>
  );
}

// ── Phase 2: KYC ────────────────────────────────────────────────────────────

function KYC({ next }: { next: () => void }) {
  const [step, setStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [bvn, setBvn] = useState("22012345678");
  const [done, setDone] = useState(false);

  const doVerify = () => {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); if (step < 3) setStep(s => s + 1); else setDone(true); }, 1800);
  };

  const kycSteps = [
    { icon: "🏦", title: "BVN Verification", desc: "Link your Bank Verification Number to confirm your banking identity", body: <Field label="BVN Number" value={bvn} onChange={setBvn} placeholder="11-digit BVN" mono /> },
    { icon: "🪪", title: "NIN / ID Upload", desc: "Upload a clear photo of your government-issued ID document", body: <div style={{ background: T.card, borderRadius: 10, padding: "24px 20px", textAlign: "center", border: `2px dashed ${T.border}`, cursor: "pointer" }}><div style={{ fontSize: 26, marginBottom: 6 }}>📄</div><div style={{ fontSize: 12, color: T.dim }}>Tap to upload ID image</div><div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>NIN slip · International Passport · Driver's License</div></div> },
    { icon: "🤳", title: "Selfie & Liveness Check", desc: "Take a selfie — our AI will match it against your ID photo", body: <div style={{ background: T.card, borderRadius: 10, padding: "24px 20px", textAlign: "center", border: `2px dashed ${T.border}`, cursor: "pointer" }}><div style={{ fontSize: 26, marginBottom: 6 }}>📷</div><div style={{ fontSize: 12, color: T.dim }}>Tap to enable camera</div><div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Liveness: blink once and turn your head slowly</div></div> },
    { icon: "🏠", title: "Proof of Address", desc: "Upload a utility bill or bank statement from the last 3 months", body: <div style={{ background: T.card, borderRadius: 10, padding: "24px 20px", textAlign: "center", border: `2px dashed ${T.border}`, cursor: "pointer" }}><div style={{ fontSize: 26, marginBottom: 6 }}>🏠</div><div style={{ fontSize: 12, color: T.dim }}>Tap to upload document</div><div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>PHCN bill · LAWMA receipt · Bank statement</div></div> },
  ];

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.green, marginBottom: 6 }}>KYC Approved!</div>
      <Badge label="Tier 2 Verified · ₦2M/day limit" color={T.green} />
      <div style={{ width: "100%", margin: "16px 0" }}>
        {["BVN verified against NIBSS database", "Identity document authenticated", "Liveness check passed", "Address confirmed"].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
            <span style={{ color: T.dim }}>{s}</span>
            <span style={{ color: T.green, fontWeight: 700 }}>✓</span>
          </div>
        ))}
      </div>
      <Btn label="Generate My Wallet →" onClick={next} />
    </div>
  );

  const cur = kycSteps[step];
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {kycSteps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.teal : T.muted }} />)}
      </div>
      <div style={{ fontSize: 10, color: T.dim, marginBottom: 12 }}>Step {step + 1} of {kycSteps.length}</div>
      <SecHead icon={cur.icon} title={cur.title} />
      <p style={{ fontSize: 12, color: T.dim, marginBottom: 14 }}>{cur.desc}</p>
      {cur.body}
      <div style={{ marginTop: 14 }}>
        {verifying
          ? <div style={{ textAlign: "center", padding: "12px", color: T.teal, fontSize: 13, fontWeight: 700 }}>Verifying with SmileID ▪ ▪ ▪</div>
          : <Btn label={step === 3 ? "Submit for Review" : "Verify & Continue"} onClick={doVerify} />}
      </div>
    </div>
  );
}

// ── Phase 3: Wallet Generated ─────────────────────────────────────────────────

function WalletGen({ next }: { next: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const wallets = [
    { net: "TRON", token: "TRC-20", addr: "TQtfwq4nVjfXFqKLBYqmFAE5PbhBKUiVrx", color: T.red, badge: "Cheapest Fees" },
    { net: "Ethereum", token: "ERC-20", addr: "0x8a3D5F6c9E7b2A1d4C0F8e3B6A2D9E5", color: T.blue, badge: "Most Liquid" },
    { net: "Solana", token: "SPL", addr: "8zQp3rXwV7mL4kY9tFe6cN2aHs5dBjKo", color: T.purple, badge: "Fastest" },
  ];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🔐</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>Wallet Generated!</div>
        <p style={{ fontSize: 11, color: T.dim }}>Your custodial wallet is live across 3 blockchain networks</p>
      </div>
      {wallets.map(w => (
        <div key={w.net} style={{ background: T.card, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{w.net}</span>
              <Badge label={w.token} color={w.color} />
            </div>
            <Badge label={w.badge} color={w.color} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: T.dim, fontFamily: '"Courier New", monospace', flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.addr}</span>
            <button onClick={() => { setCopied(w.net); setTimeout(() => setCopied(null), 2000); }} style={{ background: copied === w.net ? T.green + "22" : T.muted, border: "none", color: copied === w.net ? T.green : T.dim, padding: "3px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
              {copied === w.net ? "✓" : "Copy"}
            </button>
          </div>
        </div>
      ))}
      <Alert type="err" text="⚠ Critical: Always match the blockchain network to the sender's network. Sending TRC-20 USDT to an ERC-20 address = permanent, unrecoverable loss." />
      <Btn label="Fund My Wallet →" onClick={next} />
    </div>
  );
}

// ── Phase 4: Buy USDT ────────────────────────────────────────────────────────

function BuyUSDT({ next }: { next: () => void }) {
  const [ngn, setNgn] = useState("83250");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const rate = 1665;
  const gross = ngn ? (parseFloat(ngn) / rate).toFixed(2) : "0.00";
  const fee = (parseFloat(gross) * 0.015).toFixed(2);
  const net = (parseFloat(gross) - parseFloat(fee)).toFixed(2);

  if (step === 2) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 8 }}>💰</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.teal, marginBottom: 2 }}>+{net} USDT</div>
      <div style={{ fontSize: 12, color: T.dim, marginBottom: 20 }}>Credited to your RoyalPay wallet</div>
      <div style={{ width: "100%", marginBottom: 16 }}>
        <FRow label="NGN Paid" value={`₦${parseInt(ngn).toLocaleString()}`} />
        <FRow label="Exchange Rate" value={`₦${rate} = $1`} />
        <FRow label="Platform Fee (1.5%)" value={`${fee} USDT`} vColor={T.amber} />
        <FRow label="USDT Credited" value={`${net} USDT`} vColor={T.teal} />
        <FRow label="Settlement" value="Internal ledger (instant)" vColor={T.green} />
      </div>
      <Badge label={`Wallet Balance: ${net} USDT`} color={T.teal} />
      <div style={{ marginTop: 20, width: "100%" }}><Btn label="Explore Use Cases →" onClick={next} /></div>
    </div>
  );

  if (step === 1) return (
    <div>
      <SecHead icon="🏦" title="Bank Transfer Details" />
      <Alert type="info" text="Transfer the exact Naira amount below to this virtual account. Funds reflect within 2-5 minutes after bank confirmation." />
      <div style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 14 }}>
        <FRow label="Bank Name" value="Providus Bank (via Paystack)" />
        <FRow label="Account Number" value="0012345678" mono />
        <FRow label="Account Name" value="RoyalPay / Amaka Okonkwo" />
        <FRow label="Amount to Transfer" value={`₦${parseInt(ngn).toLocaleString()}`} vColor={T.teal} />
        <FRow label="You will receive" value={`${net} USDT`} vColor={T.green} />
      </div>
      <Alert type="warn" text="Rate locked for 10 minutes. Transfer the exact amount shown or the rate will be recalculated." />
      <Btn label="I've Made the Transfer ✓" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setStep(2); }, 1200); }} disabled={loading} />
    </div>
  );

  return (
    <div>
      <SecHead icon="💳" title="Buy USDT" />
      <div style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontSize: 10, color: T.dim, marginBottom: 2 }}>WALLET BALANCE</div><div style={{ fontSize: 20, fontWeight: 800, color: T.txt }}>0.00 USDT</div></div>
        <Badge label="Tier 2 Verified" color={T.green} />
      </div>
      <Field label="Amount in Naira (NGN)" value={ngn} onChange={v => setNgn(v.replace(/[^0-9]/g, ""))} placeholder="Enter NGN amount" />
      <div style={{ background: T.card, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <FRow label="Rate (locked)" value={`₦${rate} = 1 USDT`} />
        <FRow label="Gross USDT" value={`${gross} USDT`} />
        <FRow label="Fee (1.5%)" value={`${fee} USDT`} vColor={T.amber} />
        <FRow label="Net USDT" value={`${net} USDT`} vColor={T.teal} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: T.dim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Payment Method</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Bank Transfer", "Card", "USSD"].map((m, i) => (
            <div key={i} style={{ flex: 1, background: i === 0 ? T.teal + "18" : T.card, border: `1.5px solid ${i === 0 ? T.teal : T.border}`, borderRadius: 8, padding: "7px", textAlign: "center", cursor: "pointer", fontSize: 10, color: i === 0 ? T.teal : T.dim, fontWeight: 600 }}>{m}</div>
          ))}
        </div>
      </div>
      <Btn label={`Buy ${net} USDT →`} onClick={() => setStep(1)} disabled={!ngn || parseFloat(ngn) < 500} />
    </div>
  );
}

// ── Phase 5: Use Case Selector ────────────────────────────────────────────────

function UseCaseSelector({ next, setUseCase }: { next: () => void; setUseCase: (uc: typeof USE_CASES[0]) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Choose Your Scenario</div>
      <p style={{ fontSize: 12, color: T.dim, marginBottom: 14, lineHeight: 1.6 }}>Same USDT in your wallet. Five different real-world use cases. Pick one to simulate the full flow:</p>
      {USE_CASES.map(uc => (
        <div key={uc.id} onClick={() => { trackUseCase(uc.id, uc.title, uc.amount); setUseCase(uc); next(); }}
          onMouseEnter={() => setHovered(uc.id)} onMouseLeave={() => setHovered(null)}
          style={{ background: hovered === uc.id ? T.card2 : T.card, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${hovered === uc.id ? uc.color : T.border}`, cursor: "pointer", transition: "all 0.18s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: uc.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{uc.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginBottom: 1 }}>{uc.title}</div>
              <div style={{ fontSize: 10, color: T.dim }}>{uc.subtitle}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Badge label={`$${uc.amount}`} color={uc.color} />
              <span style={{ color: T.dim, fontSize: 14 }}>›</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Phase 6: Transfer ─────────────────────────────────────────────────────────

function Transfer({ next, useCase }: { next: () => void; useCase: typeof USE_CASES[0] | null }) {
  const uc = useCase || USE_CASES[0];
  const [network, setNetwork] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [addrErr, setAddrErr] = useState("");
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const txHash = "a4f2c9e7b1d8f305a6e2b9c4f1a7e3d0b8c5f2a9e6d3";

  useEffect(() => {
    if (step !== 3 || !network) return;
    const total = network === "TRON" ? 120 : 900;
    setCountdown(total);
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); setStep(4); return 0; }
        return c - 1;
      });
    }, 40);
    return () => clearInterval(iv);
  }, [step, network]);

  const validateAddr = (addr: string) => {
    if (!addr || !network) return "";
    if (network === "TRON" && addr.startsWith("0x")) return "ERC-20 address pasted on TRON — funds will be permanently lost!";
    if (network === "ETH" && (addr.startsWith("T") && addr.length > 20)) return "TRC-20 address pasted on Ethereum — funds will be permanently lost!";
    return "";
  };

  const sampleAddrs: Record<string, { ok: string; bad: string }> = {
    TRON: { ok: "TQtfwqXm4nVjfXFqKLBYqmFAE5PbhBKUiVrx", bad: "0x8a3D5F6c9E7b2A1d4C0F8e3B6A2D9E5C1F7" },
    ETH: { ok: "0x8a3D5F6c9E7b2A1d4C0F8e3B6A2D9E5C1F7A3B0", bad: "TQtfwqXm4nVjfXFqKLBYqmFAE5PbhBKUiVrx" },
  };

  const gasLabel: Record<string, string> = { TRON: "~1.00 USDT", ETH: "~$8.50 (variable)" };
  const timeLabel: Record<string, string> = { TRON: "~2 minutes", ETH: "~12-15 minutes" };

  if (step === 4) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.green, marginBottom: 4 }}>Transfer Confirmed!</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: T.teal, marginBottom: 16 }}>{uc.amount} USDT Sent</div>
      <div style={{ width: "100%", marginBottom: 14 }}>
        <FRow label="To" value={uc.recipient} />
        <FRow label="Location" value={uc.location} />
        <FRow label="Network" value={`${network} (${network === "TRON" ? "TRC-20" : "ERC-20"})`} vColor={T.teal} />
        <FRow label="Gas Fee" value={gasLabel[network!]} vColor={T.amber} />
        <FRow label="Status" value="Confirmed on-chain ✓" vColor={T.green} />
        <FRow label="TxHash" value={txHash.substring(0, 14) + "..."} mono vColor={T.teal} />
      </div>
      <div style={{ fontSize: 11, color: T.dim, marginBottom: 16, fontStyle: "italic" }}>"{uc.why}"</div>
      <Btn label="Cash Out to Bank →" onClick={next} />
    </div>
  );

  if (step === 3) {
    const total = network === "TRON" ? 120 : 900;
    const pct = ((total - countdown) / total) * 100;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>⛓️</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Broadcasting to {network}</div>
        <p style={{ fontSize: 12, color: T.dim, marginBottom: 20 }}>Waiting for block confirmation from validators...</p>
        <div style={{ width: "100%", background: T.muted, borderRadius: 4, height: 6, marginBottom: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, background: T.teal, height: "100%", borderRadius: 4, transition: "width 0.05s" }} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.teal, marginBottom: 4 }}>{countdown}s</div>
        <div style={{ fontSize: 12, color: T.dim, marginBottom: 16 }}>Estimated: {timeLabel[network!]}</div>
        <div style={{ fontSize: 10, color: T.muted, fontFamily: '"Courier New", monospace' }}>TxHash: {txHash.substring(0, 22)}...</div>
      </div>
    );
  }

  if (step === 2) return (
    <div>
      <SecHead icon="📋" title="Review Transfer" />
      <div style={{ background: uc.color + "12", border: `1px solid ${uc.color}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: T.txt, lineHeight: 1.6 }}>
        {uc.icon} {uc.story}
      </div>
      <div style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 14 }}>
        <FRow label="To" value={uc.recipient} />
        <FRow label="Amount" value={`${uc.amount} USDT`} vColor={T.teal} />
        <FRow label="Network" value={`${network} · ${network === "TRON" ? "TRC-20" : "ERC-20"}`} />
        <FRow label="Gas Fee" value={gasLabel[network!]} vColor={T.amber} />
        <FRow label="Est. Time" value={timeLabel[network!]} vColor={T.green} />
      </div>
      <Alert type="warn" text="This transaction is irreversible. Verify recipient and network before confirming." />
      <Btn label={`Confirm — Send ${uc.amount} USDT`} onClick={() => { trackInteraction('transfer_confirmed', 6, uc.id, { network }); setStep(3); }} />
      <div style={{ marginTop: 8 }}><Btn label="← Back" onClick={() => setStep(1)} outline /></div>
    </div>
  );

  if (step === 1 && network) return (
    <div>
      <SecHead icon={uc.icon} title={uc.title} />
      <div style={{ background: T.card, borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: T.dim, lineHeight: 1.6 }}>{uc.story}</div>
      <Field label={`${uc.recipient}'s ${network} Wallet Address`} value={address}
        onChange={v => { setAddress(v); setAddrErr(validateAddr(v)); }}
        placeholder={`Paste ${network} wallet address here`} error={addrErr} mono />
      {!addrErr && address.length > 10 && <Alert type="ok" text="✓ Valid address format detected." />}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button onClick={() => { trackInteraction('correct_address_used', 6, uc.id, { network }); setAddress(sampleAddrs[network].ok); setAddrErr(""); }} style={{ flex: 1, background: T.green + "18", border: `1px solid ${T.green}40`, color: T.green, padding: "7px", borderRadius: 8, fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
          ✓ Correct Address
        </button>
        <button onClick={() => { const a = sampleAddrs[network].bad; const err = validateAddr(a); trackInteraction('wrong_network_clicked', 6, uc.id, { network, address_pasted: a }); setAddress(a); setAddrErr(err); }} style={{ flex: 1, background: T.red + "18", border: `1px solid ${T.red}40`, color: T.red, padding: "7px", borderRadius: 8, fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
          ⚠ Wrong Network
        </button>
      </div>
      <Alert type="info" text={`Why stablecoins win here: ${uc.why}`} />
      <Btn label="Review Transfer →" onClick={() => setStep(2)} disabled={!address || !!addrErr || address.length < 10} />
    </div>
  );

  return (
    <div>
      <SecHead icon="📤" title="Send USDT" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: uc.color + "12", borderRadius: 12, padding: "12px 14px", marginBottom: 16, border: `1px solid ${uc.color}30` }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: uc.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{uc.icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>{uc.recipient}</div>
          <div style={{ fontSize: 11, color: T.dim }}>{uc.location} · {uc.amount} USDT</div>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Select Blockchain Network (Rail)</div>
      {[
        { id: "TRON", token: "TRC-20", fee: "~$1 flat", time: "~2 min", badge: "Recommended", color: T.green, desc: "Fast and cheap. Best for most transfers under $10,000." },
        { id: "ETH", token: "ERC-20", fee: "$3-25 gas", time: "~15 min", badge: "Higher cost", color: T.amber, desc: "Slower, variable cost. Preferred for large institutional amounts." },
      ].map(n => (
        <div key={n.id} onClick={() => { trackInteraction(n.id === 'TRON' ? 'network_selected_tron' : 'network_selected_eth', 6, uc.id, { network: n.id, use_case: uc.id }); setNetwork(n.id); setStep(1); }}
          style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 10, border: `1.5px solid ${T.border}`, cursor: "pointer", transition: "border-color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = n.color)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.txt }}>{n.id}</span>
              <Badge label={n.token} color={n.color} />
            </div>
            <Badge label={n.badge} color={n.color} />
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: T.dim }}>Fee: <strong style={{ color: n.color }}>{n.fee}</strong></span>
            <span style={{ fontSize: 11, color: T.dim }}>Time: <strong style={{ color: T.txt }}>{n.time}</strong></span>
          </div>
          <div style={{ fontSize: 11, color: T.dim }}>{n.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Phase 7: Off-Ramp ─────────────────────────────────────────────────────────

function OffRamp({ next }: { next: () => void }) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("45");
  const [loading, setLoading] = useState(false);
  const rate = 1665;
  const fee = (parseFloat(amount || "0") * 0.008).toFixed(2);
  const netAmt = (parseFloat(amount || "0") - parseFloat(fee)).toFixed(2);
  const netNGN = (parseFloat(netAmt) * rate).toFixed(0);

  if (step === 2) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🏦</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.teal, marginBottom: 4 }}>NIBSS NIP Initiated</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>₦{parseInt(netNGN).toLocaleString()}</div>
      <div style={{ fontSize: 12, color: T.dim, marginBottom: 20 }}>Credited to GTBank — 0123456789</div>
      <div style={{ width: "100%", marginBottom: 16 }}>
        <FRow label="USDT Converted" value={`${amount} USDT`} />
        <FRow label="Exchange Rate" value={`₦${rate} per USDT`} />
        <FRow label="Conversion Fee (0.8%)" value={`${fee} USDT`} vColor={T.amber} />
        <FRow label="NGN Credited" value={`₦${parseInt(netNGN).toLocaleString()}`} vColor={T.green} />
        <FRow label="Settlement Method" value="NIBSS NIP" vColor={T.teal} />
        <FRow label="Settlement Time" value="Under 5 minutes" vColor={T.green} />
      </div>
      <Btn label="View Transaction History →" onClick={next} />
    </div>
  );

  if (step === 1) return (
    <div>
      <SecHead icon="📋" title="Review Cash Out" />
      <div style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 14 }}>
        <FRow label="USDT to Convert" value={`${amount} USDT`} vColor={T.teal} />
        <FRow label="Rate" value={`₦${rate}/$1`} />
        <FRow label="Fee (0.8%)" value={`${fee} USDT`} vColor={T.amber} />
        <FRow label="NGN You Receive" value={`₦${parseInt(netNGN).toLocaleString()}`} vColor={T.green} />
        <FRow label="Bank" value="GTBank" />
        <FRow label="Account" value="0123456789" mono />
        <FRow label="Settlement" value="NIBSS NIP (<5 min)" vColor={T.teal} />
      </div>
      <Alert type="info" text="NIBSS NIP works 24/7 including weekends and public holidays. Funds typically arrive within 2-5 minutes." />
      <Btn label="Confirm — Cash Out to Bank" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); trackInteraction('offramp_completed', 7); setStep(2); }, 1000); }} disabled={loading} color={T.green} />
    </div>
  );

  return (
    <div>
      <SecHead icon="💵" title="Cash Out to Bank" />
      <div style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontSize: 10, color: T.dim, marginBottom: 2 }}>AVAILABLE BALANCE</div><div style={{ fontSize: 20, fontWeight: 800, color: T.teal }}>5.00 USDT</div></div>
        <Badge label="Instant Off-Ramp" color={T.green} />
      </div>
      <Field label="USDT Amount to Convert" value={amount} onChange={v => setAmount(v.replace(/[^0-9.]/g, ""))} placeholder="Enter USDT amount" />
      <div style={{ background: T.card, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <FRow label="You will receive" value={`₦${parseInt(netNGN).toLocaleString()}`} vColor={T.teal} />
        <FRow label="Fee (0.8%)" value={`${fee} USDT`} vColor={T.amber} />
        <FRow label="Net NGN" value={`₦${parseInt(netNGN).toLocaleString()}`} vColor={T.green} />
      </div>
      <Field label="Nigerian Bank Account" value="0123456789" readOnly />
      <Field label="Bank Name" value="GTBank" readOnly />
      <Btn label="Review Cash Out →" onClick={() => { trackInteraction('offramp_initiated', 7, undefined, { amount_usdt: amount }); setStep(1); }} disabled={!amount || parseFloat(amount) <= 0} />
    </div>
  );
}

// ── Phase 8: Transaction History ──────────────────────────────────────────────

function TxHistory({ next }: { next: () => void }) {
  const [filter, setFilter] = useState("All");
  const txns = [
    { type: "⬇ On-Ramp", desc: "Bought USDT via GTBank transfer", amount: "+50.00 USDT", sub: "₦83,250 debited", date: "Today, 09:14", status: "Confirmed", sColor: T.green, tag: "Off-chain", hash: null },
    { type: "📤 Transfer", desc: "Sent to DesignMaster Academy (E-commerce)", amount: "-50.00 USDT", sub: "TRC-20 · Tronscan", date: "Today, 09:22", status: "On-chain ✓", sColor: T.teal, tag: "On-chain", hash: "a4f2c9e7..." },
    { type: "💰 Received", desc: "Invoice from Pixel & Co. Agency (Freelance)", amount: "+200.00 USDT", sub: "ERC-20 · Etherscan", date: "Yesterday", status: "On-chain ✓", sColor: T.teal, tag: "On-chain", hash: "b7e3f1d0..." },
    { type: "⬆ Off-Ramp", desc: "Cash out to GTBank 0123456789", amount: "-45.00 USDT", sub: "₦74,440 via NIBSS NIP", date: "Today, 10:05", status: "Settled", sColor: T.green, tag: "Off-chain", hash: null },
  ];
  const filtered = filter === "All" ? txns : txns.filter(t => t.tag === filter);

  return (
    <div>
      <SecHead icon="📋" title="Transaction History" />
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["All", "On-chain", "Off-chain"].map(f => (
          <button key={f} onClick={() => { setFilter(f); if (f === 'On-chain') trackInteraction('history_filter_onchain', 8); else if (f === 'Off-chain') trackInteraction('history_filter_offchain', 8); }} style={{ background: filter === f ? T.teal + "22" : T.card, border: `1.5px solid ${filter === f ? T.teal : T.border}`, color: filter === f ? T.teal : T.dim, padding: "5px 11px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((tx, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{tx.type}</div>
                <div style={{ fontSize: 10, color: T.dim, marginTop: 1 }}>{tx.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: tx.amount.startsWith("+") ? T.green : T.txt }}>{tx.amount}</div>
                <div style={{ fontSize: 10, color: T.dim }}>{tx.sub}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: T.muted }}>{tx.date}</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {tx.hash && <span style={{ fontSize: 9, color: T.teal, fontFamily: '"Courier New", monospace' }}>{tx.hash}</span>}
                <Badge label={tx.status} color={tx.sColor} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}><Btn label="See the Final Comparison →" onClick={next} /></div>
    </div>
  );
}

// ── Phase 9: Compare ──────────────────────────────────────────────────────────

function Compare({ restart, phasesCompleted }: { restart: () => void; phasesCompleted: number }) {
  const [showLead, setShowLead] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadRole, setLeadRole] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadLinkedin, setLeadLinkedin] = useState("");
  const [consented, setConsented] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  useEffect(() => {
    trackSessionComplete(phasesCompleted, true);
  }, []);

  const submitLead = async () => {
    if (!leadEmail || !consented) return;
    setLeadLoading(true);
    await trackLead({
      email: leadEmail,
      full_name: leadName,
      role: leadRole,
      company: leadCompany,
      linkedin_url: leadLinkedin,
      phases_completed: phasesCompleted,
      consented_to_updates: consented,
      consent_text: "I agree to receive updates about RoyalPay and stablecoin payment infrastructure.",
    });
    setLeadLoading(false);
    setLeadSent(true);
  };

  const rows = [
    { label: "Speed", swift: "1-3 business days", stable: "~2 min (TRC-20)", win: true },
    { label: "Cost", swift: "$25-50 + 5-7% FX", stable: "~$1 flat fee", win: true },
    { label: "Availability", swift: "Mon-Fri, 9-5 only", stable: "24/7/365", win: true },
    { label: "Intermediaries", swift: "2-5 banks", stable: "Zero", win: true },
    { label: "Transparency", swift: "Opaque, proprietary", stable: "Public blockchain", win: true },
    { label: "Reversibility", swift: "Reversible (1-3d)", stable: "Irreversible — final", win: false },
    { label: "Regulation", swift: "Fully regulated", stable: "Rapidly regulated", win: false },
  ];
  return (
    <div>
      <SecHead icon="⚖️" title="SWIFT vs Stablecoin" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[{ l: "Faster", v: "1,000×", c: T.teal }, { l: "Cheaper", v: "~95%", c: T.green }, { l: "Available", v: "24/7", c: T.amber }, { l: "2025 Volume", v: "$33T", c: T.blue }].map((s, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 10, padding: "12px", textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.card, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.1fr", background: T.bg, padding: "8px 12px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.dim }}>METRIC</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.dim }}>SWIFT</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.teal }}>STABLECOIN</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.1fr", padding: "9px 12px", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none", background: i % 2 === 0 ? "transparent" : T.bg }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.txt }}>{r.label}</div>
            <div style={{ fontSize: 10, color: r.win ? T.dim : T.txt, textDecoration: r.win ? "line-through" : "none" }}>{r.swift}</div>
            <div style={{ fontSize: 10, color: r.win ? T.teal : T.txt, fontWeight: r.win ? 700 : 400 }}>{r.stable}</div>
          </div>
        ))}
      </div>
      <Alert type="ok" text="Regulation is converging: US GENIUS Act (2025), EU MiCA, Nigeria CBN VASP licensing. Stablecoins are now as regulated as banks — but without 50 years of legacy inefficiency." />

      {/* Lead Capture */}
      {leadSent ? (
        <div style={{ background: T.green + "15", border: `1px solid ${T.green}40`, borderRadius: 12, padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 4 }}>You're on the list</div>
          <div style={{ fontSize: 11, color: T.dim }}>We'll be in touch. Connect on LinkedIn too.</div>
        </div>
      ) : !showLead ? (
        <div style={{ background: T.card, borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginBottom: 4 }}>Stay in the loop</div>
          <div style={{ fontSize: 11, color: T.dim, marginBottom: 10 }}>Building in payments or stablecoins? Leave your details and we'll keep you updated.</div>
          <Btn label="Leave My Details →" onClick={() => setShowLead(true)} color={T.teal} />
        </div>
      ) : (
        <div style={{ background: T.card, borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: `1px solid ${T.teal}40` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginBottom: 12 }}>Your Details</div>
          <Field label="Email *" value={leadEmail} onChange={setLeadEmail} placeholder="you@company.com" type="email" />
          <Field label="Full Name" value={leadName} onChange={setLeadName} placeholder="Amaka Okonkwo" />
          <Field label="Role" value={leadRole} onChange={setLeadRole} placeholder="Product Manager, Engineer, Founder..." />
          <Field label="Company" value={leadCompany} onChange={setLeadCompany} placeholder="Flutterwave, GTBank..." />
          <Field label="LinkedIn URL" value={leadLinkedin} onChange={setLeadLinkedin} placeholder="linkedin.com/in/..." />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
            <input type="checkbox" id="consent" checked={consented} onChange={e => setConsented(e.target.checked)} style={{ marginTop: 2, accentColor: T.teal, flexShrink: 0 }} />
            <label htmlFor="consent" style={{ fontSize: 10, color: T.dim, lineHeight: 1.6, cursor: "pointer" }}>
              I agree to receive updates about RoyalPay and stablecoin payment infrastructure.
            </label>
          </div>
          <Btn label={leadLoading ? "Saving..." : "Submit"} onClick={submitLead} disabled={!leadEmail || !consented || leadLoading} color={T.teal} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn label="↺ Restart Simulation" onClick={restart} outline />
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

const PHASE_NAMES = [
  "welcome","signup","kyc","wallet_gen","buy_usdt",
  "use_case_selector","transfer","offramp","tx_history","swift_comparison",
];

export default function App() {
  const [phase, setPhase] = useState(0);
  const [useCase, setUseCase] = useState<typeof USE_CASES[0] | null>(null);

  useEffect(() => {
    trackSessionStart().then(() => trackPhase(0, PHASE_NAMES[0]));
  }, []);

  const next = () => setPhase(p => {
    const np = Math.min(p + 1, 9);
    trackPhase(np, PHASE_NAMES[np]);
    return np;
  });

  const restart = () => {
    trackInteraction('simulation_restarted', phase, undefined, { highest_phase_before_restart: phase });
    setPhase(0);
    setUseCase(null);
    trackPhase(0, PHASE_NAMES[0]);
  };

  const screens = [
    <Welcome next={next} />,
    <SignUp next={next} />,
    <KYC next={next} />,
    <WalletGen next={next} />,
    <BuyUSDT next={next} />,
    <UseCaseSelector next={next} setUseCase={setUseCase} />,
    <Transfer next={next} useCase={useCase} />,
    <OffRamp next={next} />,
    <TxHistory next={next} />,
    <Compare restart={restart} phasesCompleted={phase} />,
  ];

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", minHeight: "100vh",
      background: T.bg, color: T.txt,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      padding: 20, gap: 0, boxSizing: "border-box", alignItems: "flex-start",
    }}>
      {/* Phone */}
      <div style={{ width: 380, flexShrink: 0, display: "flex", justifyContent: "center", paddingRight: 8 }}>
        <PhoneFrame phase={phase} total={10}>{screens[phase]}</PhoneFrame>
      </div>
      {/* Infra Panel */}
      <div style={{ flex: 1, minWidth: 260, paddingTop: 4, overflowY: "auto" }}>
        <InfraPanel data={INFRA[phase]} />
      </div>
    </div>
  );
}
