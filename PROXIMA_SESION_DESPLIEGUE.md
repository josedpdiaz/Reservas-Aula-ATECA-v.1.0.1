# 📌 Hoja de Ruta y Próxima Sesión: Despliegue, Nube y Términos de Uso
### Sistema de Gestión de Reservas y Memorias Didácticas - Aula ATECA

---

## 🎯 Objetivos de la Próxima Sesión (Momento Tranquilo / Producción)

### 1. 🌐 Despliegue en Servidor Web Propio (Hosting)
* **Objetivo**: Poner la aplicación accesible en Internet a través de un dominio o subdominio en el hosting del administrador (ej. Hostinger / cPanel con certificado SSL/HTTPS).
* **Pasos previstos**:
  1. Generar la compilación optimizada de producción con `npm run build` (carpeta `dist/`).
  2. Subida guiada de los archivos al servidor web (vía Administrador de Archivos web o FTP).
  3. Comprobación del correcto enrutamiento SPA (archivo `.htaccess` para servidores Apache/LiteSpeed).

---

### 2. ☁️ Conexión en Vivo con Google Drive / Sheets Institucional
* **Objetivo**: Conectar la interfaz web con la nube institucional de la Consejería de Educación (Canarias Educación).
* **Pasos previstos**:
  1. Abrir la hoja de cálculo de Google Sheets del centro educativo.
  2. Pegar el código actualizado de `Google Apps Script` (incluyendo la acción `sendEmail` para correos corporativos gratuitos).
  3. Desplegar como Web App (`Cualquier usuario`) y copiar la URL generada.
  4. Pegar la URL en la pestaña **Google Sheets** de la consola de administración de la aplicación.
  5. Ejecutar la sincronización inicial de prueba en vivo.

---

### 3. 🔒 Aceptación Obligatoria de Términos de Uso y RGPD (Primer Acceso)
* **Objetivo**: Garantizar la máxima transparencia legal y cumplimiento normativo en el tratamiento de nombres y correos docentes.
* **Componente a implementar/activar**:
  * Modal de primer acceso para profesores:
    * Información clara sobre la finalidad didáctica y organizativa del registro de reservas y memorias del Aula ATECA.
    * Checkbox obligatorio de aceptación de los términos del servicio y política de privacidad.
    * Registro de fecha y hora de aceptación en el perfil del usuario.
    * Acceso bloqueado al formulario de reserva hasta haber aceptado los términos.

---

## 📅 Estado Actual del Proyecto (v1.3.0)
* **Versión activa**: `1.3.0`
* **Directorio de trabajo local**: `C:\Users\josed\Desktop\9-D-SEP.26\01-IA-APP-ATECA-GESTIÓN-DE-RESERVAS`
* **Repositorio Git**: Sincronizado en rama `main` con Release v1.3.0 en GitHub.
* **Sistema de avisos por correo**: Completamente programado y funcional (plantillas HTML, preferencias por usuario, bandeja de salida y disparadores automáticos).
