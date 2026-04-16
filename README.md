# SIT725 QR App

QR-based restaurant menu web application for SIT725.

## What This Project Is

Customers scan a QR code and view a restaurant menu. There is no ordering flow.

Tech stack:
- Frontend: HTML, CSS, Materialize CSS, vanilla JavaScript
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose

Architecture:
- Backend uses MVC (`models`, `controllers`, `routes`, `middleware`, `utils`, `config`)
- Frontend is static pages consuming backend REST APIs via `fetch()`

## Repository Structure

- `backend/` API server and database layer
- `frontend/` static pages and UI components
- `docs/` SRS and team documentation

## Quick Start (After Clone)

1. Clone and open project
```bash
git clone <repo-url>
cd SIT725_QR_APP
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create local env file
```bash
cp .env.example .env
```

4. Run backend
```bash
npm run dev
```

5. Open frontend pages with Live Server (or any local static server)
- Start at `frontend/pages/index.html`

## Team Role Handoff

Backend developer:
- Implement MongoDB schemas in `backend/models/`
- Add business logic in `backend/controllers/`
- Wire endpoints in `backend/routes/`
- Keep auth-protected routes behind `backend/middleware/authMiddleware.js`

Frontend developer:
- Build UI in `frontend/pages/` + `frontend/components/`
- Add shared styles/scripts in `frontend/assets/`
- Connect to backend via REST APIs using `fetch()`

QA developer:
- Validate auth, CRUD flows, and QR menu flow
- Track test cases in `docs/diagrams/` or separate QA docs
- Verify regression after each merged feature

## Configuration

This project uses a single local configuration only.

Use one file: `backend/.env` (copy from `.env.example` once).
Required keys:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

## Important Rules

- Do not commit real `.env` values
- Do not use React or frontend frameworks
- Keep backend modular and MVC-aligned
- QR links should map to `menu` by restaurant id

## New Contributor Checklist

- `npm install` completed in `backend/`
- `.env` created from `.env.example`
- Backend starts without crash
- Can access API root route
- Frontend pages open locally

See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) for a role-based startup guide.
