# 🛡️ AutoSovereign

AutoSovereign is an enterprise-grade autonomous micro-escrow and contingency platform designed for AI agent transactions and modern freelance engineering workflows.

## 🚀 Key Features

- **Dual-Agent AI Handshake**: Autonomous negotiation engine where buyer and seller agents agree on scope, valuation, and milestone breakdowns.
- **PayPal v2 Checkout Integration**: Automated order creation, capture intent routing, and webhook verification via PayPal REST SDK.
- **Real-Time Financial Telemetry**: High-performance **AG Grid** data table tracking contract IDs, locked amounts, 5% platform fees, and net payouts.
- **Milestone Execution Timeline**: Live status tracking across project phases (`PENDING`, `FUNDED`, `RELEASED`).
- **Server-Sent Events (SSE)**: Instantaneous, zero-polling UI updates driven by backend webhook state changes.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) with Turbopack
- **UI & Data Grids**: AG Grid Community (`ag-grid-react`), Tailwind CSS
- **Database & ORM**: SQLite with Prisma
- **Payment Gateway**: PayPal REST API (v2 Orders & Webhooks)
- **Real-Time Architecture**: Native EventSource (SSE) streaming hub

---

## ⚙️ Getting Started Locally

### 1. Clone & Install Dependencies
\`\`\`bash
git clone https://github.com/your-username/autosovereign.git
cd autosovereign
npm install
\`\`\`

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
\`\`\`env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_SANDBOX=true
DATABASE_URL="file:./dev.db"
\`\`\`

### 3. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the live telemetry dashboard.

---

## 🧪 Running E2E Simulations
Test the entire agent handshake, PayPal escrow locking, and webhook event stream directly from your terminal or via the **⚡ Run Full E2E Simulation** button on the dashboard UI:
\`\`\`powershell
npx ts-node scripts/simulate-e2e.ts
\`\`\`