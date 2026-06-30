# Valentina Agenda — Project Guide for AI Agents

## Overview
Web app para gestión de turnos de uñas (nail salon scheduling). Creada con Next.js 16 + Turso (SQLite remota). Desplegada en Vercel. Accesible desde celular como PWA.

**URL producción:** `https://valentina-agenda.vercel.app`  
**GitHub:** `https://github.com/ayelenn0707-cell/valentina-agenda`  
**PIN default:** `1234`

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.9 (webpack build) |
| Frontend | React 19, Tailwind CSS 4 |
| Backend | API Routes (Next.js) |
| DB | Turso (libSQL, SQLite-compatible, cloud) |
| Auth | bcryptjs + cookies (sesión) |
| PWA | Service Worker + Manifest |
| Hosting | Vercel (serverless) |
| DB Hosting | Turso (cloud, free tier 9GB) |

---

## Architecture

```
User (browser/PWA)
    │
    ▼
Vercel (Next.js SSR + API Routes)
    │
    ├── Server Components (page.tsx) → render inicial
    ├── Client Components (useState/useEffect) → interactividad
    └── API Routes (/api/*) → operaciones DB
            │
            ▼
        @libsql/client → Turso (SQLite cloud)
```

### Data Flow
1. Usuario visita `/` → `page.tsx` (server component) → `ensureInitialized()` crea schema → `initPin()` setea PIN default → `seedData()` siembra datos demo → redirect a `/login` o `/dashboard`
2. Login: POST `/api/auth/login` → verifica PIN en tabla `config` → setea cookie de sesión
3. Dashboard: fetch a `/api/turnos`, `/api/clientes` → muestra turnos del día
4. CRUD clientes/turnos/precios: API Routes con `await` a `@libsql/client`

---

## Database (Turso — SQLite)

### Tablas

#### `clientes`
| Columna | Tipo | Default |
|---------|------|---------|
| id | INTEGER PK AUTOINCREMENT | |
| nombre | TEXT | '' |
| wpp | TEXT | '' |
| edad | INTEGER | 0 |
| dir | TEXT | '' |
| ig | TEXT | '' |
| alerg | TEXT | '' |
| emb | INTEGER | 0 |
| cond | TEXT | '' |
| forma | TEXT | '' |
| largo | TEXT | '' |
| servHab | TEXT | '' |
| notas | TEXT | '' |
| fav | INTEGER | 0 |
| nueva | INTEGER | 0 |
| cancel | INTEGER | 0 |

#### `turnos`
| Columna | Tipo | Default |
|---------|------|---------|
| id | INTEGER PK AUTOINCREMENT | |
| cid | INTEGER FK → clientes.id | |
| fec | TEXT (ISO date) | |
| hor | TEXT (HH:MM) | |
| serv | TEXT | '' |
| reconst | INTEGER | 0 |
| remoc | INTEGER | 0 |
| tot | INTEGER (cents) | 0 |
| met | TEXT | '' |
| pg | TEXT | 'pendiente' |
| est | TEXT | 'agendado' |
| notas | TEXT | '' |
| mot | TEXT | '' |

#### `precios`
| Columna | Tipo | Default |
|---------|------|---------|
| id | INTEGER PK AUTOINCREMENT | |
| serv | TEXT | '' |
| pre | INTEGER (cents) | 0 |
| act | INTEGER (boolean) | 1 |

#### `config`
| Columna | Tipo | Default |
|---------|------|---------|
| key | TEXT PK | |
| value | TEXT | |

### DB Connection (`lib/db.ts`)
```typescript
export function getDB() {
  const url = process.env.TURSO_DB_URL ?? `file:${process.env.DB_PATH ?? "./data.db"}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}
```
- En producción (Vercel): usa `TURSO_DB_URL` + `TURSO_AUTH_TOKEN` → Turso cloud
- En local (sin env vars): fallback a SQLite file (`./data.db`)

---

## Environment Variables (Vercel)

| Variable | Valor |
|----------|-------|
| `TURSO_DB_URL` | `libsql://valentina-agenda-mili.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | (token de Turso, empieza con eyJ...) |

---

## Project Structure

```
valentina-agenda/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts    → POST: verifica PIN, crea sesión
│   │   │   ├── logout/route.ts   → POST: limpia sesión
│   │   │   └── check/route.ts    → GET: verifica cookie de sesión
│   │   ├── clientes/
│   │   │   ├── route.ts          → GET (list), POST (create)
│   │   │   └── [id]/route.ts     → GET, PUT (update)
│   │   ├── turnos/
│   │   │   ├── route.ts          → GET (filter by fec/rango/cid), POST
│   │   │   └── [id]/route.ts     → GET, PUT
│   │   └── precios/
│   │       ├── route.ts          → GET, POST
│   │       └── [id]/route.ts     → GET, PUT, DELETE
│   ├── page.tsx                  → Server Component: init + seed + redirect
│   ├── layout.tsx                → Root layout + PWA setup
│   ├── login/page.tsx            → Client: login PIN pad
│   ├── dashboard/page.tsx        → Client: turnos hoy + stats
│   ├── clientes/page.tsx         → Client: list + profile view
│   ├── turnos/page.tsx           → Client: calendar view
│   ├── precios/page.tsx          → Client: CRUD precios
│   ├── caja/page.tsx             → Client: cash register
│   └── globals.css               → Tailwind + custom styles
├── components/
│   ├── bottom-nav.tsx            → Navegación inferior fija
│   ├── calendar-view.tsx         → Vista calendario de turnos
│   ├── client-card.tsx           → Card de cliente en listado
│   ├── client-profile.tsx        → Perfil detallado del cliente
│   ├── modal.tsx                 → Modal reutilizable
│   ├── notifications.tsx         → Banner de notificaciones
│   ├── pwa-setup.tsx             → Service worker registration
│   └── turno-card.tsx            → Card de turno
├── lib/
│   ├── db.ts                     → DB client + todas las queries (async)
│   ├── seed.ts                   → Seed data (sample clients, turnos, precios)
│   ├── auth.ts                   → PIN login + session management
│   └── types.ts                  → TypeScript interfaces + helpers
├── public/
│   ├── icons/                    → PWA icons (PNG 192, 512, maskable)
│   ├── manifest.json             → PWA manifest
│   ├── sw.js                     → Service worker (cache-first)
│   └── *.svg                     → Vercel default assets
└── config files
    ├── next.config.ts            → Next.js config
    ├── tsconfig.json             → TypeScript config (strict)
    ├── tailwind.config.js → Tailwind 4 (inline CSS)
    └── package.json              → Dependencies
```

---

## API Reference

### `GET /api/auth/check`
Returns `{ authenticated: boolean }` based on session cookie.

### `POST /api/auth/login`
Body: `{ pin: string }`  
Returns `{ ok: true }` or `{ ok: false, error }`. Crea cookie de sesión.

### `GET /api/clientes`
Returns array of clientes. No auth required (protected by client-side redirect).

### `POST /api/clientes`
Body: `Omit<Client, "id" | "cancel">`  
Returns created Cliente.

### `PUT /api/clientes/:id`
Body: `Partial<Client>`  
Returns `{ ok: true }`.

### `GET /api/turnos?fec=2026-06-29` | `?fecDesde=X&fecHasta=Y` | `?cid=1`
Returns filtered turnos array.

### `POST /api/turnos`
Body: `Omit<Turno, "id">`  
Returns created Turno.

### `PUT /api/turnos/:id`
Body: `Partial<Turno>`  
Returns `{ ok: true }`.

### `GET /api/precios?onlyActive=true`
Returns precios array.

### `POST /api/precios`
Body: `Omit<Precio, "id">`  
Returns created Precio.

### `PUT /api/precios/:id`
Body: `Partial<Precio>`  
Returns `{ ok: true }`.

### `DELETE /api/precios/:id`
Returns `{ ok: true }`.

---

## Modifying the App

### Workflow
1. Hacer cambios localmente
2. `git add . && git commit -m "descripción"`
3. `git push origin master`
4. Vercel redeployea automáticamente (2-3 min)

### Database de desarrollo
- Si no hay env vars, usa `file:./data.db` (SQLite local)
- Para pruebas: crear `.env.local` con `TURSO_DB_URL=file:./test.db`

### Important Gotchas
- **Todas las funciones DB son async** — siempre usar `await`
- **API Routes** deben usar `await` en todas las calls a db.ts
- **next.config.ts** tiene `typescript: { ignoreBuildErrors: true }` porque Turbopack compila bien pero TypeScript strict mode a veces da falsos positivos
- **Turso DB es compartida** — cambios de prueba se ven en prod

---

## Deployment

### Creado: Vercel + Turso
- Vercel: conectado al repo de GitHub, deploy automático en cada push
- Turso: DB remota, configurada via env vars en Vercel

### Para deployar cambios
```bash
git add .
git commit -m "lo que cambiaste"
git push origin master
# Vercel deployea solo en ~2 min
```

---

## Seed Data
`lib/seed.ts` contiene datos demo (6 clientes, 8 turnos, 8 precios). Se ejecuta solo si la tabla `clientes` está vacía. Para resetear:
- Opción 1: Mandar DELETE directo a Turso
- Opción 2: Vaciar tablas desde API (no implementado)

---

## Notas para el agente

1. Este proyecto es usado por una manicurista real — los cambios deben ser cuidadosos
2. La UI está en español, los datos de clientes son argentinos
3. Los montos están en ARS (pesos argentinos), en centavos (enteros)
4. La app está diseñada mobile-first (max-width 393px)
5. El PIN por defecto es 1234, almacenado como bcrypt hash en tabla `config`
6. No hay registro de usuarios — un solo PIN compartido
7. La sesión dura 30 días via cookie httpOnly
