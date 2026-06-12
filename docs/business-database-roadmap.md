# Ruta de desarrollo de base de datos y negocio

Este documento traduce el modelo de negocio de Empleate YA a tablas y fases de desarrollo. La regla central es disenar desde ahora como plataforma multi-tenant: un usuario puede entrar como usuario online, cliente de emprendedor, ex-colaborador de empresa o usuario con coaching 1o1, pero sus datos personales y consentimientos siguen siendo suyos.

## Fase 1: Fundacion segura

Objetivo: permitir cuentas, roles, organizaciones, consentimiento y auditoria antes de escalar operaciones.

Tablas principales:

- `users`: cuenta base del usuario, perfil, idioma, datos de contacto y estado.
- `organizations`: empresas, emprendedores/franquiciatarios y Empleate YA como organizacion principal. No conviene duplicar tablas de empresas y emprendedores; se distinguen por `OrganizationType`.
- `memberships`: relacion usuario-organizacion con rol: `super_admin`, responsable, colaborador, reclutador, coach, cliente o participante.
- `consents`: permisos granulares del usuario para compartir avances, artifacts, datos con coach, empresa, emprendedor y futura bolsa de trabajo.
- `audit_logs`: registro obligatorio de altas, bajas, cambios, ejecucion de agentes, descargas, asignaciones, pagos y solicitudes sensibles.
- `deletion_requests`: solicitudes de borrado que notifican a servicio a clientes antes de ejecutar eliminacion.
- `catalogs` y `catalog_items`: catálogos editables por super admin para tipos de usuario, roles, estados, industrias, niveles, campañas y otros valores maestros.
- `credit_policies`, `ai_model_costs` y `screen_token_budgets`: política económica para convertir costo de modelos IA en créditos, considerando tipo de cambio USD/MXN, margen, tokens estimados y pantallas cuyo costo absorbe Empleate YA.

Prioridad de seguridad:

- Separacion por `organizationId` en toda consulta sensible.
- Politicas de acceso por rol y consentimiento.
- Auditoria no editable desde la interfaz.
- Todo cambio de catálogo debe crear `audit_log`.
- Todo cambio de política de créditos, modelo o presupuesto de tokens debe crear `audit_log` y conservar versión histórica.
- Retencion limitada de archivos y artifacts segun plan y aviso de privacidad.

## Fase 2: Usuarios online y creditos

Objetivo: vender acceso directo a usuarios que compran creditos y consumen agentes.

Tablas principales:

- `credit_wallets`: saldo actual por usuario.
- `credit_ledger`: movimientos de compra, consumo, reembolso, expiracion y ajuste manual.
- `module_pricing`: costo por agente, idioma, tipo de entrega o version.
- `screen_token_budgets`: presupuesto esperado por pantalla/agente para saber dónde se consumen más tokens y qué flujos conviene limitar, cobrar o absorber.
- `module_runs`: cada ejecucion de avatar/agente con prompt, idioma, estado, costo y resultado.
- `artifacts`: entregables generados: CV, reporte ScoreX, cartas, LinkedIn, entrevista, etc.
- `artifact_files`: archivos descargables: Word, PDF, HTML, imagenes o evidencias.
- `projects`: carpetas de trabajo del usuario para agrupar CVs, vacantes y procesos.

Notas:

- El usuario online compra creditos desde Stripe de Empleate YA.
- Los creditos deben tener historial completo; nunca solo actualizar un numero.
- El idioma elegido por el usuario debe guardarse en `module_runs` y `artifacts`.
- El FAQ de home y el Gateway gratuito deben tener límites por sesión/IP porque generan costo absorbido por marketing.
- ScoreX regalado debe registrarse como consumo promocional: no cobra al usuario, pero sí descuenta de una bolsa promocional o presupuesto interno.

## Fase 3: Coaching 1o1 y cursos online

Objetivo: vender planes premium con acompanamiento humano y entrenamiento.

Tablas principales:

- `coaching_sessions`: sesiones online o presenciales con fecha, coach, usuario, estado y tipo.
- `coaching_notes`: notas internas del coach, visibles segun rol y autorizacion.
- `nps_surveys`: evaluacion de calidad, NPS, testimonios y feedback.
- `courses`: cursos de metodologia Empleate YA.
- `course_lessons`: lecciones por curso.
- `course_enrollments`: inscripcion de usuarios, coaches o emprendedores.
- `course_progress`: avance por leccion, fecha y evidencia.

Notas:

- Coaching 1o1 es servicio directo de Empleate YA.
- El coach puede ver artifacts y avance solo cuando exista consentimiento o sea parte del servicio contratado.
- NPS y testimonios deben pedir consentimiento separado.

## Fase 4: Empresas y outplacement

Objetivo: vender licencias empresariales, campanas de outplacement y seguimiento de ex-colaboradores.

Tablas principales:

- `organizations` con tipo `company`.
- `memberships` para responsables y colaboradores de reclutamiento/seleccion.
- `subscriptions` para licencia anual o mensual segun contrato.
- `campaigns`: grupos de outplacement autorizados por administrador principal.
- `campaign_participants`: usuarios/ex-colaboradores asignados a cada campana, con estado, rol dentro de la campana y referencia a su membresia en la empresa.
- `campaign_artifacts`: entregables relacionados con una campana.
- `coaching_sessions`: coaching opcional dentro de la campana.
- `nps_surveys`: calidad del entrenamiento, coach y experiencia.

Reglas de negocio:

- La empresa paga licencia y fee por campana o grupo autorizado.
- La empresa puede ver avance y artifacts requeridos de ex-colaboradores dentro del servicio.
- Debe quedar auditado quien asigno, vio, descargo o modifico informacion.

## Fase 5: Emprendedores y franquicia

Objetivo: habilitar franquiciatarios con clientes propios, metodologia y cuota mensual.

Tablas principales:

- `organizations` con tipo `entrepreneur`.
- `memberships` para responsable, colaborador y clientes.
- `subscriptions` con permanencia minima de 6 meses.
- `course_enrollments` obligatorio para curso de metodologia.
- `campaign_participants`: clientes asignados a programas o campanas creadas por el emprendedor.
- `module_runs`, `artifacts` y `credit_ledger` para consumo de clientes.

Reglas de negocio:

- El emprendedor paga licencia mensual a Empleate YA.
- El emprendedor cobra a sus clientes por su cuenta.
- Los clientes pueden comprar creditos adicionales a Empleate YA si el modelo lo permite.
- El emprendedor puede ver avance y artifacts de sus clientes dentro del alcance autorizado.

## Fase 6: Bolsa de trabajo y matching futuro

Objetivo: permitir que empresas publiquen vacantes y que usuarios acepten participar en matching.

Tablas futuras:

- `job_opportunities`: vacantes de empresas.
- `job_match_consents`: consentimiento explicito para participar.
- `job_matches`: relacion usuario-vacante con score, estado y fecha.
- `job_applications`: postulaciones, entrevistas y seguimiento.
- `candidate_profiles`: perfil resumido para matching sin exponer datos sensibles innecesarios.

Reglas:

- El usuario debe autorizar entrar a la bolsa de trabajo.
- El matching no debe exponer CV completo ni artifacts privados sin consentimiento.
- Las empresas solo deben ver candidatos dentro de vacantes y permisos autorizados.

## Orden recomendado de construccion

1. Usuarios online: autenticacion, idioma global, creditos, ejecucion de agentes, artifacts y descargas.
2. Coaching 1o1: agenda, coach asignado, notas, NPS y cursos base.
3. Empresas/outplacement: organizaciones, responsables, campanas y seguimiento.
4. Emprendedores/franquicia: licencias de 6 meses, curso obligatorio, clientes y reportes.
5. Bolsa de trabajo: consentimiento, vacantes, matching y postulaciones.

## Decisiones tecnicas iniciales

- Usar Supabase Postgres como base de datos principal.
- Usar Prisma como capa de modelado opcional para describir tablas, relaciones y migraciones desde el codigo.
- Guardar archivos grandes en Supabase Storage o Blob compatible, no dentro de tablas.
- Mantener Stripe como fuente de verdad de pagos y reflejar estados en `subscriptions` y `credit_ledger`.
- Implementar auditoria desde el primer modulo real, aunque al principio sea simple.

## Aviso de privacidad: puntos que ya debe contemplar

- Identidad del responsable: Empleate YA.
- Datos recabados: perfil, CV, vacantes, artifacts, pagos, uso de agentes, sesiones y encuestas.
- Finalidades primarias: prestacion del servicio, generacion de entregables, coaching y soporte.
- Finalidades secundarias: testimonios, investigacion, marketing y bolsa de trabajo, siempre con consentimiento.
- Transferencias: empresas, emprendedores o coaches solo cuando el usuario pertenezca a ese servicio o lo autorice.
- Derechos ARCO y borrado: solicitud registrada, revision de servicio a clientes y ejecucion auditada.
- Seguridad: control por rol, separacion por organizacion, cifrado en transito, almacenamiento seguro y logs.
