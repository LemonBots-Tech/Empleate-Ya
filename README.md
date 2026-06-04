# Empléate YA AI Platform

Plataforma web SaaS de empleabilidad con inteligencia artificial. El MVP técnico implementa un **backend central con orquestador** para recibir un prompt libre, clasificar intención, validar créditos e insumos, ejecutar módulos internos mock y guardar entregables como artifacts.

## 1. Arquitectura propuesta

- **Frontend:** Next.js App Router + TypeScript + Tailwind CSS, pantallas responsivas y componentes reutilizables en `src/components/employability`.
- **Backend:** API routes de Next.js para Auth, Perfil, Créditos, Archivos, Prompt Gateway, Ejecución, Artifacts y Proyectos.
- **Orquestación:** `careerOrchestrator` recibe una solicitud única, detecta intención, elige módulos internos, estima créditos, valida faltantes y ejecuta agentes mock en Fase 1.
- **IA:** `aiService` centraliza la integración. En Fase 1 devuelve respuestas mock; en Fase 2 conectará OpenAI API solo desde backend.
- **Créditos:** `creditService` administra wallet, compras mock, consumo y ledger con balance antes/después.
- **Artifacts:** `artifactService` crea, lista, duplica, elimina y prepara descargas HTML/JSON. La arquitectura reserva rutas DOCX/PDF.
- **Base de datos:** `prisma/schema.prisma` define PostgreSQL con usuarios, perfiles, consentimientos, wallets, ledger, pricing, proyectos, archivos, artifacts, versiones, sesiones, runs, auditoría y vacantes guardadas.
- **Storage:** Fase 1 registra rutas locales mock. Producción debe usar S3/Supabase Storage con URLs firmadas.
- **Pagos:** Fase 1 incluye compra mock. La capa queda lista para Stripe/Mercado Pago mediante variables de entorno.
- **Seguridad MVP:** contraseñas con PBKDF2, cookies httpOnly, consentimientos, auditoría básica y control de acceso por usuario en endpoints.

## 2. Estructura de carpetas

```text
prisma/schema.prisma                  # Esquema PostgreSQL propuesto
src/ai/personaRegistry.ts             # Configuración visual/persona de agentes
src/ai/skillRegistry.ts               # Módulos, costos, inputs, outputs y prompts
src/ai/prompts/*.md                   # Prompts separados por agente
src/services/aiService.ts             # Capa central de IA
src/services/authService.ts           # Registro/login/hash/session mock
src/services/careerOrchestrator.ts    # Orquestador central
src/services/creditService.ts         # Wallet y ledger
src/services/artifactService.ts       # Bóveda de artifacts
src/lib/mockdb/store.ts               # Store en memoria para Fase 1
src/lib/api/response.ts               # Respuestas y errores API
src/app/api/**/route.ts               # Endpoints MVP
src/app/register                      # Registro
src/app/login                         # Login
src/app/onboarding                    # Perfil profesional
src/app/dashboard                     # Dashboard
src/app/gateway                       # Prompt Gateway
src/app/modules/[id]                  # Pantalla de personaje/agente
src/app/vault                         # Mi Bóveda
src/app/projects                      # Proyectos profesionales
src/app/credits                       # Créditos y compra mock
src/app/account                       # Configuración/privacidad
tests/employability-mvp.test.mjs      # Smoke tests de orquestador/créditos
```

## 3. Esquema Prisma

El esquema incluye los modelos solicitados:

- `User`
- `ProfessionalProfile`
- `PrivacyConsent`
- `CreditWallet`
- `CreditLedger`
- `ModulePricing`
- `Project`
- `File`
- `Artifact`
- `ArtifactVersion`
- `Session`
- `ModuleRun`
- `AuditLog`
- `SavedJob`

También incluye enums para estado de usuario, consentimientos, ledger, proyectos, artifacts, sesiones y ejecuciones.

## 4. Componentes principales

- `EmployabilityShell`: layout SaaS con navegación principal.
- `AgentCards`: tarjetas de personajes desde skill/persona registry.
- `PromptGatewayClient`: campo libre, análisis del orquestador, plan, costo estimado y ejecución mock.
- Pantallas de registro, login, onboarding, dashboard, módulos, bóveda, proyectos, créditos y configuración.

## 5. Endpoints MVP

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Perfil
- `GET /api/profile`
- `PUT /api/profile`

### Créditos
- `GET /api/credits/balance`
- `GET /api/credits/ledger`
- `POST /api/credits/mock-purchase`

### Archivos
- `POST /api/files/upload`
- `GET /api/files`
- `DELETE /api/files/:id`

### IA central
- `POST /api/ai/prompt`
- `POST /api/ai/execute`

### Artifacts
- `GET /api/artifacts`
- `GET /api/artifacts/:id`
- `POST /api/artifacts/:id/duplicate`
- `GET /api/artifacts/:id/download?format=html|json`
- `DELETE /api/artifacts/:id`

### Proyectos
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

## 6. Plan de implementación por commits pequeños

1. **Arquitectura y dominio:** Prisma schema, registries, prompts, README y `.env.example`.
2. **Servicios base:** auth, créditos, artifacts, aiService mock y store temporal.
3. **Orquestador:** clasificación, missing inputs, estimación, validación de saldo, ejecución mock y auditoría.
4. **Endpoints:** Auth, Perfil, Créditos, Archivos, IA, Artifacts y Proyectos.
5. **Frontend navegable:** landing, registro/login, onboarding, dashboard, gateway, módulos, bóveda, proyectos, créditos y configuración.
6. **Calidad:** tests básicos, lint, typecheck y build si aplica.

## Fase 1 MVP técnico implementada

- Registro/login mock con hash seguro PBKDF2 y cookies httpOnly.
- Consentimientos iniciales: privacidad, términos, IA y almacenamiento de artifacts.
- Perfil profesional vía onboarding.
- Créditos mock con wallet, compra mock y ledger.
- Skill registry y persona registry con 10 agentes.
- Prompt Gateway básico con análisis y ejecución centralizada.
- ScoreX y Optim mock dentro del orquestador.
- Guardado de artifacts mock en Mi Bóveda.
- Prisma schema completo preparado para PostgreSQL.

## Pendiente para Fases 2-5

- Persistencia real con Prisma Client y PostgreSQL.
- Integración OpenAI API real, medición de tokens y costos reales.
- Generación DOCX/PDF y versionado avanzado.
- Storage S3/Supabase con URLs firmadas.
- Agentes avanzados con lógica real.
- Stripe/Mercado Pago, políticas legales finales, backups, panel admin y hardening de producción.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

> Nota: en este entorno la instalación de paquetes desde npm puede estar restringida. El MVP usa dependencias ya presentes en el workspace.

## Variables de entorno

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/empleate_ya_ai"
OPENAI_API_KEY=""
NEXTAUTH_SECRET="change-me"
APP_URL="http://localhost:3000"
STORAGE_PROVIDER="local"
STRIPE_SECRET_KEY=""
MERCADOPAGO_ACCESS_TOKEN=""
```

## Comandos de calidad

```bash
npm run lint
npm run typecheck
npm test
```
