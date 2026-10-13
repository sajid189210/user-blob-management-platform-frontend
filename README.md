# DraftPad — Blog Management Platform

DraftPad is a full-stack blogging platform where users register, write posts as drafts or published articles, upload cover images, and like posts from other authors. It is built as two independent applications — a REST API backend and an Angular single-page frontend — that live side by side in this project.

The platform targets individual writers and small content communities that need a lightweight, self-hostable blogging tool with authenticated authoring, an image-backed reading feed, and social likes.

> **Project status:** The core feature set (authentication, post CRUD, publishing workflow, likes, search, image uploads) is implemented and has been deployed. It has not undergone a formal security or performance audit and should not be considered production-hardened without review. See [Security](#authentication-and-security) for known limitations.

---

## Table of Contents

- [Key Features](#key-features)
- [Screenshots and Demo](#screenshots-and-demo)
- [Technology Stack](#technology-stack)
- [Architecture and Project Structure](#architecture-and-project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Local Setup](#installation-and-local-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Authentication and Security](#authentication-and-security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

---

## Key Features

### Authentication
- Email and password registration and login.
- JWT-based sessions: a short-lived access token returned in the response body and a long-lived refresh token stored in an httpOnly cookie.
- Transparent access-token refresh on the client when a request returns `401`.
- Route protection through an authentication guard and a guest guard that redirects logged-in users away from login/signup.

### Posts
- Create, edit, and delete posts with a title, body, cover image, tags, and status (`draft` or `published`).
- Separate "My Posts" view with published and draft tabs.
- Cover images uploaded to Cloudinary (JPEG, PNG, WebP, GIF; maximum 5 MB), with client-side type and size validation.
- Post detail page showing tags, author, date, like count, and owner-only edit/delete controls.

### Discovery and engagement
- Public feed of published posts, newest first.
- Keyword search across post titles, bodies, and tags.
- Likes: toggle like/unlike, a "Liked Posts" view, and like counts. Authors cannot like their own posts.

### Developer experience
- Layered backend architecture (routes → controllers → services → repositories) with dependency-injection containers and interface-based contracts.
- Request validation with Zod, centralized error handling, and consistent JSON response envelopes.
- Angular standalone components with NgRx-managed auth state, HTTP interceptors, and toast notifications.

---

## Screenshots and Demo

No screenshots or demo GIFs are currently committed to this repository. Add them here using relative paths once available, for example:

```markdown
![Home feed](./docs/screenshots/home.png)
```

**Configured deployment URLs** (present in application configuration, not independently verified here):

| Application | URL |
| --- | --- |
| Frontend | `https://blog.msajid.space` |
| API | `https://api.blog.msajid.space/api` |

> TODO: Replace this section with real screenshots and confirm the live URLs are still active.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
| --- | --- | --- |
| Angular | ^20.3 | SPA framework (standalone components, zoneless change detection) |
| NgRx Store | ^20.1 | Auth state management |
| NgRx Store Devtools | ^20.1 | State debugging (dev only) |
| RxJS | ~7.8 | Reactive HTTP and state streams |
| ngx-toastr | ^19.1 | Toast notifications |
| Tailwind CSS | CDN | Utility-first styling (loaded from `cdn.tailwindcss.com`) |
| Font Awesome | 6.5.1 (CDN) | Icons |

### Backend
| Technology | Version | Purpose |
| --- | --- | --- |
| Node.js | 20 LTS (CI) | Runtime |
| Express | ^5.2 | HTTP server and routing |
| TypeScript | ^6.0 | Typed source, compiled with `tsc` |
| ts-node-dev | ^2.0 | Local development runner |
| Zod | ^4.4 | Request payload validation |

### Database and data access
| Technology | Version | Purpose |
| --- | --- | --- |
| MongoDB | — | Document database |
| Mongoose | ^9.7 | ODM, schemas, and models |

### Authentication and security
| Technology | Version | Purpose |
| --- | --- | --- |
| jsonwebtoken | ^9.0 | Access and refresh token signing/verification |
| bcrypt | ^6.0 | Password hashing |
| helmet | ^8.2 | HTTP security headers |
| cors | ^2.8 | Cross-origin resource sharing allowlist |
| cookie-parser | ^1.4 | Refresh-token cookie parsing |
| multer | ^2.2 | Multipart image upload parsing |

### External integrations
| Service | Purpose |
| --- | --- |
| Cloudinary | Image hosting and deletion for post cover images |

### Testing and development tools
| Tool | Applies to | Purpose |
| --- | --- | --- |
| ESLint 10 + typescript-eslint | Both | Linting |
| eslint-plugin-security | Backend | Security-focused lint rules |
| Angular ESLint 22 | Frontend | Angular-specific lint rules |
| Karma + Jasmine | Frontend | Unit testing |
| Morgan | Backend | HTTP request logging |
| dotenv | Backend | Environment variable loading |

### Deployment and infrastructure
| Tool | Purpose |
| --- | --- |
| GitHub Actions | CI (lint + build) for the backend |
| Render | Backend hosting, triggered via a deploy hook |

---

## Architecture and Project Structure

DraftPad is composed of two separately versioned applications:

- A **stateless REST API** (`backend/`) that owns all business logic, persistence, authentication, and image storage. It is structured in layers: routes delegate to controllers, controllers to services, and services to repositories that wrap Mongoose models. Wiring is centralized in per-module *containers*, so concrete implementations (repositories, token service, upload service) are injected rather than imported directly.
- An **Angular SPA** (`frontend/`) that consumes the API over HTTP. Authentication state lives in an NgRx store; an auth interceptor attaches the access token to outgoing requests, and an error interceptor performs a one-time token refresh and request retry on `401`.

The two folders contain **separate git repositories** and are not linked by a workspace file. Some setup steps therefore need to be run independently in each.

```mermaid
flowchart LR
    U[Browser] -->|HTTPS| SPA[Angular SPA]
    SPA -->|REST /api + Bearer JWT| API[Express API]
    API -->|Mongoose| DB[(MongoDB)]
    API -->|Upload / delete| CL[Cloudinary]
    SPA -.->|refresh_token httpOnly cookie| API
```

### Directory tree

```text
user-blog-management-platform/
├── backend/                        # REST API (separate git repo)
│   ├── .github/workflows/
│   │   └── deploy.yml              # CI: pnpm install → lint → build → Render hook
│   ├── src/
│   │   ├── index.ts                # Bootstrap: load env, connect DB, listen
│   │   ├── app.ts                  # Express app: middleware, CORS, routers, errors
│   │   ├── core/
│   │   │   ├── configs/            # database.ts, cloudinary.ts
│   │   │   ├── containers/         # Dependency wiring per module (auth, post)
│   │   │   ├── domain/
│   │   │   │   ├── constants/      # Route paths, error messages
│   │   │   │   ├── dto/            # Zod schemas (auth.dto.ts, post.dto.ts)
│   │   │   │   ├── interface/      # Domain interfaces
│   │   │   │   └── mappers/        # Document → response mappers
│   │   │   ├── enums/              # HTTP status codes
│   │   │   ├── errors/             # AppError
│   │   │   ├── infrastructure/     # Mongoose schemas (user, post)
│   │   │   ├── middleware/         # auth, validate, upload, error
│   │   │   └── services/           # token, cloudinary upload (interfaces + impl)
│   │   ├── modules/
│   │   │   ├── auth/               # routes, controller, service
│   │   │   └── posts/              # routes, controller, service
│   │   └── repositories/
│   │       ├── implementations/    # base, user, post repositories
│   │       └── interfaces/         # repository contracts
│   ├── eslint.config.mjs
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── tsconfig.json
└── frontend/                       # Angular SPA (separate git repo)
    ├── src/
    │   ├── app/
    │   │   ├── app.config.ts       # Providers: router, store, HTTP, toastr, initializer
    │   │   ├── app.routes.ts       # Route table with guards
    │   │   ├── core/
    │   │   │   ├── guards/         # auth.guard.ts, guest.guard.ts
    │   │   │   ├── interceptors/   # auth.interceptor.ts, error.interceptor.ts
    │   │   │   ├── interface/      # auth.interface.ts, post.interface.ts
    │   │   │   └── service/        # auth, post, notification services
    │   │   ├── module/
    │   │   │   ├── components/     # auth, home, my-posts, liked, post-detail, post-card, post-form-modal, favorites
    │   │   │   └── partials/       # header, footer
    │   │   └── store/auth/         # NgRx actions, reducer, selectors, state
    │   ├── environments/           # environment.ts, environment.prod.ts
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.scss
    ├── angular.json
    ├── eslint.config.js
    ├── package.json
    └── tsconfig*.json
```

> `frontend/src/app/module/components/favorites/` is a component that is not referenced by the router (`app.routes.ts`) and appears to be unused. The "Liked Posts" page is served by the `liked` component.

---

## Prerequisites

### Mandatory
| Requirement | Notes |
| --- | --- |
| Node.js 20 LTS | Backend CI targets Node 20. Angular 20 requires Node `^20.19.0`, `^22.12.0`, or `>=24.0.0`. |
| pnpm 9 | Package manager for the backend (`pnpm-lock.yaml`). |
| npm | Package manager for the frontend (`package-lock.json`). Ships with Node.js. |
| MongoDB | A MongoDB connection string. MongoDB Atlas is used in the current configuration (`mongodb+srv://`). |
| Cloudinary account | Cloud name, API key, and API secret. Required for post image upload/delete. |

### Optional
| Requirement | Notes |
| --- | --- |
| Git | To clone and contribute to the two repositories. |

---

## Installation and Local Setup

The backend and frontend are separate repositories. Clone and configure each one.

### 1. Clone the repositories

```bash
git clone https://github.com/sajid189210/user-blob-management-platform-backend.git backend
git clone https://github.com/sajid189210/user-blob-management-platform-frontend.git frontend
```

### 2. Install dependencies

```bash
# Backend (pnpm)
pnpm install --dir backend

# Frontend (npm)
npm install --prefix frontend
```

Or run each command from inside the respective directory.

### 3. Configure the backend environment

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables)). At minimum you need `MONGO_URL`, the JWT secrets, and the Cloudinary credentials for image uploads to work.

### 4. Prepare the MongoDB database

No migration step is required. Mongoose creates collections on first write, but the database cluster itself (and a database user with network access) must exist beforehand. If you use MongoDB Atlas, create a free cluster and copy its SRV connection string into `MONGO_URL`. This is required because the API refuses to start meaningfully without a database connection.

### 5. Confirm Cloudinary access

Image upload and deletion go through Cloudinary. Set `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, and `CLOUDINARY_SECRET`; otherwise post create/update calls that include an image will fail.

### 6. Start the applications

Run the backend and frontend in separate terminals:

```bash
# Terminal 1 — API on http://localhost:5000
pnpm --dir backend run dev

# Terminal 2 — SPA on http://localhost:4200
npm --prefix frontend start
```

Open `http://localhost:4200`. The frontend's development `apiUrl` is `http://localhost:5000/api`, and the backend's default `ALLOWED_URLS` includes `http://localhost:4200`, so the two connect out of the box.

---

## Environment Variables

All variables below are read by the backend (via `dotenv` in `src/index.ts`). No environment file is currently committed; create `backend/.env` locally. **Never commit real credentials.**

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `PORT` | API port | No (defaults to `5000`) | `5000` |
| `NODE_ENV` | Runtime environment; enables `secure` cookies when `production` | Recommended | `development` |
| `MONGO_URL` | MongoDB connection string | Yes | `mongodb+srv://user:password@cluster0.example.mongodb.net/draftpad` |
| `ALLOWED_URLS` | Comma-separated CORS allowlist of frontend origins | Yes | `http://localhost:4200` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | Yes | `replace-with-a-long-random-string` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | Yes | `replace-with-a-different-long-random-string` |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime | No (defaults to `15m`) | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime | No (defaults to `7d`) | `7d` |
| `CLOUDINARY_NAME` | Cloudinary cloud name | Yes (for uploads) | `your-cloud-name` |
| `CLOUDINARY_KEY` | Cloudinary API key | Yes (for uploads) | `123456789012345` |
| `CLOUDINARY_SECRET` | Cloudinary API secret | Yes (for uploads) | `your-api-secret` |

> **Security note:** The backend falls back to hard-coded default JWT secrets if `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are unset. Always set explicit, high-entropy secrets in every environment. See [Authentication and Security](#authentication-and-security).

### Recommended `backend/.env.example`

There is currently no `.env.example` in the repository. Consider adding one (with placeholder values only) so contributors can copy it:

```dotenv
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb+srv://user:password@cluster0.example.mongodb.net/draftpad
ALLOWED_URLS=http://localhost:4200
JWT_ACCESS_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-a-different-long-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

### Frontend configuration

The frontend does not use environment files at runtime; instead it switches API URLs at build time via Angular `fileReplacements`:

| File | `apiUrl` | Used by |
| --- | --- | --- |
| `frontend/src/environments/environment.ts` | `http://localhost:5000/api` | Development build |
| `frontend/src/environments/environment.prod.ts` | `https://api.blog.msajid.space/api` | Production build |

Change `environment.prod.ts` if you deploy the API elsewhere.

---

## Running the Application

### Backend

| Command | Description |
| --- | --- |
| `pnpm run dev` | Start in watch mode with `ts-node-dev` (auto-restart). |
| `pnpm run build` | Compile TypeScript to `dist/` with `tsc`. |
| `pnpm run start` | Run the compiled output (`node dist/index.js`). Requires a prior build. |
| `pnpm run lint` | Lint `src/` with ESLint. |
| `pnpm run lint:fix` | Lint and auto-fix. |

### Frontend

| Command | Description |
| --- | --- |
| `npm start` | Serve with the Angular dev server at `http://localhost:4200`. |
| `npm run build` | Production build (default configuration) to `dist/`. |
| `npm run watch` | Development build in watch mode. |
| `npm test` | Run unit tests with Karma. |
| `npm run lint` | Lint `src/` with ESLint. |
| `npm run lint:fix` | Lint and auto-fix. |

> There is no database migration command: schema is defined by Mongoose models and collections are created on demand.

---

## API Documentation

Base URL: `/api` (locally `http://localhost:5000/api`). All responses are JSON.

**Success envelope:**

```json
{ "data": {}, "message": "..." }
```

**Error envelope** (produced by the centralized error handler and controllers):

```json
{ "message": "..." }
```

Endpoints marked **Auth** require an `Authorization: Bearer <accessToken>` header.

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | No | Register a new account. |
| `POST` | `/api/auth/login` | No | Authenticate and receive an access token; sets the refresh cookie. |
| `POST` | `/api/auth/refresh-token` | Cookie | Issue a new access token using the `refresh_token` cookie. |
| `POST` | `/api/auth/logout` | No | Clear the refresh-token cookie. |

**`POST /api/auth/signup`** — body: `{ "name": string (min 2), "email": string, "password": string (min 6) }`

- `201` — `{ "data": null, "message": "Account created successfully." }`
- `409` — email already in use
- `400` — validation failure

**`POST /api/auth/login`** — body: `{ "email": string, "password": string }`

- `200` — `{ "data": { "user": { "id", "name", "email" }, "accessToken": "..." }, "message": "Login successful" }` and an httpOnly `refresh_token` cookie
- `401` — invalid email or password

**`POST /api/auth/refresh-token`** — no body; reads the `refresh_token` cookie.

- `200` — `{ "data": { "user": {...}, "accessToken": "..." }, "message": "Token refreshed" }`, rotates the refresh cookie
- `401` — missing or invalid session

**`POST /api/auth/logout`**

- `200` — `{ "data": null, "message": "Logged out successfully" }`

### Posts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/posts/published` | No | List all published posts, newest first. |
| `GET` | `/api/posts/search?q=<query>` | No | Search title, body, and tags among published posts. |
| `GET` | `/api/posts/author/:authorId` | No | List all posts by a given author (includes drafts). |
| `GET` | `/api/posts/:id` | No | Fetch a single post by ID. |
| `GET` | `/api/posts/liked` | Yes | List posts the authenticated user has liked. |
| `GET` | `/api/posts/liked/ids` | Yes | List IDs of posts the authenticated user has liked. |
| `POST` | `/api/posts` | Yes | Create a post (`multipart/form-data`). |
| `PATCH` | `/api/posts/:id` | Yes | Partially update a post (`multipart/form-data`). |
| `DELETE` | `/api/posts/:id` | Yes | Delete a post and its Cloudinary image. |
| `POST` | `/api/posts/:id/like` | Yes | Toggle like/unlike for the authenticated user. |

**Post object (response shape):**

```json
{
  "id": "665f...",
  "title": "Hello world",
  "body": "Post content...",
  "imageUrl": "https://res.cloudinary.com/.../image.jpg",
  "tags": ["angular", "blog"],
  "status": "published",
  "author": "665e...",
  "authorEmail": "author@example.com",
  "authorName": "Author Name",
  "likes": 3,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**`POST /api/posts`** — `multipart/form-data`:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | text | Yes | |
| `body` | text | Yes | |
| `image` | file | Yes | JPEG, PNG, WebP, or GIF; max 5 MB |
| `tags` | text | No | Comma-separated; stored as a string array |
| `status` | text | No | `draft` or `published` (defaults to `draft`) |

- `201` — created post
- `400` — missing image or validation failure
- `401` — not authenticated

**`PATCH /api/posts/:id`** — same fields as create, all optional, `image` optional (replaces the existing image when provided).

- `200` — updated post
- `404` — post not found

**`DELETE /api/posts/:id`**

- `200` — deletes the post and its Cloudinary asset
- `404` — post not found

**`POST /api/posts/:id/like`**

- `200` — `{ "data": { "liked": true, "likedIds": ["..."], "likes": 4 }, "message": "Like toggled successfully" }`

**Common status codes:** `200`, `201`, `400` (bad request/validation), `401` (unauthenticated/invalid token), `404` (not found), `409` (conflict), `500` (server error).

> There is no OpenAPI/Swagger specification in the repository. The tables above are derived from the route definitions and controllers.

---

## Database Design

**Database:** MongoDB, accessed through Mongoose. Two collections are defined.

### `User`

| Field | Type | Constraints |
| --- | --- | --- |
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercased, email regex, trimmed |
| `password` | String | required, min length 4, `select: false` (excluded by default) |
| `liked` | ObjectId[] → `Post` | array of liked post references |
| `createdAt` / `updatedAt` | Date | timestamps |

- Passwords are hashed with bcrypt (cost 10) in a `pre('save')` hook when modified.
- An instance method `comparePassword` performs bcrypt comparison.

### `Post`

| Field | Type | Constraints |
| --- | --- | --- |
| `title` | String | required, trimmed, max 200 chars |
| `body` | String | required |
| `imageUrl` | String | default `''` |
| `tags` | String[] | default `[]` |
| `status` | String | enum `draft` \| `published`, default `draft` |
| `author` | ObjectId → `User` | required |
| `likes` | Number | default `0` |
| `createdAt` / `updatedAt` | Date | timestamps |

### Relationships

- A **Post** belongs to one **User** (`author`). Read operations populate `author` with `name` and `email`.
- Likes are modeled twice: the `Post.likes` counter is incremented/decremented, and the liking user's `User.liked` array stores the post references. `User` has no separate `favorites` collection.

```mermaid
erDiagram
    USER ||--o{ POST : authors
    USER }o--o{ POST : likes
    USER {
        ObjectId _id
        string name
        string email
        string password
        ObjectId[] liked
    }
    POST {
        ObjectId _id
        string title
        string body
        string imageUrl
        string[] tags
        string status
        ObjectId author
        number likes
    }
```

### Schema management

There are no migration files. Mongoose applies the schema defined in `src/core/infrastructure/user.schema.ts` and `post.schema.ts`. Indexes declared by the schema (for example, the unique index on `User.email`) are created automatically by MongoDB/Mongoose.

---

## Authentication and Security

### What is implemented

- **Password hashing:** bcrypt with a salt round of 10, applied on save; hashes are excluded from queries by default (`select: false`).
- **Access tokens:** JWT signed with `JWT_ACCESS_SECRET`, default lifetime `15m`, sent as `Authorization: Bearer <token>`.
- **Refresh tokens:** JWT signed with `JWT_REFRESH_SECRET`, default lifetime `7d`, stored in an httpOnly cookie named `refresh_token` (`sameSite: 'lax'`, `secure` only when `NODE_ENV === 'production'`).
- **Token rotation:** `POST /api/auth/refresh-token` issues a new access token and rotates the refresh cookie.
- **Authorization:** write/private post endpoints are protected by an auth middleware that verifies the access token; ownership checks for edit/delete are enforced on the frontend (owner-only controls), while the API itself allows any authenticated user to update/delete a post by ID.
- **Input validation:** request bodies validated with Zod (`SignupDto`, `LoginDto`, `CreatePostDto`, `UpdatePostDto`) before reaching controllers.
- **Upload restrictions:** multer accepts only `image/jpeg`, `image/png`, `image/webp`, `image/gif` up to 5 MB, held in memory and streamed to Cloudinary.
- **HTTP hardening:** `helmet` is applied globally.
- **CORS:** restricted to the comma-separated `ALLOWED_URLS` allowlist with `credentials: true`.
- **Error handling:** a centralized handler normalizes Multer and application errors and avoids leaking stack traces in responses.

### Known limitations

- **No server-side ownership enforcement:** the API's `PATCH`/`DELETE /api/posts/:id` handlers do not verify that the requester authored the post. Ownership is only enforced in the UI. This should be added server-side before public deployment.
- **No rate limiting** on authentication or other endpoints.
- **No role-based access control:** the token payload includes a `role` field, but no roles are assigned or checked.
- **Weak fallback secrets:** if `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are unset, the server uses hard-coded defaults. Always set explicit secrets.
- **Refresh tokens are not revocable** beyond clearing the cookie (no server-side denylist).
- **`likes` counter integrity:** likes are tracked in two places without a transaction; concurrent toggles could drift the counter.
- **Frontend dependencies via CDN:** Tailwind CSS and Font Awesome are loaded from public CDNs in `index.html`, which is unsuitable for strict CSP/offline production environments.
- **Secrets hygiene:** ensure `backend/.env` is never committed (it is listed in `.gitignore`) and rotate any credentials that may have been exposed.

---

## Testing

### Frontend

- Framework: **Karma + Jasmine** (Angular CLI default), configured through `angular.json` and `tsconfig.spec.json`.
- Run:

  ```bash
  npm test
  ```

- A single spec exists (`src/app/app.spec.ts`) that verifies the root component compiles. Note that one of its assertions still references placeholder text (`Hello, frontend`) that the current template no longer renders, so it may fail as written.

### Backend

- No test framework or `test` script is configured. Adding one (for example, Jest or Vitest with Supertest) is recommended; see [Roadmap](#roadmap).

> No coverage figures are reported here because none are generated by the current configuration.

---

## Deployment

### Backend (configured)

Deployment is automated via `.github/workflows/deploy.yml`:

1. On a push to the `main` branch, GitHub Actions checks out the code.
2. Installs pnpm 9 and Node 20 (with pnpm caching).
3. Runs `pnpm install --frozen-lockfile`, `pnpm run lint`, and `pnpm run build`.
4. On success, triggers a **Render** deploy by calling the Render deploy hook stored in the `RENDER_DEPLOY_HOOK` repository secret.

**Required for deployment:**

| Item | Notes |
| --- | --- |
| Render web service | Build: `pnpm install && pnpm run build`; Start: `pnpm run start` (runs `node dist/index.js`). |
| `RENDER_DEPLOY_HOOK` secret | Set in the GitHub repository secrets. |
| Environment variables | All [backend variables](#environment-variables) must be set in the Render dashboard. Set `NODE_ENV=production` and add your deployed frontend origin to `ALLOWED_URLS`. |
| MongoDB | Reachable from the Render service (allow its outbound IPs in Atlas). |

### Frontend (not configured in this repository)

No deployment workflow or hosting configuration is committed for the frontend. To deploy it you will need to:

1. Set the correct API URL in `src/environments/environment.prod.ts`.
2. Run `npm run build` to produce static assets in `dist/`.
3. Host the output on a static host (for example, Netlify, Vercel, GitHub Pages, or a CDN) and point the domain at it.
4. Ensure the frontend origin is present in the backend's `ALLOWED_URLS`.

---

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| API exits or logs "MongoDB connection error" | Missing/invalid `MONGO_URL`, or network access blocked | Verify the connection string and allow the host's IP in MongoDB Atlas. |
| Requests blocked by CORS | Frontend origin not in `ALLOWED_URLS` | Add the exact origin (including protocol/port) to `ALLOWED_URLS`. |
| `401` immediately after login | Missing access token header, or expired token with no valid refresh cookie | Confirm the interceptor is attaching the Bearer token and that the browser accepts the `refresh_token` cookie (`withCredentials` is set on auth requests). |
| Refresh loop / repeated logouts | Refresh cookie not sent (e.g., cross-site `sameSite: 'lax'` in production) | Serve frontend and API under the same site, or adjust cookie settings for your deployment topology. |
| "Image is required" on create | No `image` field sent | Send `multipart/form-data` with an `image` file; required on create, optional on update. |
| "File is too large. Maximum size is 5MB." | Upload exceeds the limit | Compress the image or raise the multer limit in `upload.middleware.ts`. |
| Cloudinary upload failures | Missing or wrong Cloudinary credentials | Set `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`. |
| Port already in use | Another process on `5000` (API) or `4200` (SPA) | Stop the conflicting process or change `PORT` / the Angular serve port. |
| Validation errors on signup/login | Payload does not meet Zod rules | Name ≥ 2 chars, valid email, password ≥ 6 chars (signup). |
| `require is not defined` / module errors in backend | Mixing ESM/CJS expectations | The backend compiles to CommonJS (`tsconfig.json`); run via the provided scripts. |

---

## Contributing

The backend and frontend are separate repositories. Contributions should target the relevant repository.

1. **Report bugs / request features:** open an issue in the respective repository:
   - Backend: https://github.com/sajid189210/user-blob-management-platform-backend/issues
   - Frontend: https://github.com/sajid189210/user-blob-management-platform-frontend/issues
2. **Create a branch:** use a descriptive name such as `feat/post-pagination` or `fix/refresh-cookie`.
3. **Follow conventions:**
   - Backend: TypeScript with strict mode; maintain the routes → controllers → services → repositories layering and keep interfaces in sync with implementations.
   - Frontend: standalone Angular components, signals where already used, and the existing service/guard/interceptor structure.
   - Run `lint:fix` in the affected app before committing.
4. **Testing expectations:** the frontend test suite is minimal and the backend has none. At minimum, ensure `lint` and `build` pass in the backend (as CI enforces) and `lint`/`build` pass in the frontend. Add tests for new logic where practical.
5. **Pull requests:** describe the change, link the related issue, and note any manual verification steps.

---

## Roadmap

These are **proposed** improvements, not committed work:

- Enforce post ownership server-side on `PATCH`/`DELETE`.
- Add rate limiting to authentication endpoints.
- Introduce a backend test suite (unit + API integration).
- Add pagination to `GET /api/posts/published`.
- Implement token revocation for logout/refresh.
- Add a genuine "favorites" feature or remove the unused `favorites` component.
- Replace CDN Tailwind/Font Awesome with bundled assets for production.
- Refresh or remove the stale frontend spec assertion.

---

## License

The backend declares **ISC** in `backend/package.json`; the frontend is marked `private`. **No `LICENSE` file currently exists in either repository.** If you intend to distribute or open-source this project, add a `LICENSE` file to make the licensing terms explicit and consistent, and update the `license` fields accordingly.

---

## Contact

- Backend repository: https://github.com/sajid189210/user-blob-management-platform-backend
- Frontend repository: https://github.com/sajid189210/user-blob-management-platform-frontend
- Maintainer: `sajid189210` (GitHub)

For questions or issues, please open an issue in the relevant repository.
