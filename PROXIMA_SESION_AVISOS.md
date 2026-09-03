# 📌 Tareas Pendientes y Próximas Mejoras (Backlog)
### Sistema de Gestión de Reservas Aula ATECA

---

## 🚀 Próxima Funcionalidad Prioritaria (Siguiente Sesión)

### 📧 Sistema de Avisos y Notificaciones por Correo Electrónico
Configuración flexible y personalizada de alertas por correo electrónico tanto a nivel de usuario individual como por roles del sistema (Profesor, Coordinador, Administrador).

#### 1. Tipos de Notificaciones a Contemplar:
* **Para el Profesor / Solicitante**:
  * ✅ Confirmación inmediata de recepción de solicitud de reserva.
  * 🎉 Notificación cuando la reserva sea **APROBADA** por Coordinación.
  * ❌ Notificación explicativa cuando una reserva sea **RECHAZADA** o cancelada con su motivo.
  * ⏰ Recordatorio 24h antes del día de la actividad didáctica en el Aula ATECA.
  * 🎖️ Recordatorio tras la clase para cumplimentar la **Valoración Didáctica / Memoria**.
  * 🔒 Alerta de bloqueo imprevisto del aula por mantenimiento de equipamiento.
* **Para el Coordinador ATECA**:
  * 📥 Aviso inmediato cada vez que un docente registre una nueva solicitud de reserva.
  * 📊 Resumen periódico (diario/semanal) del estado de ocupación y memorias pendientes.
* **Para el Administrador**:
  * ⚙️ Alertas de configuración del centro, nuevos usuarios registrados o incidencias técnicas.

#### 2. Panel de Preferencias Configurable por el Usuario:
* Selector de activación/desactivación por cada tipo de aviso:
  * [x] Notificarme al aprobar/rechazar mis reservas.
  * [x] Recordatorio el día antes de mi reserva.
  * [x] Recordatorio para valorar la clase.
* Para coordinadores:
  * [x] Notificarme inmediatamente por cada nueva solicitud.
  * [x] Enviar resumen matutino con las actividades del día.

#### 3. Integración Técnica Prevista:
* Vía **Google Apps Script** (`MailApp` / `GmailApp`) conectado al Google Sheets corporativo de Canarias Educación (sin costes y usando la cuenta educativa del centro).
* O vía servicio SMTP / Webhook configurado en el servidor (para cuando se despliegue en Hostinger).

---
*Anotado para inicio de la siguiente sesión por petición del usuario (03/09/2026).*
