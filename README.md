# Habit Tracker

Aplicación web para crear, organizar y dar seguimiento a hábitos personales: permite definir
hábitos con distintas frecuencias, marcarlos como cumplidos día a día, mantener rachas y
consultar estadísticas de progreso.

Proyecto final del curso de **Experiencia de Usuario** — UNITEC, campus San Pedro Sula.
Autor: **Marcelo Rafael Molina Sierra**, Ingeniería en Sistemas Computacionales.

La interfaz está íntegramente en español y el público objetivo son estudiantes universitarios
de 18 a 25 años.

---

## Funcionalidades

- **Autenticación** con registro e inicio de sesión (JWT).
- **Gestión de hábitos**: crear, editar, eliminar, archivar y restaurar. Cada hábito tiene
  nombre, descripción, categoría, frecuencia y prioridad.
- **Tres frecuencias**: diaria, semanal y personalizada (cada N días).
- **Marcado de cumplimiento** por período, con historial persistente.
- **Rachas** calculadas por hábito y una racha global de días activos.
- **Dashboard** con el progreso del día, rachas y los hábitos agrupados por frecuencia.
- **Página de hábitos** con búsqueda, filtros rápidos, filtros avanzados combinables y
  ordenamiento.
- **Estadísticas** con gráfica de cumplimiento de los últimos 30 días, desglose por frecuencia
  y rendimiento por hábito.
- **Configuración**: editar nombre y foto de perfil, cambiar contraseña y cerrar sesión.

---

## Tecnologías utilizadas

### Frontend

| Tecnología                                                                   | Versión      |
| ---------------------------------------------------------------------------- | ------------ |
| Next.js (App Router)                                                         | 16.3.4       |
| React                                                                        | 19.2.8       |
| Material UI (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`) | 9.4.0        |
| MUI X Charts (`@mui/x-charts`)                                               | 9.13.0       |
| Emotion (`@emotion/react`, `@emotion/styled`, `@emotion/cache`)              | 11.14.x      |
| Zod                                                                          | 4.5.4        |
| TypeScript                                                                   | 5.x          |
| ESLint + `eslint-config-next`                                                | 9.x / 16.3.4 |

No se usa Tailwind: todo el estilo sale del tema de Material UI.

### Backend

| Tecnología                               | Versión        |
| ---------------------------------------- | -------------- |
| NestJS (ESM)                             | 12.0.1         |
| Express                                  | 5.2.1          |
| Prisma ORM (`prisma` y `@prisma/client`) | 6.19.3         |
| `@nestjs/jwt`                            | 12.0.1         |
| Passport + `passport-jwt`                | 0.7.0 / 4.0.1  |
| bcrypt                                   | 6.0.0          |
| `class-validator` / `class-transformer`  | 0.15.x / 0.5.x |
| TypeScript                               | 6.x            |
| Vitest                                   | 4.x            |
| oxlint                                   | 1.x            |
| Prettier                                 | 3.x            |

### Base de datos

| Tecnología                 | Versión |
| -------------------------- | ------- |
| MongoDB (imagen `mongo:8`) | 8       |

Configurada como **replica set de un solo nodo** (`rs0`). Ver
[Instalación](#4-levantar-la-base-de-datos) para el motivo.

### Herramientas

| Herramienta | Versión usada |
| ----------- | ------------- |
| Node.js     | 24.18.0       |
| pnpm        | 11.17.0       |
| Docker      | 29.7.2        |

---

## Arquitectura

El frontend y el backend son dos aplicaciones independientes que se comunican por HTTP.

```
┌──────────────────────┐                          ┌──────────────────────┐
│  Next.js (navegador) │ ── fetch + Bearer JWT ──▶ │   NestJS API         │
│  localhost:3000      │ ◀──────── JSON ────────── │   localhost:3001     │
│                      │                          │          │           │
│  token en            │                          │       Prisma         │
│  localStorage        │                          │          ▼           │
└──────────────────────┘                          │   MongoDB (rs0)      │
                                                  │   localhost:27017    │
                                                  └──────────────────────┘
```

**Puntos clave:**

- **Todo el consumo de datos ocurre en el cliente.** Las páginas con datos son Client Components
  que piden en un `useEffect`. No hay Server Components consultando la API, ni Route Handlers,
  ni capa intermedia: el navegador habla directo con NestJS.
- **Autenticación con JWT como Bearer token.** El backend devuelve un `accessToken` al registrarse
  o iniciar sesión. El cliente lo guarda en `localStorage` y lo adjunta en cada petición como
  cabecera `Authorization: Bearer <token>`.
- **El acceso a `localStorage` está encapsulado** en `frontend/src/lib/auth-storage.ts`, de modo
  que migrar a cookies `httpOnly` implicaría cambiar un solo archivo.
- **Capas del frontend**: página → `services/*.service.ts` → `lib/api.ts` → backend. Ningún
  componente llama `fetch` directamente.
- **CORS** está restringido al origen definido en `FRONTEND_URL`.
- Todos los endpoints salvo `/` y `/auth/*` exigen token válido y **verifican propiedad del
  recurso**: devuelven 403 si el hábito o registro no pertenece al usuario del token.

### Estructura del repositorio

```
HabitTracker/
├── docker-compose.yml        # MongoDB 8 como replica set rs0
├── CLAUDE.md                 # Contexto y decisiones técnicas del proyecto
├── README.md
│
├── backend/                  # API NestJS
│   ├── prisma/
│   │   └── schema.prisma     # Modelos y enums
│   ├── prisma.config.ts
│   └── src/
│       ├── main.ts           # Bootstrap: CORS, ValidationPipe global, body parser
│       ├── app.module.ts
│       ├── prisma/           # PrismaService (módulo global)
│       ├── auth/             # Registro, login, estrategia y guard JWT
│       ├── users/            # Perfil y cambio de contraseña
│       ├── habits/           # CRUD de hábitos + archivado
│       ├── habit-records/    # Marcar y desmarcar cumplimiento
│       ├── statistics/       # Resumen, series temporales y rendimiento por hábito
│       └── common/
│           └── streaks.ts    # Cálculo de períodos y rachas (funciones puras)
│
└── frontend/                 # Aplicación Next.js
    └── src/
        ├── app/
        │   ├── page.tsx      # Landing pública con formulario de registro
        │   ├── login/
        │   └── (app)/        # Rutas protegidas (AuthGuard + AppShell)
        │       ├── dashboard/
        │       ├── habits/   # Listado, creación y edición
        │       ├── statistics/
        │       └── settings/
        ├── components/       # UI reutilizable
        ├── context/          # AuthContext (sesión)
        ├── lib/              # Cliente HTTP, fechas, filtros, metadatos
        ├── services/         # Una función por endpoint
        ├── schemas/          # Validación con Zod
        ├── types/            # Espejo de los modelos de Prisma
        └── theme/            # Tema de Material UI
```

### API

| Método   | Ruta                       | Descripción                           |
| -------- | -------------------------- | ------------------------------------- |
| `POST`   | `/auth/register`           | Crear cuenta                          |
| `POST`   | `/auth/login`              | Iniciar sesión                        |
| `GET`    | `/users/me`                | Perfil del usuario autenticado        |
| `PATCH`  | `/users/me`                | Actualizar nombre y/o foto            |
| `PATCH`  | `/users/me/password`       | Cambiar contraseña                    |
| `GET`    | `/habits`                  | Listar hábitos con su racha           |
| `POST`   | `/habits`                  | Crear hábito                          |
| `GET`    | `/habits/:id`              | Detalle de un hábito                  |
| `PATCH`  | `/habits/:id`              | Editar hábito                         |
| `PATCH`  | `/habits/:id/archive`      | Archivar o restaurar                  |
| `DELETE` | `/habits/:id`              | Eliminar hábito e historial           |
| `POST`   | `/habits/:habitId/records` | Marcar o desmarcar cumplimiento       |
| `GET`    | `/habits/:habitId/records` | Historial de un hábito                |
| `GET`    | `/statistics/summary`      | Totales, vencimientos de hoy y rachas |
| `GET`    | `/statistics/weekly`       | Cumplimiento de la semana actual      |
| `GET`    | `/statistics/monthly`      | Cumplimiento de los últimos 30 días   |
| `GET`    | `/statistics/by-habit`     | Rendimiento de cada hábito activo     |

---

## Modelo de datos

Tres colecciones en MongoDB, definidas en `backend/prisma/schema.prisma`.

### `User`

Cuenta de la persona. Guarda `name`, `email` (único, siempre en minúsculas), el hash de la
contraseña, la `salt` en columna propia y opcionalmente un `avatar` en base64.

### `Habit`

Hábito que pertenece a **un solo usuario**. Campos relevantes:

- `frequency` — `daily`, `weekly` o `custom`
- `intervalDays` — cada cuántos días, solo para `custom`
- `priority` — `low`, `medium` o `high`
- `category` — texto libre
- `startDate` / `endDate` — vigencia del hábito
- `archivedAt` — `null` significa activo; si tiene fecha, el hábito está archivado

### `HabitRecord`

Registro de que un hábito se cumplió en una fecha. Tiene un **índice único compuesto
`[habitId, date]`**, que es lo que permite actualizar en lugar de duplicar cuando se marca dos
veces el mismo día.

### Relaciones

```
User ──1:N──▶ Habit ──1:N──▶ HabitRecord
  └──────────────1:N──────────────┘
```

Un usuario tiene muchos hábitos y muchos registros; un hábito tiene muchos registros. La
relación entre usuario y hábito es **directa, sin colección intermedia**.

> Las rachas **no se almacenan**: se calculan en cada petición a partir de los `HabitRecord`.

---

## Instalación

Instrucciones completas desde cero.

### 1. Requisitos previos

| Requisito                                                         | Versión usada | Notas                    |
| ----------------------------------------------------------------- | ------------- | ------------------------ |
| [Node.js](https://nodejs.org/)                                    | 24.18.0       |                          |
| [pnpm](https://pnpm.io/installation)                              | 11.17.0       | `npm install -g pnpm`    |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 29.7.2        | Debe estar **corriendo** |

El proyecto usa **pnpm**, no npm ni yarn. Mezclar gestores genera lockfiles inconsistentes.

### 2. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd HabitTracker
```

### 3. Verificar que Docker esté activo

```bash
docker info
```

Si falla, abre Docker Desktop y espera a que termine de iniciar.

### 4. Levantar la base de datos

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Esto levanta MongoDB 8 en el puerto `27017`, en un contenedor llamado `habit-tracker-mongo`.

**¿Por qué replica set y no un MongoDB normal?** Prisma exige que MongoDB corra como replica set
porque usa transacciones (`$transaction`), y MongoDB solo las soporta en ese modo. Contra una
instancia suelta, Prisma falla al conectarse. Por eso el contenedor arranca con
`--replSet rs0` y el `healthcheck` del `docker-compose.yml` ejecuta `rs.initiate()`
automáticamente la primera vez.

Espera a que el contenedor esté saludable antes de seguir:

```bash
docker ps
```

La columna `STATUS` debe decir `(healthy)`. Suele tardar entre 10 y 30 segundos.

### 5. Configurar las variables de entorno del backend

Crea el archivo `backend/.env`:

```env
DATABASE_URL="mongodb://localhost:27017/habit-tracker?replicaSet=rs0"
JWT_SECRET="<cadena-larga-y-aleatoria>"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

| Variable         | Descripción                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | Cadena de conexión a MongoDB. **Debe incluir `?replicaSet=rs0`**; sin ese parámetro Prisma no conecta. El contenedor local no usa usuario ni contraseña. |
| `JWT_SECRET`     | Clave con la que se firman y verifican los tokens. Usa una cadena larga y aleatoria propia; no la subas al repositorio.                                  |
| `JWT_EXPIRES_IN` | Vigencia del token. Debe tener el formato `<número>d` (por ejemplo `7d`).                                                                                |
| `PORT`           | Puerto donde escucha la API. El frontend espera `3001`.                                                                                                  |
| `FRONTEND_URL`   | Origen autorizado por CORS. En desarrollo, `http://localhost:3000`.                                                                                      |

> El archivo `.env` está en `.gitignore` y no debe versionarse.

### 6. Instalar dependencias del backend y generar el cliente de Prisma

```bash
cd backend
pnpm install
pnpm prisma generate
```

`prisma generate` lee `schema.prisma` y genera el cliente tipado que importa el código. **Hay que
volver a ejecutarlo cada vez que cambie el schema**, o TypeScript no conocerá los campos nuevos.

### 7. Sincronizar el schema con la base de datos

```bash
pnpm prisma db push
```

**¿Por qué `db push` y no `prisma migrate`?** El sistema de migraciones de Prisma está pensado
para bases relacionales, donde cada cambio de estructura necesita un `ALTER TABLE` versionado.
MongoDB no tiene esquema rígido: las colecciones y los campos se crean solos al escribir. Por eso
Prisma **no soporta `migrate` con MongoDB**, y `db push` se encarga de lo único que sí requiere
una operación explícita: crear los índices, como el índice único `[habitId, date]` de
`HabitRecord`.

### 8. Configurar las variables de entorno del frontend

Crea el archivo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

| Variable              | Descripción                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base de la API. El prefijo `NEXT_PUBLIC_` es obligatorio para que Next.js la exponga al navegador, que es donde se ejecutan las peticiones. |

### 9. Instalar dependencias del frontend

```bash
cd ../frontend
pnpm install
```

### 10. Levantar ambos servidores

En **dos terminales separadas**:

```bash
# Terminal 1 — backend
cd backend
pnpm run start:dev
```

```bash
# Terminal 2 — frontend
cd frontend
pnpm dev
```

| Servicio      | URL                         |
| ------------- | --------------------------- |
| Frontend      | http://localhost:3000       |
| Backend (API) | http://localhost:3001       |
| MongoDB       | `mongodb://localhost:27017` |

Abre http://localhost:3000, crea una cuenta desde la página de inicio y listo.

> Para inspeccionar la base de datos, MongoDB Compass se conecta a
> `mongodb://localhost:27017` sin usuario ni contraseña.

---

## Problemas comunes al instalar

### `EPERM: operation not permitted` al ejecutar `prisma generate` (Windows)

```
Error: EPERM: operation not permitted, rename '...\query_engine-windows.dll.node.tmp...'
```

Ocurre cuando el servidor de desarrollo está corriendo: el proceso de Node mantiene bloqueado el
motor de consultas de Prisma y Windows no permite reemplazar un archivo en uso.

**Solución:** detén el backend (`Ctrl+C` en su terminal), ejecuta `pnpm prisma generate` y vuelve
a levantarlo.

### VS Code marca errores de tipos que no existen

Después de un `prisma generate`, el editor puede seguir señalando campos del schema como
inexistentes aunque el proyecto compile sin problemas en la terminal. Es caché del servidor de
TypeScript, no un error real.

**Solución:** `Ctrl+Shift+P` → **TypeScript: Restart TS Server**.

Regla práctica: si `pnpm run build` pasa en la terminal y el editor no, confía en la terminal.

### El backend no conecta con la base de datos

Revisa, en este orden:

1. Docker Desktop está corriendo.
2. `docker ps` muestra `habit-tracker-mongo` con estado `(healthy)`, no solo `Up`.
3. `DATABASE_URL` incluye `?replicaSet=rs0`.

Si levantaste MongoDB por tu cuenta en vez de usar `docker compose`, no funcionará: necesita ser
replica set.

### Todas las peticiones autenticadas devuelven 401

Verifica que `backend/src/main.ts` conserve `import 'dotenv/config'` como **primera línea del
archivo**. Si se mueve o se ordenan los imports automáticamente, `JwtModule` se evalúa antes de
que se cargue el `.env`: los tokens se firman con el secreto de respaldo y se verifican con el
real, así que todo falla sin un mensaje claro.

### Una petición válida devuelve 400

El backend valida con `forbidNonWhitelisted` activado: cualquier campo que no exista en el DTO
correspondiente hace fallar la petición completa. Envía únicamente los campos declarados.

### pnpm pide aprobar scripts de compilación

`bcrypt` y Prisma compilan binarios nativos durante la instalación. Los permisos ya están
declarados en los archivos `pnpm-workspace.yaml` de cada proyecto, así que no debería pedirlos;
si tu versión de pnpm lo hace igualmente, apruébalos.

---

## Scripts disponibles

### Backend (`cd backend`)

| Comando                | Descripción                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `pnpm run start:dev`   | Servidor de desarrollo con recarga automática               |
| `pnpm run build`       | Compila a `dist/`. Sirve también como verificación de tipos |
| `pnpm run start:prod`  | Ejecuta la compilación de producción                        |
| `pnpm test`            | Tests unitarios con Vitest                                  |
| `pnpm run test:watch`  | Tests en modo observador                                    |
| `pnpm run test:cov`    | Tests con reporte de cobertura                              |
| `pnpm run lint`        | Análisis estático con oxlint                                |
| `pnpm run format`      | Formatea el código con Prettier                             |
| `pnpm prisma generate` | Regenera el cliente de Prisma                               |
| `pnpm prisma db push`  | Sincroniza el schema con MongoDB                            |

### Frontend (`cd frontend`)

| Comando      | Descripción                                       |
| ------------ | ------------------------------------------------- |
| `pnpm dev`   | Servidor de desarrollo                            |
| `pnpm build` | Compilación de producción. Verifica tipos también |
| `pnpm start` | Sirve la compilación de producción                |
| `pnpm lint`  | Análisis estático con ESLint                      |

Ninguno de los dos proyectos define un script `typecheck`. Para revisar tipos sin compilar:
`npx tsc --noEmit`.

### Base de datos (desde la raíz)

| Comando                  | Descripción                                       |
| ------------------------ | ------------------------------------------------- |
| `docker compose up -d`   | Levanta MongoDB en segundo plano                  |
| `docker compose stop`    | Detiene el contenedor conservando los datos       |
| `docker compose down -v` | Detiene el contenedor y **borra todos los datos** |

---

## Decisiones de diseño

Las decisiones técnicas que un lector podría cuestionar, con su razón.

### Prisma fijado en 6.19.3

No es una versión desactualizada por descuido. **Prisma 7 eliminó el soporte para MongoDB**, y
aunque Prisma 8 lo reincorpora, al momento de desarrollar seguía en release candidate. La 6.19.3
es la última versión estable que soporta MongoDB, y además se mantiene cerca de la que se usa en
clase. Actualizar rompería el proyecto.

### El token vive en `localStorage`, no en una cookie

Una cookie `httpOnly` sería más resistente a XSS, ya que JavaScript no puede leerla. Se optó por
`localStorage` porque el frontend y el backend son dos aplicaciones separadas en orígenes
distintos: usar cookies exigiría configurar `SameSite`, `credentials` y dominios compartidos,
complejidad que no se justifica en un proyecto académico ejecutado en local.

La decisión está **aislada en un único archivo** (`frontend/src/lib/auth-storage.ts`): ningún
componente accede a `localStorage` directamente, así que migrar a cookies significaría reescribir
ese archivo y nada más.

### Las rachas se calculan, no se guardan

Almacenar la racha en la base de datos crearía un dato derivado que puede desincronizarse del
historial real. En su lugar se recalculan en cada petición a partir de los `HabitRecord`, con
funciones puras en `backend/src/common/streaks.ts`. `GET /habits` resuelve todas las rachas en
dos consultas —hábitos y registros— agrupando en memoria, en vez de una consulta por hábito.

### Archivar guarda una fecha, no un booleano

`Habit.archivedAt` es una fecha nullable en lugar de un campo `isArchived`. Esto permite
responder _"¿estaba archivado este hábito el día X?"_, que es lo que hace posible archivar sin
reescribir el historial: los días anteriores al archivado conservan sus estadísticas intactas y
el hábito solo deja de contar a partir de esa fecha. Con un booleano habría que elegir entre
alterar el pasado o penalizar al usuario indefinidamente.

Archivar y eliminar son operaciones distintas por diseño: archivar es reversible y conserva todo
el historial; eliminar es irreversible y borra los registros junto con el hábito.

### Sin librería de manejo de estado ni de data-fetching

No hay Redux, Zustand ni React Query. El estado se maneja con `useState`, `useEffect` y un único
Context para la sesión. Para el tamaño de la aplicación es suficiente, y mantiene el código
explicable de principio a fin sin capas de abstracción adicionales.

### Sin react-hook-form

Los formularios usan `useState` junto con `schema.safeParse()` de Zod al enviar, y
`z.flattenError()` para repartir los errores a cada campo. Es el mismo patrón en todos los
formularios de la aplicación.

### Sal de bcrypt en columna propia

`User.salt` almacena la sal de forma explícita, aunque bcrypt ya la incrusta dentro del hash y
`bcrypt.compare()` no la necesita como argumento. Es redundante a propósito: responde a la
convención enseñada en el curso.

### Backend en ESM

El backend usa módulos ES (`"type": "module"`), por lo que **los imports relativos llevan
extensión `.js` aunque el archivo fuente sea `.ts`** (por ejemplo, `from './app.module.js'`).
No es un error: es el requisito de resolución de módulos de Node en ESM.

---

## Limitaciones conocidas

- **Cambiar la contraseña no invalida los tokens ya emitidos.** Siguen siendo válidos hasta que
  expiran. Cerrarlos requeriría un campo de versión de token en `User` verificado por la
  estrategia JWT.
- **El correo electrónico no se puede modificar**: no existe endpoint para ello.
- **Las estadísticas semanales y mensuales consideran solo hábitos diarios.** Un hábito semanal o
  personalizado no pertenece a un día concreto, e incluirlo distorsionaría el cálculo. Los
  hábitos de esas frecuencias se cubren en el desglose de `/statistics/by-habit`.
- **No hay tests de frontend.** El backend conserva únicamente los tests del andamiaje inicial.
