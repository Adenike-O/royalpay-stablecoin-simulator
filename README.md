# royalpay-stablecoin-simulator
> **A fully interactive, browser-based prototype simulating the end-to-end flow of a stablecoin payment — from KYC onboarding to NIBSS settlement.**
> Built to bridge the understanding gap between traditional finance operators and modern blockchain payment infrastructure.
## Why This Exists

Stablecoins processed **$33 trillion in volume in 2025** — surpassing Visa and Mastercard combined. Yet a majority of fintech professionals, banking operators, and payments product teams still struggle to concretely explain how a stablecoin moves from a customer's wallet to a supplier's bank account.

This gap isn't about intelligence. It's about **experience**. People understand things they can feel and interact with, not things they read about.

**RoyalPay closes that gap.** It is an interactive product prototype designed to give any finance or tech professional a hands-on, end-to-end experience of the stablecoin lifecycle — in under 10 minutes, with no wallet, no real money, and no blockchain knowledge required.

### The Problem I Set Out to Solve

| The Old Way | The RoyalPay Way |
|---|---|
| Read a whitepaper about stablecoins | Click through a simulated real app |
| Watch a YouTube explainer | Make decisions at each step yourself |
| Attend a workshop | Experience address validation errors firsthand |
| Ask an engineer | See the invisible infrastructure explained in real time |

---

## Target Users

This prototype was designed for:

- **Fintech Product Managers** exploring stablecoin payment features for their roadmap
- **Payments & Treasury Professionals** evaluating stablecoin rails vs SWIFT for cross-border settlement
- **Banking & Finance Operators** in emerging markets (especially Nigeria/Africa) onboarding to Web3
- **Technical Recruiters & Hiring Managers** evaluating a candidate's domain depth in payments infrastructure
- **Founders & CTOs** at African fintech startups assessing whether to integrate USDT rails
---

## What the Simulator Covers — All 9 Phases

Each phase simulates a real app screen **and** reveals the invisible infrastructure layer running underneath it.

```
Phase 0 → Welcome & Orientation
Phase 1 → Web Sign-Up (Registration, OTP, JWT session token)
Phase 2 → KYC Onboarding (BVN, ID Upload, Liveness Check, Sanctions Screening)
Phase 3 → Wallet Generation (Custodial vs Non-Custodial, Multi-network addresses)
Phase 4 → Fiat On-Ramp (Buy USDT with NGN via virtual bank account + webhook)
Phase 5 → Use Case Hub — 5 Real Scenarios (see below)
Phase 6 → Cross-Border Transfer (Network rail selection, address validation, gas fees, TxHash)
Phase 7 → Off-Ramp & Settlement (USDT → NGN → NIBSS NIP to bank account)
Phase 8 → Transaction History (On-chain vs off-chain audit trail, filter by type)
Phase 9 → SWIFT vs Stablecoin Comparison (Final verdict, side-by-side)
```

### Phase 5: The 5 Use Cases (Why This Matters in Africa)

The same USDT infrastructure — five completely different real-world payment stories:

| # | Use Case | Scenario | Amount |
|---|---|---|---|
| 🛒 | **E-commerce** | Amaka's Nigerian debit card keeps getting declined buying a US Figma course | $50 |
| 💼 | **Freelancer Invoice** | London agency pays Nigerian freelancer — SWIFT would take 5 days and deduct $45 | $200 |
| 🏭 | **B2B Supplier Payment** | Fashion label pays Ghanaian fabric supplier before tomorrow's shipment deadline | $500 |
| ❤️ | **Family Remittance** | UK-based cousin sends Mum money in Ibadan — no Western Union queues, no 7% cut | $100 |
| 🤝 | **P2P Bill Split** | Splitting coworking space fees when Nigerian bank transfers are down for maintenance | $25 |

---

## Product Architecture & Technical Decisions

### Key Product Decisions Made

**1. Custodial wallet model** — Chose custodial (platform-managed keys) over non-custodial for the simulation because 95% of consumer-facing fintech apps (Quidax, Binance, RoyalPay) use custodial wallets. It mirrors the real user experience for the target audience.

**2. TRC-20 as the primary rail** — TRON is the dominant stablecoin network in Africa by transaction volume due to its ~$1 flat fee vs Ethereum's $3-25 variable gas fee. The prototype defaults to recommending TRON for transfers under $10,000 — matching how Quidax and Yellow Card actually route transactions.

**3. Wrong-network address simulation** — Deliberately included the ability to paste a wrong-network address (e.g. an ERC-20 address into a TRON transfer) and see the live validation error. This single feature teaches more about blockchain risk than any explainer article. It was a core product requirement, not a nice-to-have.

**4. Dual-panel layout (App + Infrastructure)** — Every app screen is paired with a real-time explanation of what's happening invisibly underneath (webhooks, HSMs, NIBSS, sanctions screening). This is the simulator's core value proposition: the left panel shows what users see, the right panel shows what engineers build.

**5. NIBSS NIP for off-ramp** — Chose NIBSS Instant Payment specifically (not just "bank transfer") to ground the off-ramp in Nigerian payment infrastructure reality. This is the actual mechanism platforms like Busha and Quidax use today.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (JSX) |
| Styling | Inline CSS with design tokens |
| State Management | React useState (local component state) |
| Blockchain Reference | TRON (TRC-20), Ethereum (ERC-20), Solana (SPL) |
| Payment Rail Reference | NIBSS NIP, Paystack Virtual Accounts, Flutterwave |
| KYC Reference | SmileID, MetaMap |
| Hosting | Replit |
| AI Tooling | Claude by Anthropic (see AI Transparency section) |

---

## Running This Locally

```bash
# Clone the repo
git clone https://github.com/Adenike-O/royalpay-stablecoin-simulator.git
cd royalpay-stablecoin-simulator

# Install dependencies
npm install

# Run the development server
npm start
```

The app runs on `http://localhost:3000`

### Replit (Recommended for Demo)

1. Fork this repo into your Replit account
2. Replit auto-detects the React config
3. Click **Run** — your live URL is instantly shareable
---

## AI Transparency — How Claude Was Used

I believe in transparent AI collaboration. Here's exactly how this was built:

**My role (Product Direction):**
- Identified the market education gap and defined the core problem statement
- Researched the competitive landscape (Quidax, Binance, Yellow Card, Kora)
- Wrote the product requirements: all 9 phases, all 5 use cases, the dual-panel concept
- Made every key product decision (custodial model, TRC-20 default, NIBSS specificity, wrong-address simulation)
- Directed the information architecture: what each phase teaches, in what order, and why
- Reviewed, tested, and iterated on every screen
**Claude's role (Technical Execution):**
- Translated the product requirements into working React code
- Structured the infrastructure panel content based on my domain direction
- Implemented the UI components and state management
**The important distinction:** The product thinking is mine. The code is AI-assisted. This is exactly how modern Technical Product Managers work in 2025 — and being able to direct AI to build a working prototype from a product spec is itself a core competency.

---

## Domain Expertise: The Infrastructure Behind the Simulator

If you're a hiring manager reading this, here's what this project demonstrates I understand at depth:

### Nigerian Payment Infrastructure
- **NIBSS NIP** — Nigeria Inter-Bank Settlement System Instant Payment. The actual rail used for real-time interbank transfers, operating 24/7/365.
- **BVN/NIN Verification** — Bank Verification Number linked to CBN/NIBSS API for real-time identity confirmation
- **Virtual Account Issuance** — How Paystack and Flutterwave issue unique NGN virtual accounts per transaction for on-ramp flows
- **Tiered KYC Limits** — CBN's regulatory framework: Tier 1 = ₦500k/day, Tier 2 = ₦2M/day, Tier 3 = Unlimited
### Stablecoin Infrastructure
- **TRC-20 vs ERC-20** — Network selection tradeoffs: speed, fee structure, confirmation time, institutional preference
- **Custodial Key Management** — Hardware Security Module (HSM) architecture for enterprise key custody
- **Liquidity Pool Management** — How platforms like Quidax maintain internal USDT pools vs going to external exchanges per transaction
- **Transaction Signing & Broadcasting** — The signing lifecycle from instruction to block confirmation
- **Tether Freeze Capability** — OFAC compliance mechanism and the $1.5B+ frozen in 2024-25
### Compliance & Regulatory Framework
- **KYC/AML Stack** — SmileID/MetaMap for document OCR, liveness detection, biometric matching
- **Sanctions Screening** — OFAC, UN Security Council, EU, UK HMT simultaneous screening
- **VASP Licensing** — Nigeria SEC's Virtual Asset Service Provider regulatory framework
- **US GENIUS Act (2025)** — First comprehensive US stablecoin legal framework
- **EU MiCA** — Markets in Crypto-Assets regulation fully in effect
---

## 📈 The Business Case This Prototype Makes

**For any fintech hiring manager**, this project is evidence that I can:

1. **Identify a product opportunity** from a market education gap (not just build features)
2. **Define clear user personas** and design for their specific context (Nigerian freelancers, African B2B payments)
3. **Make opinionated product decisions** backed by real data and domain knowledge
4. **Think in systems** — not just UI, but webhooks, liquidity pools, settlement rails, compliance layers
5. **Ship a working product** from idea to live URL
6. **Communicate technical concepts** to non-technical audiences — the core job of a Technical PM
---

## 🔮 Roadmap (If Extended to a Full Product)

- [ ] Add Solana SPL transfer simulation (under 1 second confirmation)
- [ ] Multi-currency off-ramp: GHS (Ghana), KES (Kenya), ZAR (South Africa)
- [ ] Business account flow: API key generation, webhook configuration
- [ ] Smart contract interaction: simulate a DeFi yield deposit on stablecoins
- [ ] Regulatory comparison mode: Nigeria CBN vs EU MiCA vs US GENIUS Act side-by-side
---

##  About the Author

**Adenike Olatunbosun** — Technical Product Manager | Fintech & Payments | Web3 Infrastructure

I build at the intersection of financial infrastructure, product strategy, and emerging technology. My focus is on payment systems in emerging markets — specifically how stablecoin rails can reduce the cost and friction of cross-border payments in Africa.

- 🔗 [LinkedIn](https://www.linkedin.com/in/adenike-olatunbosun-27b384237)
- 🐦 [Twitter/X](https://twitter.com/adenike_techmom)
- 📧 adenikedosunmu21@gmail.com
---

## License

MIT License — feel free to fork, adapt, and build on this for educational purposes.

---

*Built with product thinking, domain research, and AI-assisted development. The infrastructure knowledge is real. The USDT is not.*
