# 🛡️ SafeLearn AI — Explainable Cybersecurity for Students

<div align="center">

![SafeLearn AI](https://img.shields.io/badge/SafeLearn-AI-4F46E5?style=for-the-badge&logo=shield&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-10B981?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-F59E0B?style=for-the-badge)

**AI-powered cybersecurity that explains threats in plain English — protecting students from phishing, malware, and data misuse.**

[🌐 Live Demo](https://github.com/gopi374/SafeLearnAI) · [🐛 Report Bug](https://github.com/gopi374/SafeLearnAI/issues) · [✨ Request Feature](https://github.com/gopi374/SafeLearnAI/issues)

</div>

---

## 🎯 What is SafeLearn AI?

SafeLearn AI is a full-stack cybersecurity platform designed specifically for students and educators. Unlike traditional security tools that just block threats, SafeLearn AI **explains what was detected and why it matters** — turning every security event into a learning opportunity.

The platform consists of three tightly integrated components:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend Web App** | React + Vite + TypeScript | Dashboard, Learning Hub, Landing Page |
| **Backend API** | FastAPI + Python + SQLite | AI analysis, user management, threat logging |
| **Chrome Extension** | Manifest V3 + JavaScript | Real-time browser threat detection |

---

## ✨ Key Features

### 🔍 Real-Time Threat Detection
- Monitors URLs, emails, and downloads as you browse — silently and without slowing you down
- Powered by a **Llama 3-based AI engine** for accurate phishing, malware, and privacy threat detection
- Automatically blocks dangerous pages and redirects to a custom warning screen
- Assigns threat levels: `safe`, `low`, `medium`, `high`, `critical`

### 🧠 Explainable AI Security
- Every detected threat comes with a **3-line, plain-English explanation** written for students
- Uses analogies and simple language so users actually understand the risk
- Shows exactly what checks were performed (URL analysis, domain reputation, content scanning, etc.)
- Provides risk indicators and actionable recommendations

### 📚 Interactive Learning Hub
- Structured cybersecurity lessons covering phishing, password security, privacy, and more
- Lessons are dynamically fetched from the backend API — no hardcoded content
- Students earn **XP points** and **badges** as they complete lessons
- Progress is tracked and displayed on the dashboard

### 📊 Personal Security Dashboard
- Real-time **security score gauge** (0–100) with visual status indicator
- Stats cards showing: Threats Blocked Today, Blocked This Month, Total Pages Protected, Reward Points
- Recent activity feed showing all detected threats with timestamps and AI explanations
- Daily security pro tips to build good habits

### 🗂️ Threat History
- Full log of every threat detected by the extension
- Searchable, filterable threat list with severity badges
- Detailed modal view with AI breakdown, risk indicators, and security checklist
- User feedback system (Accurate / False Alarm) to improve AI models

### 📁 File Scanner
- Upload any file for a manual deep security scan
- Analyzes file metadata, hash, content patterns, and known malware signatures
- Returns: security score, risk indicators, recommendations, file type details
- Supports common file types: documents, images, executables, archives

### ⚙️ Settings & Profile
- Granular protection controls (enable/disable specific threat detection types)
- Pause protection temporarily with a timer
- Notification preferences
- User profile management with editable full name and email
- Change password functionality with current password verification

### 🌗 Dark / Light Theme
- Full **dark and light theme** support across every page
- Theme toggle button in both the landing page navbar and dashboard header
- Theme preference persists across sessions via `next-themes`
- Carefully tuned dark colors using Tailwind's `dark:` modifier for excellent contrast

---

## 🏗️ Project Architecture

```
SafeLearn/
├── frontend/          # React + Vite web application
├── backend/           # FastAPI Python backend
└── extension/         # Chrome extension (Manifest V3)
```

### System Flow

```
User browses web
       ↓
Chrome Extension (content-script.js)
       ↓ intercepts URL
Background Service Worker
       ↓ POST /threats/analyze
FastAPI Backend
       ↓ runs AI detection
Llama 3 / Threat Detector Service
       ↓ returns result
Extension shows warning / allows page
       ↓ logs to database
User sees threat in Dashboard
```

---

## 🖥️ Frontend

**Stack:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion

### Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | `LandingPage` | Public |
| `/auth` | `AuthPage` | Public |
| `/dashboard` | `HomePage` | Protected |
| `/dashboard/threats` | `ThreatHistoryPage` | Protected |
| `/dashboard/learn` | `LearningHubPage` | Protected |
| `/dashboard/learn/:lessonId` | `LessonDetail` | Protected |
| `/dashboard/settings` | `SettingsPage` | Protected |
| `/dashboard/profile` | `ProfilePage` | Protected |
| `/scan` | `ManualScan` | Protected |

### Landing Page Sections
1. **Navbar** — Responsive navigation with theme toggle
2. **HeroSection** — Animated hero with CTA buttons
3. **ProblemSection** — Why student cybersecurity matters
4. **SolutionSection** — How SafeLearn AI solves it
5. **FeaturesSection** — Feature grid with icons
6. **HowItWorksSection** — 3-step explainer with "For the Tech Curious" collapsible
7. **TrustSection** — Privacy promise and architecture overview
8. **TestimonialsSection** — Student reviews + stats
9. **CTASection** — Final call to action + school licensing
10. **Footer** — Links and info

### Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## ⚙️ Backend

**Stack:** FastAPI, Python, SQLite, SQLAlchemy, Alembic, JWT Auth, Uvicorn

### API Endpoints

| Router | Prefix | Description |
|--------|--------|-------------|
| `auth.py` | `/auth` | Register, login, profile fetch (`/auth/me`) |
| `threats.py` | `/threats` | Analyze URL, log threat, fetch history |
| `dashboard.py` | `/dashboard` | Stats, recent activity feed |
| `scan.py` | `/scan` | Upload file, get security report |
| `learning.py` | `/learning` | Lessons, progress, XP, badges |
| `settings.py` | `/settings` | Get/update user protection preferences |

### AI Services

| Service | File | Purpose |
|---------|------|---------|
| Threat Detector | `threat_detector.py` | URL/content phishing & malware analysis |
| File Scanner | `file_scanner.py` | Deep file content and metadata analysis |
| AI Service | `ai_service.py` | Llama 3-powered natural language explanations |

### Database Models

- **User** — Authentication, profile, points, badges, protection settings
- **ThreatLog** — Detected threat records with AI explanation, risk indicators, checks performed
- **FileScan** — File upload scan results
- **Feedback** — User feedback on threat detections
- **LessonProgress** — Tracks which lessons a user has completed

### Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib alembic python-dotenv

# Configure environment variables
cp .env.example .env
# Edit .env with your SECRET_KEY and other settings

# Run the server
python run.py
```

The API runs at `http://localhost:8000`.  
Interactive API docs: `http://localhost:8000/docs`

### Environment Variables (`.env`)

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./safelearn_v2.db
ACCESS_TOKEN_EXPIRE_MINUTES=10080
APP_NAME=SafeLearn AI
ALLOWED_ORIGINS=http://localhost:5173,chrome-extension://...
```

---

## 🔌 Chrome Extension

**Manifest Version:** 3  
**Permissions:** `activeTab`, `tabs`, `storage`, `scripting`, `webRequest`, `webNavigation`, `alarms`, `notifications`

### Components

| File | Role |
|------|------|
| `service-worker.js` | Background service worker — intercepts navigations, calls backend |
| `content-script.js` | Injected into every page — synchronizes auth session from web app |
| `popup.html / popup.js` | Extension popup UI — shows current user status and stats |
| `blocked.html` | Custom threat warning page shown when a URL is blocked |
| `api.js` | Shared utility for calling the SafeLearn backend API |

### How It Works

1. **Session Sync:** The content script detects when a user is logged in to the SafeLearn web app and copies the JWT token to extension storage so the extension can make authenticated API calls.
2. **URL Interception:** The service worker listens to all web navigations and sends URLs to the backend for analysis.
3. **Block or Allow:** If a threat is detected above a set threshold, the tab is redirected to `blocked.html` with threat details.
4. **Silent Logging:** Even allowed URLs with low-level threats are silently logged to the database for the user's review in the dashboard.

### Installation (Development)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Log in to the SafeLearn web app to sync your session

---

## 🔐 Security & Privacy

- **Zero data collection** — browsing history is never sold or shared
- **Local-first processing** — threat analysis happens on-device where possible
- **No account required** for basic protection (optional for learning features)
- **Open source** — code is publicly auditable at [github.com/gopi374/SafeLearnAI](https://github.com/gopi374/SafeLearnAI)
- **JWT-based auth** — short-lived tokens, bcrypt password hashing
- **HTTPS enforced** — all API communication is encrypted in production

---

## 🚀 Getting Started (Full Stack)

```bash
# 1. Clone the repository
git clone https://github.com/gopi374/SafeLearnAI.git
cd SafeLearnAI

# 2. Start the backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib alembic python-dotenv
cp .env.example .env
python run.py

# 3. Start the frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Load the Chrome extension
# Open chrome://extensions → Enable Developer Mode → Load Unpacked → select /extension
```

Visit `http://localhost:5173` to see the app.

---

## 👩‍💻 Development Notes

- **API Proxy:** The frontend Vite dev server proxies `/api` requests to `http://localhost:8000` — no CORS headaches during development.
- **Auto-refresh:** The dashboard auto-refreshes every 25 seconds for real-time threat updates without a page reload.
- **Extension ↔ Web Sync:** The content script polls `localStorage` for the `user` key set by the web app and copies the JWT to `chrome.storage.local`.
- **Theme System:** Uses `next-themes` with Tailwind's `dark:` class strategy. The `<html>` element gets a `dark` class toggled on theme change.

---

## 📁 Folder Structure

```
SafeLearn/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # All UI components
│   │   │   │   ├── scan/          # File scanner components
│   │   │   │   ├── ui/            # shadcn/ui base components
│   │   │   │   ├── theme-provider.tsx
│   │   │   │   └── theme-toggle.tsx
│   │   │   ├── routes.tsx         # App routes
│   │   │   └── App.tsx
│   │   ├── api/                   # Axios API clients
│   │   └── styles/                # Global CSS & theme variables
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routers/               # FastAPI route handlers
│   │   ├── services/              # AI and business logic
│   │   ├── models.py              # SQLAlchemy database models
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── security.py            # JWT auth helpers
│   │   ├── database.py            # DB connection and session
│   │   └── main.py                # FastAPI app entry point
│   ├── alembic/                   # Database migrations
│   ├── run.py                     # Server startup script
│   └── requirements.txt
│
└── extension/
    ├── src/
    │   ├── background/            # Service worker
    │   ├── content/               # Content scripts
    │   ├── popup/                 # Extension popup UI
    │   ├── pages/                 # blocked.html
    │   └── utils/                 # Shared API utilities
    ├── icons/                     # Extension icons (16, 48, 128px)
    └── manifest.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Gopi Banjara**  
GitHub: [@gopi374](https://github.com/gopi374)  
Repository: [SafeLearnAI](https://github.com/gopi374/SafeLearnAI)

---

<div align="center">

Made with ❤️ to make the internet safer for students everywhere.

⭐ Star this repo if you find it useful!

</div>
