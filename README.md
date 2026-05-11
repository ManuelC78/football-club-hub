# ⚽ Football Club Hub

> The all-in-one management platform for grassroots and youth football clubs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![CI](https://github.com/ManuelC78/football-club-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/ManuelC78/football-club-hub/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## 🌟 Overview

Football Club Hub is a SaaS platform designed for football club managers, coaches, and administrators at the grassroots, youth, and coaching levels. It streamlines club organisation, training planning, player management, and team communication — all in one place.

## 🚀 Features

- **Club Management** — Member registration, roles, and permissions
- **Training Planner** — Session builder with drills, formations, and notes
- **Squad Manager** — Player profiles, attendance, and performance tracking
- **Team Communication** — Announcements, chat, and notifications
- **Fixtures & Results** — Schedule management and result logging
- **Parent Portal** — Consent forms, payments, and updates for parents
- **Reports & Analytics** — Club-level insights and player progress

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React / Next.js |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| Auth | JWT / OAuth2 |
| Hosting | Vercel / AWS |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
football-club-hub/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── api/         # API client functions
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── server/              # Backend API
│   ├── routes/          # API route handlers
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── middleware/       # Auth, validation, logging
│   └── utils/           # Helper functions
├── docs/                # Documentation
├── tests/               # Unit & integration tests
└── .github/             # GitHub Actions & templates
```

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/ManuelC78/football-club-hub.git
cd football-club-hub

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

## 🌿 Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `release/*` | Release preparation |
| `hotfix/*` | Emergency production fixes |

## 📋 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat:` · `fix:` · `docs:` · `style:` · `refactor:` · `test:` · `chore:`

## 📄 License

MIT © [Football Club Hub](https://github.com/ManuelC78/football-club-hub)

---

Built with ❤️ for the grassroots football community.
