# Quiz System - Complete Flow

## 🎯 Complete User Journey

### 1. User Registration & Schedule
- **Navigate to**: `/quiz/[id]`
- **Step 1: Register**: User clicks "Register for Quiz"
- **Step 2: Wait for Schedule**: Admin sets the quiz start time
- **Step 3: Waiting Room**:
  - If > 5 mins to start: "Starts in X mins" (Button disabled)
  - If ≤ 5 mins to start: "Enter Lobby" (Button enabled)

### 2. Live Lobby → `/quiz/lobby`
- **Dynamic Countdown**: Timer counts down to the specific start time
- **Visuals**:
  - 🟡 Amber timer: Normal countdown
  - 🔴 Red pulsing timer: Last 10 seconds
- **Participants**: See others joining while waiting
- **Auto-Start**: Redirects to quiz play exactly at start time

### 3. Quiz Play → `/quiz/play`
- **Live Competition**:
  - Left: Real-time leaderboard
  - Center: Question & Options
  - Right: Timers & Stats
- **Scoring**: Points based on speed
- **Flow**: 15s per question → Auto-advance

---

## 🛠️ Admin Features (Simulated)

On the Quiz Detail page, a hidden **Admin Controls** panel allows testing the flow:
- **Set Start +6m**: Simulates a quiz scheduled 6 minutes from now (Test "Waiting" state)
- **Set Start +1m**: Simulates a quiz starting in 1 minute (Test "Lobby Entry" & "Countdown")

---

## 🎮 Quiz Play Features

### Left Sidebar - Dynamic Leaderboard
- 📊 **Real-time rankings**
- 🏆 Top 3 with special icons
- 📈 Live score updates
- ✅ Progress tracker

### Main Area - Questions
- ❓ **Large, readable questions**
- 🔤 **4 multiple choice options**
- ✨ **Visual feedback**: Selected, Correct, Wrong

### Top Right - Quiz Info
- ⏱️ **Individual question timer** (15s)
- 📊 **Questions remaining**

---

## 🚀 Quick Start Guide

1. **Go to Quiz Details**: `http://localhost:3000/quiz/1`
2. **Click "Register for Quiz"**
3. **Use Admin Controls** (bottom of page):
   - Click "Set Start +1m"
4. **Click "Enter Lobby"**
5. **Wait 60s in Lobby**
6. **Play Quiz!**

---

## 💡 Technical Notes

- **Suspense Boundary**: Lobby handles URL search params safely
- **Drift-Proof Timer**: Countdown calculates difference from target time
- **Responsive Design**: Works on mobile & desktop
- **Next.js App Router**: Uses Server Components & Client Hooks
