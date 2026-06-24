<div align="center">

<br/>

# 🚗 AutoNidhi

### *The Finance Operations Platform Built for Vehicle Loan Companies That Were Still Running on WhatsApp and Excel*

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)

</div>

---

## The Problem We Set Out to Solve

Small and mid-sized vehicle loan (Nidhi) companies in India are a backbone of rural and semi-urban vehicle financing — yet most of them operate with an almost embarrassing gap between the scale of money they manage and the tools they use to manage it.

We've seen it firsthand:

- Loan files tracked in physical registers or scattered across WhatsApp groups
- Commission payouts calculated in Excel sheets, with no audit trail
- Staff manually cross-referencing customer documents with no visibility into what's missing or expired
- Insurance renewal reminders sent via sticky notes or memory alone
- Advance disbursements to dealers approved on "gut feel" — with zero historical pattern analysis
- Customers with zero visibility into their own loan status, having to call or visit in person just to get an update

The result? Missed insurance renewals, disputed commissions, lost paperwork, cash flow blind spots, and zero accountability between roles.

**AutoNidhi is the system we built to change that.**

---

## What We Built

AutoNidhi is a full-stack, role-based loan operations platform designed from the ground up for vehicle finance companies. It replaces every spreadsheet, every WhatsApp chain, and every paper register with a unified digital system — complete with a customer self-service portal, an AI-powered advance risk engine, and real-time financial dashboards.

---

## Core Capabilities

### 🧠 ML-Powered Advance Risk Scoring

The most unique piece of AutoNidhi is its built-in machine learning engine for advance approvals. Instead of a manager eyeballing a request and guessing, every advance disbursement request is run through a trained classifier that outputs one of three recommendations:

- ✅ **Likely Approved** — low risk, can proceed
- ⚠️ **Needs Manual Review** — borderline, escalate
- ❌ **High Risk / Likely Rejected** — significant overdue signals detected

The model is trained on real loan lifecycle data using an ensemble of four algorithms — **XGBoost**, **LightGBM**, **CatBoost**, and **Random Forest** — with the best-performing model selected at inference time. Feature engineering includes custom-built signals like:

| Engineered Feature | What It Captures |
|---|---|
| `risk_score` | Composite 0–10 score based on loan amount, EMI, overdue status, and recovery history |
| `loan_burden_score` | EMI as a fraction of total loan — how stretched is the customer? |
| `advance_ratio` | Advance amount relative to existing loan exposure |
| `overdue_severity` | Outstanding dues measured in EMI multiples |
| `recovery_percentage` | How much of previously advanced money has been returned |
| `customer_tenure_months` | How long the customer has been in the system |

This is not a black-box button. It's a model trained on the company's own data, producing transparent confidence scores and probability breakdowns per decision class.

---

### 📁 File & Loan Pipeline Management

Every vehicle finance transaction starts as a "file" — a customer's loan application moving through stages. AutoNidhi models this precisely:

**File Lifecycle:** `Draft → Login → Under Process → Sanctioned → Disbursed → Completed`

Each file is a container for:
- Customer identity (Aadhaar, PAN, DOB, type: Individual / Business)
- Finance details (LAN number, loan amount, EMI, tenure, IRR%, linked bank)
- Insurance details (policy number, validity dates, IDV, premium, type)
- All associated payments — in, out, RTO, commission, insurance
- Document checklist with review status per item
- Dealer / broker referral tracking

Files are assigned to staff consultants and give every role exactly what they need — no more, no less.

---

### 💰 End-to-End Financial Ledger

AutoNidhi tracks every rupee that moves through the business:

| Transaction Type | What It Covers |
|---|---|
| **Payment In** | Cash / cheque / UPI received from customers |
| **Payment Out** | Disbursements to customers, dealers, or brokers |
| **Commission In** | Commission received from banks / NBFCs |
| **Commission Out** | Commission paid to dealers and brokers |
| **RTO Payments** | Road Tax / RTO-related disbursements |
| **Insurance Payments** | Premium payments against policies, with expiry tracking |
| **Advances** | Advances given to dealers / brokers, with recovery tracking |
| **Expenses** | Categorized operational expense ledger |

Every transaction logs payment mode (cash, cheque, NEFT/IMPS), cheque details, UTR numbers, and which company bank account was used. Month-to-date financials and net position are computed in real time.

---

### 👥 Multi-Role Access Architecture

AutoNidhi is built around four distinct user roles, each with a dedicated portal:

#### 🔑 Admin
Full system access. Sees every file, customer, payment, and staff member. Manages master data (banks, insurance companies, dealers, brokers, expense categories). Reviews modification requests from accountants. Access to the analytics dashboard and review desk.

#### 📝 Staff (Data Entry / Consultant)
The frontline role. Creates and manages customers, creates loan files, records payments, commissions, and insurance. Each staff member sees only their own assigned files. Raises modification requests to change locked records. Gets a personalized dashboard showing their own pipeline and insurance expiry alerts.

#### 📊 Accountant
Financial operations role. Reviews and reconciles payments in/out, commissions, advances, expenses, and RTO payments. Raises modification requests for corrections. Has a dedicated modifications queue and financial summaries.

#### 🙋 Customer (Self-Service Portal)
Customers get their own login via the `/portal` routes. They can:
- View their active loan files and current status
- See their payment history
- View insurance policy details and renewal dates
- Track RTO payments
- Upload and view their KYC and transactional documents
- Submit service requests to their assigned consultant

---

### 📊 Analytics & Reporting Dashboard

The admin analytics page visualizes the business in real time:

- **Customer breakdown** — Individual vs. Business split (pie chart)
- **Acquisition trends** — New customer registrations over the last 6 months (bar)
- **Staff performance** — Customers created and files handled per staff member
- **File pipeline by status** — Distribution across all lifecycle stages
- **Payment trends** — Payment In vs. Payment Out per month over 6 months (line chart)
- **Modification request stats** — Pending, approved, and rejected counts

Charts are rendered with **Recharts** and update live on page load.

---

### 🔔 Notifications & Alerts

The system generates and delivers in-app notifications for critical events:
- Insurance policies expiring within 7 days — surfaced on the dashboard and in the notification panel
- Modification request status updates (submitted, approved, rejected)
- Document review outcomes
- Service request assignments

Every user role sees only notifications relevant to them, with unread counts tracked in the UI.

---

### ✅ Modification Request Workflow

Because financial data must be immutable once entered, AutoNidhi implements a structured change request workflow:

1. Staff / Accountant submits a modification request with reason
2. Admin reviews it on the **Review Desk** (`/admin/review-desk`)
3. Admin approves (with notes) or rejects (with reason)
4. Status progresses: `pending → verification → in_progress → approved / rejected`

This creates an auditable paper trail for every data correction — no silent edits.

---

### 📄 Document Management

Every customer has a document checklist split into:
- **KYC documents** — Aadhaar, PAN, photo, address proof
- **Transactional documents** — RC book, insurance copy, NOC, etc.

Staff can upload files against each document slot. Admins can mark documents as `verified`, `pending_review`, or `rejected` (with a rejection reason). Customers can view the status of their own documents from the portal.

---

### 🔐 Auth & Security

- JWT-based authentication with role-based route guards
- Passwords hashed with bcrypt
- `must_change_password` flag for admin-created accounts
- DB-backed password reset tokens (survives server restarts — no in-memory state)
- Soft delete on all critical entities (users, files, advances, dealers, brokers) — nothing is permanently destroyed

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| **React 19** | UI framework |
| **TypeScript 6** | Type-safe component development |
| **Vite 8** | Build tooling and dev server |
| **React Router v7** | Client-side routing with lazy-loaded pages |
| **Ant Design 5** | Component library (tables, forms, modals) |
| **Recharts** | Analytics charts |
| **Axios** | HTTP client |
| **jsPDF + jspdf-autotable** | PDF export |
| **XLSX / JSZip** | Excel export and ZIP downloads |
| **Lucide React** | Icon system |
| **Vanilla CSS** | Custom design system and theming |

### Backend

| Technology | Role |
|---|---|
| **FastAPI** | REST API framework |
| **SQLAlchemy 2** | ORM and database access |
| **PostgreSQL** | Primary database (UUID primary keys, JSONB) |
| **Pydantic v2** | Request / response validation |
| **PyJWT** | JWT token issuance and verification |
| **bcrypt** | Password hashing |
| **SMTP (email-validator)** | Email delivery for password reset |
| **python-multipart** | File upload handling |

### Machine Learning

| Technology | Role |
|---|---|
| **XGBoost** | Gradient boosted tree classifier |
| **LightGBM** | Fast gradient boosting framework |
| **CatBoost** | Categorical-aware gradient boosting |
| **scikit-learn (Random Forest)** | Ensemble baseline and preprocessing |
| **pandas** | Feature engineering and data pipeline |
| **joblib** | Model serialization / deserialization |
| **NumPy** | Numerical operations |

### Infrastructure

| Technology | Role |
|---|---|
| **Vercel** | Frontend deployment |
| **Render** | Backend API deployment |
| **Neon / Supabase (PostgreSQL)** | Managed database |
| **pnpm workspaces** | Monorepo package management |

---

## Roles at a Glance

```
AutoNidhi
│
├── /                     → Public landing page
├── /login, /signup       → Auth
│
├── /portal/*             → Customer self-service portal
│   ├── Dashboard, Files, Payments, Insurance, Loans, RTO, Documents
│
├── /dashboard            → Admin (full access)
│   ├── Customers, Files, Payments In/Out
│   ├── Commissions In/Out, RTO, Insurance, Expenses, Advances, Loans
│   ├── Masters (Banks, Dealers, Brokers, Insurance Companies/Types)
│   ├── Settings (Company, Bank Accounts, Users, Staff, Accountants)
│   ├── Review Desk, Analytics
│
├── /staff/*              → Staff / Data Entry portal
│   ├── Customers, Files, Payments, Commissions, RTO, Insurance
│   ├── Expenses, Requests, Modifications
│
└── /accountant/*         → Accountant portal
    ├── Files, Payments In/Out, Commissions In/Out
    ├── RTO, Insurance, Expenses, Advances, Modifications
```

---

## What Makes This Different

Most "loan management software" in the Indian SME space is either:
- A bloated ERP designed for banks (overkill, expensive, requires training)
- A glorified Excel macro (no audit trail, no multi-role, no customer visibility)

AutoNidhi is neither. It was designed specifically for the **Nidhi company / vehicle loan DSA** model — with the exact roles, workflows, and transaction types that actually exist in that business. Every feature was driven by a real operational pain point, not a feature checklist.

The ML risk engine in particular is something no off-the-shelf software in this segment offers. It turns historical loan recovery data into a real-time advisory signal — reducing the cognitive load on managers and creating a defensible, data-driven advance approval process.

---

## Team

Built by a team that understands both the domain and the technology — combining hands-on experience with vehicle finance operations and modern full-stack + ML engineering.

---

<div align="center">
<br/>
<em>AutoNidhi — Because every rupee deserves a paper trail.</em>
<br/><br/>
</div>
