# 🛡️ AEGIS — Intelligent Academic Portfolio & Asset Defense Platform

> *Dive into the art of assets, where innovative blockchain technology meets financial expertise. AEGIS ensures your academic footprint is guarded by intelligence.*

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)
![Three.js](https://img.shields.io/badge/Three.js-3D_Physics-white?style=for-the-badge&logo=three.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📖 Overview

**AEGIS** is a premium, full-stack Next.js application designed to revolutionize the way students, researchers, and professionals manage their academic portfolios and networking. 

By combining immersive **3D physics-based UI elements**, real-time **gamified learning environments**, and powerful **Google Gemini AI integrations**, AEGIS acts as an intelligent career co-pilot and networking hub.

---

## ✨ Core Features

### 🤖 AI-Powered Career Engine
* **Intelligent Resume Builder (`/ai-resume-build`):** Leverages Google Gemini AI to structure academic profiles, optimize experience descriptions, and inject industry-specific keywords for maximum ATS compliance.
* **Resume Analysis (`/resume-analysis`):** Deep-scans existing resumes to provide actionable feedback and scoring.

### 🎮 Real-Time Quiz Architecture
* **Live Lobbies (`/quiz/lobby`):** Features state-driven, drift-proof countdown timers, participant auto-join simulators, and engaging glassmorphic visuals.
* **Gamified Play (`/quiz/play`):** Real-time dynamic leaderboards, timed multiple-choice interfaces, and instant visual feedback.

### 🌌 Immersive 3D Interface
* **Antigravity Interactive Environments:** Built with `@react-three/fiber` and `Three.js` to render performant, interactive particle systems that respond to user themes (Light/Dark mode) and cursors.

### 🔐 Secure Backend & Networking
* **Supabase SSR Authentication:** Robust, Server-Side Rendered authentication loops (`/login`, `/signup`) wrapped in React Suspense boundaries for optimal performance.
* **Academic Feeds & Profiles:** Create posts, track career roadmaps (`/roadmaps`), build networks (`/network`), and manage custom portfolios.
* **Role-Based Access Control:** Dedicated administrative dashboard (`/admin`) for managing users, quizzes, events, and bans.

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Framework:** Next.js 16 (App Router, Turbopack, Server Actions)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (v4), PostCSS
* **Components:** Lucide React (Icons), Custom Glassmorphism UI
* **3D Rendering:** Three.js, React Three Fiber (`@react-three/fiber`)

### Backend & AI Infrastructure
* **Database & Auth:** Supabase (PostgreSQL, Supabase SSR client)
* **AI Engine:** Google Generative AI (`@google/generative-ai` - Gemini 2.5 Flash/Pro)
* **Data Fetching:** React Suspense, Next.js Server Components

---

## 📂 Project Structure

```text
aegis/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin dashboard, bans, events, roadmaps
│   │   ├── ai-resume-build/  # Gemini AI Resume Generator
│   │   ├── api/              # API Routes (Backfill, Auth Callbacks)
│   │   ├── feed/             # Social Feed & Timeline
│   │   ├── login/            # Suspense-wrapped Auth Pages
│   │   ├── profile/          # User Portfolios
│   │   ├── quiz/             # Live Lobbies & Quiz Engine
│   │   └── roadmaps/         # Interactive Career Tracks
│   ├── components/           # Reusable UI (AppProvider, Antigravity)
│   └── actions/              # Next.js Server Actions (Auth, DB logic)
