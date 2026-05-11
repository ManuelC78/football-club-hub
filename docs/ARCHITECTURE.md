# Architecture Overview

## System Design

Football Club Hub follows a **client-server architecture** with a RESTful API backend and a React single-page application frontend.

```
┌─────────────────────┐     HTTPS      ┌─────────────────────┐
│   React Frontend    │ ◄────────────► │   Node.js Backend   │
│   (Next.js / SPA)   │                │   (Express API)     │
└─────────────────────┘                └──────────┬──────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │    PostgreSQL DB     │
                                        │   (Primary Data)     │
                                        └─────────────────────┘
```

## Core Modules

### 1. Authentication
- JWT-based stateless auth
- Refresh token rotation
- Role-based access control (Admin, Manager, Coach, Player, Parent)

### 2. Club Management
- Multi-club support (one user can manage multiple clubs)
- Club settings, branding, and permissions
- Member invitation and onboarding

### 3. Training Planner
- Session templates with drills library
- Attendance tracking per session
- PDF export of session plans

### 4. Squad Manager
- Player profiles with photos and stats
- Age group and team assignment
- Availability and injury tracking

### 5. Communication
- In-app announcements
- Email notifications via SendGrid
- Push notifications (future)

### 6. Payments & Subscriptions
- Stripe integration for club subscriptions
- Membership fee collection from players/parents

## Data Flow

1. Client authenticates → receives JWT
2. All API requests carry JWT in `Authorization: Bearer` header
3. Middleware validates token → attaches user context
4. Route handler → Controller → Service → Model → DB
5. Response serialised and returned

## Security Considerations

- All passwords hashed with bcrypt (cost factor 12)
- SQL injection prevention via parameterised queries (ORM)
- Rate limiting on auth endpoints
- CORS restricted to known origins
- Environment secrets never committed to repo
