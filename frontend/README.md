# 🛡️ SafeLearn AI: Explainable Cybersecurity for Students

[![Hackathon](https://img.shields.io/badge/Hackathon-Smart%20Cyber%20Security-blue)](https://example.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev)

> **Cybersecurity that teaches, not just blocks.**  
> SafeLearn AI is an AI-driven browser extension and dashboard that protects students from phishing and data misuse while explaining threats in plain English. We turn security alerts into micro-learning moments.

---

## 📖 Table of Contents
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Team](#-team)
- [License](#-license)

---

## 🚨 The Problem
As digital learning expands, students are prime targets for phishing, malware, and data misuse. However, existing cybersecurity tools are:
1.  **Too Complex:** Opaque dashboards designed for IT admins, not learners.
2.  **Too Silent:** They block threats without explaining *why*, leaving users confused.
3.  **Trust-Deficient:** Users don't know what data is being collected or how it's used.

## 💡 The Solution
**SafeLearn AI** bridges the gap between protection and education. We use Explainable AI (XAI) to detect threats in real-time and generate plain-English explanations. Instead of a scary red screen, students get a friendly mentor that says: *"Wait! This link looks like your school portal, but the address is actually `fake-school.com`."*

---

## ✨ Key Features

| Feature | Description | Impact |
| :--- | :--- | :--- |
| **🗣️ Plain-English Explanations** | LLM-powered summaries of why a link is dangerous. | Builds cyber literacy, not just fear. |
| **🔐 Privacy Nutrition Labels** | Real-time privacy scores for EdTech apps. | Empowers students to protect their data. |
| **🎓 Gamified Dashboard** | Security scores, badges, and learning streaks. | Makes security engaging and positive. |
| **🤝 Trust Feedback Loop** | Users can report false positives to improve AI. | Builds trust and reduces alert fatigue. |
| **🔒 Privacy-First Architecture** | Local analysis where possible; zero data selling. | Aligns with student privacy laws (FERPA/COPPA). |

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend (Dashboard)** | React.js + Tailwind CSS | User-friendly student dashboard & landing page. |
| **Browser Extension** | Vanilla JS + React (Popup) | Real-time threat interception & UI overlay. |
| **Backend API** | Python (FastAPI) | Handles threat analysis & data logging |
| **AI / LLM** | Groq API (Llama 3 70B) | Generates explainable security insights. |
| **Threat Detection** | Scikit-Learn + Heuristics | URL analysis & phishing pattern matching. |
| **Database** | Firebase / SQLite | Stores user profiles & threat logs. |
| **Deployment** | Vercel (Frontend) + Railway (Backend) | Fast, scalable hosting. |

---

## 🏗️ Architecture

```mermaid
graph TD
    Student[Student Browser] -->|1. Visits URL| Extension[Chrome Extension]
    Extension -->|2. Sends Metadata| Backend[FastAPI Backend]
    Backend -->|3. Analyzes Threat| AI[LLM / ML Model]
    AI -->|4. Returns Explanation| Backend
    Backend -->|5. Saves Log| DB[(Database)]
    Backend -->|6. Sends Alert| Extension
    Extension -->|7. Shows Warning| Student
    Student -->|8. Views History| Dashboard[React Dashboard]
    Dashboard -->|9. Fetches Logs| DB