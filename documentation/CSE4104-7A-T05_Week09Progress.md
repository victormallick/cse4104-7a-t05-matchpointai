# MatchPoint AI — Week 09 Progress & Integration Report

**Course**: CSE4104 — Web Application Development  
**Section**: 7A  
**Team**: T05  
**Project Title**: MatchPoint AI — AI-Powered ATS Resume Analyzer & Interview Preparation Platform  
**Submission Date**: August 19, 2026  
**Document Identifier**: `CSE4104-7A-T05_Week09Progress`  

---

## 👥 1. Team Members & Student IDs

| Member Name | Student ID | Academic Role | Core Development Responsibilities |
| :--- | :--- | :--- | :--- |
| **Junnatul Farhana** | 11230121088 | Team Leader | Project Management, SRS & Workflow Governance, QA & Integration Verification |
| **Farhana Azgar Orin** | 11230121070 | Frontend / UI Lead | React Component Architecture, Radial ATS HUD, Themes, Responsive Viewports |
| **Victor Mallick** | 11210320676 | Backend & Full-Stack | Express REST APIs, In-Memory PDF/DOCX Parsers, Client-Server Integration |
| **Easin Mohammad Rayhan** | 11220120789 | Database & AI Lead | PostgreSQL / Supabase Schema & RLS, Google Gemini Multi-Key Pool, Prompt Engineering |

---

## 📋 2. Feature Completion Checklist

### Summary of Completed Features (100% Core Scope)
* **User Authentication & RBAC**: Candidate registration, login, logout, password visibility toggles (`Eye`/`EyeOff`), candidate vs. admin route guards (`ProtectedRoute.jsx`).
* **In-Memory Resume Parser**: In-memory extraction for **PDF** (`pdfjs-dist`) and **DOCX** (`mammoth`) with zero disk leaks.
* **Job Description Ingestion**: Target role title, company name, and full JD text input with validation on `/analyze`.
* **ATS Scoring & Skill Gap Matrix**: Multi-dimensional scoring, matched competencies vs. missing keywords, and dynamic **Radial Target HUD Gauge**.
* **Before/After STAR Bullet Optimizer**: Side-by-side comparison of unquantified drafted bullet points alongside STAR-framework AI rewrites with 1-click clipboard copy.
* **Tailored Mock Interview Question Bank**: Technical, Behavioral, and HR & Culture questions generated with Recruiter Intent context and STAR strategy notes.
* **Dual-Market Job Matching**: Dual-market filtering for **🇧🇩 Bangladesh Tech** and **🌍 Global Remote** roles with 1-click LinkedIn application links.
* **Candidate History & Profile**: Timestamped analysis records on `/history` and editable career preferences on `/profile`.
* **Administrator Operations Panel**: User monitoring, metrics, AI token tracking, service health, and audit logs on `/admin/*`.
* **AI Multi-Key Failover Pool**: Rotating array of 3 Gemini API keys with auto-failover + deterministic local NLP fallback.

### Partially Completed / Future Polish Features
* **Live Audio Speech-to-Text Interview Practice**: Candidates can currently review and practice generated interview questions with model answers. Live microphone audio transcription is planned as a Week 11 expansion.

### Remaining Features
* **Multi-Variant A/B Resume PDF Exporter**: Exporting optimized STAR bullet points directly into a downloadable ATS-friendly PDF template (Scheduled for Week 12).

---

## 🔌 3. Frontend–Backend & Database Integration Status

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     React + Vite Frontend       │  REST API calls │      Node.js Express API        │
│   (Auth, Forms, Realtime UI)    ├────────────────►│   (Controllers, Parsers, AI)    │
│  http://localhost:5173 (Port)   │◄────────────────┤   http://localhost:5000 (Port)  │
└─────────────────────────────────┘  JSON & Tokens  └────────────────┬────────────────┘
                                                                     │
                                                    ┌────────────────┴────────────────┐
                                                    ▼                                 ▼
                                       ┌─────────────────────────┐       ┌─────────────────────────┐
                                       │   Supabase PostgreSQL   │       │  Google Gemini AI Pool  │
                                       │    8 Relational Tables  │       │  gemini-2.5-flash keys  │
                                       └─────────────────────────┘       └─────────────────────────┘
```

* **API Endpoints**: 15 REST endpoints verified and responding with structured `{ success: true, message: "...", data: {...} }` envelopes.
* **Authentication**: Authorization header automatically attached via Axios interceptor: `Authorization: Bearer <session_token>`.
* **Database Operations**: Supabase PostgreSQL with 8 production tables (`users`, `resumes`, `job_descriptions`, `analysis_records`, `interview_sessions`, `job_recommendations`, `admin_logs`, `ai_usage_logs`) + in-memory store fallback.
* **Data Retrieval & Updates**: Live dynamic data retrieval on Dashboard, History, Results, Interview, Jobs, and Admin pages.

---

## 🤖 4. AI Integration Status

* **Model Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK.
* **Multi-Key Failover Pool**: Automatic rotation across `GEMINI_API_KEY_1..3` on HTTP 429 rate limit events.
* **Deterministic NLP Fallback**: Guaranteed 100% lab uptime via local keyword extraction and STAR rewrite generation if external APIs time out.
* **Secret Isolation**: All API credentials stored strictly in server-side `backend/.env` (never leaked to the client).

---

## 🔐 5. User Authentication Status

* **Registration (`POST /api/auth/register`)**: Creates candidate accounts with full name, email, and password hashing in Supabase Auth.
* **Login (`POST /api/auth/login`)**: Validates credentials and returns JWT bearer tokens.
* **Logout (`POST /api/auth/logout`)**: Clears local session and redirects to landing page.
* **Password Visibility**: Interactive password visibility eye toggles (`Eye` / `EyeOff`) on both Login and Register forms.
* **Role-Based Access Control**: `ProtectedRoute.jsx` guards candidate workspace routes (`/dashboard`, `/analyze`, `/result`, `/interview`, `/jobs`, `/history`, `/profile`) and restricts `/admin/*` routes strictly to users with `role: 'admin'`.

---

## 🛠️ 6. Major Problems Encountered & Solutions Implemented

1. **Gemini Free-Tier Rate Limits (HTTP 429)**:
   * *Problem*: Concurrent student test runs triggered Google Gemini free-tier quota limits.
   * *Solution*: Implemented a 3-key rotating failover pool (`GEMINI_API_KEY_1..3`) combined with a deterministic domain-aware local NLP fallback engine.
2. **Temporary File Descriptor Leaks on PDF Uploads**:
   * *Problem*: Writing uploaded PDFs to temporary server disk locations caused orphaned files on Windows.
   * *Solution*: Replaced disk storage with in-memory binary stream extraction using `pdfjs-dist` and `mammoth`.
3. **React Router Link Cloning Issues in Production Minified Bundles**:
   * *Problem*: Base UI `<Button render={<Link ... />}>` prop threw a silent render crash in minified production builds.
   * *Solution*: Refactored all buttons to use standard, bulletproof `<Link to="..."> <Button ...> </Button> </Link>` component wrappers.

---

## 📊 7. Changes from Original Proposal

| Area | Original Proposal | Week 09 Implemented Reality | Technical Rationale |
| :--- | :--- | :--- | :--- |
| **Interview Module** | Interactive typing studio with written answer grading. | Targeted question bank with Recruiter Intent & STAR strategy notes. | User testing proved candidates prefer immediate model talking points over typing lengthy text forms. |
| **Job Matching** | Modal cover letter popup on Job Listings. | Focused 1-click LinkedIn job application redirection. | Direct LinkedIn search links provide immediate, actionable utility for active job seekers. |
| **AI Infrastructure** | Single API key dependency. | Multi-Key Gemini Failover Pool + Deterministic Fallback. | Ensures 100% lab and production uptime resilient against quota limits. |

---

## 📸 8. Screenshots & Visual Verification Inventory (1×1 Format)

All screenshots are captured from the live running application and cataloged in [`screenshots/`](file:///d:/Projectss/Matchpoint%20AI/screenshots):

| Category | Screenshot Filename | Live Verification Description |
| :--- | :--- | :--- |
| **1. Login / Registration** | [`01_Login_Registration.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/01_Login_Registration.png) | Sign In & Sign Up interfaces with password visibility toggles (`Eye`/`EyeOff`). |
| **2. Dashboard Interface** | [`02_Dashboard.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/02_Dashboard.png) | Candidate workspace with metric cards, recent analysis history, and quick actions. |
| **3. Major Functional Module** | [`03_Major_Functional_Module_Analyze.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/03_Major_Functional_Module_Analyze.png) | Drag-and-drop resume upload and target job description ingestion interface. |
| **4. AI Feature (ATS & STAR)** | [`04_AI_Feature_Result.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/04_AI_Feature_Result.png) | Radial ATS score gauge, matched/missing keyword matrix, and Before/After bullet optimizer. |
| **5. AI Feature (Interviews)** | [`05_AI_Feature_Interview_Questions.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/05_AI_Feature_Interview_Questions.png) | Technical, Behavioral, and HR question bank with recruiter context and strategy notes. |
| **6. Job Matching Module** | [`06_Dual_Market_Job_Matches.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/06_Dual_Market_Job_Matches.png) | Dual-market job recommendations with Bangladesh Tech and Global Remote filters. |
| **7. Mobile / Responsive View** | [`07_Mobile_Responsive_Interface.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/07_Mobile_Responsive_Interface.png) | Mobile viewport verification showing responsive drawer navigation and stacked cards. |
| **8. Database & Backend APIs** | [`08_API_Integration_Supabase_Data.png`](file:///d:/Projectss/Matchpoint%20AI/screenshots/08_API_Integration_Supabase_Data.png) | Live database records and API integration verification in Supabase / Postman. |

---

## 🔗 9. Repository & Project Links

* **Official GitHub Repository**: [https://github.com/victormallick/cse4104-7a-t05-matchpointai](https://github.com/victormallick/cse4104-7a-t05-matchpointai)
* **Postman API Collection**: [`postman/MatchPoint_AI_APIs.postman_collection.json`](file:///d:/Projectss/Matchpoint%20AI/postman/MatchPoint_AI_APIs.postman_collection.json)
* **Database Schema SQL**: [`database/schema.sql`](file:///d:/Projectss/Matchpoint%20AI/database/schema.sql)
* **Demo Walkthrough Video**: [`screenshots/matchpoint_ai_demo.webm`](file:///d:/Projectss/Matchpoint%20AI/screenshots/matchpoint_ai_demo.webm)
