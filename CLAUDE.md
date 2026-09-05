# Habit Tracker — Proyecto Final UX (UNITEC)

## Contexto académico

- Curso: Experiencia de Usuario — UNITEC, campus San Pedro Sula. Catedrático: Ing. Victor Ramirez.
- Modalidad: **individual**. Estudiante: Marcelo.
- Entregas: Avance 1 (semana 4), Avance 2 (semana 7), Avance 3 (semana 10, proyecto final).
- Enfoque incremental: cada entrega parte de la anterior, no se reescribe desde cero.
- **El estudiante está construyendo esto manualmente para aprender.** No entregar archivos completos para pegar sin explicación: guiar paso a paso y explicar el porqué de cada decisión. Si un paso implica modificar un archivo existente, dar el archivo completo, no "agrega esta línea en algún lado".

## Estructura del repo

```
HabitTracker/
├── frontend/            # Next.js 16 + MUI v9
├── backend/             # NestJS 12 (ESM)
├── docker-compose.yml   # MongoDB como replica set rs0
└── CLAUDE.md
```

## Stack

**Gestor de paquetes: pnpm** en ambos proyectos (requisito del curso).

**Frontend** — `frontend/`

- Next.js 16.3.4, App Router, carpeta `src/`, alias `@/*`, **sin Tailwind**
- Material UI v9.4.0 + Emotion + `@mui/material-nextjs` (ruta `v16-appRouter`)
- Corre en `http://localhost:3000`
- **Zod** para validación de formularios (requisito explícito del ingeniero, solo frontend)

**Backend** — `backend/`

- NestJS 12.0.1, **ESM** (`"type": "module"`), Vitest + oxlint
- Prisma **6.19.3** con MongoDB
- Auth: `@nestjs/jwt` + `passport-jwt` + `bcrypt`
- Validación: `class-validator` + `class-transformer`
- Corre en `http://localhost:3001`

**Base de datos**

- MongoDB 8 en Docker, como **replica set de un solo nodo (`rs0`)** — requisito de Prisma, no funciona con Mongo standalone
- MongoDB Compass: `mongodb://localhost:27017` (sin usuario ni contraseña)

## Qué es el producto

App web para crear, organizar y dar seguimiento a hábitos personales (salud, estudio, descanso). Público objetivo: universitarios 18–25 años. Debe motivar con indicadores visuales, estadísticas y gamificación ligera (rachas), sin volverse un juego.

## Design tokens — usar siempre estos, no inventar otros

- Primary `#5EC269` / Primary Dark `#438E8F`
- Secondary `#4E80EE`
- Background `#F8FAFC` / Surface `#FFFFFF`
- Text Primary `#111729` / Text Secondary `#677389`
- Success `#4CA154` / Warning `#E9A23B` / Error `#DD524C`
- Tipografía: Inter (cargada vía `next/font/google` en `theme.ts`)
- Radios: 12 base, 16 en cards/dialogs, 10 en botones/inputs
- Botones: `disableElevation`, sin `textTransform: uppercase`
- Todo vive en `frontend/src/theme/theme.ts`. **No hardcodear colores ni spacing** en componentes: usar `theme.palette`, `theme.spacing()`, `sx`.

## Modelo de datos (`backend/prisma/schema.prisma`)

- **User**: id, name, email (único), password (hash bcrypt), salt, createdAt, updatedAt
- **Habit**: id, userId → User, name, description?, category?, frequency (enum: daily/weekly/custom), priority (enum: low/medium/high), startDate, endDate?, active, timestamps
- **HabitRecord**: id, habitId → Habit, userId → User, date, completed, timestamps. Índice único compuesto `[habitId, date]`

IDs: `String @id @default(uuid()) @map("_id")` — UUID en string, **no** ObjectId nativo (para alinear con lo que enseña el ingeniero en clase).

## Estado actual

### Backend — hecho y probado

- `PrismaService` / `PrismaModule` (`@Global()`)
- **Auth** (`/auth/register`, `/auth/login`) — JWT con Bearer token, bcrypt con sal explícita. Probado de punta a punta.
- **Habits** (`/habits`) — CRUD completo: POST, GET, GET `/:id`, PATCH `/:id`, PATCH `/:id/status`, DELETE `/:id`. Protegido con `JwtAuthGuard` + `@CurrentUser()`, con verificación de dueño probada con dos usuarios reales (devuelve 403 si el hábito no le pertenece).
- `JwtStrategy`, `JwtAuthGuard`, decorador `@CurrentUser()` en `src/common/decorators/`
- `ValidationPipe` global en `main.ts` (whitelist, forbidNonWhitelisted, transform)

### Backend — pendiente

- **HabitRecords**: `POST /habits/:id/records`, `GET /habits/:id/records`. Upsert por día (aprovechar el índice único `[habitId, date]` para no duplicar).
- **Statistics**: `GET /statistics/summary`, `/weekly`, `/monthly`. Rachas (actual y mejor), % de cumplimiento, datos para gráficas.
- **UsersController**: `GET /users/me`, `PATCH /users/me`. El `UsersService` ya existe (con `toSafeUser()` que quita password y salt), falta solo el controller.
- **CORS**: `app.enableCors()` en `main.ts` — hará falta en cuanto el frontend empiece a llamar al backend.

### Frontend — hecho

- Tema MUI conectado vía `src/theme/ThemeRegistry.tsx` en el layout raíz
- `src/components/Link.tsx` — wrapper de `next/link` necesario para usarlo con componentes MUI desde Server Components
- Rutas creadas como **placeholders sin diseño ni lógica**: `/`, `/login`, `/register`, `/dashboard`, `/habits`, `/habits/new`, `/statistics`

### Frontend — pendiente (casi todo)

- Diseñar cada pantalla a partir de los wireframes del Avance 1 (el estudiante los tiene en su documento; pedírselos cuando toque cada pantalla)
- Formularios con Zod (login, registro, crear/editar hábito)
- Cliente HTTP hacia el backend + manejo del token JWT (guardarlo tras login, mandarlo como `Authorization: Bearer <token>`)
- Estados de cada vista: carga, vacío, error, con datos
- Componentes reutilizables: `HabitCard`, `StreakBadge`, `ProgressBar`, `ConfirmDialog`
- Responsive real (sidebar → drawer/bottom nav en móvil)
- Gráficas de estadísticas

### Documento de Avance 1 — pendiente

- Sección "Componentes principales" del sistema de diseño
- Sección "Tema Material UI" documentada (el código ya existe, falta insertarlo)
- Diagrama de flujo de navegación completo (pantalla → pantalla)
- Separar la sección "API" de "Wireframes"

## Convenciones y trampas ya resueltas

**No repetir estos errores — ya costaron tiempo:**

1. **ESM en el backend**: los imports relativos llevan extensión `.js` aunque el archivo sea `.ts` (`from './app.module.js'`). Es correcto, no es un typo.

2. **`import 'dotenv/config'` debe ser la PRIMERA línea de `main.ts`**, antes de cualquier otro import. Sin eso, `JwtModule.register()` se evalúa antes de que `ConfigModule` cargue el `.env`, firma los tokens con el secreto de respaldo, y `JwtStrategy` los verifica con el real → todo da 401 sin razón aparente.

3. **`PassportModule.register({ defaultStrategy: 'jwt' })`** — cada módulo cuyo controller use `@UseGuards(JwtAuthGuard)` debe importarlo así, configurado. Importarlo "pelón" no basta y da `UnknownDependenciesException` sobre `AuthModuleOptions`.

4. **Prisma fijado en 6.19.3 a propósito.** Prisma 7 no soporta MongoDB. Prisma 8 sí lo soporta pero todos sus paquetes siguen en release candidate. El ingeniero usa 6.15.0 en clase. **No actualizar.**

5. **Generador `prisma-client-js` sin `output`** → los imports son `from '@prisma/client'` (tanto el cliente como los enums). Se eligió así para coincidir con lo que enseña el ingeniero.

6. **Después de `prisma generate`, VS Code puede mostrar errores de tipos falsos.** Solución: `Ctrl+Shift+P` → "TypeScript: Restart TS Server". Si el build de terminal pasa y el editor no, es caché.

7. **MUI v9 tiene breaking changes**: ya no existen claves combinadas tipo `containedPrimary` en `styleOverrides` (usar el arreglo `variants` dentro de `root`), y los "system props" sueltos (`alignItems`, `justifyContent`, etc.) ya no funcionan como props directas — **siempre dentro de `sx={{ }}`**.

8. **`@mui/material-nextjs/v16-appRouter`** — la ruta de import depende de la versión de Next. Este proyecto usa Next 16, no v15.

9. **Puertos**: frontend 3000, backend 3001.

## Diferencias deliberadas con el proyecto del ingeniero

Él construye este mismo habit tracker en clase como guía. Se adoptaron sus **convenciones** (generador, estilo de IDs, campo `salt`), pero **no su modelo ni su arquitectura**:

- Su schema tiene una tabla intermedia `UserHabits` (muchos-a-muchos). El nuestro es directo: un hábito pertenece a un usuario. **Conservar el nuestro** — es lo documentado en el Avance 1.
- Su `habits.service.ts` no filtra por usuario ni verifica dueño (`findAll()` devuelve los hábitos de todos). **El nuestro sí, y debe seguir así.**
- Él usa `jsonwebtoken` directo; nosotros `@nestjs/jwt` + Passport (más idiomático de NestJS).
- Él está en NestJS 11 con CommonJS y Jest; nosotros en 12 con ESM y Vitest.
- Él no tiene `HabitRecord`; nosotros lo necesitamos para rachas y estadísticas.

Sobre el campo `salt`: bcrypt ya incrusta la sal dentro del hash, así que guardarla aparte es técnicamente redundante — se hace para igualar lo que pide el ingeniero. Generarla con `bcrypt.genSalt()`, usarla en `bcrypt.hash()`, y guardarla en su columna. `bcrypt.compare()` no la necesita como argumento.

## Comandos

```bash
# Base de datos (desde la raíz)
docker compose up -d          # levanta Mongo; esperar a que docker ps diga (healthy)
docker compose down -v        # apaga Y BORRA los datos

# Backend
cd backend
pnpm install
pnpm prisma generate          # regenera el cliente tras cambiar el schema
pnpm prisma db push           # sincroniza el schema con Mongo (Mongo usa db push, NO migrate)
pnpm run start:dev
pnpm run build

# Frontend
cd frontend
pnpm install
pnpm dev
```

Variables en `backend/.env`: `PORT`, `DATABASE_URL` (con `?replicaSet=rs0`), `JWT_SECRET`, `JWT_EXPIRES_IN`.

## Cómo probar endpoints (PowerShell, Windows)

Usar `Invoke-RestMethod`, no `curl` (en PowerShell es un alias que se comporta distinto).

```powershell
$login = @{ email = "test@example.com"; password = "password123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body $login -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($response.accessToken)" }

Invoke-RestMethod -Uri "http://localhost:3001/habits" -Method Get -Headers $headers
```

Nota: `ls -a` no existe en PowerShell; el equivalente es `ls -Force`.

## Reglas de producto

- A partir de Avance 2 no se acepta mock data — todo conectado a Mongo real.
- Toda acción destructiva (eliminar hábito) requiere diálogo de confirmación.
- Toda vista necesita: estado de carga, estado vacío, estado de error, estado con datos.
- Reutilizar componentes en vez de duplicar UI entre pantallas.
- Commits frecuentes y descriptivos (`feat:`, `fix:`, `refactor:`) — es criterio de evaluación.
