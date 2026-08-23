# MatchPoint AI 🎯

> **AI-Powered ATS Resume Analyzer, Tailored Interview Preparation & Career Matching Platform**  
> Official Project: **CSE4104-7A-T05**

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-black?style=for-the-badge&logo=vercel)](https://matchpointai.vercel.app)
[![API Server](https://img.shields.io/badge/API%20Server-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://matchpointsai.onrender.com)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-LLM%20API%20Engine-6366F1?style=for-the-badge)](https://matchpointai.vercel.app)

---

## 🌐 Live Deployments

* 🚀 **Web Application**: [https://matchpointai.vercel.app](https://matchpointai.vercel.app)
* ⚡ **Production Backend**: [https://matchpointsai.onrender.com](https://matchpointsai.onrender.com)
* 🩺 **API Health Check**: [https://matchpointsai.onrender.com/api/health](https://matchpointsai.onrender.com/api/health)
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

* 📄 **Multi-Format Resume Parser**: In-memory parsing for **PDF** (`pdfjs-dist`) and **DOCX** (`mammoth`) with zero disk storage leaks.
* 🎯 **Dynamic Radial ATS Target Gauge**: Real-time circular HUD score classification (*Top 5% Applicant, Strong Match, Needs Review*).
* 🔍 **Skill & Keyword Gap Matrix**: Live comparative breakdown between candidate competencies and target job requirements.
* ✍️ **Interactive STAR Bullet Rewriter**: Side-by-side comparison of unquantified resume lines vs. high-impact STAR achievement rewrites with 1-click clipboard copying.
* 🎙️ **Tailored AI Mock Interview Bank**:
  * Categorized into **Technical**, **Behavioral**, **HR & Culture**, and **Saved Questions**.
  * Recruiter intent breakdowns, target competencies, and sample STAR responses.
* 💼 **AI Job Recommendation Engine**:
  * Dual-market filtering for **🇧🇩 Bangladesh Tech** and **🌍 Global Remote** opportunities.
  * Direct 1-click application redirection to LinkedIn and company career pages.
* 🔑 **1-Click Google OAuth & Email Authentication**:
  * Frictionless onboarding with **"Continue with Google"** and secure Email/Password.
  * Full password visibility toggles and customizable display names.
* 🔒 **Self-Service Password Recovery**:
  * Automated **Forgot Password (`/forgot-password`)** and **Reset Password (`/reset-password`)** flows via Supabase Auth email tokens.
* 👤 **Persistent Candidate Profile**:
  * Manage contact details, target job roles, social/portfolio links, bio, and custom skill banks.
  * Profile changes synchronize automatically across all dashboard headers, greetings, and avatar initials.
* 🌓 **Adaptive Light & Dark Mode**:
  * Comprehensive responsive theming with custom slate gradients, Tailwind CSS v4, Lucide icons, and Radix UI.
* 🛡️ **High-Availability Multi-Key AI Failover Pool**:
  * Resilient round-robin rotation across multiple API keys with automated fallback and local heuristic processing for 100% service uptime.
* 📊 **Role-Based Admin Console**:
  * Admin dashboard with system metrics, user tracking, AI token analytics, and audit logs.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8.1, Tailwind CSS v4 | Ultra-fast client SPA with modern glassmorphism styling |
| **Icons & Primitives** | Lucide React, Radix UI | Accessible UI components and iconography |
| **Backend** | Node.js 18+, Express 4.19, Multer | Modular REST API with in-memory upload buffers |
| **Document Parsers** | `pdfjs-dist`, `mammoth` | High-fidelity text extraction from PDF and Word documents |
| **Database & Auth** | Supabase Auth & PostgreSQL | Managed relational database with Row Level Security (RLS) |
| **AI Intelligence** | Generative AI REST API | Multi-key failover pool + local heuristic engine |
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
│   │   ├── components/      # UI components (AppLayout, AuthLayout, PageHeader, etc.)
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── pages/           # Analyze, Result, Interview, Jobs, Profile, Forgot/Reset, etc.
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
GEMINI_API_KEY_1=your-ai-api-key-1
GEMINI_API_KEY_2=your-ai-api-key-2
GEMINI_API_KEY_3=your-ai-api-key-3

DEMO_MODE=false
```

### `frontend/.env`
```dotenv
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
```

---

## 🧪 Verification & Health Checks

Run backend tests and verify production builds:
```bash
# Test Backend APIs
cd backend
npm test

# Verify Frontend Production Build
cd ../frontend
npm run build
```

---

## 📄 License
CSE4104 Academic Project — Group T05. All rights reserved.
