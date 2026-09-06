# 📢 Resumen Informativo para el Equipo / Compañero
### Estado del Proyecto: Gestor de Reservas Aula ATECA (Versión 1.3.0)
**Fecha**: Septiembre de 2026

---

Estimado/a compañero/a,

Te comparto una actualización concisa sobre el estado del **Gestor de Reservas y Memorias Didácticas del Aula ATECA** y los avances clave que hemos consolidado en la sesión de hoy:

---

### 1. ✅ ¿Qué se ha implementado hoy? (Versión 1.3.0)
* **Sistema Integral de Notificaciones por Correo Electrónico**:
  * Acuse de recibo inmediato para el docente al solicitar el aula.
  * Notificación formal de **Aprobación** con indicaciones técnicas/pedagógicas.
  * Notificación explicativa en caso de **Rechazo** (justificando motivos o prioridad formativa).
  * Alerta inmediata a Coordinación si un compañero **libera o cancela** una reserva (favoreciendo el civismo colaborativo).
  * Alerta técnica en caso de **bloqueos por mantenimiento** o incidencias en el equipamiento.
  * Recordatorio para cumplimentar la **Memoria Didáctica** tras la sesión.
* **Panel de Preferencias Personalizable por Docente**:
  * Cada usuario dispone de un botón de «Avisos» en su cabecera para activar o desactivar cada tipo de alerta a su gusto y especificar un correo alternativo si lo prefiere.
* **Bandeja de Auditoría y Previsualización**:
  * Visor para Coordinación y Dirección con el historial de todos los correos generados y previsualización interactiva en HTML con la estética institucional de ATECA.
* **Puesta a Cero para Producción (v1.2.3)**:
  * Se han purgado todas las reservas y datos ficticios de demostración. La base de datos queda totalmente limpia y lista para la fase de pruebas reales de centro.

---

### 2. 🌐 Arquitectura de Despliegue Decidida
Para poner la herramienta en funcionamiento de inmediato y sin trabas técnicas:
1. **Frontend en Servidor Web Propio**: La interfaz web se desplegará en un servidor web propio con certificado de seguridad SSL (`https://`), permitiendo que el profesorado acceda cómodamente desde cualquier dispositivo (ordenador de aula, tablet o móvil) a través de un enlace web directo.
2. **Nube y Datos en Google Drive Institucional**: Toda la base de datos (hoja de cálculo) y el motor de envío de correos funcionarán a través de **Google Apps Script** conectado a la cuenta de la Consejería de Educación (`canariaseducacion.org`). Esto garantiza:
   * **Cero costes** de mantenimiento o licencias.
   * **Privacidad institucional**: Los registros de reservas y memorias residen en la nube oficial educativa de nuestro centro.

---

### 3. 🔒 Protección de Datos (RGPD) y Aceptación por el Claustro
* Para facilitar la coordinación pedagógica y la trazabilidad del material de alto valor (impresoras 3D, gafas VR, etc.), en la aplicación figurarán los nombres y correos de los docentes solicitantes.
* En su **primer acceso**, la plataforma mostrará un aviso formal de condiciones de uso y protección de datos que cada profesor deberá validar con un clic (`[x] He leído y acepto los términos`). De este modo, garantizamos transparencia, base legal y consentimiento expreso de todo el equipo docente participante.

---

### 4. 🚀 Próximos Pasos (Siguiente Sesión)
1. **Subida de los archivos web al hosting** para tener la URL pública disponible.
2. **Vinculación en vivo del Google Apps Script** institucional para activar la sincronización y los envíos de correos reales.
3. **Paseo de prueba conjunto** entre nosotros antes de abrirlo al resto del claustro.

El proyecto está listo, con el código respaldado y versionado en GitHub. ¡Cualquier duda o sugerencia pedagógica la comentamos cuando quieras!
