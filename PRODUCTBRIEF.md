# Product Requirements Document (PRD)
## RoyalPay — Stablecoin Lifecycle Simulator
**Version:** 1.0  
**Status:** Shipped  
**Author:** Adenike Olatunbosun, Technical Product Manager  
**Date:** May 2025

---

## 1. Executive Summary

### Problem Statement
There is a significant knowledge gap between traditional finance professionals and the Web3 payment infrastructure they are increasingly expected to work with, integrate, or make decisions about. Whitepapers and explainer videos don't close this gap. Hands-on experience does.

### Solution
An interactive browser-based prototype that simulates the complete stablecoin payment lifecycle, giving fintech professionals, payments operators, and technical teams a lived experience of how stablecoins actually move from a customer's bank account to a recipient's bank account across borders.

### Success Metric (Primary)
A fintech professional who completes the full simulation can accurately explain: what happens when a Nigerian user buys USDT with Naira, how a TRC-20 transfer differs from an ERC-20 transfer, what NIBSS NIP is and why it's used for off-ramp settlement, and why sending to the wrong network address results in permanent fund loss.

---

## 2. The Market Context

### Why Now (May 2025)
- Stablecoins processed **$33T in settlement volume in 2025**, surpassing Visa + Mastercard combined
- **US GENIUS Act** (July 2025) creates the first comprehensive federal stablecoin regulatory framework
- **EU MiCA** is fully in effect — European financial institutions now have a clear compliance pathway
- **Nigeria SEC VASP licensing** is active — Nigerian fintech startups are now required to comply
- Nigeria leads Africa in stablecoin volume — **70%+ of Nigerian crypto volume is USDT/USDC**
- **Yellow Card, Quidax, Busha, Kora** are all aggressively hiring product managers who understand both traditional payment rails and stablecoin infrastructure

### The Education Gap
Most fintech professionals can explain M-Pesa, NIBSS, or SWIFT. Very few can explain:
- What happens between a Naira bank transfer and USDT appearing in a wallet
- Why TRC-20 is the dominant stablecoin network in Africa (cost, not features)
- What a custodial wallet actually means at the infrastructure level
- How NIBSS NIP connects to crypto off-ramp settlement

This prototype addresses all four.

---

## 3. User Personas

### Primary Persona: The Payments PM
- **Name:** Tunde, 31, Lagos
- **Role:** Product Manager at a Nigerian fintech startup exploring stablecoin integration
- **Blocker:** Can explain NIBSS and card processing in depth. Cannot explain to his engineering team exactly what a webhook trigger for USDT credit looks like or why they should use TRC-20 vs ERC-20.
- **Job to be Done:** "Help me understand stablecoin infrastructure deeply enough to write a credible PRD for integrating USDT payments into our product."

### Secondary Persona: The Treasury Analyst
- **Name:** Sade, 28, London (Nigerian diaspora)
- **Role:** Treasury operations at a UK-based remittance company
- **Blocker:** Her company is evaluating replacing Western Union rails with stablecoin infrastructure. She needs to understand the settlement finality and compliance layer to present to her CFO.
- **Job to be Done:** "Show me exactly how stablecoin settlement compares to SWIFT and NIBSS in terms of speed, cost, and reversibility."

### Tertiary Persona: The Fintech Recruiter/Hiring Manager
- **Name:** Mark, 42, San Francisco
- **Role:** Head of Product at a global payments company evaluating candidates for a "Stablecoin Product Lead" role
- **Blocker:** Candidates claim Web3 expertise but struggle to explain infrastructure specifics in interviews.
- **Job to be Done:** "Show me a candidate who actually understands how this works at the system level, not just the marketing level."

---

## 4. Product Requirements

### Must Have (V1.0 — Shipped)

| # | Requirement | Rationale |
|---|---|---|
| R1 | Complete 9-phase simulation with no dead ends | Users must be able to experience the full lifecycle without friction |
| R2 | Dual-panel layout: app screen + infrastructure explanation | Core value prop — the invisible layer is what professionals need to understand |
| R3 | KYC with tiered verification (BVN + ID + liveness + address) | Nigeria-specific compliance context is essential for the target market |
| R4 | Custodial wallet generation across 3 networks (TRON, ETH, Solana) | Multi-network reality of production apps like Quidax |
| R5 | Fiat on-ramp with virtual account + rate lock simulation | Mirrors the actual Paystack/Flutterwave integration pattern |
| R6 | 5 distinct use cases with individual stories and context | Same infrastructure, different use cases — teaches generalizability |
| R7 | Network rail selector (TRC-20 vs ERC-20) with real fee/time data | The most consequential decision in a stablecoin transfer |
| R8 | Wrong-network address validation error simulation | Teaches the #1 user risk in stablecoin transfers |
| R9 | Countdown timer for block confirmation (120s TRON, 900s ETH) | Makes abstract "confirmation time" tangible and felt |
| R10 | NIBSS NIP off-ramp with NGN credit simulation | Nigeria-specific, accurate — not generic "bank transfer" |
| R11 | Filterable transaction history (on-chain vs off-chain) | Teaches the difference between blockchain and ledger records |
| R12 | SWIFT vs Stablecoin comparison table | The "so what" that every finance professional needs to walk away with |

### Should Have (V1.1 — Backlog)
- Multi-country off-ramp: GHS, KES, ZAR with local payment rail references
- Solana SPL transfer with sub-1-second confirmation simulation
- Business/merchant account type with API key generation demo
- Mobile-responsive layout optimized for phone screens

### Won't Have (V1.0)
- Real blockchain connectivity (this is a simulator, not a wallet)
- User accounts or persistent state (no database needed)
- Multiple languages (English only for V1)

---

## 5. Key Product Decisions & Rationale

### Decision 1: Custodial-only model
**Decision:** The simulator only shows custodial wallets (platform-managed keys).  
**Rationale:** 95%+ of consumer fintech apps targeting non-technical users use custodial wallets. Non-custodial is important but would confuse the primary audience at this stage. A future "advanced mode" could include it.  
**Tradeoff:** Doesn't teach seed phrase management — acceptable for V1 target audience.

### Decision 2: TRC-20 as the recommended default
**Decision:** The simulator defaults to recommending TRON (TRC-20) for transfers.  
**Rationale:** TRON handles approximately 60%+ of USDT stablecoin transfer volume globally, primarily due to its ~$1 flat fee vs Ethereum's $3-25 variable gas. In Africa specifically, every major platform (Quidax, Yellow Card, Busha) defaults to TRC-20 for retail transfers.  
**Tradeoff:** ERC-20 is the more technically prestigious network and better for large institutional amounts, but optimizing for the Nigerian retail/SMB use case is correct for this audience.

### Decision 3: Wrong-address error is a core feature, not an edge case
**Decision:** Built two buttons on the transfer screen: "Correct Address" and "Wrong Network" — deliberately letting users simulate the error.  
**Rationale:** The most dangerous and irreversible mistake in a stablecoin transfer is sending to the wrong network. Having users experience the validation error (and the warning message) teaches this more effectively than any paragraph of text could. This is a product education decision, not just a UX feature.

### Decision 4: NIBSS NIP by name, not just "bank transfer"
**Decision:** The off-ramp screen specifically references NIBSS NIP, not a generic "bank transfer."  
**Rationale:** The target audience includes Nigerian fintech professionals who know what NIBSS NIP is. Using the precise term signals domain expertise and grounds the simulation in operational reality. The infrastructure panel explains exactly how NIBSS connects to the crypto off-ramp for users who don't already know.

### Decision 5: Transparency about AI-assisted development
**Decision:** The README explicitly states that Claude (Anthropic) was used for code generation, under clear product direction.  
**Rationale:** AI transparency is a professional signal, not a liability. In 2025, the ability to direct AI tools to execute on a product spec is itself a core Technical PM competency. Hiding this would be dishonest. Framing it correctly is a competitive advantage.

---

## 6. Infrastructure Architecture (Documented for Technical Reviewers)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (BROWSER)                            │
│                    royalpay.app (Replit)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼────┐     ┌─────▼────┐
    │  KYC    │      │  FIAT    │     │ BLOCKCHAIN│
    │  Stack  │      │  RAILS   │     │  LAYER   │
    │         │      │          │     │          │
    │SmileID  │      │Paystack  │     │TRON/TRC20│
    │MetaMap  │      │Virtual   │     │ETH/ERC20 │
    │BVN/NIBSS│      │Accounts  │     │Solana/SPL│
    │OFAC     │      │Webhook   │     │          │
    └─────────┘      │Triggers  │     └────┬─────┘
                     └──────────┘          │
                                     ┌─────▼──────┐
                                     │ OFF-RAMP   │
                                     │ SETTLEMENT │
                                     │            │
                                     │ NIBSS NIP  │
                                     │ GTBank etc │
                                     └────────────┘
```

### Key Infrastructure Facts (Verified)
- **Block time TRON:** 3 seconds | **Confirmation:** ~19 Super Representatives | **Total time:** ~2 min
- **Block time Ethereum PoS:** ~12 seconds | **Total confirmation:** 12-15 min
- **TRC-20 gas fee:** $0.80 - $2.00 flat | **ERC-20 gas fee:** $3 - $25 (variable, congestion-dependent)
- **NIBSS NIP SLA:** < 5 minutes | **Availability:** 24/7/365 | **Fee:** ₦50 flat
- **SWIFT wire:** 1-3 business days | **Correspondent banks:** 2-5 | **Fee:** $25-50 + 5-7% FX spread
- **Tether freeze capability:** Active — $1.5B+ frozen across 2,000+ addresses in 2024-25

---

## 7. Metrics for Success

Since this is an educational prototype (not a revenue product), success is measured differently:

| Metric | Definition | Target |
|---|---|---|
| Completion Rate | % of users who reach Phase 9 | >60% |
| Use Case Diversity | % who try more than 1 use case | >30% |
| Wrong-Network Click | % who click "Wrong Network" button | >50% (desired — it's the lesson) |
| Demo Link Shares | Times the Replit URL is shared | Qualitative tracking via recruiter feedback |
| Portfolio Signal | Interview invitations citing this project | Primary career impact metric |

---

## 8. Competitive Landscape Reference

| Platform | Region | What They Do Well | What This Simulator Adds |
|---|---|---|---|
| Quidax | Nigeria | Best-in-class Nigerian UX, Naira on/off ramp | Explains the infrastructure behind the UI |
| Yellow Card | Pan-Africa | Multi-country, B2B API, wide network | Shows all 5 use cases in one flow |
| Binance | Global | Deepest liquidity, full feature set | Explains NIBSS, Nigerian-specific context |
| Kora | Nigeria/Global | Payment orchestration, fintech API | Makes abstract orchestration tangible |
| Busha | Nigeria | Clean UX, strong compliance posture | Explains the compliance stack end-to-end |

---

*This PRD documents the thinking behind RoyalPay v1.0. It is presented as part of a Technical Product Manager portfolio to demonstrate product strategy, domain expertise, and the ability to translate market insight into a shipped product.*