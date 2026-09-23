# 📚 Historial de Versiones y Mejoras (Changelog)
### Sistema de Gestión de Reservas y Memorias Didácticas - Aula ATECA

Este documento recopila de forma cronológica, concisa y estructurada todos los upgrades, updates y mejoras implementadas en la rama principal (`main`) del proyecto, asociadas a sus respectivas *Releases* en GitHub.

---

## [v1.3.8] - 2026-09-23
### 🧪 Habilitación Excepcional de Cuentas de Prueba Autorizadas (2FA OTP)
* **Objetivo**: Autorizar exclusivamente de forma interna y restringida dos cuentas de correo electrónico para pruebas de verificación y control pedagógico (`josedpdiaz@gmail.com` y `phopsys@gmail.com`), manteniendo el principio rector de acceso exclusivo a cuentas institucionales de Canarias Educación (`@gobiernodecanarias.org`) y preservando la portada institucional al 100%.
* **Mejoras clave**:
  * **Excepción de Cuentas de Prueba Controladas**:
    * Admisión estricta de `josedpdiaz@gmail.com` asignada al departamento de `Administración y Gestión` (FP, prioridad P1 con auto-aprobación directa).
    * Admisión estricta de `phopsys@gmail.com` asignada al departamento de `Tecnología` (Secundaria, prioridad P2/P3 con aprobación requerida).
    * Bloqueo tajante de cualquier otra cuenta externa de Gmail, Hotmail, Yahoo u otros dominios públicos.
  * **Mismo Protocolo de Seguridad 2FA OTP**:
    * Las cuentas de prueba operan bajo el idéntico sistema de código aleatorio de 6 dígitos remitido por correo, con caducidad estricta de 5 minutos (300 s) y control de 5 intentos fallidos.
  * **Integridad Total de la Portada Institucional**:
    * Se preserva íntegramente la portada oficial con los textos, diseño corporativo y aviso institucional del Gobierno de Canarias para el IES Agustín de Betancourt.
  * **Sincronización en las 3 Capas (v1.3.8)**:
    * Actualización a la versión `1.3.8` en el pie de página, git, zip y servidor de producción en Hostinger.

---

## [v1.3.7] - 2026-09-23
### 🔔 Confirmación Inmediata de Reserva Autorizada y Recordatorio Semanal Preventivo (Lunes 08:00 AM) con Liberación Anticipada
* **Objetivo**: Garantizar la notificación instantánea al docente en cuanto su reserva queda autorizada y fijada en el calendario, e implementar un sistema proactivo de recordatorio semanal preventivo (lunes 08:00 AM) para reservas programadas con antelación previa a la semana lectiva, permitiendo confirmar asistencia o liberar la franja horaria con un solo clic para mantener el aula optimizada y accesible para todo el claustro.
* **Mejoras clave**:
  * **Confirmación Inmediata de Reserva Autorizada**:
    * Notificación instantánea y enriquecida remitida al docente tanto en aprobaciones automáticas directas (P1 de FP) como en autorizaciones concedidas por Coordinación o Administración.
    * Ficha oficial con denominación del IES Agustín de Betancourt, fecha, franja lectiva, módulo formativo, grupo y zona asignada.
  * **Recordatorio Semanal Preventivo (Lunes a las 08:00 AM)**:
    * Detección algorítmica de reservas agendadas con antelación previa a la semana de la actividad (de una semana para otra, a 2 o 3 semanas vista).
    * Disparo automático el lunes de la semana lectiva a las 08:00 AM recordando la sesión programada (día específico, horas, materia y grupo).
  * **Interacción Directa en el Correo (Confirmación o Liberación en 1 Clic)**:
    * Botón verde **«✅ Confirmar Asistencia / Mantener Reserva»**: Registra formalmente la confirmación en el sistema y muestra el distintivo *Asistencia Confirmada* en la ficha de detalle.
    * Botón rojo **«🚪 Liberar Franja Horaria (No la usaré)»**: Si el docente tiene algún cambio de programación o no va a usar el espacio, abre directamente el diálogo de liberación para dejar la franja horaria inmediatamente disponible para otros compañeros y notificar a Coordinación.
  * **Automatización Dual Robusta (Frontend + Backend PHP 8.1)**:
    * **Frontend**: Chequeo en segundo plano periódico integrado en el ciclo de auto-sincronización de `App.tsx`.
    * **Backend**: Endpoint desatendido en `public/api.php?action=check_weekly_reminders` para ejecución autónoma programable vía cron server-side.
    * Idempotencia garantizada: marcas persistentes `recordatorio_semanal_enviado` y registro histórico en base de datos atómica `store.json`.
  * **Sincronización Global de Versión**:
    * Actualización a `v1.3.7` en `types.ts`, `package.json`, pie de página institucional e historial de versiones.

---

## [v1.3.6] - 2026-09-23
### ⏱️ Ajuste Oficial de Horarios Lectivos a Franjas de 55 Minutos (Mañana y Tarde-Noche)
* **Objetivo**: Calibración exacta de las franjas horarias de reserva en la hoja diaria (`DayScheduleSheet`) adaptándolas a la duración lectiva oficial de 55 minutos del IES Agustín de Betancourt, incluyendo los tiempos exactos de recreo y descanso para los turnos de mañana y tarde-noche.
* **Mejoras clave**:
  * **Turno de Mañana (Sesiones de 55 min y Recreo de 30 min)**:
    * 1ª Sesión: `08:00 - 08:55` (55 min)
    * 2ª Sesión: `08:55 - 09:50` (55 min)
    * 3ª Sesión: `09:50 - 10:45` (55 min)
    * Recreo / Descanso Mañana: `10:45 - 11:15` (30 min)
    * 4ª Sesión: `11:15 - 12:10` (55 min)
    * 5ª Sesión: `12:10 - 13:05` (55 min)
    * 6ª Sesión: `13:05 - 14:00` (55 min)
  * **Turno de Tarde-Noche (Sesiones de 55 min y Recreo de 15 min)**:
    * 1ª Sesión Tarde-Noche: `17:00 - 17:55` (55 min)
    * 2ª Sesión Tarde-Noche: `17:55 - 18:50` (55 min)
    * 3ª Sesión Tarde-Noche: `18:50 - 19:45` (55 min)
    * Recreo / Descanso Tarde: `19:45 - 20:00` (15 min)
    * 4ª Sesión Tarde-Noche: `20:00 - 20:55` (55 min)
    * 5ª Sesión Tarde-Noche: `20:55 - 21:50` (55 min)
  * **Visualización Dinámica e Inmunidad de Recreos**:
    * Las franjas de recreo quedan explícitamente etiquetadas y protegidas contra reservas no procedentes.
  * **Sincronización de Versión en Pie de Aplicación**:
    * Actualización global de versión `1.3.6` en `package.json`, `types.ts`, pie de página institucional e historial de versiones.

---

## [v1.3.5] - 2026-09-23
### 🔐 Seguridad 2FA por Correo, Departamentos Oficiales Simplificados y Lógica Condicionada P1/P2/P3
* **Objetivo**: Refuerzo integral de seguridad mediante autenticación de doble factor con código aleatorio por email oficial, estandarización de la nomenclatura de departamentos didácticos, bloqueo en modo solo lectura del campo en reservas y asignación automatizada de prioridades P1, P2 y P3.
* **Mejoras clave**:
  * **Autenticación con Código de Seguridad OTP por Correo (2FA)**:
    * Generación de código criptoseguro de 6 dígitos con validez máxima de 5 minutos (300 s) y control de 5 intentos máximos.
    * Envío oficial con formato corporativo a la cuenta `@gobiernodecanarias.org`.
    * Temporizador regresivo en pantalla, reenvío controlado e invalidación tras uso exitoso o expiración.
  * **Nomenclatura Oficial de Departamentos**:
    * Supresión del prefijo redundante «Departamento de», adoptando nombres directos y limpios: `Administración y Gestión`, `Formación y Orientación Laboral`, `Comercio`, `Tecnología`, `Física y Química`, `Matemáticas`, `Inglés`, `Geografía e Historia`, `Lengua Castellana y Literatura`, `Literatura e Historia` y `Otro`.
    * Migración automática tanto en backend como en cliente de las cuentas de `Informática` y `Ofimática` hacia `Administración y Gestión`.
  * **Selectores Tipados e Insignias en Gestión de Usuarios**:
    * Reemplazo de campos de texto libre por menús desplegables agrupados con indicadores visuales de auto-aprobación directa (P1) vs revisión obligatoria (P2/P3).
  * **Ficha de Reserva (`BookingForm`) Blindada**:
    * Campo «Departamento Didáctico» fijado en modo `readOnly`, sincronizado con la ficha oficial del docente.
    * Asignación automática de P1 (`ALTA`) y estado `APROBADA` para docentes de FP en ciclos de FP.
    * Regla estricta: si un docente de FP reserva para niveles de ESO o Bachillerato, la solicitud pasa automáticamente a estado `PENDIENTE` para revisión de Coordinación o Administración.
  * **Ajustes de Accesibilidad Visual**:
    * Optimización del modo oscuro para reducir contrastes agresivos y suavizar la legibilidad.
    * Indicador superior de conmutación «Claro / Oscuro».

---

## [v1.3.4] - 2026-09-13
### 🏛️ Producción Oficial IES Agustín de Betancourt (ateca.fpapps.es) y Arquitectura Simplificada de 3 Capas
* **Objetivo**: Puesta en marcha definitiva del sistema en producción para el **IES Agustín de Betancourt** en el dominio oficial `https://ateca.fpapps.es`, suprimiendo definitivamente el entorno de pruebas para operar en un modelo unificado y robusto de 3 capas (Guardado Local, Git GitHub y Producción Oficial), con autenticación corporativa mediante cuentas Google del Gobierno de Canarias (`@gobiernodecanarias.org`) y el administrador oficial `jpacdia@gobiernodecanarias.org`.
* **Mejoras clave**:
  * **Sincronización Centralizada Multi-Dispositivo (Servidor Hostinger PHP 8.1)**:
    * Creación de `api.php`: servicio backend atómico y seguro que unifica la base de datos entre todos los dispositivos del centro educativo (ordenadores de aulas, secretaría, dirección, tablets y móviles).
    * Almacenamiento seguro en `/data/store.json` blindado contra descargas directas mediante reglas Apache/LiteSpeed (`403 Forbidden` garantizado).
    * Token criptográfico de seguridad interno (`X-Ateca-Token`) y control de origen CORS.
    * Sincronización automática bidireccional inmediata al arrancar, al guardar reservas, al añadir usuarios y al enfocar la ventana.
    * Conector Google Sheets centralizado: la URL de la API de Apps Script y el enlace a la hoja ahora se guardan en el servidor y están disponibles al instante en cualquier ordenador.
  * **Corrección Crítica en Panel de Administración**:
    * Subsanado el fallo de pantalla en blanco al acceder al Panel de Administración mediante la importación de `useEffect` en React.
    * Eliminación de importaciones duplicadas en iconos.
  * **Persistencia Inmediata de Google Sheets**:
    * Guardado en tiempo real en `localStorage` y en el servidor central tanto del enlace directo a la hoja como del endpoint de Apps Script, evitando pérdidas accidentales al conmutar pestañas.
  * **Aprobación Directa desde el Calendario**:
    * Añadido botón directo de «Aprobar Reserva» en la tarjeta de detalle para Administración y Coordinación.
  * **Arquitectura Simplificada en 3 Capas**:
    * **Capa 1: Guardado en Local**: Código fuente consolidado en el equipo local y copias de seguridad limpias en ZIP.
    * **Capa 2: Control de Versiones en Git**: Repositorio GitHub sincronizado en rama `main`.
    * **Capa 3: Despliegue en Producción**: Despliegue automatizado directo a `https://ateca.fpapps.es` (`npm run deploy`).
    * Supresión definitiva de dependencias, scripts y elementos del entorno de pruebas secundario.
  * **Identidad Institucional de Centro**:
    * Cabecera oficial con la denominación del centro: **Gestor Aula ATECA • IES Agustín de Betancourt**.
    * Configuración base predeterminada asignada al IES Agustín de Betancourt.
  * **Autenticación Corporativa Google (@gobiernodecanarias.org)**:
    * Portada de acceso adaptada: aviso explícito de autenticación oficial mediante cuentas Google Workspace del Gobierno de Canarias.
    * Validación estricta de dominio: solo se permite el acceso a direcciones con terminación `@gobiernodecanarias.org`.
    * Alta y acceso automático de profesorado corporativo del centro.
    * Administrador único oficial fijado en `jpacdia@gobiernodecanarias.org`.
* **Archivos afectados**: `public/api.php`, `public/data/.htaccess`, `src/lib/serverSync.ts`, `src/lib/storage.ts`, `src/App.tsx`, `src/components/AdminPanel.tsx`, `package.json`, `HISTORIAL_VERSIONES.md`.

---

## [v1.3.3] - 2026-09-06
### 🛡️ Consolidación de Opción A: Gestión de Bajas con Protección Total del Histórico Escolar
* **Objetivo**: Blindar la base de datos frente a pérdida accidental de memorias pedagógicas, eliminando el borrado destructivo y adoptando la **Opción A** («Dar de baja / Desactivar») como estándar exclusivo del centro educativo.
* **Mejoras clave**:
  * **Acción Exclusiva de Baja / Reactivación (`UserX` / `UserCheck`)**:
    * Se retira cualquier opción de eliminación destructiva de la base de datos.
    * Al pulsar sobre el docente, se activa el modal de **Opción A: Protección del Histórico Escolar**: revoca el acceso a la plataforma de inmediato pero preserva intactas todas las reservas pasadas, valoraciones y memorias didácticas del Aula ATECA.
    * Si el profesor ya está dado de baja, el botón y el modal permiten su reactivación con un clic.
  * **Edición Integral**:
    * Se mantiene el botón de edición (lápiz) para modificar nombre, correo, departamento, turno y rol.
* **Archivos afectados**: `src/components/AdminPanel.tsx`, `package.json`.

---

## [v1.3.2] - 2026-09-06
### 👥 Gestión Flexible de Docentes: Edición Completa, Eliminación Segura y Buscador
* **Objetivo**: Proporcionar autonomía total al Administrador para modificar cualquier dato de un profesor (nombre, email, departamento, turno, rol, estado) o gestionar su baja/eliminación con protección del histórico pedagógico.
* **Mejoras clave**:
  * **Modal de Edición Completa de Docente (`userToEdit`)**:
    * Permite modificar nombre, correo corporativo, departamento, turno preferente (`Mañana`, `Tarde-Noche`, `Ambos`), rol asignado y estado.
  * **Modal de Eliminación Segura con Doble Modalidad (`userToDelete`)**:
    * Detección proactiva de reservas pasadas en el historial.
    * *Opción recomendada*: «Dar de baja / Desactivar» (revoca el acceso sin alterar las memorias didácticas del centro).
    * *Opción definitiva*: «Eliminar definitivamente de la base de datos».
    * Salvaguarda: Bloqueo de auto-eliminación y auto-desactivación para el administrador logueado.
  * **Buscador en Vivo y Estadísticas**:
    * Búsqueda en tiempo real por nombre, correo, departamento o rol.
    * Contadores dinámicos de usuarios totales, activos y de baja.
* **Archivos afectados**: `src/lib/storage.ts`, `src/components/AdminPanel.tsx`, `package.json`.

---

## [v1.3.1] - 2026-09-06
### 🌐 Despliegue en Producción en Hostinger y Automatización SSH
* **Objetivo**: Publicar la aplicación beta en Internet en el subdominio `https://ateca.josedpdiaz.net` con certificado SSL, soporte de rutas SPA y flujo de despliegue continuo mediante SSH.
* **Mejoras clave**:
  * **Publicación en Subdominio Institucional**: Disponible con protocolo seguro HTTPS en `https://ateca.josedpdiaz.net`.
  * **Enrutamiento SPA (`.htaccess`)**: Reglas de reescritura para Apache/LiteSpeed que garantizan que recargar la página en cualquier pestaña no cause error 404.
  * **Despliegue Automatizado (`npm run deploy`)**: Script en `package.json` para compilar y sincronizar automáticamente con Hostinger vía SCP/SSH con verificación de permisos `755/644`.
  * **Identidad de Navegador**: Título oficial fijado en `Gestor de Aula ATECA`, idioma español (`es`) y favicon institucional en formato SVG.
  * **Modo Producción Limpio**: Barra interactiva de demo oculta por defecto para acceso limpio del claustro, con alternancia discreta en pie de página y desplegable de cuentas.
* **Archivos afectados**: `index.html`, `src/App.tsx`, `public/.htaccess`, `package.json`.

---

## [v1.3.0] - 2026-09-06
### 📧 Sistema de Avisos y Notificaciones por Correo Electrónico Configurable
* **Objetivo**: Proveer un canal de comunicación automatizado y privado para notificar a docentes, coordinadores y administradores sobre solicitudes, resoluciones pedagógicas, liberaciones de aula, avisos de mantenimiento y recordatorios, respetando las preferencias individuales de cada usuario.
* **Mejoras clave**:
  * **Modal de Preferencias de Notificaciones (`NotificationSettingsModal`)**:
    * Accesible directamente desde la cabecera superior con el botón de campana (**«Avisos»**).
    * Interruptores independientes para cada tipo de aviso:
      * *Aprobación o Rechazo de mis reservas*.
      * *Recordatorio 24 horas antes del uso del aula*.
      * *Recordatorio post-clase para cumplimentar la memoria didáctica*.
      * *Avisos de mantenimiento y bloqueos técnicos*.
      * *(Coordinación/Admin)* *Aviso inmediato de nueva solicitud registrada*.
      * *(Coordinación/Admin)* *Aviso cuando un docente libera una franja horaria*.
    * Opción para configurar un **correo alternativo o personal** de recepción.
    * Botón de **«Enviar correo de prueba»** en vivo para verificar la conectividad al instante.
  * **Motor de Correo con Plantillas HTML Pedagógicas (`emailService.ts`)**:
    * Diseño visual responsivo, estilizado con identidad institucional ATECA (azul noche, verde esmeralda y detalles en tarjeta).
    * Filtrado estricto de consentimiento: el sistema comprueba si el destinatario consiente recibir cada tipo de aviso antes de despacharlo.
  * **Bandeja de Salida y Auditoría de Correos (`EmailLogsModal` y pestaña en `AdminPanel`)**:
    * Visor de todos los mensajes generados con destinatario, fecha/hora, estado de envío y previsualización interactiva del HTML renderizado.
  * **Doble Motor de Despacho (Google Apps Script / Registro Local)**:
    * Compatible con `MailApp.sendEmail()` en el script de Google Sheets de la Consejería de Educación para envío real de emails sin costes de API.
* **Archivos afectados**: `src/types.ts`, `src/lib/emailService.ts`, `src/components/NotificationSettingsModal.tsx`, `src/components/EmailLogsModal.tsx`, `src/components/BookingForm.tsx`, `src/components/CoordinatorPanel.tsx`, `src/components/MyBookingsView.tsx`, `src/components/AdminPanel.tsx`, `src/components/SheetsGuide.tsx`, `src/App.tsx`.

---

## [v1.2.3] - 2026-09-06
### 🚀 Preparación para Producción y Fase de Pruebas (Base de Datos Limpia)
* **Objetivo**: Dejar la aplicación 100% lista para su despliegue en entorno real y fase de pruebas de centro, sin datos ficticios ni reservas de demostración, manteniendo la configuración institucional y los roles de usuario.
* **Mejoras clave**:
  * **Vaciado de colecciones de prueba**: `DEFAULT_RESERVAS`, `DEFAULT_VALORACIONES` y `DEFAULT_BLOQUEOS` se inicializan a arrays vacíos (`[]`), garantizando un inicio totalmente limpio.
  * **Utilidad de puesta a cero**: Nueva función `clearAllReservasAndValoraciones()` y botón en la pestaña de Configuración del Administrador para vaciar reservas y memorias didácticas en cualquier momento con confirmación de seguridad.
  * **Actualización de metadatos**: `package.json` actualizado con nombre oficial `reservas-aula-ateca` y versión `1.2.3`.
* **Archivos afectados**: `src/lib/storage.ts`, `src/components/AdminPanel.tsx`, `package.json`, `metadata.json`.

---

## [v1.2.2] - 2026-09-03
### 🔍 Control de Tamaño de Fuente (A- / A+) y Eliminación del Modo Claro
* **Objetivo**: Proporcionar accesibilidad visual y descanso ocular directo mediante botones de ampliación/reducción de texto, y concentrar los temas en los dos modos más confortables y de alto contraste (Intermedio y Oscuro), retirando el modo claro.
* **Mejoras clave**:
  * **Botones de Escalado de Letra (`A-`, `100%`, `A+`)**:
    * Ubicados en la cabecera principal junto al selector de tema.
    * Permiten aumentar o disminuir el tamaño tipográfico de toda la aplicación entre el 85% y el 130% en pasos del 10%.
    * Botón de porcentaje central para restablecer al tamaño estándar (100%) con un solo clic.
    * Persistencia en `localStorage` (`ateca_font_size`) para recordar el tamaño entre sesiones.
  * **Eliminación del Modo Claro**:
    * Se retira la opción de tema claro por causar fatiga visual.
    * Se conservan y perfeccionan el **Modo Intermedio** (tono neutro / sepia suave de descanso visual) y el **Modo Oscuro** (alto contraste / modo noche).
    * Si un usuario tenía guardado el modo claro, se migra de manera transparente al Modo Intermedio.
* **Archivos afectados**: `src/lib/storage.ts`, `src/App.tsx`.

---

## [v1.2.1] - 2026-09-03
### 🧹 Purga Estricta y Automática de Tareas y Reservas en Fines de Semana
* **Objetivo**: Garantizar que bajo ninguna circunstancia existan tareas, reservas, bloqueos o eventos en sábados o domingos en la base de datos o en la interfaz.
* **Mejoras clave**:
  * **Purga automática proactiva (`purgeWeekendTasks`)**: Tanto al arrancar la aplicación como en cada consulta de datos (`getReservas()` y `getBloqueos()`), el sistema detecta y elimina de forma definitiva cualquier registro cuya fecha coincida con sábado o domingo.
  * **Datos de prueba blindados (`getRelativeWeekdayStr`)**: Todas las reservas y bloqueos presembrados se calculan estrictamente sobre días lectivos hábiles (lunes a viernes), imposibilitando que caigan en fin de semana con el paso del tiempo.
  * **Integridad del calendario**: Se garantiza un calendario 100% libre de actividades en sábados y domingos.
* **Archivos afectados**: `src/lib/storage.ts`.

---

## [v1.2.0] - 2026-09-03
### 🚀 Edición y Liberación de Reservas, Logotipo del Centro, 3 Modos de Tema y Calendario de Días No Hábiles
* **Objetivo**: Proporcionar autonomía total al docente para modificar y liberar sus reservas fomentando el civismo colaborativo, personalizar la imagen institucional del centro, incorporar temas visuales descansados y de alto contraste, y blindar el calendario frente a reservas en fines de semana o vacaciones escolares.
* **Mejoras clave**:
  * **1. Edición y Liberación Colaborativa de Reservas Propias**:
    * Cualquier usuario (Profesor, Coordinador o Admin) puede editar los datos didácticos o la fecha/hora de sus reservas.
    * Botón «Liberar Aula / Cancelar» con modal de civismo que recuerda la importancia de dejar el aula libre para los compañeros de claustro.
    * Dos modalidades: Marcar como cancelada (conserva registro histórico) o eliminar definitivamente del calendario.
  * **2. Logotipo Institucional del Centro**:
    * El Administrador puede subir el logotipo o escudo de su centro (SVG, PNG, JPG) o vincular una URL.
    * Vista previa en vivo con guía de especificaciones técnicas: formato transparente, resolución óptima (48x48 a 128x128 px) y peso sugerido (< 500 KB).
    * Reemplaza elegantemente el icono genérico en la barra de cabecera.
  * **3. Selector de 3 Temas Visuales (Claro, Intermedio y Oscuro)**:
    * **Claro**: Fondo blanco institucional de alta pureza.
    * **Intermedio**: Tono neutro / sepia suave descansado para la vista en horas prolongadas de aula o despacho.
    * **Oscuro**: Modo noche de alto contraste, con tarjetas pizarra y tipografía clara nítida.
    * Control rápido con iconos (Sol ☀️, Intermedio 🌓 y Luna 🌙) persistido en almacenamiento local.
  * **4. Calendario Escolar y Días No Hábiles**:
    * **Sábados y Domingos**: Permanentemente inhabilitados como días no lectivos en todo el calendario.
    * Nueva pestaña en la consola de administración para configurar festividades (Navidad, Semana Santa, festivos locales, libre disposición).
    * Bloqueo proactivo en formulario de reserva y distintivo visual en cuadrícula mensual y hoja diaria.
* **Archivos afectados**: `src/types.ts`, `src/lib/storage.ts`, `src/App.tsx`, `src/components/AdminPanel.tsx`, `src/components/BookingForm.tsx`, `src/components/CalendarView.tsx`, `src/components/DayScheduleSheet.tsx`, `src/components/MyBookingsView.tsx`, `src/index.css`.

---

## [v1.1.2] - 2026-09-03
### 🎯 Clasificación Profesional de Prioridades y Reorganización de Niveles ATECA
* **Objetivo**: Alinear los niveles educativos a la normativa del Aula ATECA con un modelo visual intuitivo y profesional por jerarquía (P1, P2 y P3).
* **Mejoras clave**:
  * **Niveles actualizados**:
    * Se renombra `FP Básica / Programas Especiales` a `FP Básica` limpia y directa.
    * Incorporación de `Proyecto de Centro de FP` (Prioridad P1).
    * Incorporación de `Prueba técnica / Demostración` a Prioridad P1.
    * Incorporación de `Proyecto de Centro (No FP)` (Prioridad P2).
  * **Agrupación en el desplegable (`<optgroup>`)**:
    * `⭐ Formación Profesional y Tecnológica (P1 · Preferente ATECA)`: Grado Superior, Grado Medio, FP Básica, Proyecto de Centro de FP y Pruebas técnicas.
    * `💡 Proyectos Transversales del Centro (P2 · Proyectos)`: Proyecto de Centro (No FP).
    * `📚 Enseñanzas Generales (P3 · Ordinaria)`: Bachillerato y ESO.
  * **Insignias dinámicas de prioridad en tiempo real**:
    * `P1 · Preferente FP` con punto de pulso en verde esmeralda institucional.
    * `P2 · Proyectos` en azul índigo.
    * `P3 · Ordinaria` en pizarra neutro.
  * **Unificación en tablas y panel de coordinación**: Reemplazadas las etiquetas genéricas por los distintivos claros `P1 · FP`, `P2 · Proyectos` y `P3 · Ordinaria`.
* **Archivos afectados**: `src/components/BookingForm.tsx`, `src/components/CalendarView.tsx`, `src/components/CoordinatorPanel.tsx`.

---

## [v1.1.1] - 2026-09-03
### 🧹 Limpieza y Consolidación de Botones en la Hoja del Día
* **Objetivo**: Evitar redundancia visual en la interfaz de usuario.
* **Mejoras clave**:
  * Eliminado el botón duplicado `+ Nueva Reserva` del navegador de días en la cabecera de la hoja diaria.
  * Se consolida como acción principal el botón con degradado esmeralda `Solicitar Reserva` de la barra superior.
  * Se mantienen los botones contextuales `+ Reservar` en cada franja horaria disponible para precargar el horario con 1 clic.
* **Archivos afectados**: `src/components/DayScheduleSheet.tsx`.

---

## [v1.1.0] - 2026-09-03
### ⏱️ Simetría Exacta en Turno de Mañana (6 Sesiones de 50m y Recreo 10:30-11:00)
* **Objetivo**: Cuadrar la jornada lectiva matinal en 6 sesiones idénticas de 50 minutos con el recreo centralizado.
* **Mejoras clave**:
  * **1ª a 3ª sesión**: `08:00 - 08:50`, `08:50 - 09:40`, `09:40 - 10:30` (50 min cada una).
  * **Recreo de mañana**: `10:30 - 11:00` (30 min de descanso oficial).
  * **4ª a 6ª sesión**: `11:00 - 11:50`, `11:50 - 12:40`, `12:40 - 13:30` (50 min cada una).
  * Eliminadas franjas intermedias artificiales para total pulcritud horaria.
* **Archivos afectados**: `src/components/DayScheduleSheet.tsx`.

---

## [v1.0.9] - 2026-09-03
### ☕ Ajuste de Recreo Matutino
* **Objetivo**: Reubicación y pruebas de la pausa matinal de descanso escolar.
* **Mejoras clave**:
  * Sincronización temporal del recreo en la franja matutina y reajuste de sesiones posteriores.
* **Archivos afectados**: `src/components/DayScheduleSheet.tsx`.

---

## [v1.0.8] - 2026-09-03
### 🌙 Estandarización de Nomenclatura a «Turno de Tarde-Noche»
* **Objetivo**: Adaptar la terminología oficial al horario extendido que finaliza a las 22:20.
* **Mejoras clave**:
  * Sustituida la palabra `Tarde` por `Tarde-Noche` en toda la aplicación.
  * Renombradas las 6 sesiones vespertinas a `1ª a 6ª Sesión Tarde-Noche (50m)`.
  * Actualizado el descanso a `Descanso Tarde-Noche (20m)`.
  * Modelo de usuarios (`types.ts` y `storage.ts`) adaptado con soporte para el turno `Tarde-Noche`.
* **Archivos afectados**: `src/components/DayScheduleSheet.tsx`, `src/components/CalendarView.tsx`, `src/types.ts`, `src/lib/storage.ts`.

---

## [v1.0.7] - 2026-09-03
### 🎚️ Panel Redimensionable Móvil y Controles Estilo Ventanas de Windows
* **Objetivo**: Proporcionar ergonomía y control de espacio en el calendario y detalle del día.
* **Mejoras clave**:
  * **3 Posiciones para el Detalle del Día**: Selección rápida entre **Izquierda** (`PanelLeft`), **Arriba** (`PanelTop`) o **Derecha** (`PanelRight`).
  * **Agarradera Central Móvil (Split Resizer)**: Divisor interactivo con cursor `col-resize` que permite arrastrar con ratón o táctil para ajustar el ancho relativo entre calendario y detalle (con límites saludables de 25% a 75% y doble clic para restablecer al 60/40).
  * **Controles estilo Windows**:
    * **Minimizar (`—`)**: Pliega el contenido dejando solo la cabecera.
    * **Maximizar / Restaurar (`□` / `⧉`)**: Expande el panel a pantalla completa (o restaura el split).
    * **Cerrar (`X`)**: Oculta el detalle del día, haciendo que el calendario se abra automáticamente al 100% del ancho (`w-full`), con botón para reabrirlo cuando se desee.
* **Archivos afectados**: `src/components/CalendarView.tsx`.

---

## [v1.0.6] - 2026-09-03
### 🌙 6 Sesiones de Tarde y Desahogo Visual de Cabecera al 100% de Zoom
* **Objetivo**: Alinear la tarde a 6 periodos y eliminar la sensación de sobrecarga/apelotonamiento visual.
* **Mejoras clave**:
  * **Estructura de Tarde**: 6 sesiones de 50 min de `17:00 a 22:20` con descanso de 20 min tras la 3ª sesión (`19:30 - 19:50`).
  * Ampliado el límite de cierre del centro en configuración a las `22:30` para permitir reservas válidas de noche.
  * **Rediseño de Cabecera**: Selector de vistas compacto (`Mes`, `Horario del Día` y `Lista`).
  * **Bandeja de Filtros Plegable**: Los 4 selectores densos se agrupan en un panel desplegable bajo el botón `Filtros` con contador de filtros activos y enlace de limpieza rápida.
* **Archivos afectados**: `src/components/DayScheduleSheet.tsx`, `src/components/CalendarView.tsx`, `src/lib/storage.ts`.

---

## [v1.0.5] - 2026-09-03
### 📅 Hoja de Horario del Día (Mañana y Tarde) con Acceso Directo por Celda
* **Objetivo**: Facilitar la consulta horaria por turnos al pulsar sobre cualquier día del mes.
* **Mejoras clave**:
  * Creación del componente `DayScheduleSheet.tsx`.
  * Al hacer clic en cualquier día del calendario mensual, la aplicación transiciona directamente a la hoja de horarios de ese día.
  * Visualización dividida en dos columnas: Turno de Mañana y Turno de Tarde con estados de ocupación en tiempo real.
  * Precarga automática de fecha y horas al pulsar `+ Reservar` en cualquier franja libre.
  * Navegación entre días (`< Anterior`, `Hoy`, `Siguiente >`) y botón de retorno al mes.
* **Archivos afectados**: `src/components/DayScheduleSheet.tsx`, `src/components/CalendarView.tsx`, `src/components/BookingForm.tsx`, `src/App.tsx`.

---

## [v1.0.4] - 2026-09-03
### 🔖 Vistas en Tarjetas/Lista en «Mis Actividades» y Colapso de Mes
* **Objetivo**: Permitir alternar modos de visualización y filtrado rápido en la agenda personal del docente.
* **Mejoras clave**:
  * Creación del componente dedicado `MyBookingsView.tsx`.
  * Doble vista: Modo Tarjetas/Etiquetas visuales vs Modo Tabla/Lista compacta filtrable.
  * Buscador en vivo por texto, selector por estado (Aprobada, Pendiente, Sin valorar, etc.) y orden cronológico.
  * Controles de colapso/expansión para el mes y la agenda lateral en el calendario.
* **Archivos afectados**: `src/components/MyBookingsView.tsx`, `src/components/CalendarView.tsx`, `src/App.tsx`.

---

## [v1.0.3] - 2026-09-03
### 🔒 Cumplimiento Normativo RGPD / LOPDGDD para Centros Educativos
* **Objetivo**: Garantizar el cumplimiento estricto de protección de datos en el entorno escolar de Canarias.
* **Mejoras clave**:
  * Creación del componente modal `PrivacyModal.tsx` con la base jurídica del tratamiento (Art. 6.1.e RGPD, cumplimiento de misión de interés público).
  * Cláusula de exención y salvaguarda: constancia explícita de no almacenamiento de nombres, apellidos ni datos identificativos de alumnado (únicamente nivel, grupo y número de alumnos por aforo).
  * Enlace permanente en el pie de página y distintivo informativo en el formulario de solicitud.
* **Archivos afectados**: `src/components/PrivacyModal.tsx`, `src/components/BookingForm.tsx`, `src/App.tsx`.

---

## [v1.0.2] - 2026-09-03
### 🛠️ Corrección de Zona Horaria Local y Estabilización de Build
* **Objetivo**: Corregir el desfase en el que el día 3 de septiembre se marcaba erróneamente como viernes 4 por conversión UTC.
* **Mejoras clave**:
  * Creación de la función utilitaria `formatDateToYMD()` en `storage.ts` para gestionar fechas según la hora local del dispositivo docente.
  * Generación y sincronización de `package-lock.json` tras verificación de compilación exitosa con Vite y TypeScript.
* **Archivos afectados**: `src/lib/storage.ts`, `src/components/CalendarView.tsx`, `src/components/BookingForm.tsx`, `src/components/AdminPanel.tsx`.

---

## [v1.0.1] - 2026-09-02
### 🚀 Exportación Inicial a Repositorio Público de GitHub
* **Objetivo**: Configuración del repositorio Git inicial en GitHub (`josedpdiaz/Reservas-Aula-ATECA-v.1.0.1`).
* **Mejoras clave**:
  * Código base exportado desde Google AI Studio con React 18, Vite, TypeScript y Tailwind CSS.
  * Estructura básica de base de datos local presembrada en `localStorage` con simulación de sincronización a Google Sheets.
