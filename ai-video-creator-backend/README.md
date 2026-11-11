# AI Video Creator Backend

Production-ready **Node.js + Express + PostgreSQL (Sequelize)** backend for an AI video creation platform, with **JWT authentication**, **interactive Swagger documentation**, Pexels stock video search, optional ElevenLabs voiceover generation, and FFmpeg video exports.

Built to be consumed by a separate **React + TypeScript** frontend over predictable JSON REST endpoints.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [PostgreSQL Setup](#postgresql-setup)
6. [Configuration (.env)](#configuration-env)
7. [Install & Run](#install--run)
8. [Verification Script](#verification-script)
9. [API Overview](#api-overview)
10. [Response Formats](#response-formats)
11. [Authentication Flow](#authentication-flow)
12. [React Integration Examples](#react-integration-examples)
13. [Optional Integrations (Pexels / ElevenLabs / FFmpeg)](#optional-integrations)
14. [Postman Collection](#postman-collection)
15. [Security Notes](#security-notes)
16. [Troubleshooting](#troubleshooting)

---

## Features

- Register / login with email + password (bcrypt hashing, JWT Bearer auth)
- Current-user profile endpoint
- Full project CRUD with pagination, ownership enforced in the service layer
- Stock video search by topic via the **Pexels API** (key stays server-side; flagged mock data when the key is missing)
- Attach / list / remove videos on projects
- Voiceover text management; optional **ElevenLabs** audio generation with graceful degradation
- Caption CRUD with optional timings (validated time ranges)
- **FFmpeg** video exports: downloads selected videos, normalizes + concatenates them, mixes the voiceover audio, burns timed captions, and verifies the output file before reporting success
- Export status polling with a valid output URL once completed
- Centralized error handling, request validation, Helmet, CORS, rate limiting
- Complete interactive Swagger documentation at `/api-docs`

> Instagram publishing is intentionally **not** implemented - it is optional and must not block the MVP. No fake publishing endpoints exist.

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Runtime    | Node.js >= 18 (ES Modules)                        |
| Framework  | Express.js 4                                      |
| Database   | PostgreSQL                                        |
| ORM        | Sequelize 6 (`pg` driver)                         |
| Auth       | jsonwebtoken + bcryptjs                           |
| Validation | express-validator                                 |
| Docs       | swagger-jsdoc + swagger-ui-express (OpenAPI 3.0.3)|
| Security   | helmet, cors, express-rate-limit                  |
| Media      | FFmpeg (system binary), Pexels API, ElevenLabs API|

## Project Structure

```
ai-video-creator-backend/
├── package.json
├── .env.example              # copy to .env and adjust
├── .gitignore
├── README.md
├── postman/
│   └── collection.json       # Postman collection with auth flow
├── scripts/
│   └── check.js              # npm run check - real verification
├── uploads/                  # generated media (voiceovers, exports, tmp)
│   ├── exports/.gitkeep
│   ├── tmp/.gitkeep
│   └── voiceovers/.gitkeep
└── src/
    ├── app.js                # Express app factory (middleware, swagger, routes)
    ├── server.js             # entry: env check -> DB verify -> sync -> listen
    ├── config/
    │   ├── database.js       # Sequelize instance from env
    │   └── swagger.js        # OpenAPI definition + reusable schemas
    ├── constants/
    │   └── errorMessages.js  # single source of error message strings
    ├── models/               # User, Project, Video, Voiceover, Caption, Export
    ├── routes/               # route definitions + @openapi annotations
    ├── controllers/          # HTTP layer (thin)
    ├── services/             # business logic + ownership checks
    ├── middleware/           # auth, error, notFound, asyncHandler
    ├── validators/           # express-validator chains
    └── utils/                # AppError, generateToken, storage helpers
```

## Prerequisites

- **Node.js 18+** (Node 20+ recommended) - `node -v`
- **PostgreSQL 14+** running locally (or reachable via `DATABASE_URL`)
- **FFmpeg** (optional, only for video exports) - `ffmpeg -version`
- A **Pexels API key** (optional, only for real stock search) - free at <https://www.pexels.com/api/>
- An **ElevenLabs API key** (optional, only for voiceover audio) - <https://elevenlabs.io/>

## PostgreSQL Setup

Create a database and a password for the local `postgres` user:

```bash
# Debian/Ubuntu (if PostgreSQL is not installed yet)
sudo apt update && sudo apt install -y postgresql

# Start the service (Debian/Ubuntu)
sudo service postgresql start        # or: sudo systemctl start postgresql

# Create the database (choose one method)
createdb ai_video_creator            # method A: createdb CLI
psql -U postgres -c "CREATE DATABASE ai_video_creator;"   # method B: SQL
```

macOS (Homebrew):

```bash
brew install postgresql@16 && brew services start postgresql@16
createdb ai_video_creator
```

Docker (alternative):

```bash
docker run --name ai-video-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_video_creator -p 5432:5432 -d postgres:16
```

Set the matching credentials in `.env` (next section). Tables are created automatically on first start via `sequelize.sync({ alter: true })` - no manual migration needed for the local MVP.

## Configuration (.env)

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable                | Required | Description                                                                 |
| ----------------------- | -------- | --------------------------------------------------------------------------- |
| `NODE_ENV`              | yes      | `development` or `production`                                                |
| `PORT`                  | yes      | HTTP port (default `5000`)                                                   |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | yes | PostgreSQL connection (or use `DATABASE_URL`) |
| `DATABASE_URL`          | optional | Full connection string, overrides the `DB_*` variables                       |
| `JWT_SECRET`            | yes      | Long random string. **Required in production** - the server refuses to start without it. |
| `JWT_EXPIRES_IN`        | optional | Token lifetime (default `7d`)                                                |
| `BCRYPT_ROUNDS`         | optional | bcrypt cost factor (default `10`)                                            |
| `CLIENT_URL`            | recommended | Comma-separated allowed origins for CORS, e.g. `http://localhost:3000`    |
| `PEXELS_API_KEY`        | optional | Pexels key; when empty, `/api/videos/search` returns flagged mock data       |
| `ELEVENLABS_API_KEY`    | optional | ElevenLabs key; when empty, audio generation returns 503 with guidance       |
| `ELEVENLABS_VOICE_ID`   | optional | Voice to use (defaults to ElevenLabs "Rachel")                               |
| `UPLOAD_DIR`            | optional | Directory for generated media (default `uploads`)                            |

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Install & Run

```bash
npm install
npm run dev        # development with auto-reload (node --watch)
# or
npm start          # plain node
```

On success you will see:

```
[boot] PostgreSQL connection established
[boot] Models synchronized (sequelize.sync({ alter: true }))
[boot] AI Video Creator API listening on http://localhost:5000
[boot] Swagger UI:  http://localhost:5000/api-docs
[boot] OpenAPI JSON: http://localhost:5000/api-docs.json
```

- **API base URL:** <http://localhost:5000>
- **Swagger UI:** <http://localhost:5000/api-docs>
- **OpenAPI JSON:** <http://localhost:5000/api-docs.json>
- **Health check:** <http://localhost:5000/api/health>

## Verification Script

```bash
npm run check
```

Runs real checks (no database required): `node --check` syntax validation of every source file, an import smoke test of the models + full app graph, and OpenAPI spec generation (expects 15+ documented paths). Exits non-zero on failure.

## API Overview

| Method | Path                                              | Auth | Description                          |
| ------ | ------------------------------------------------- | ---- | ------------------------------------ |
| POST   | `/api/auth/register`                              | -    | Register, returns user + JWT         |
| POST   | `/api/auth/login`                                 | -    | Login, returns user + JWT            |
| GET    | `/api/auth/me`                                    | JWT  | Current user profile                 |
| POST   | `/api/projects`                                   | JWT  | Create project                       |
| GET    | `/api/projects?page=&limit=`                      | JWT  | List projects (paginated)            |
| GET    | `/api/projects/:id?include=videos,captions,...`   | JWT  | Project detail (optional includes)   |
| PATCH  | `/api/projects/:id`                               | JWT  | Update project                       |
| DELETE | `/api/projects/:id`                               | JWT  | Delete project (cascades children)   |
| GET    | `/api/videos/search?query=nature&page=1`          | JWT  | Pexels stock search (or mock data)   |
| POST   | `/api/projects/:projectId/videos`                 | JWT  | Attach a video to a project          |
| GET    | `/api/projects/:projectId/videos`                 | JWT  | List project videos                  |
| DELETE | `/api/projects/:projectId/videos/:videoId`        | JWT  | Remove a video                       |
| POST   | `/api/projects/:projectId/voiceovers`             | JWT  | Save voiceover text                  |
| GET    | `/api/projects/:projectId/voiceovers`             | JWT  | List voiceovers                      |
| POST   | `/api/projects/:projectId/voiceovers/:id/generate`| JWT  | Generate MP3 audio (ElevenLabs, optional) |
| DELETE | `/api/projects/:projectId/voiceovers/:id`         | JWT  | Delete voiceover                     |
| POST   | `/api/projects/:projectId/captions`               | JWT  | Create caption                       |
| GET    | `/api/projects/:projectId/captions`               | JWT  | List captions                        |
| PATCH  | `/api/projects/:projectId/captions/:captionId`    | JWT  | Update caption                       |
| DELETE | `/api/projects/:projectId/captions/:captionId`    | JWT  | Delete caption                       |
| POST   | `/api/projects/:projectId/exports`                | JWT  | Start FFmpeg export (503 if missing) |
| GET    | `/api/projects/:projectId/exports`                | JWT  | List exports                         |
| GET    | `/api/projects/:projectId/exports/:exportId`      | JWT  | Poll export status / output URL      |
| GET    | `/api/health`                                     | -    | Health + database status             |

## Response Formats

Success:

```json
{ "success": true, "data": { } }
```

Lists additionally include pagination:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
  }
}
```

Errors (never HTML, no stack traces in production):

```json
{ "success": false, "statusCode": 400, "message": "A useful error message" }
```

Validation errors add a consistent `errors` array:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed. Please check the errors field for details.",
  "errors": [{ "field": "email", "message": "Email must be a valid email address." }]
}
```

All timestamps are ISO 8601 UTC strings. Password hashes are never returned.

## Authentication Flow

1. `POST /api/auth/register` or `POST /api/auth/login` -> receive `{ user, token }`
2. Store the JWT on the client (memory / localStorage)
3. Send `Authorization: Bearer <token>` on every authenticated request
4. Swagger UI: click **Authorize**, paste the token, and try endpoints directly

Invalid login attempts always return the same generic `Invalid email or password` message (no account enumeration).

## React Integration Examples

Plain `fetch` examples for a React + TypeScript app:

```typescript
const API = 'http://localhost:5000';

// ---- Register ----
async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  localStorage.setItem('token', json.data.token);
  return json.data.user;
}

// ---- Login ----
async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message); // "Invalid email or password"
  localStorage.setItem('token', json.data.token);
  return json.data.user;
}

// ---- Authenticated request: current user ----
async function fetchMe() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (res.status === 401) {
    // token missing/expired -> redirect to login
  }
  return json.data.user;
}

// ---- Create a project ----
async function createProject(title: string, topic: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, topic }),
  });
  const json = await res.json();
  return json.data.project;
}

// ---- Search stock videos (Pexels behind the backend) ----
async function searchVideos(query: string, page = 1) {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `${API}/api/videos/search?query=${encodeURIComponent(query)}&page=${page}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const json = await res.json();
  // json.data.mock === true means development mock data (no PEXELS_API_KEY set)
  return json.data.videos;
}
```

CORS: add your dev origin to `CLIENT_URL` in `.env` (e.g. `CLIENT_URL=http://localhost:3000`) so the browser can call the API from the React app.

## Optional Integrations

### Pexels (stock video search)

- Get a free key at <https://www.pexels.com/api/> and set `PEXELS_API_KEY` in `.env`.
- **Without a key** the endpoint still works and returns clearly-flagged development mock data (`mock: true`, plus an explanatory `message`) so frontend development is not blocked.
- The key is only used server-side and is never exposed to the frontend.

### ElevenLabs (voiceover audio)

- Set `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_VOICE_ID`) in `.env`.
- **Without a key** saving voiceover text works normally; only the `generate` endpoint responds with `503` and setup guidance - it never corrupts stored text.
- With a key, generated MP3 files are stored in `uploads/voiceovers` and served at `/uploads/voiceovers/<file>.mp3`.

### FFmpeg (video export)

- Install once: `sudo apt install ffmpeg` (Debian/Ubuntu) or `brew install ffmpeg` (macOS); verify with `ffmpeg -version`.
- **Without FFmpeg** the export endpoint responds `503` with a clear explanation of what must be installed - no fake success.
- With FFmpeg: `POST /api/projects/:projectId/exports` starts a background job (download -> normalize/concat 1280x720@30fps -> mix voiceover -> burn captions) and `GET .../exports/:exportId` reports `queued | processing | completed | failed`. `outputUrl` is only set after the output file was verified on disk.

## Postman Collection

Import `postman/collection.json` into Postman. It contains:

- A `baseUrl` collection variable (default `http://localhost:5000`)
- Register + Login requests whose test scripts automatically store the returned token in the `token` collection variable
- Example bodies for every endpoint, wired to use `{{token}}` and `{{projectId}}` automatically

## Security Notes

- Passwords hashed with bcrypt (configurable rounds)
- JWTs carry only the user id; no client-assignable roles/privileges
- Ownership checks in the service layer; other users' projects return 404 (no existence leak)
- Generic login error message (no account enumeration)
- Helmet security headers, CORS allow-list, API rate limiting (300 req / 15 min)
- All FFmpeg invocations use argv arrays (no shell), paths are server-generated, URLs are protocol-validated; user input never reaches a shell command
- No stack traces or secrets in responses; `.env` is git-ignored and absent from the ZIP
- `sequelize.sync({ alter: true })` only in development - never `force: true`

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `Unable to connect to PostgreSQL` | Ensure PostgreSQL is running and `DB_*` values in `.env` are correct; create the DB with `createdb ai_video_creator`. |
| `swagger-ui` assets blocked by Helmet | This setup already sets `crossOriginResourcePolicy: cross-origin`; do not remove it. |
| `/api/videos/search` returns `mock: true` | Expected without `PEXELS_API_KEY`; add a key and restart. |
| Export returns 503 | Install FFmpeg and restart the server. |
| Export `failed` with `No videos are attached...` | Attach at least one video to the project first. |
| Voiceover generate returns 503 | Expected without `ELEVENLABS_API_KEY`; add a key to enable audio. |
| CORS error in the browser | Add the frontend origin to `CLIENT_URL` in `.env` and restart. |
| 401 on every request | Missing/expired token; log in again and send `Authorization: Bearer <token>`. |

### Profile settings

Authenticated requests use `Authorization: Bearer <token>`.

- `PATCH /api/auth/me`: JSON `{ "name": "Erik" }` (2–80 characters).
- `PATCH /api/auth/password`: JSON `{ "currentPassword": "old-password", "newPassword": "new-password" }` (8–128 characters, at most 72 UTF-8 bytes). Existing JWTs remain valid until expiry.
- `POST /api/auth/avatar`: multipart form with one file named `avatar`; JPEG, PNG or WebP, at most 5 MB. Returns `data.user.avatarUrl`.
- `DELETE /api/auth/avatar`: removes the image and returns `avatarUrl: null`.

Public users returned by register, login, profile and profile updates include nullable `avatarUrl`. Prefix relative image URLs with the backend origin. Images are stored in `UPLOAD_DIR/avatars`; use persistent upload storage in deployment. Interactive upload and all profile operations are documented at `/api-docs`.

Development startup adds the new column through the existing model sync. For an existing production database, run `node scripts/migrate-profile.js` before starting the updated server. This additive migration only adds the nullable `users.avatarUrl` column and is safe to rerun.

Run profile behavior tests with `node --test tests/profile.test.js` (isolated model stubs; no database required).
