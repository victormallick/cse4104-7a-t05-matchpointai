# MatchPoint AI

AI Resume Analyzer & Interview Preparation Platform
Official project: **CSE4104-7A-T05**

MatchPoint AI helps candidates compare a PDF/DOCX resume with a target job description, review an ATS score and skill gaps, improve weak resume content, prepare for interviews, explore matched jobs, and revisit previous analyses. Administrators can monitor users, platform analytics, AI usage, service status, and logs.

The implementation follows the T05 Proposal, SRS, Use Case Diagram, ER Diagram, System Architecture, System Design, UI/Wireframe Design, User Flow, Development Roadmap, and Backend Progress documents.

## Team

| Member | Student ID | Role |
| --- | --- | --- |
| Junnatul Farhana | 11230121088 | Team Leader |
| Farhana Azgar Orin | 11230121070 | Frontend / UI Design |
| Victor Mallick | 11210320676 | Backend Development |
| Easin Mohammad Rayhan | 11220120789 | Database / AI Integration |

## Features

- Email/password registration, login, logout, and role-aware navigation
- PDF/DOCX resume upload and text parsing
- Job title, company, and job-description input
- ATS score, matched/missing keywords, missing skills, and improvement guidance
- Resume bullet rewrite examples
- Technical, behavioral, and HR interview question generation
- Job recommendations with match scores and bookmark interaction
- Analysis history and editable candidate profile
- Admin dashboard, user monitoring, analytics, AI usage, service health, and logs
- Fully runnable local demo mode with no Supabase or paid AI key

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router DOM, Axios, lucide-react, CSS |
| Backend | Node.js 18+, Express, Multer |
| Parsing | pdf-parse, Mammoth DOCX parser |
| Database/Auth | Supabase Auth and PostgreSQL |
| AI-ready integration | OpenAI API or Gemini API environment slots |
| API testing | Postman collection and Node test runner |

## Folder structure

```text
root/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── test/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
├── postman/
│   └── MatchPoint_AI_APIs.postman_collection.json
├── .gitignore
└── README.md
```

## Local setup

Prerequisites: Node.js 18 or newer and npm.

### 1. Start the backend

```powershell
cd backend
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

The backend runs at `http://localhost:5000`.

### 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

### 3. Run verification

```powershell
cd backend
npm.cmd test

cd ..\frontend
npm.cmd run build
```

## Environment variables

`backend/.env`:

```dotenv
PORT=5000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
DEMO_MODE=true
```

`frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

Never commit real credentials. Set `DEMO_MODE=false` and fill the relevant credentials only when connecting a prepared Supabase project.

## Demo/mock mode

Demo mode is enabled automatically when Supabase credentials are absent, or explicitly with `DEMO_MODE=true`. It provides realistic in-memory profiles, ATS analyses, interview questions, jobs, history, admin users, analytics, AI usage, service health, and logs.

Demo login:

- Candidate: `amina.rahman@example.com` / `password123`
- Administrator: `admin@matchpoint.ai` / `password123`
- In demo mode, any valid email and non-empty password also works.

Data created in backend demo mode resets when the backend process restarts. Resume text is parsed locally; no paid AI service is called.

## API endpoints

All successful endpoints use:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API and integration mode health |
| POST | `/api/auth/register` | Register candidate |
| POST | `/api/auth/login` | Login candidate/admin |
| POST | `/api/auth/logout` | End client session |
| GET | `/api/user/profile` | Load profile |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/upload` | Upload and parse resume |
| POST | `/api/analysis/gap-analysis` | Generate ATS/gap analysis |
| POST | `/api/interview/generate` | Generate interview questions |
| GET | `/api/user/history` | Load analysis history |
| GET | `/api/jobs/recommendations` | Load matched jobs |
| GET | `/api/admin/analytics` | Admin overview and trends |
| GET | `/api/admin/users` | Admin user monitoring |
| GET | `/api/admin/ai-usage` | AI usage and endpoint health |
| GET | `/api/admin/logs` | Admin/system logs |

Import the collection in `postman/` for ready-made requests. The login, upload, and analysis requests save their returned IDs into collection variables.

## Frontend pages

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/login` | Candidate/admin login |
| `/register` | Registration |
| `/dashboard` | Candidate dashboard |
| `/analyze` | Resume upload and job input |
| `/result` | ATS and gap-analysis result |
| `/interview` | Technical, behavioral, and HR practice |
| `/jobs` | Job recommendations |
| `/history` | Analysis history |
| `/profile` | Candidate profile |
| `/admin` | Admin dashboard |
| `/admin/users` | Manage users |
| `/admin/analytics` | System analytics |
| `/admin/ai-usage` | AI usage monitoring |
| `/admin/logs` | Admin logs |

## Database notes

Run `database/schema.sql` in the Supabase SQL Editor when using real persistence. It keeps the Week 6 backend names:

- `analysis_records` implements the ER diagram's conceptual `analysis_results`.
- `interview_sessions.questions_json` groups the ER diagram's `interview_questions` into generated practice sessions.

This preserves the existing backend while adding the documented job recommendation, admin log, AI usage, profile, job-title, company, missing-skill, indexing, trigger, and Row Level Security fields.

## Final lab demonstration flow

1. Start backend and frontend with demo mode enabled.
2. Show the landing page and register or use the candidate demo login.
3. Review dashboard cards and recent analyses.
4. Open **Analyze Resume**, upload a real PDF/DOCX resume, and confirm the target job details.
5. Click **Analyze with AI** and explain the parsing/loading feedback.
6. Review ATS score, missing keywords, missing skills, suggestions, and rewrite example.
7. Open interview questions and demonstrate Practice/Save interaction.
8. Show job recommendations, bookmarks, history search, and profile update.
9. Log out, use the administrator demo login, and show users, analytics, AI usage, service status, and logs.
10. Optionally run the Postman health, login, upload, analysis, interview, jobs, and admin requests.

## Optional production setup

Local lab demonstration needs no additional setup. Real persistence requires creating a Supabase project, running `database/schema.sql`, configuring the backend credentials, and setting `DEMO_MODE=false`. The project currently exposes AI-ready environment slots but intentionally uses the deterministic local analysis engine so the lab demo never depends on paid keys.
