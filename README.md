# ⚡ AI Job Tracker SaaS

> A full-stack AI-powered job application tracker built with Flask, SQLite, and Groq AI.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=for-the-badge&logo=flask)
![Groq AI](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightblue?style=for-the-badge&logo=sqlite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)

---

## 🎯 What is this project?

Job seekers apply to 50-100 companies and lose track of everything. **AI Job Tracker** solves this by letting users track all their applications in one place — and uses AI to analyze their resume against job descriptions to tell them exactly why they might be getting rejected.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📋 Job Application Tracker | Add, edit, delete applications with status tracking |
| 📊 Dashboard Analytics | Visual charts — monthly applications, success rate, funnel |
| 🔍 Search & Filter | Filter by status, search by company or role |
| 📄 Resume Upload | Upload PDF — backend extracts text automatically |
| 🎯 AI Resume Match Score | AI compares resume vs job description — gives % match |
| 🤖 ATS Resume Score | AI checks resume ATS friendliness with improvement tips |
| 🧠 Skill Gap Detector | AI finds missing skills + learning resources with time |
| 💬 Interview Question AI | AI generates technical, behavioral, situational questions |

---

## 🖥️ Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### AI Analyzer
![Analyzer](screenshots/analyzer.png)

### Analytics
![Analytics](screenshots/analytics.png)

---

## 🛠️ Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| Backend | Python Flask |
| Database | SQLite |
| AI API | Groq AI (Llama 3.1) |
| PDF Parsing | pdfplumber |
| Charts | Chart.js |
| UI Design | Custom Dark Glassmorphism |

---

## 📁 Project Structure

```
ai-job-tracker/
├── frontend/
│   ├── index.html          # Landing page
│   ├── dashboard.html      # Job tracker
│   ├── analyzer.html       # AI analyzer
│   ├── analytics.html      # Charts & insights
│   ├── css/
│   │   └── style.css       # Full UI design
│   └── js/
│       ├── app.js          # Shared utilities
│       ├── dashboard.js    # Job CRUD logic
│       ├── analyzer.js     # AI feature logic
│       └── analytics.js    # Chart logic
├── backend/
│   ├── main.py             # Flask REST API (12 endpoints)
│   ├── database.py         # SQLite setup
│   ├── models.py           # Job model
│   ├── requirements.txt    # Python packages
│   └── ai/
│       ├── resume_parser.py     # PDF text extraction
│       ├── match_engine.py      # AI match score
│       ├── ats_checker.py       # ATS analysis
│       ├── skill_gap.py         # Skill gap detection
│       └── interview_questions.py # Interview Q generator
├── jobs.db                 # SQLite database (auto-created)
├── .env                    # API keys (not pushed to GitHub)
└── README.md
```

---

## ⚙️ Setup & Installation

### Step 1 — Clone the repository
```bash
https://github.com/jesima25/Ai_job_tracker
cd ai-job-tracker
```

### Step 2 — Get free Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create API Key
4. Copy the key

### Step 3 — Configure environment
Create `.env` file in root:
```
GEMINI_API_KEY=your_groq_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### Step 4 — Install dependencies
```bash
cd backend
pip install -r requirements.txt
pip install groq pdfplumber
```

### Step 5 — Run the backend
```bash
python main.py
```
Backend runs on: `http://localhost:7860`

### Step 6 — Open frontend
Open `frontend/index.html` in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs |
| POST | `/api/jobs` | Add new job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| PATCH | `/api/jobs/:id/status` | Quick status update |
| GET | `/api/analytics` | Get analytics data |
| POST | `/api/upload-resume` | Upload PDF resume |
| POST | `/api/analyze` | Full AI analysis |
| POST | `/api/match-score` | Match score only |
| POST | `/api/ats-score` | ATS score only |
| POST | `/api/skill-gap` | Skill gap only |
| POST | `/api/interview-questions` | Interview questions |

---

## 🤖 How AI Works

1. User uploads resume PDF or pastes resume text
2. User pastes job description
3. Backend sends both to **Groq AI (Llama 3.1)**
4. AI returns structured JSON with:
   - Match score (0-100%)
   - ATS score with passed/failed checks
   - Missing skills with learning resources
   - Interview questions by category
5. Frontend displays results beautifully

---

## 💡 What Recruiters Will See

✔ Full Stack Development (HTML + CSS + JS + Flask)
✔ REST API Design (12 endpoints)
✔ Database Management (SQLite CRUD)
✔ AI Integration (Groq AI + Llama 3.1)
✔ PDF Processing (pdfplumber)
✔ Data Visualization (Chart.js)
✔ SaaS Product Thinking
✔ Clean Code Architecture

---

## 🚀 Future Improvements

- [ ] User authentication (login/register)
- [ ] Chrome extension for auto-fill from LinkedIn
- [ ] Email reminders for follow-ups
- [ ] Export applications to Excel
- [ ] Deploy on cloud (Render + GitHub Pages)

---

## 👨‍💻 About
 Built by Jesima | B.Sc Computer Science | Madurai, Tamil Nadu.

**Tech:** Python · Flask · SQLite · Groq AI · HTML · CSS · JavaScript · Chart.js

---

## 🌐 Live Demo

Try the live version here: [AI Job Tracker on Hugging Face](https://jesima932-ai-job-tracker.hf.space/)

⭐ **Star this repo if you found it helpful!**
