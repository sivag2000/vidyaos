# VidyaOS — Production Setup Guide

## Project Structure

```
education app/
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Node.js + Express + TypeScript + Prisma
├── index.html         # (Legacy prototype — kept for reference)
├── app.js             # (Legacy prototype)
└── mockData.js        # (Legacy prototype)
```

## 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally (or use a cloud DB like Supabase/Railway)

## 2. Backend Setup

```bash
cd backend

# Copy env file
cp .env.example .env
# Edit .env — set your DATABASE_URL and JWT_SECRET

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create the database tables
npm run db:migrate

# Seed with sample data (student/teacher/parent accounts)
npm run db:seed

# Start dev server (http://localhost:4000)
npm run dev
```

## 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

## 4. Dev Login Credentials

All use password: `Test@1234`

| Role    | Email                              |
|---------|------------------------------------|
| Student | rohan@vidyaos.edu.in               |
| Teacher | sharma.teacher@vidyaos.edu.in      |
| Parent  | parent@vidyaos.edu.in              |

## 5. Adding Real AI (Gemini API)

1. Get a free API key from https://aistudio.google.com/app/apikey
2. Add to `backend/.env`: `GEMINI_API_KEY=your-key-here`
3. That's it — the server auto-detects the key and switches from mock to real Gemini responses

## 6. API Endpoints

| Method | Path                         | Auth    | Description                  |
|--------|------------------------------|---------|------------------------------|
| POST   | /api/auth/register           | None    | Register new user            |
| POST   | /api/auth/login              | None    | Login                        |
| GET    | /api/auth/me                 | Bearer  | Get current user profile     |
| GET    | /api/student/profile         | Student | Full student data            |
| GET    | /api/student/tasks           | Student | Today's daily tasks          |
| PATCH  | /api/student/tasks/:id       | Student | Complete/uncomplete task     |
| GET    | /api/student/announcements   | Student | All announcements            |
| POST   | /api/tests/submit            | Student | Submit test result           |
| GET    | /api/tests/history           | Student | Test history                 |
| POST   | /api/ai/tutor                | Any     | AI tutor response            |
| POST   | /api/ai/doubt                | Any     | Solve a doubt                |
| POST   | /api/ai/generate-questions   | Any     | Generate CBSE questions      |
| GET    | /api/teacher/dashboard       | Teacher | Teacher dashboard data       |
| POST   | /api/teacher/homework        | Teacher | Create & assign homework     |
| POST   | /api/teacher/announcement    | Teacher | Broadcast announcement       |
| GET    | /api/parent/children         | Parent  | Children's progress data     |
