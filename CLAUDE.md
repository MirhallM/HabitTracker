# Habit Tracker — Proyecto Final UX (UNITEC)

## 1. Overview

App web para crear, organizar y dar seguimiento a hábitos personales (salud, estudio, descanso).
Público objetivo: universitarios 18–25 años. Motiva con indicadores visuales, rachas y
estadísticas, sin volverse un juego.

**Contexto académico**

- Curso: Experiencia de Usuario — UNITEC, campus San Pedro Sula. Catedrático: Ing. Victor Ramirez.
- Modalidad: **individual**. Estudiante: Marcelo.
- Entregas: Avance 1 (semana 4), Avance 2 (semana 7), Avance 3 (semana 10, proyecto final).
- Enfoque incremental: cada entrega parte de la anterior, no se reescribe desde cero.
- **El estudiante lo está construyendo manualmente para aprender.** No entregar archivos
  completos para pegar sin explicación: guiar paso a paso y explicar el porqué de cada decisión.
  Si un paso implica modificar un archivo existente, dar el archivo completo, no "agrega esta
  línea en algún lado".
- El código y la UI están **en español** (nombres de variables en inglés, textos y comentarios
  en español). Mantener esa mezcla.

## 2. Tech Stack

**Gestor de paquetes: pnpm** en ambos proyectos (requisito del curso). `packageManager: pnpm@11.17.0`.

**Frontend** — `frontend/` · puerto 3000

- Next.js **16.3.4**, App Router, carpeta `src/`, alias `@/*`, **sin Tailwind**
- React **19.2.8**
- Material UI **9.4.0** (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs` en la
  ruta `v16-appRouter`) + Emotion
- **Zod 4.5.4** para validación de formularios (requisito explícito del ingeniero, solo frontend)
- ESLint 9 con `eslint-config-next`, TypeScript 5
- **MUI X Charts 9.13.0** (`@mui/x-charts`, licencia MIT) para las gráficas de `/statistics`.
  Las series usan `chartColors` de `theme.ts`, nunca colores inventados.
- **No hay react-hook-form, Redux, Zustand ni React Query.** Ver §10.

**Backend** — `backend/` · puerto 3001

- NestJS **12.0.1**, **ESM** (`"type": "module"`), Express 5
- Prisma **6.19.3** con MongoDB (versión fijada, ver §10)
- Auth: `@nestjs/jwt` + `passport-jwt` + `bcrypt`
- Validación: `class-validator` + `class-transformer` (+ `@nestjs/mapped-types` para `PartialType`)
- Testing: **Vitest 4**. Lint: **oxlint**. Formato: Prettier.
- TypeScript 6, `module: nodenext`

**Base de datos**

- MongoDB 8 en Docker, como **replica set de un solo nodo (`rs0`)** — requisito de Prisma,
  no funciona con Mongo standalone.
- MongoDB Compass: `mongodb://localhost:27017` (sin usuario ni contraseña).

## 3. Project Structure

```
HabitTracker/
├── docker-compose.yml        # Mongo 8 como replica set rs0, con healthcheck que hace rs.initiate
├── CLAUDE.md
├── backend/
│   ├── prisma/schema.prisma  # 3 modelos + 2 enums
│   ├── prisma.config.ts      # config nueva de Prisma (carga dotenv, engine "classic")
│   └── src/
│       ├── main.ts           # bootstrap: dotenv, body parser 2 MB, ValidationPipe global, CORS
│       ├── app.module.ts     # ConfigModule global + los 5 módulos de dominio
│       ├── prisma/           # PrismaService + PrismaModule (@Global)
│       ├── auth/             # register/login, JwtStrategy, JwtAuthGuard, DTOs
│       ├── users/            # /users/me, toSafeUser()
│       ├── habits/           # CRUD de hábitos, con racha calculada al vuelo
│       ├── habit-records/    # marcar/desmarcar cumplimiento
│       ├── statistics/       # summary, weekly, monthly
│       └── common/
│           ├── streaks.ts    # ★ funciones puras de períodos y rachas — el corazón del dominio
│           └── decorators/current-user.decorator.ts
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx        # ThemeRegistry + AuthProvider
        │   ├── page.tsx          # landing pública CON el formulario de registro
        │   ├── login/            # login
        │   └── (app)/            # route group protegido: AuthGuard + AppShell
        │       ├── dashboard/  habits/  habits/new/  habits/[id]/edit/
        │       └── statistics/  settings/
        ├── components/           # UI reutilizable (ver §8)
        ├── context/AuthContext.tsx
        ├── lib/                  # api.ts, auth-storage.ts, dates.ts, habit-meta.ts, habit-filters.ts
        ├── services/             # una función por endpoint, tipada
        ├── schemas/              # esquemas Zod
        ├── types/                # espejo de los modelos de Prisma
        └── theme/                # theme.ts (design tokens) + ThemeRegistry.tsx
```

**No existe** `frontend/src/app/register/` — el registro vive en la landing `/`.
`frontend/AGENTS.md` (y `frontend/CLAUDE.md`, que solo hace `@AGENTS.md`) los regenera
`next dev`; no editarlos a mano.

## 4. Architecture

```
Next.js (cliente)  ──fetch + Bearer JWT──▶  NestJS  ──Prisma──▶  MongoDB (rs0)
   localStorage                              :3001                :27017
```

- **Todo el consumo de datos es del lado del cliente.** Las páginas con datos llevan
  `"use client"` y piden en un `useEffect`. No hay Server Components pidiendo datos, ni
  Route Handlers, ni BFF: el navegador habla directo con NestJS.
- **Capas del frontend**: página → `services/*.service.ts` → `lib/api.ts` → backend.
  Nunca llamar `fetch` desde un componente; siempre pasar por un service.
- `lib/api.ts` inyecta `Authorization: Bearer <token>` leyendo `localStorage`, normaliza los
  errores de NestJS (el `message` puede venir string o arreglo) y los lanza como `ApiError`
  con `status`, para que la UI distinga 401 de 409.
- **El token vive en `localStorage`**, encapsulado en `lib/auth-storage.ts` para que migrar a
  cookies httpOnly toque un solo archivo.
- `AuthContext` rehidrata la sesión al montar: si hay token, llama `GET /users/me`; si falla,
  lo borra. `AuthGuard` bloquea el render de `(app)/*` hasta resolver eso.
- **CORS** está habilitado en `main.ts` contra `FRONTEND_URL` (default `http://localhost:3000`).
- El body parser de Nest se reemplaza por uno de 2 MB porque los avatares viajan como base64.
- **La racha nunca se guarda en base de datos**: se calcula en cada request desde los
  `HabitRecord`. `GET /habits` la resuelve en 2 consultas totales (hábitos + registros) y
  agrupa en memoria, no una consulta por hábito.

## 5. Data Model

`backend/prisma/schema.prisma`. IDs: `String @id @default(uuid()) @map("_id")` — UUID en string,
**no** ObjectId nativo (para alinear con lo que enseña el ingeniero).

- **User**: `id`, `name`, `email` (único, siempre guardado en minúsculas), `password` (hash
  bcrypt), `salt`, `avatar?` (data URL base64), timestamps.
- **Habit**: `id`, `userId → User`, `name`, `description?`, `category?` (texto libre, no enum),
  `frequency` (enum `daily|weekly|custom`, default `daily`), `priority` (enum `low|medium|high`,
  default `medium`), `intervalDays?` (solo para `custom`), `startDate` (default now), `endDate?`,
  `archivedAt?` (**null = activo**; ver §7), timestamps.
- **HabitRecord**: `id`, `habitId → Habit`, `userId → User`, `date`, `completed` (default true),
  timestamps. **Índice único compuesto `@@unique([habitId, date])`** — es lo que hace posible el
  upsert por día.

Relaciones: un User tiene muchos Habits y muchos HabitRecords; un Habit tiene muchos
HabitRecords. **Un hábito pertenece a un solo usuario** (relación directa, sin tabla intermedia).

`frontend/src/types/habit.ts` y `user.ts` son el espejo manual de estos modelos —
**mantenerlos sincronizados a mano** al cambiar el schema. El tipo `Habit` del frontend incluye
además `streak`, que el backend agrega pero no está en la tabla.

## 6. Current Features

### Backend — completo y probado

| Método | Ruta | Notas |
|---|---|---|
| GET | `/` | Devuelve `"Hello World!"` (scaffolding de Nest, sin usar) |
| POST | `/auth/register` | Crea usuario, devuelve `{ accessToken, user }` |
| POST | `/auth/login` | 200 explícito, mismo shape que register |
| GET | `/users/me` | Usuario sin `password` ni `salt` |
| PATCH | `/users/me` | `name` y/o `avatar` |
| POST | `/habits` | |
| GET | `/habits` | Del usuario, `createdAt desc`, con `streak` |
| GET | `/habits/:id` | Con `streak` |
| PATCH | `/habits/:id` | |
| PATCH | `/habits/:id/archive` | Body `{ archived }` — archiva o restaura |
| DELETE | `/habits/:id` | Borra registros + hábito en `$transaction` |
| POST | `/habits/:habitId/records` | Marca (upsert) o desmarca (borra el período) |
| GET | `/habits/:habitId/records` | `date desc` |
| GET | `/statistics/summary` | Totales, vencimientos de hoy, racha de cuenta |
| GET | `/statistics/weekly` | 7 días, lunes→domingo, `{ date, completed, expected }` |
| GET | `/statistics/monthly` | Últimos 30 días, mismo shape |
| GET | `/statistics/by-habit` | Rendimiento de cada hábito **activo** en 30 días, contado en períodos |

Todo excepto `/` y `/auth/*` está protegido con `JwtAuthGuard` + `@CurrentUser()`, y **verifica
dueño**: devuelve 403 si el recurso no pertenece al usuario del token.

### Frontend — implementado

- **`/` (landing pública)** — hero con propuesta de valor + `RegisterForm` a la derecha.
  Si ya hay sesión, redirige a `/dashboard`.
- **`/login`** — validación Zod, estado de envío, errores de servidor en `Alert`.
- **`/dashboard`** — saludo con el nombre, fecha larga en español, `TodayProgressCard`,
  `StreakCard`, hábitos activos agrupados en tarjetas por frecuencia (Diarios / Semanales /
  Personalizados) con checkbox para marcar, y `WeekSummaryCard`. Los 4 estados
  (carga con `Skeleton`, error con "Reintentar", vacío con CTA, con datos).
- **`/habits`** — página de administración: pestañas **Activos / Archivados** con contadores,
  **búsqueda** (nombre + descripción + categoría, sin acentos ni mayúsculas), **filtros rápidos**
  (Todos / Completados / Por hacer / Urgentes), **filtros avanzados** en Popover (prioridad,
  frecuencia, categoría — combinables), y **ordenamiento** (recientes, nombre A→Z y Z→A,
  prioridad, racha, próximo vencimiento). Cada `HabitCard` tiene toggle de cumplimiento, editar
  visible y menú `⋮` con Archivar/Restaurar y Eliminar. Estados vacíos diferenciados por causa
  (sin hábitos, pestaña vacía, búsqueda sin resultados, filtros sin resultados).
- **`/habits/new` y `/habits/[id]/edit`** — el mismo `HabitForm`; recibir un `habit` lo pone en
  modo edición.
- **`/statistics`** — tres tarjetas de resumen (hábitos activos, racha de días activos,
  cumplimiento a 30 días), gráfica de área del cumplimiento diario del último mes, corte por
  frecuencia y desglose de rendimiento por hábito con selector de orden. Los 4 estados.
- **Perfil** — `ProfileDialog` (diálogo flotante desde el avatar del AppBar) con foto, datos,
  progreso de hoy, rachas y totales. `AvatarUpload` recorta y redimensiona la imagen en el
  navegador antes de subirla.
- **Shell responsive** — `AppShell`: AppBar fija, sidebar permanente en ≥md, `BottomNavigation`
  en móvil, menú de usuario con "Mi perfil" y "Cerrar sesión".

### Frontend — pendiente (NO documentar como hecho)

- **`/settings` es un placeholder**: título y "Aquí podrás editar tu perfil". El botón
  "Editar perfil" del `ProfileDialog` lleva ahí. Falta el formulario (editar nombre).
- `HabitForm` sigue sin campos de fecha (ver abajo).
- `HabitForm` **no envía `startDate` ni `endDate`** — no hay campos de fecha en la UI, así que
  todo hábito arranca hoy y no tiene fin, aunque el backend sí los acepta.
- El icono de notificaciones del AppBar es decorativo ("próximamente").

### Testing — estado real

- Solo existen los dos specs de scaffolding de Nest. `pnpm test` pasa (1 test).
- `test/app.e2e-spec.ts` **está desactualizado**: espera `{ status: 'ok', service:
  'habit-tracker-api' }` de `GET /`, pero `AppController` devuelve `"Hello World!"`.
  `pnpm test:e2e` falla por eso.
- **`common/streaks.ts` no tiene tests y es la lógica más delicada del proyecto.** Si se van a
  escribir tests en algún momento, empezar ahí: son funciones puras, sin base de datos.

## 7. Important Business Logic

### Períodos — el concepto central (`backend/src/common/streaks.ts`)

El algoritmo de racha **nunca cambia**; lo único que cambia es cómo se agrupan las fechas en
períodos. `periodIndex(fecha, frecuencia, opciones)` traduce una fecha al índice de su período:

- `daily` → el día mismo.
- `weekly` → **semanas ancladas a lunes** (`floor((day + 3) / 7)`; el `+3` corrige que el
  1 de enero de 1970 cayó jueves).
- `custom` → **ventanas de N días contadas desde el `startDate` del hábito**, no desde el
  calendario. Dos hábitos "cada 3 días" creados en días distintos vencen en días distintos.

`periodRange()` es su inverso: devuelve `[start, end)` del período, con el mismo anclaje.
`frontend/src/lib/dates.ts` **replica este anclaje** (`startOfWeek`, `customPeriodEnd`) para
las etiquetas de vencimiento. **Si cambias uno, cambia el otro.**

### Completado

- Marcar = `POST /habits/:id/records` con `completed: true` → **upsert** sobre
  `[habitId, date]` con la fecha normalizada a medianoche local. Marcar dos veces el mismo día
  actualiza, no duplica.
- **Desmarcar borra todo el período, no solo hoy.** Desmarcar significa "no está cumplido en
  este período": un hábito semanal marcado el jueves seguiría contando como hecho si el domingo
  solo borráramos el registro de ese domingo. Devuelve `{ cleared: n }`.
- El checkbox de la UI refleja `streak.completedInCurrentPeriod`, no "marcado hoy".

### Rachas (`computeStreak`)

- Se calculan sobre **períodos únicos**, ordenados del más reciente al más antiguo.
- **Día de gracia**: la racha sigue viva si el último cumplimiento fue en el período actual
  **o en el inmediatamente anterior**. Solo se rompe al saltarse dos.
- `bestStreak` recorre todo el historial buscando la cadena más larga.
- Dos rachas distintas conviven, no confundirlas:
  - **Racha por hábito** (`habit.streak`) — en períodos de ese hábito.
  - **Racha de cuenta** (`activeDaysStreak` en `/statistics/summary`) — **días** consecutivos en
    los que se completó *algo*, sin importar la frecuencia.

### Vencimientos y progreso de hoy

Un hábito "vence hoy" si **hoy es el último día de su período actual**: los diarios siempre,
los semanales solo el domingo, los personalizados solo al cerrar su ventana. Así un hábito
semanal recién iniciado el lunes no aparece como pendiente toda la semana.
`completionRate` = `completedDueToday / dueToday` (0 si no vence nada; eso se muestra como
"Sin pendientes", no como fracaso).

### Estadísticas semanal/mensual

`weekly` devuelve la **semana calendario actual** (lunes→domingo), consistente con cómo
`periodIndex` agrupa los semanales. `monthly` son los últimos 30 días.
**Ambas consideran solo hábitos `daily`**: un semanal o personalizado no pertenece a un día
concreto, e incluirlo distorsionaría el "día completo". `expected` y `completed` por día usan
**el mismo criterio** (`countsOnDay`), para que nunca aparezca un "3 de 2" en el resumen semanal.
Por eso la gráfica de `/statistics` se rotula explícitamente **"Solo hábitos diarios"**, y los
semanales y personalizados se cubren con `by-habit`.

### Rendimiento por hábito (`/statistics/by-habit`)

Cuenta en **períodos, no en días**: un semanal cumplido 3 de 4 semanas es 75%, aunque solo tenga
3 registros en el mes. Por eso no se puede derivar de `/monthly`, que agrega entre todos los
diarios sin separar por hábito.

- Recorre los 30 días de la ventana quedándose con un día por período (más simple que invertir
  `periodIndex`), y para cada período usa el mismo `countsOnDay` que las gráficas.
- **El período en curso no cuenta**: contarlo como incumplido castigaría una semana que apenas
  va por el martes. Solo entran los períodos cuyo último día ya pasó.
- Solo devuelve hábitos **activos** — la pregunta es "cómo vengo", y un archivado ya no es parte
  de la rutina. Su historial sigue intacto en `/habits`.
- `expected: 0` significa **sin datos**, y la UI lo muestra como "—", nunca como 0%.

### Frecuencias, prioridades, categorías

- `custom` **exige `intervalDays >= 2`** (para 1 día existe `daily`). Validado en los dos lados:
  `@ValidateIf` en el DTO y `.refine()` en el schema Zod.
- Prioridad: solo ordena y colorea. **No** cambia el cálculo. En el dashboard los pendientes van
  primero y dentro de cada bloque por prioridad (`high → medium → low`).
- Categoría: **texto libre**, no enum. Se muestra como Chip.
- Archivado: `archivedAt !== null`. Vive en la pestaña **Archivados** de `/habits`, sin checkbox
  y mostrando la mejor racha; queda fuera del dashboard y de los conteos de "activos".

### Archivar vs. eliminar — conceptos independientes

`archivedAt` (null = activo) es **la fecha en que se archivó, no un booleano**, y esa es la
decisión de diseño más importante del modelo. Permite responder *"¿estaba archivado el día X?"*,
que es lo que hace que archivar **no reescriba el historial**:

- `StatisticsService.countsOnDay()` cuenta un hábito diario en el `expected` de un día si ya
  había iniciado, no había terminado **y aún no estaba archivado ese día**. Los días previos al
  archivado quedan idénticos; solo deja de contar del día del archivado en adelante.
- Con un booleano esto sería imposible: o se excluye de todo el histórico (reescribiendo el
  pasado) o nunca se excluye (penalizando al usuario para siempre).

Archivar **no toca ni un solo `HabitRecord`**. Restaurar (`archived: false`) pone `archivedAt` en
null y devuelve el hábito con todo su historial. `bestStreak` sobrevive intacto; `currentStreak`
vuelve a cero si hubo hueco, que es lo correcto.

**En la UI la distinción es deliberada**: archivar es reversible y se confirma con Snackbar +
"Deshacer"; eliminar es irreversible y **siempre** pasa por diálogo de confirmación.

`completed` (de `HabitRecord`) y `archivedAt` (de `Habit`) son cosas distintas y **nunca deben
mezclarse**: uno dice si se cumplió en una fecha, el otro si el hábito sigue en la lista activa.

### Eliminar

`HabitRecord` tiene relación obligatoria con `Habit`, así que borrar un hábito borra primero sus
registros, dentro de un `$transaction`. Es irreversible y **siempre requiere confirmación en la UI**.

### Auth

- bcrypt con **sal explícita**: `genSalt(10)` → `hash(password, salt)` → se guarda la sal en su
  propia columna. Es técnicamente redundante (bcrypt ya la incrusta en el hash) pero es lo que
  pide el ingeniero. `bcrypt.compare()` no la necesita como argumento.
- Login y register devuelven **el mismo shape** que `GET /users/me` (usuario completo sin
  `password`/`salt`), para que el frontend no tenga que manejar dos formas de usuario.
- El JWT lleva `{ sub, email }`; `JwtStrategy.validate` lo convierte en `{ userId, email }`,
  que es lo que recibe `@CurrentUser()`.

### Avatar

Data URL base64 en Mongo (sin storage externo). El navegador recorta en cuadrado centrado,
reduce a 256 px y exporta JPEG al 85% (~30 KB). El backend acepta solo `data:image/(jpeg|png|webp)`
con máximo 2.000.000 caracteres, y el body parser está en 2 MB para que quepa.
`avatar: null` en el PATCH borra la foto; omitirlo la deja igual.

## 8. UI/UX Conventions

**Design tokens — usar siempre estos, no inventar otros.** Todo vive en
`frontend/src/theme/theme.ts`. **No hardcodear colores ni spacing** en componentes: usar
`theme.palette`, `theme.spacing()`, `sx`.

- Primary `#5EC269` / Primary Dark `#438E8F` · Secondary `#4E80EE`
- Background `#F8FAFC` / Surface `#FFFFFF`
- Text Primary `#111729` / Text Secondary `#677389`
- Success `#4CA154` / Warning `#E9A23B` / Error `#DD524C`
- Tipografía **Inter** vía `next/font/google`, expuesta como variable CSS `--font-inter`
- Radios: 12 base, 16 en cards/dialogs, 10 en botones/inputs/alerts, 8 en chips
- Botones `disableElevation`, sin `textTransform: uppercase`
- Cards **planas**: borde sutil `rgba(17,23,41,0.08)`, `boxShadow: none`

**Patrones que deben mantenerse consistentes**

- **Toda vista con datos implementa los 4 estados**: carga (`Skeleton`, nunca un spinner suelto
  a media página), error (`Alert severity="error"` con botón "Reintentar"), vacío (icono
  atenuado + texto + CTA), y con datos.
- **Toda acción destructiva** requiere `Dialog` de confirmación, nombrando el elemento y
  advirtiendo que no se puede deshacer.
- **Feedback de acciones** con `Snackbar` (3000 ms). Errores de formulario en el campo
  (`error` + `helperText`); errores del servidor en un `Alert` arriba del formulario.
- **Nada bloquea la UI entera** por una acción de una fila: se deshabilita solo esa fila
  (patrón `busyId`).
- **Recarga tras mutar**: se incrementa un `reloadKey` que vuelve a disparar el `useEffect`,
  para traer del backend la racha recalculada en vez de adivinarla en el cliente.
- **MUI v9**: los system props sueltos (`alignItems`, `justifyContent`…) **siempre dentro de
  `sx={{ }}`**, nunca como props directas.
- Imports de MUI **uno por archivo** (`import Box from "@mui/material/Box"`), no destructurados.
- Iconos: variantes `Rounded`, coherente en toda la app.
- Fechas y textos en español con locale `es-HN`. Cuidar **singular/plural** — hay helpers en
  `lib/dates.ts` (`pluralizeDays`, `completedLabel`); usarlos en vez de improvisar.
- Los estados neutros no se pintan como fracaso: "hoy no vence nada" y "ese día aún no llega"
  tienen su propio tratamiento visual.
- Accesibilidad: los elementos interactivos no obvios llevan `ButtonBase` + `aria-label`
  (ver `WeekSummaryCard`), y los tooltips en móvil usan `enterTouchDelay={0}`.
- Reutilizar componentes en vez de duplicar UI entre pantallas.

**Componentes reutilizables actuales**

`AppShell` · `AuthGuard` · `EmptyState` · `HabitCard` · `Link` · `ProfileDialog` ·
`AvatarUpload` · `forms/{HabitForm, RegisterForm}` · `dashboard/{TodayProgressCard, StreakCard,
HabitGroupCard, WeekSummaryCard}` · `habits/{HabitsToolbar, HabitFiltersPopover, HabitSortMenu}`.

**Fuentes únicas que hay que respetar** (existen para no volver a duplicar):

- `lib/habit-meta.ts` — labels, colores y orden de prioridad y frecuencia. **Nunca redefinir
  esos mapas en un componente**; ya pasó y hubo que deshacerlo en 4 archivos.
- `lib/habit-filters.ts` — búsqueda, filtros y ordenamiento como **funciones puras**, sin React.
  Toda la lógica de `/habits` vive ahí; la página solo mantiene el estado.
- `lib/dates.ts` — `daysUntilPeriodEnd()` unifica el vencimiento de las tres frecuencias.
- `EmptyState` — todo estado vacío pasa por él.

`components/Link.tsx` es un wrapper de `next/link`: MUI no acepta `next/link` directo como
`component={...}` desde un Server Component.

## 9. Development Commands

```bash
# Base de datos (desde la raíz) — levantar SIEMPRE antes del backend
docker compose up -d          # esperar a que `docker ps` diga (healthy)
docker compose down -v        # apaga Y BORRA los datos

# Backend
cd backend
pnpm install
pnpm prisma generate          # regenera el cliente tras cambiar el schema
pnpm prisma db push           # sincroniza el schema con Mongo (Mongo usa db push, NO migrate)
pnpm run start:dev            # desarrollo con watch
pnpm run build                # nest build — también sirve de type check
pnpm run test                 # vitest run
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e             # OJO: hoy falla, ver §6
pnpm run lint                 # oxlint src/ test/
pnpm run format               # prettier --write

# Frontend
cd frontend
pnpm install
pnpm dev
pnpm build                    # también sirve de type check
pnpm lint                     # eslint
```

**No hay script `typecheck` en ninguno de los dos proyectos.** Para verificar tipos sin
construir: `npx tsc --noEmit` en el proyecto correspondiente.

Variables en `backend/.env`: `PORT`, `DATABASE_URL` (con `?replicaSet=rs0`), `JWT_SECRET`,
`JWT_EXPIRES_IN`, `FRONTEND_URL`.
Variables en `frontend/.env.local`: `NEXT_PUBLIC_API_URL`.

### Cómo probar endpoints (PowerShell, Windows)

Usar `Invoke-RestMethod`, no `curl` (en PowerShell es un alias que se comporta distinto).

```powershell
$login = @{ email = "test@example.com"; password = "password123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body $login -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($response.accessToken)" }

Invoke-RestMethod -Uri "http://localhost:3001/habits" -Method Get -Headers $headers
```

Nota: `ls -a` no existe en PowerShell; el equivalente es `ls -Force`.

## 10. Important Development Rules

### Trampas ya resueltas — no repetir estos errores

1. **ESM en el backend**: los imports relativos llevan extensión `.js` aunque el archivo sea
   `.ts` (`from './app.module.js'`). Es correcto, no es un typo.
2. **`import 'dotenv/config'` debe ser la PRIMERA línea de `main.ts`**, antes de cualquier otro
   import. Sin eso, `JwtModule.register()` se evalúa antes de que `ConfigModule` cargue el `.env`,
   firma los tokens con el secreto de respaldo, y `JwtStrategy` los verifica con el real → todo
   da 401 sin razón aparente.
3. **`PassportModule.register({ defaultStrategy: 'jwt' })`** — cada módulo cuyo controller use
   `@UseGuards(JwtAuthGuard)` debe importarlo **así, configurado**. Importarlo "pelón" no basta
   y da `UnknownDependenciesException` sobre `AuthModuleOptions`.
4. **Prisma fijado en 6.19.3 a propósito.** Prisma 7 no soporta MongoDB; Prisma 8 sí pero sigue
   en release candidate. El ingeniero usa 6.15.0 en clase. **No actualizar.**
5. **Generador `prisma-client-js` sin `output`** → los imports son `from '@prisma/client'`
   (el cliente y los enums). Elegido así para coincidir con la clase.
6. **Después de `prisma generate`, VS Code puede mostrar errores de tipos falsos.** Solución:
   `Ctrl+Shift+P` → "TypeScript: Restart TS Server". Si el build de terminal pasa y el editor
   no, es caché.
7. **MUI v9 tiene breaking changes**: ya no existen claves combinadas tipo `containedPrimary` en
   `styleOverrides` (usar el arreglo `variants` dentro de `root`), y los system props sueltos van
   siempre dentro de `sx`.
8. **`@mui/material-nextjs/v16-appRouter`** — la ruta de import depende de la versión de Next.
   Este proyecto usa Next 16, no v15.
9. **`params` es una Promesa** en Next 15+: se desenvuelve con `use(params)` (ver
   `habits/[id]/edit`).
10. **MUI v9 renombró props de slots**: `inputProps` → `slotProps.htmlInput`, `InputProps` →
    `slotProps.input`. Pasar `inputProps` a un `Checkbox` o `TextField` es error de tipos.
11. **No mandar campos extra al backend.** `ValidationPipe` corre con `forbidNonWhitelisted`, así
    que un campo que no exista en el DTO devuelve 400. Por eso `RegisterForm` no envía
    `confirmPassword` y `HabitForm` omite los campos vacíos en vez de mandar `""`.
12. **Puertos**: frontend 3000, backend 3001.

### Reglas de producto

- A partir de Avance 2 **no se acepta mock data** — todo conectado a Mongo real.
- Toda acción destructiva requiere diálogo de confirmación.
- Toda vista necesita sus 4 estados.
- Commits frecuentes y descriptivos (`feat:`, `fix:`, `refactor:`) — es criterio de evaluación.

### Qué NO romper

- **La simetría entre `backend/src/common/streaks.ts` y `frontend/src/lib/dates.ts`.** Ambos
  anclan las semanas a lunes y las ventanas custom al `startDate`. Cambiar uno solo produce
  etiquetas que contradicen los checkboxes.
- **`countsOnDay()` en `statistics.service.ts`.** Es lo que hace que archivar no reescriba el
  historial. Sustituirlo por un filtro booleano `archivedAt !== null` rompe esa garantía.
- **La verificación de dueño** en `habits.service.ts` (`findOneForUser`). Todo endpoint nuevo
  que toque un recurso debe pasar por ahí o replicarla.
- **`toSafeUser()`**: nunca devolver `password` ni `salt` al cliente.
- **El índice único `[habitId, date]`** y la normalización a medianoche: son lo que impide
  registros duplicados.
- **El patrón de capas del frontend** (página → service → `lib/api.ts`). No meter `fetch` suelto.
- **`frontend/AGENTS.md`** lo reescribe `next dev`; no editarlo.

### Decisiones deliberadas — diferencias con el proyecto del ingeniero

Él construye este mismo habit tracker en clase como guía. Se adoptaron sus **convenciones**
(generador, estilo de IDs, campo `salt`), pero **no su modelo ni su arquitectura**:

- Su schema tiene una tabla intermedia `UserHabits` (muchos-a-muchos). El nuestro es directo:
  un hábito pertenece a un usuario. **Conservar el nuestro** — es lo documentado en el Avance 1.
- Su `habits.service.ts` no filtra por usuario ni verifica dueño (`findAll()` devuelve los
  hábitos de todos). **El nuestro sí, y debe seguir así.**
- Él usa `jsonwebtoken` directo; nosotros `@nestjs/jwt` + Passport (más idiomático de NestJS).
- Él está en NestJS 11 con CommonJS y Jest; nosotros en 12 con ESM y Vitest.
- Él no tiene `HabitRecord`; nosotros lo necesitamos para rachas y estadísticas.

Otras decisiones propias:

- **Sin librería de manejo de estado ni de data-fetching.** `useState` + `useEffect` +
  un solo Context para la sesión. Es suficiente para el tamaño de la app y es lo que el
  estudiante puede explicar en la defensa. No introducir Redux/Zustand/React Query.
- **Sin react-hook-form.** Los formularios son `useState` + `schema.safeParse()` +
  `z.flattenError()` al enviar. Mantener ese patrón en formularios nuevos.
- **Las rachas se calculan, no se guardan.** Evita datos derivados que se desincronizan.

### Documento de Avance 1 — pendiente

- Sección "Componentes principales" del sistema de diseño
- Sección "Tema Material UI" documentada (el código ya existe, falta insertarlo)
- Diagrama de flujo de navegación completo (pantalla → pantalla)
- Separar la sección "API" de "Wireframes"
