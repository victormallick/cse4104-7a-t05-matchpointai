# MatchPoint AI 🎯

> **AI-Powered ATS Resume Analyzer, Tailored Interview Preparation & Real-Time Career Intelligence Platform**  
> Official Project: **CSE4104-7A-T05**

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-black?style=for-the-badge&logo=vercel)](https://matchpointai.vercel.app)
[![API Server](https://img.shields.io/badge/API%20Server-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://matchpointai.onrender.com)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-Playwright%20100%25%20Passing-emerald?style=for-the-badge&logo=playwright)](https://playwright.dev)
[![Security Audit](https://img.shields.io/badge/Security-Hardened%20%26%20Audited-blue?style=for-the-badge&logo=shield)](https://matchpointai.vercel.app)

---

## 🌐 Live Deployments

* 🚀 **Web Application**: [https://matchpointai.vercel.app](https://matchpointai.vercel.app)
* ⚡ **Production Backend**: [https://matchpointai.onrender.com](https://matchpointai.onrender.com)
* 🩺 **API Health Check**: [https://matchpointai.onrender.com/api/health](https://matchpointai.onrender.com/api/health)
* 🤖 **Service Availability**: Monitored 24/7 with zero cold-start delay via UptimeRobot

---

## 👥 Project Team (T05)

| Member | Student ID | Role |
| :--- | :--- | :--- |
| **Junnatul Farhana** | 11230121088 | Team Leader |
| **Farhana Azgar Orin** | 11230121070 | Frontend / UI & UX Design |
| **Victor Mallick** | 11210320676 | Backend & Full-Stack Development |
| **Easin Mohammad Rayhan** | 11220120789 | Database & AI Integration |

---

## ✨ Key Features & Capabilities

### 1. 📄 Multi-Format Resume Parser & Guardrails
* **In-Memory Streaming**: High-fidelity text extraction for **PDF** (`pdfjs-dist`) and **DOCX** (`mammoth`) without disk traversal risks.
* **Non-Resume Content Guardrail**: Identifies non-resume uploads (recipes, research papers, essays, invoices) and safely displays a clear warning card with a 0% ATS score.

### 2. 🎯 Dynamic ATS Scoring & Target Role Calibration
* **Radial ATS Target Gauge**: Real-time HUD scoring (*Top 5% Applicant, Strong Match, Needs Review*).
* **Target Role Versatility**: Prominently guides candidates on how their target job title dynamically calibrates the ATS evaluation, interview questions, and live job searches.
* **Skill & Keyword Gap Matrix**: Side-by-side comparison between candidate competencies and industry requirements.
* **Interactive Google XYZ / STAR Rewriter**: High-impact bullet point rewrites with 1-click clipboard copying.
* **Official Certified PDF Export**: 1-click export of an official ATS Assessment report featuring a unique Verification ID, audit timestamp, competency matrix, and MatchPoint AI certification seal.

### 3. 🎙️ Role-Calibrated AI Mock Interview Simulator
* **Deep Domain Taxonomies**: Dedicated question synthesis across **AI / Machine Learning & Python**, **Marketing & Growth**, **HR & Talent**, **Finance & Accounting**, **Product Design (UI/UX)**, and **Software Engineering**.
* **3 Specialized Question Categories**:
  - 💻 **Technical Scenarios**: Architecture trade-offs, system scalability, and focus skills directly addressing the candidate's ATS gaps.
  - ⭐ **Behavioral & STAR**: Workplace challenges, crisis mitigation, and leadership scenarios structured around Situation, Task, Action, and Result.
  - 🤝 **Recruiter & HR**: Career trajectory, cultural alignment, 30-60-90 day impact roadmap, and compensation framing.
* **Interactive Answer Evaluator**: Instant AI scoring (0–100), STAR alignment audit, identified strengths, and actionable coaching tips.
* **Anti-Duplication Blacklist**: Generates novel, non-repeating questions on every single click.

### 4. 💼 Real-Time Live Job Search Hub
* **Verified Search Launchers**: Pre-filtered 1-click launchers for **LinkedIn Jobs**, **BDJobs**, **Glassdoor**, and **Google Jobs** with zero dead-zones.
* **Dual-Market Ecosystem**: Instant toggling between **🇧🇩 Bangladesh Tech Market** and **🌍 Global Remote Worldwide**.
* **Target Role Search Calibrator**: Search and calibrate live job engine queries for any desired role on demand.

### 5. 📊 Synchronized Intelligence Dashboard & History
* **Single-Table JSONB Architecture**: Complete persistence via `public.user_scans(user_id, scan_data)` with Row Level Security (RLS).
* **Exact Scorecard Metrics**: Peak/Latest ATS score, total verified scans completed, Live Career Engines status, and Bookmarked Question Bank.
* **Automatic Deduplication**: Chronological scan history synchronized 1-to-1 between Dashboard and History tables.

### 6. 🛡️ Enterprise Security & Multi-User Isolation
* **Supabase UUID Account Isolation**: User A and User B data are strictly segregated at both the database level (RLS) and client storage layer.
* **Zero Demo Bleed**: Authenticated sessions strictly reflect real user identity and profile metadata.
* **JWT Cryptographic Verification**: Supabase Auth verification with RBAC protection.
* **Self-Service Password Recovery**: Secure email reset link workflow powered by Supabase Auth (`/forgot-password` and `/reset-password`).
* **Prompt Injection Defenses**: XML tag demarcation (`<security_directive>`) treats all candidate inputs strictly as untrusted raw document data.
* **Multi-Tier Rate Limiting**: Layered `express-rate-limit` guards against DDoS and brute-force scraping.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8.1, Tailwind CSS v4 | High-performance SPA with modern glassmorphic styling |
| **Icons & Primitives** | Lucide React, Radix UI, Base UI | Accessible UI components and iconography |
| **Backend** | Node.js 18+, Express 4.19, Multer | REST API with in-memory upload buffers |
| **Document Parsers** | `pdfjs-dist`, `mammoth` | High-fidelity text extraction from PDF and Word documents |
| **Database & Auth** | Supabase Auth & PostgreSQL | Managed relational database with JSONB document storage & RLS |
| **AI Intelligence** | Google Gemini & OpenAI API Pool | Multi-key failover pool + local heuristic engine |
| **Testing** | Playwright (Python E2E Automation) | Full end-to-end automated testing across all user flows |
| **Hosting & CI/CD** | Vercel (Frontend), Render (Backend) | Continuous automated deployments from GitHub `main` |
| **Monitoring** | UptimeRobot | 24/7 health check monitoring |

---

## 📂 Project Structure

```text
Matchpoint AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase, Database configuration & schema.sql
│   │   ├── controllers/     # Analysis, Interview, Jobs, Auth & User controllers
│   │   ├── data/            # Demo fixtures and domain taxonomies
│   │   ├── middleware/      # Auth (JWT verification), rate limiting & upload validation
│   │   ├── routes/          # REST API route handlers
│   │   ├── services/        # AI service (Multi-key failover pool) & Parser service
│   │   └── server.js        # Express application entrypoint
│   ├── test/                # API integration test suite
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/              # Favicon, SVG logos & static web assets
│   ├── src/
│   │   ├── components/      # UI components (AppLayout, LoadingState, PageHeader, etc.)
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── pages/           # Analyze, Result, Interview, Jobs, Dashboard, Profile, History
│   │   ├── services/        # Axios API client & error interceptors
│   │   ├── utils/           # User-namespaced storage & deduplication engine
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── screenshots/             # Application UI screenshots and preview captures
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js 18+** and **npm** installed.
* **Python 3.10+** (optional, for Playwright E2E test automation).

### 1. Clone the Repository
```bash
git clone https://github.com/victormallick/cse4104-7a-t05-matchpointai.git
cd cse4104-7a-t05-matchpointai
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy and configure environment variables
cp .env.example .env
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## ⚙️ Environment Variables

### `backend/.env`
```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase PostgreSQL & Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Multi-Key AI API Failover Pool
AI_API_KEY_1=your-ai-api-key-1
AI_API_KEY_2=your-ai-api-key-2
AI_API_KEY_3=your-ai-api-key-3

DEMO_MODE=false
```

### `frontend/.env`
```dotenv
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
```

---

## 🧪 Verification & Automated Testing

### 1. Backend Unit & API Tests
```bash
cd backend
npm test
```

### 2. Frontend Production Build Verification
```bash
cd frontend
npm run build
```

---

## 📄 License
CSE4104 Academic Project — Group T05. All rights reserved.
