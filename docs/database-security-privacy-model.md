# Modelo de base de datos, seguridad y privacidad

Este documento define la dirección inicial para convertir Empléate YA en una plataforma multi-tenant con usuarios online, coaching 1o1, empresas de outplacement, emprendedores/franquiciatarios y futuros servicios de bolsa de trabajo.

## Principios

- El usuario es dueño de su CV, reportes, documentos, sesiones, respuestas y datos profesionales.
- Toda visibilidad de terceros debe estar respaldada por rol, relación organizacional y consentimiento.
- El super admin de Empléate YA tiene acceso operativo total.
- Empresas y emprendedores pueden ver información de usuarios asignados a sus programas, clientes o campañas, según consentimientos y contrato.
- Todo movimiento relevante debe quedar en auditoría: altas, bajas, cambios de rol, uso de créditos, ejecución de avatar, descargas, consentimientos, accesos y solicitudes de borrado.
- El borrado de datos no es inmediato: se registra solicitud, se notifica a servicio a clientes, se revisa y después se elimina o anonimiza lo permitido.

## Multi-tenant

La tabla `organizations` representa:

- `empleate_ya`: operación interna, coaches, soporte y super admin.
- `company`: empresas que compran outplacement o servicios corporativos.
- `entrepreneur`: emprendedores/franquiciatarios.

La tabla `memberships` une usuarios con organizaciones y roles. Un usuario puede tener varios roles en distintas organizaciones.

Roles principales:

- `super_admin`
- `support_admin`
- `coach`
- `company_admin`
- `company_recruiter`
- `company_participant`
- `entrepreneur_owner`
- `entrepreneur_collaborator`
- `entrepreneur_client`
- `online_user`
- `coaching_client`

## Consentimientos

`privacy_consents` debe guardar aceptación y versión para:

- Aviso de privacidad.
- Términos.
- Procesamiento con IA.
- Procesamiento de imagen.
- Almacenamiento de entregables.
- Compartir avance/reportes con empresa.
- Compartir avance/reportes con emprendedor.
- Compartir información con coach.
- Participar en futura bolsa de trabajo/matching.
- Uso de testimonio.

El consentimiento `job_matching_pool` permitirá que Empléate YA contacte al usuario si una empresa entrega una vacante que haga match con su perfil. Este producto debe ser opt-in.

## Licencias y pagos

Usuarios online:

- Compran créditos por Stripe.
- Los créditos pueden vencer.
- Consumen avatares según precio por módulo.

Coaching 1o1:

- Servicio premium de Empléate YA.
- Incluye acceso a plataforma y asesoría con coach/trainer.
- Puede incluir sesiones online o presenciales.

Empresas:

- Pagan licencia anual anticipada.
- Pagan fee adicional por campaña o grupo de outplacement.
- Pueden tener varios administradores y responsables de reclutamiento/selección.
- Pueden asignar ex-empleados a campañas aprobadas.

Emprendedores/franquiciatarios:

- Pagan licencia mensual.
- Contrato mínimo de 6 meses.
- Pueden tener responsable y colaboradores.
- Administran clientes propios.
- Deben tomar curso obligatorio de metodología.
- Ellos cobran a sus clientes; Empléate YA cobra la licencia y/o créditos según modelo comercial definido.

## Campañas de outplacement

`campaigns` representa grupos o programas de una empresa:

- Deben pertenecer a una organización tipo `company`.
- Pueden requerir aprobación del administrador principal.
- Pueden tener fee propio.
- Agrupan ex-empleados y, opcionalmente, sesiones de coaching.

## Coaching, NPS y testimonios

`coaching_sessions` permite registrar:

- Coach asignado.
- Usuario o ex-empleado.
- Modalidad online o presencial.
- Fecha, duración, liga o ubicación.
- Campaña u organización asociada.

`coaching_notes` guarda notas del coach con visibilidad controlada.

`nps_surveys` permite evaluar:

- Calidad del entrenamiento.
- Experiencia del usuario/ex-empleado.
- Comentarios y permiso de testimonio.

## Cursos

`courses`, `course_lessons`, `course_enrollments` y `course_progress` permiten:

- Curso obligatorio para emprendedores/franquiciatarios.
- Curso para coaches 1o1 de Empléate YA.
- Guardar avance por lección.
- Registrar aprobación y certificado.

## Solicitudes de borrado

`deletion_requests` controla:

1. Solicitud del usuario.
2. Creación de ticket o aviso interno a servicio a clientes.
3. Revisión por support admin o super admin.
4. Aprobación o rechazo.
5. Borrado o anonimización.
6. Conservación de auditoría mínima.

El sistema no debe borrar datos sensibles de forma automática sin pasar por este flujo.

## Auditoría

`audit_logs` debe registrar como mínimo:

- Login y cambios de perfil.
- Alta/baja/suspensión de usuarios.
- Cambios de rol y membresía.
- Creación/edición de organizaciones.
- Compra, asignación, vencimiento y uso de créditos.
- Ejecución de avatares.
- Creación, descarga o eliminación de artifacts.
- Acceso de empresa, emprendedor o coach a información del usuario.
- Consentimientos aceptados o revocados.
- Solicitudes y ejecución de borrado.
- Creación y aprobación de campañas.

## Seguridad recomendada

- Usar Row Level Security en Supabase/Postgres antes de pasar a producción.
- Separar datos personales, artifacts y archivos en storage con políticas por usuario/organización.
- Guardar documentos con rutas no adivinables.
- Registrar IP/user agent en eventos sensibles.
- Usar roles de aplicación y no confiar solo en el frontend.
- Exigir consentimientos vigentes antes de mostrar datos a empresas, emprendedores o coaches.
- Preparar aviso de privacidad con categorías de datos, finalidades, transferencias, conservación, derechos ARCO y contacto de privacidad.

## Prioridad de implementación

1. Usuarios online: login, créditos, artifacts, consentimientos, auditoría.
2. Coaching 1o1 y cursos: coaches, sesiones, notas, NPS, progreso y certificados.
3. Empresas/outplacement: organizaciones, admins, campañas, ex-empleados y seguimiento.
4. Emprendedores/franquicia: licencias, responsable/colaboradores, clientes propios y curso obligatorio.
