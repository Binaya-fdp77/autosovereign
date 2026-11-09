<div align="center">

# 🛡️ AutoSovereign
### Autonomous AI Escrow & Contingency Platform with PayPal REST API, Deterministic Safety Guards, and Cryptographic Settlement Certificates

[![Next.js 16](https://img.shields.io/badge/Next.js_16-Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PayPal REST API](https://img.shields.io/badge/PayPal_Sandbox-REST_API-00457C?style=for-the-badge&logo=paypal)](https://developer.paypal.com/)
[![Prisma & PostgreSQL](https://img.shields.io/badge/Prisma-PostgreSQL-2C3E50?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

*Built for the **PayPal AI Hackathon 2026**.*

</div>

---

## 🚀 Overview

**AutoSovereign** is an enterprise-grade autonomous micro-escrow and contingency platform where AI agents negotiate contracts, escrow funds via the PayPal REST API, execute code audits via Git commits, run a Multi-Agent Consensus Jury for disputes, and trigger cryptographic payout waterfalls without human bottlenecks.

Most AI payment projects let autonomous models move money directly—introducing catastrophic hallucination risks. AutoSovereign solves this with a **Zero-Trust Safety Architecture** separating AI reasoning from deterministic financial execution.

---

## 🏆 Key Hackathon-Winning Patterns

1. **Deterministic Escrow Guard & Safety Layer**
   - AI agents analyze natural language prompts and code, but money movements never touch raw AI text. All payouts pass through a strict, boolean-verified `EscrowDeterministicGuard` class before any PayPal API is invoked.
2. **Idempotency & Double-Click Protection**
   - Integrates PayPal v4 `PayPal-Request-Id` headers to guarantee 100% protection against duplicate transactions during network timeouts or retries.
3. **Cryptographic Settlement Certificates (SHA-256)**
   - Binds GitHub commit SHAs, milestones, AG Grid telemetry logs, and PayPal Batch IDs into an unforgeable SHA-256 cryptographic signature with print-to-PDF support.
4. **Automated Dispute Refund Vault**
   - When a dispute arises, a 3-agent Consensus Jury (`AI_CODE_AUDITOR`, `AI_FINANCIAL_RISK`, `AI_COMPLIANCE`) evaluates the evidence. If the verdict favors the buyer (`FAVOR_BUYER`), an automated PayPal refund vault triggers instantly.
5. **Real-Time Swarm Observability**
   - Live latency monitor (`ms`), success rate tracking (`99.4%`), active LLM token counters, and D3/AG Grid financial telemetry.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend & App Router:** Next.js 16 (Turbopack), React 19, Tailwind CSS.
- **Backend & Database:** Next.js API Routes, Prisma ORM, PostgreSQL / SQLite.
- **Payment Gateway:** PayPal REST SDK (Sandbox environment (`https://api-m.sandbox.paypal.com`)).
- **AI & Swarm Engine:** Vercel AI SDK, GPT-4o Multi-Agent Architecture.
- **Partner Tools & Observability:** AG Grid financial telemetry tables, Render deployment-ready structure.

---

## ⚙️ Quick Start & Installation Instructions

Follow these steps to run AutoSovereign locally for evaluation:

### 1. Clone the Repository
```bash
git clone [https://github.com/Binaya-fdp77/autosovereign.git](https://github.com/your-username/autosovereign.git)
cd autosovereign