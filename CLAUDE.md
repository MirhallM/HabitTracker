# Habit Tracker — Proyecto Final UX (UNITEC)

## Contexto académico
- Curso: Experiencia de Usuario — UNITEC, campus San Pedro Sula. Catedrático: Ing. Victor Ramirez.
- Modalidad: **individual**. Estudiante: Marcelo Rafael Molina Sierra.
- Entregas: Avance 1 (semana 4), Avance 2 (semana 7), Avance 3 (semana 10, proyecto final).
- Enfoque incremental: cada entrega parte de la anterior, no se reescribe desde cero.

## Stack obligatorio
- Frontend: Next.js (App Router) + Material UI (MUI)
- Backend: NestJS, arquitectura modular
- Base de datos: MongoDB + Mongoose
- Auth: JWT
- Control de versiones: Git/GitHub con commits frecuentes y descriptivos

## Qué es el producto
App web para crear, organizar y dar seguimiento a hábitos personales (salud, estudio, descanso). Público objetivo: universitarios 18–25 años. Debe motivar con indicadores visuales, estadísticas y gamificación ligera (rachas), sin volverse un juego.

## Design tokens — usar siempre estos, no inventar otros
- Primary `#5EC269` / Primary Dark `#438E8F`
- Secondary `#4E80EE`
- Background `#F8FAFC` / Surface `#FFFFFF`
- Text Primary `#111729` / Text Secondary `#677389`
- Success `#4CA154` / Warning `#E9A23B` / Error `#DD524C`
- Tipografía: Inter
- Radios: 12 base, 16 en cards/dialogs, 10 en botones/inputs
- Botones: `disableElevation`, sin `textTransform: uppercase`
- El tema ya está implementado en `src/theme/theme.ts` + `ThemeRegistry.tsx` (App Router, usa `AppRouterCacheProvider`). No recrear desde cero, extender ese archivo.

## Funcionalidades requeridas
- **Usuarios:** registro, login, logout, ver perfil.
- **Hábitos (CRUD):** crear, editar, eliminar, activar/desactivar; frecuencia (diario/semanal/personalizada); categoría opcional; prioridad; fecha inicio y fin opcional.
- **Seguimiento:** marcar hábito completado, historial, progreso diario/semanal/mensual.
- **Dashboard:** hábitos activos, completados hoy, racha actual, mejor racha, % cumplimiento, gráfica semanal y mensual.
- **Estadísticas:** total de hábitos, activos, finalizados, días consecutivos, progreso mensual, tendencia de cumplimiento.

## Endpoints planeados (documento preliminar de Avance 1)
- `POST /auth/register`, `POST /auth/login`
- `GET /users/me`, `PATCH /users/me`
- `GET/POST /habits`, `GET/PATCH/DELETE /habits/:id`, `PATCH /habits/:id/status`
- `POST/GET /habits/:id/records`
- `GET /statistics/summary|weekly|monthly`

## Modelo de datos (Mongo, sugerido)
- **Usuarios:** nombre, correo, contraseña, fechaRegistro
- **Hábitos:** nombre, descripción, categoría, frecuencia, prioridad, fechaInicio, activo, usuario
- **Registros:** hábito, usuario, fecha, completado

## Estado actual del proyecto (retomar desde aquí, no desde cero)
Avance 1 en progreso. Ya completo: definición del problema, público objetivo, objetivos, user persona, customer journey, benchmark (Habitica, Loop Habit Tracker), paleta de colores, tipografía, iconografía, 7 wireframes, tablas preliminares de API.

**Pendiente para cerrar Avance 1:**
1. Sección "Componentes principales" del sistema de diseño (Button, Card, Input, Chip, Badge, Dialog, Snackbar en el tema real).
2. Sección "Tema Material UI" documentada (ya existe el código, falta insertarlo en el documento de entrega).
3. Diagrama de flujo de navegación más completo (pantalla → pantalla).
4. Separar la sección "API" de "Wireframes" en el documento.
5. Confirmar/crear repo de GitHub con estructura inicial.

## Convenciones de trabajo
- A partir de Avance 2 no se acepta mock data — todo debe conectar a Mongo real.
- Toda acción destructiva (eliminar hábito) requiere diálogo de confirmación.
- Toda vista necesita: estado de carga, estado vacío, estado de error, estado con datos.
- Reutilizar componentes (`HabitCard`, `StreakBadge`, `ProgressBar`, `ConfirmDialog`) en vez de duplicar UI entre pantallas.
- Responsive real: el sidebar debe colapsar a drawer/bottom nav en móvil, no solo "no romperse".
