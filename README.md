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
* **Non-Resume Content Guardrail**: Identifies non-resume uploads (recipes, research papers, essays) and safely displays a clear warning card with a 0% ATS score.

### 2. 🎯 Dynamic ATS Scoring & Target Role Calibration
* **Radial ATS Target Gauge**: Real-time HUD scoring (*Top 5% Applicant, Strong Match, Needs Review*).
* **Target Role Versatility**: Prominently guides candidates on how their target job title dynamically calibrates the ATS evaluation, interview questions, and live job searches.
* **Skill & Keyword Gap Matrix**: Side-by-side comparison between candidate competencies and industry requirements.
* **Interactive Google XYZ / STAR Rewriter**: High-impact bullet point rewrites with 1-click clipboard copying.

### 3. 🎙️ Tailored AI Mock Interview Hub
* **Dynamic Target Role Switcher**: Practice customized interview scenarios for any job role on demand without re-analyzing resumes.
* **Multi-Domain Categories**: Behavioral STAR scenarios, System Architecture & Technical challenges, and HR/Culture questions.
* **Recruiter Intent Insights**: Breakdown of what hiring managers look for, target keywords, and ideal STAR answers.

### 4. 💼 Real-Time Live Job Search Hub
* **Verified Search Launchers**: Pre-filtered 1-click launchers for **LinkedIn Jobs** and **Google Jobs** with zero click dead-zones.
* **Dual-Market Ecosystem**: Instant toggling between **🇧🇩 Bangladesh Tech Market** and **🌍 Global Remote Worldwide**.
* **Target Role Search Calibrator**: Search and calibrate live job engine queries for any desired role on demand.

### 5. 📊 Live Synchronized Dashboard
* **Real-Time Data Sync**: Merges active session records with Supabase backend history.
* **Dynamic Metric Cards**: Live latest ATS score, total completed analyses, bookmarked jobs, and recent resume reports.

### 6. 🎬 Contextual Motion & Visual Identity
* **Laser Document Inspector**: Sweeping laser scanner with active section verification checkmarks.
* **Acoustic STAR Waveform**: Equalizer soundwave animations communicating voice/question synthesis.
* **Accessibility**: GPU-accelerated 60 FPS CSS transforms with full `prefers-reduced-motion` compliance.

### 7. 🛡️ Enterprise Security & Hardening
* **JWT Cryptographic Verification**: Supabase Auth verification with RBAC protection.
* **Prompt Injection Defenses**: XML tag demarcation (`<security_directive>`) treats all candidate inputs strictly as untrusted raw document data.
* **Multi-Tier Rate Limiting**: Layered `express-rate-limit` guards against DDoS and credential scraping.
* **Dependency Auditing**: Patched against known vulnerabilities with `npm audit`.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8.1, Tailwind CSS v4 | High-performance SPA with modern glassmorphic styling |
| **Icons & Primitives** | Lucide React, Radix UI, Base UI | Accessible UI components and iconography |
| **Backend** | Node.js 18+, Express 4.19, Multer | REST API with in-memory upload buffers |
| **Document Parsers** | `pdfjs-dist`, `mammoth` | High-fidelity text extraction from PDF and Word documents |
| **Database & Auth** | Supabase Auth & PostgreSQL | Managed relational database with Row Level Security (RLS) |
| **AI Intelligence** | Generative AI REST API | Multi-key failover pool + local heuristic engine |
| **Testing** | Playwright (Python E2E Automation) | Full end-to-end automated testing across all user flows |
| **Hosting & CI/CD** | Vercel (Frontend), Render (Backend) | Continuous automated deployments from GitHub `main` |
| **Monitoring** | UptimeRobot | 24/7 health check monitoring |

---

## 📂 Project Structure

```text
Matchpoint AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase & Database configuration
│   │   ├── controllers/     # Analysis, Interview, Jobs, Auth & User controllers
│   │   ├── data/            # Demo fixtures and seed data
│   │   ├── middleware/      # Auth, rate limiting & upload validation
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
│   │   ├── pages/           # Analyze, Result, Interview, Jobs, Dashboard, Profile, etc.
│   │   ├── services/        # Axios API client & error interceptors
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── sample_resumes/          # Sample PDF/DOCX resumes for testing
├── database/
│   └── schema.sql           # PostgreSQL schema with tables & indexes
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

### 3. Automated Playwright E2E Test Suite
```bash
# Run headless browser automation across all user flows
python scratch/e2e_test_suite.py
```

---

## 📄 License
CSE4104 Academic Project — Group T05. All rights reserved.
