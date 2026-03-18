# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BirdDex is a personal bird photography tracking web app. Users log bird sightings (date, location, photos, notes) and browse them in a species gallery with heatmap visualization. It's a pnpm monorepo with Turborepo.

**Workspaces**:

- `apps/api` — Hono backend (DDD architecture, Node.js + PostgreSQL)
- `apps/web` — SolidJS frontend (Vite, TanStack Router/Query)
- `packages/shared` — Shared TypeScript DTOs

## Commands

### Root (run from `/`)

```bash
pnpm dev           # Start both API and Web dev servers
pnpm build         # Build all packages
pnpm type-check    # TypeScript check across all packages
pnpm lint          # oxlint static analysis
pnpm lint:fix      # Auto-fix lint issues
pnpm format        # oxfmt formatting
pnpm format:check  # Verify formatting
```

### API only (`apps/api`)

```bash
pnpm --filter @bird-dex/api db:generate  # Generate Drizzle migrations
pnpm --filter @bird-dex/api db:push      # Push schema to DB (--force)
pnpm --filter @bird-dex/api db:studio    # Open Drizzle Studio (DB browser)
```

### Local dev environment (Docker)

```bash
cd docker && docker compose up -d  # Start PostgreSQL + RustFS (S3-compatible)
```

There are no test commands — the project has no test suite.

## Backend Architecture (`apps/api`)

The API follows DDD with four layers wired together by a manual DI container at `src/di/container.ts`.

**Layer flow**: HTTP request → Presentation → Application (Use Cases) → Domain → Infrastructure

- **`src/presentation/`** — Hono route handlers, Zod request validation DTOs, auth middleware
- **`src/application/`** — Use cases (one class per operation, e.g. `RegisterSighting`, `AddPhotoToSighting`)
- **`src/domain/`** — Entities (`User`, `Species`, `Sighting`, `Photo`), Value Objects with validation, Repository interfaces
- **`src/infrastructure/`** — Drizzle ORM repositories, S3 blob storage, GitHub OAuth client

Key files:

- `src/index.ts` — Server entry, mounts all routes
- `src/di/container.ts` — Wires all dependencies
- `src/infrastructure/db/schema.ts` — PostgreSQL schema (users, species, sightings, photos)

**Important**: The API is ESM (`"type": "module"`), so imports use `.js` extensions even for `.ts` source files.

## Frontend Architecture (`apps/web`)

- **Routing**: File-based routing via TanStack Router (`src/routes/`). `routeTree.gen.ts` is auto-generated on first `pnpm dev` — do not edit it.
- **Data fetching**: TanStack Query (Solid) hooks in `src/lib/queries.ts`
- **API client**: `src/lib/api.ts` — `apiFetch<T>()` for JSON requests, `apiUpload<T>()` for multipart uploads. Dev proxy in `vite.config.ts` forwards `/api`, `/auth`, `/health` to `localhost:3000`.
- **Styling**: Tailwind CSS v4 (no config file — uses CSS-first approach)
- **Path alias**: `~` resolves to `src/`

## Database Schema

Four tables: `users` → `species` / `sightings` → `photos`

- `photos` has FKs to both `sightings` (CASCADE delete) and `species` (RESTRICT delete)
- `(user_id, name)` is unique on `species`
- Drizzle migrations live in `drizzle/`; config at `apps/api/drizzle.config.ts`

## Shared Types (`packages/shared`)

`packages/shared/src/types.ts` exports DTOs used by both API responses and frontend: `UserDto`, `SpeciesDto`, `SightingDto`, `PhotoDto`, `HeatmapPointDto`, `ApiResponse<T>`, `PaginatedResponse<T>`.

## Environment Setup

Copy `.env.example` to `.env` in `apps/api/`. Local defaults match the Docker Compose services:

- PostgreSQL: `postgres://birdlog:birdlog@localhost:5432/birdlog`
- RustFS (S3): endpoint `http://localhost:9000`, key `rustfsadmin`, bucket `birdlog-photos`
- API runs on port 3000, Web dev server on port 5173

## Deployment

CI (`.github/workflows/ci.yml`) runs on PRs: type-check + build. Deploy (`.github/workflows/deploy.yml`) triggers on push to `main`, builds Docker images and deploys to Azure Container Apps via Bicep templates in `infra/bicep/`.
