# MatchPoint AI - AI Resume Analyzer & Interview Preparation Platform.

## Team Information

| Field | Information |
| --- | --- |
| Official Team Name | CSE4104-7A-T05 |
| Section | 7A |
| Project Title | MatchPoint AI - AI Resume Analyzer & Interview Preparation Platform |
| Team Leader | Junnatul Farhana |
| GitHub Repository Link | [https://github.com/wizzzzzzzz255/cse4104-7a-t05-matchpointai](https://github.com/wizzzzzzzz255/cse4104-7a-t05-matchpointai) |

## Team Members and Student IDs

| SL | Member Name | Student ID | Role |
| --- | --- | --- | --- |
| 1 | Junnatul Farhana | 11230121088 | Team Leader |
| 2 | Farhana Azgar Orin | 11230121070 | Frontend Developer |
| 3 | Victor Mallick | 11210320676 | Backend Developer |
| 4 | Easin Mohammad Rayhan | 11220120789 | AI Integration Engineer |

## Project Description

MatchPoint AI is an AI-powered smart career preparation system designed to help users optimize their resumes and prepare for technical interviews. Users can upload their resume alongside a target job description, and the system will evaluate them using advanced semantic analysis. 

The platform acts as a strict Applicant Tracking System (ATS) and technical recruiter, providing a detailed gap analysis, missing keywords detection, and an overall ATS match score. Furthermore, the system dynamically generates custom mock interview questions targeting the candidate's specific weaknesses and suggests professional rewrites for weak experience bullet points.

## Proposed Features

* Secure User Authentication System (via Supabase).
* Resume Upload (PDF/DOCX) and structured text parsing.
* AI semantically compares the resume with the target job description.
* System provides targeted Gap Analysis & ATS Match Scoring.
* System identifies missing technical skills and keywords.
* AI Resume Improvement Generator provides professional rewriting suggestions for weak bullet points.
* Custom Mock Interview Generator creates personalized technical and behavioral questions based on detected skill gaps.
* Smart Job Match Recommendations.
* User can view previous analysis history on their dashboard.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React.js, Tailwind CSS, ShadCN UI |
| Backend | Node.js, Express.js |
| Database & Auth | Supabase (PostgreSQL & Authentication) |
| AI / Machine Learning | OpenAI API / Gemini API |
| API and Tools | PDF Parser, Mammoth DOCX parser |

## Project Folder Structure

```text
CSE4104-7A-T05_MatchPoint/
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── project_overview.md
│   ├── team_info.md
│   └── database_design.md
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── styles/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   └── utils/
│       └── parsers/
└── tests/
```

## How the System Works

1. User authenticates and uploads a resume (PDF/DOCX) along with a target job description from the frontend.
2. The documents are sent to the Node.js backend.
3. Backend parsers extract clean text from the uploaded files.
4. The extracted text is sent to the AI API with strict prompt instructions.
5. AI performs semantic gap analysis to find missing keywords and calculates the ATS score.
6. AI generates personalized mock interview questions based on the candidate's missing skills.
7. System saves the analysis results to the Supabase PostgreSQL database.
8. Result is displayed on the user's dashboard.

## Installation and Setup

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Environment Variables (.env)
You will need to create a `.env` file in your backend directory with the following keys:
```text
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
AI_API_KEY=your_openai_or_gemini_key
```

## API Endpoints Draft

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload-resume` | Upload and parse PDF/DOCX files |
| POST | `/analyze-resume` | Compare resume with JD and get ATS score |
| POST | `/generate-interview` | Generate custom mock interview questions |
| POST | `/improve-resume` | Get AI rewriting suggestions for weak bullet points |
| GET | `/analysis-history` | Fetch previous ATS analyses for the user |

## Expected Output Example

```json
{
  "ats_score": "74%",
  "missing_keywords": ["Docker", "CI/CD", "Redis"],
  "weak_points": [
    {
      "original": "Worked on backend systems.",
      "suggestion": "Developed scalable REST APIs using Node.js and PostgreSQL, improving response efficiency by 30%."
    }
  ],
  "interview_questions": [
    {
      "topic": "Docker",
      "question": "How would you containerize a Node.js application using Docker?"
    },
    {
      "topic": "Database",
      "question": "Explain indexing in PostgreSQL and when you would use composite indexes."
    }
  ]
}
```

## File Naming Convention

Official files should follow the required naming convention.

Examples:

```text
CSE4104-7A-T05_Proposal.pdf
CSE4104-7A-T05_Week01.pdf
CSE4104-7A-T05_InitialProjectStructure.zip
```

## Current Status

Initial project structure and team details finalized. Next steps are setting up the Supabase database schema, configuring the Node.js/Express backend, building the React UI, and implementing the core document parsing logic.
