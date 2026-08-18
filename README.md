# MatchPoint AI 🎯

> **AI-Powered ATS Resume Analyzer, Tailored Interview Preparation & Career Matching Platform**  
> Official Project: **CSE4104-7A-T05**

MatchPoint AI helps candidates optimize their PDF/DOCX resumes against target job descriptions, discover high-value keyword gaps, explore AI-powered bullet rewrites, prepare with tailored mock interview questions, and discover high-alignment job opportunities in **Bangladesh** and **Abroad**.

---

## 👥 Project Team (T05)

| Member | Student ID | Role |
| :--- | :--- | :--- |
| **Junnatul Farhana** | 11230121088 | Team Leader |
| **Farhana Azgar Orin** | 11230121070 | Frontend / UI & UX Design |
| **Victor Mallick** | 11210320676 | Backend & Full-Stack Development |
| **Easin Mohammad Rayhan** | 11220120789 | Database & AI Integration |

---

## ✨ Key Features & Upgrades

* 📄 **Multi-Format Resume Parser**: In-memory parsing for **PDF** (`pdfjs-dist`) and **DOCX** (`mammoth`) with zero disk leakage.
* 🎯 **Dynamic Radial "Target HUD" ATS Gauge**: Animated circular gauge providing multi-tier score classification (*e.g. Top 5% Applicant, Strong Match*).
* 🔍 **Comprehensive Keyword & Skill Gap Matrix**: Identifies matched competencies vs. high-impact missing industry terms.
* ✍️ **Interactive "Before vs. After" Bullet Point Optimizer**: Side-by-side comparison of unquantified drafts vs. STAR-backed achievement bullets with 1-click clipboard copy.
* 🎙️ **Custom Mock Interview Question Bank**:
  * Categorized into **Technical**, **Behavioral**, **HR & Culture**, and **Saved Questions**.
  * Recruiter intent breakdowns, target keywords, and recommended STAR answering strategies.
* 💼 **AI Job Recommendation Engine**:
  * Dual-market filtering for **🇧🇩 Bangladesh Tech** and **🌍 Global Remote** roles.
  * Live search by target role with direct 1-click LinkedIn application links.
* 🌓 **Modern UI with Light / Dark Mode**: Custom brand theme built with Tailwind CSS v4, Radix UI primitives, Lucide icons, and official neural knot branding.
* 🛡️ **Multi-Key Gemini Failover Pool**: Automatic fallback rotation across `GEMINI_API_KEY_1..3` + deterministic local analyzer for 100% uptime.
* 🔐 **Secure Authentication**: Clean Login & Registration with password visibility eye toggles and Supabase session management.
* 📊 **Administrator Operations Panel**: User monitoring, system analytics, AI token tracking, service health, and audit logs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 / 18, Vite 8.1, Tailwind CSS v4, Radix UI, Lucide React, Axios |
| **Backend** | Node.js 18+, Express 4.19, Multer (Memory Storage) |
| **Document Parsers** | `pdfjs-dist` (PDF extraction), `mammoth` (DOCX extraction) |
| **Database & Auth** | Supabase Auth & PostgreSQL (with in-memory fallback engine) |
| **AI Intelligence** | Google Gemini API (`gemini-3.6-flash`) with Multi-Key Pool & OpenAI support |
| **Testing** | Node test runner, Postman API Collection, automated diagnostic suites |

---

## 📂 Project Structure

```text
Matchpoint AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase & Database configuration
│   │   ├── controllers/     # Analysis, Interview, Jobs, Auth & User controllers
│   │   ├── data/            # Demo fixtures and seed data
│   │   ├── middleware/      # Auth, error handling & upload validation
│   │   ├── routes/          # REST API route handlers
│   │   ├── services/        # AI service (Gemini multi-key pool) & Parser service
│   │   └── server.js        # Express application entrypoint
│   ├── test/                # API integration test suite
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/              # Favicon, SVG logos & static web assets
│   ├── src/
│   │   ├── components/      # UI components (PageHeader, LoadingState, Brand, etc.)
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── pages/           # Analyze, Result, Interview, Jobs, Dashboard, etc.
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── sample_resumes/          # PDF test resumes for quick evaluation
├── database/
│   └── schema.sql           # Supabase PostgreSQL schema with RLS policies
├── postman/
│   └── MatchPoint_AI_APIs.postman_collection.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js 18+** and **npm** installed.

### 1. Start the Backend API
```powershell
cd backend
npm.cmd install
npm.cmd run dev
```
*Backend runs on `http://localhost:5000`.*

### 2. Start the Frontend App
Open a second terminal window:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## ⚙️ Environment Configuration

### `backend/.env`
```dotenv
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini Multi-Key Failover Pool
GEMINI_API_KEY_1=your-gemini-key-1
GEMINI_API_KEY_2=your-gemini-key-2
GEMINI_API_KEY_3=your-gemini-key-3

DEMO_MODE=false
```

### `frontend/.env`
```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🧪 Verification & Health Checks

Run the automated test suites:
```powershell
# Test Backend APIs
cd backend
npm.cmd test

# Verify Frontend Production Build
cd ..\frontend
npm.cmd run build
```

---

## 📄 License
CSE4104 Academic Project — Group T05. All rights reserved.
