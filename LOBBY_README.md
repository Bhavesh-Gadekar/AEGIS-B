# Quiz Lobby - Frontend Only

## 🎯 Access the Lobby

Navigate to: **`http://localhost:3000/quiz/lobby`**

Or click "Initialize Session" on any quiz detail page.

## ✨ Features

### 1. **Countdown Timer**
- 60-second countdown (1:00 → 0:00)
- Large circular design with glowing border
- Turns red and pulses when ≤ 10 seconds
- Clock icon animation

### 2. **Participant Bubbles**
- Shows profile bubbles with initials
- 5 different gradient color schemes
- Green online indicator with pulse effect
- Smooth fade-in animations
- Hover scale effect
- Participants auto-join at: 3s, 8s, 15s, 25s

### 3. **Progress Bar**
- Shows quiz start progress (0% → 100%)
- Amber gradient fill
- Percentage indicator

### 4. **Beautiful Design**
- Dark theme (#050505)
- Glassmorphism cards
- Antigravity particle background
- Smooth animations
- Premium shadows and glows

## 🎨 UI Components

```
┌──────────────────────────────────────┐
│          🏆 Quiz Lobby               │
│    Waiting for quiz to start...      │
│                                      │
│         ╭──────────╮                 │
│         │  ⏰ 0:45 │  ← Timer        │
│         ╰──────────╯                 │
│                                      │
│      👥 Participants (5)             │
│                                      │
│  ●SJ  ●AC  ●MP  ●JS  ●CL  ← Bubbles │
│                                      │
│  ▓▓▓▓▓░░░░░░░░░  25%  ← Progress    │
│                                      │
│  ▶ Quiz starts when timer hits zero │
└──────────────────────────────────────┘
```

## 🚀 How It Works

1. **Timer**: Counts down from 60 seconds
2. **Participants**: Auto-join at intervals (demo mode)
3. **Animations**: Smooth transitions and effects
4. **No Backend**: Pure frontend with mock data

## 💡 Mock Data

The page uses simulated participants:
- Sarah Johnson (@sarahj)
- Alex Chen (@alexc)
- Maya Patel (@mayap)
- Jordan Smith (@jsmith)
- Chris Lee (@chrisl)

They join automatically to demonstrate the UI.

## 🎭 What Happens at 0:00

Currently: Timer stops at 0
Future: Would redirect to quiz play page

## 📱 Responsive

Works on all screen sizes:
- Mobile: Single column
- Tablet: Flexible grid
- Desktop: Full layout

Enjoy the lobby! 🎉
