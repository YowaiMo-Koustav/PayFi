# 💸 Subscription Saver Agent (PayWithLocus Hackathon)

An autonomous AI agent that **detects overcharges, negotiates bills, and recovers money for you** — while you sleep.

Built for **Paygentic Week 1 (PayWithLocus)** — where agents don’t just analyze finances… they **act on them**.

## 🚀 Problem

People lose money every month due to:

* Forgotten subscriptions
* Silent price hikes
* Missed downgrade/refund opportunities
* Lack of time to negotiate bills

Most finance apps only **track spending** — they don’t **recover money**.

## 💡 Solution

**Subscription Saver Agent** automatically:

1. Ingests bills (CSV/PDF/manual input)
2. Detects recurring charges & overcharges
3. Generates cancellation/refund emails
4. Escalates complex cases to human taskers
5. Sends recovered money back to the user

**Result:** Real, measurable savings

## ⚡ Key Features

* **Smart Detection Engine**

  * Finds recurring subscriptions
  * Flags price increases & anomalies

* **Auto Negotiation**

  * Generates refund/cancellation emails using AI

* **Human-in-the-loop Tasks**

  * Uses Locus Tasks for complex disputes

* **Automated Payouts**

  * Sends recovered funds via USDC (wallet/email)

* **Live Dashboard**

  * Money recovered
  * Monthly savings
  * Agent spend
  * Net profit

## 🧩 Built with PayWithLocus

This project integrates key PayWithLocus primitives:

* Unified USDC Wallet
* Wrapped APIs (AI, scraping, email)
* Task Marketplace (human-in-the-loop)
* Spending Controls & Audit Logs
* USDC Transfers (wallet/email)

## 🏗️ Architecture

Frontend (Next.js + Tailwind)
↓
Backend (Node.js + TypeScript)
↓
Agent Layer (LLM + Rule Engine)
↓
PayWithLocus API
├── Wrapped APIs (AI, email)
├── Tasks (human escalation)
└── Wallet (USDC transfers)

## 🔄 How It Works

Upload Bills → Detect Subscriptions → Flag Overcharges
↓
Generate Refund Email → (Optional) Human Task
↓
Confirm Savings → Send Payout → Update Dashboard

## 📸 Demo Flow

1. Upload a sample bill
2. Agent detects a price increase
3. Generates refund email
4. Escalates one case (optional)
5. Shows recovered money in dashboard
6. Sends payout via Locus

## ⚙️ Setup & Run

Clone repo
Install dependencies
Run dev server

Create a `.env` file:

```env
LOCUS_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_NAME=SubscriptionSaver
```

## 🧪 MVP Scope (Hackathon)

* CSV upload
* Recurring charge detection
* AI-generated emails
* One Locus API integration
* One payout flow
* Full bank integration
* Production-grade security

## 🏆 Why This Can Win

* Directly **makes users money**
* Deep integration with Locus primitives
* Clear, demo-friendly ROI
* Fully functional (not just a pitch)

## 📈 Future Improvements

* Bank API integration
* Auto email sending & tracking
* Subscription cancellation automation
* Multi-currency support
* Personal finance insights

## ❤️ Acknowledgements

* PayWithLocus Team
* Paygentic Hackathon
* Open-source AI ecosystem

