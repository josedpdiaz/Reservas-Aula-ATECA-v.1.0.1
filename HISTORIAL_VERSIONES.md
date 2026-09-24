# 📚 Historial de Versiones y Mejoras (Changelog)
### Sistema de Gestión de Reservas y Memorias Didácticas - Aula ATECA

Este documento recopila de forma cronológica, concisa y estructurada todos los upgrades, updates y mejoras implementadas en la rama principal (`main`) del proyecto, asociadas a sus respectivas *Releases* en GitHub.

---

## [v1.4.5] - 2026-09-24
### 📊 Gestión de Usuarios: Paginación Configurable (5, 10, Todos) y Ordenación Interactiva Multicolumna
* **Objetivo**: Proporcionar una experiencia fluida, rápida y ergonómica en la tabla de Gestión de Usuarios del Panel de Administración, permitiendo al Administrador ver a todos los docentes de un golpe o paginados (de 5 en 5, de 10 en 10, de 25 o de 50), así como ordenar interactivamente por cualquiera de las 9 columnas de la tabla.
* **Mejoras clave**:
  * **Paginación Configurable y Vista Completa ("Ver todos de un golpe")**:
    * Botones selectores directos en la barra superior: `5 en 5`, `10 en 10`, `25`, `50` y `Ver todos de un golpe`.
    * Barra inferior de navegación con botones Anterior / Siguiente, numeración de páginas activas e indicador de rango de docentes visibles (`Mostrando del X al Y de Z docentes` o `Mostrando todos los Z docentes de un golpe`).
  * **Ordenación Interactiva en las 9 Columnas de la Tabla**:
    * Cada encabezado de columna es interactivo y conmutador (ascendente / descendente):
      * **Estado**: Clasifica entre docentes Activos y De Baja.
      * **Nombre**: Orden alfabético (A-Z / Z-A) con soporte de acentos y caracteres en español.
      * **Email Institucional**: Orden alfabético por buzón oficial corporativo.
      * **Departamento Didáctico**: Agrupación y orden alfabético por especialidad o familia profesional.
      * **Turno**: Clasificación por jornada (Mañana, Tarde o Ambos).
      * **Rol Asignado**: Ordenación jerárquica por perfil (Profesor, Coordinador, Administrador).
      * **Acreditación ATECA**: Priorización entre docentes Acreditados con competencias básicas vs Sin Acreditar.
      * **Cuenta**: Ordenación por estado de habilitación de cuenta.
      * **Acciones**: Ordenación alfabética complementaria.
    * Indicadores visuales direccionales dinámicos (`ArrowUp`, `ArrowDown`, `ArrowUpDown`) para identificar con claridad el criterio activo de ordenación.
  * **Sincronización en las 3 Capas (v1.4.5)**:
    * Actualización de la versión a `1.4.5` en `types.ts`, `package.json` y pie de página.
    * Generación de respaldo local en archivo ZIP `Reservas-Aula-ATECA-v.1.4.5.zip`.
    * Compilación con Vite y despliegue a producción Hostinger (`https://ateca.fpapps.es`).
    * Sincronización en GitHub (`main`, `backup/v1.4.5` y tag `v1.4.5`).

---

## [v1.4.4] - 2026-09-24
### 🗑️ Gestión Avanzada de Usuarios: Opción de Eliminación Completa y Purga Definitiva de Registros
* **Objetivo**: Permitir al Administrador eliminar definitivamente y por completo a cualquier usuario para mantener la lista de usuarios limpia y depurada, eliminando simultáneamente en cascada todos sus registros asociados (reservas históricas, memorias didácticas, valoraciones y códigos 2FA activos), manteniendo al mismo tiempo la política existente de «Dar de baja (Opción A)» para aquellos casos donde se desee preservar el histórico escolar.
* **Mejoras clave**:
  * **Doble Política de Gestión de Usuarios**:
    * **Opción A (Conservar Histórico)**: Conmutador de «Dar de baja» / «Reactivar», que revoca el acceso del docente pero conserva intactas todas sus reservas pasadas, valoraciones y memorias para auditorías pedagógicas y estadísticas del centro.
    * **Opción B (Eliminación Completa y Purga Total)**: Botón de acción con icono de papelera roja (`Trash2`) que purga totalmente al usuario de la base de datos, desasigna y suprime todas sus reservas del calendario (dejando las franjas horarias libres), purga sus valoraciones y limpia cualquier código 2FA activo en el almacén de seguridad.
  * **Salvaguardas de Seguridad Institucional**:
    * Protección estricta que impide borrar la cuenta raíz de Administración del centro (`jpacdia@gobiernodecanarias.org` / `u-1`) o el usuario con el que el administrador tiene la sesión iniciada en ese momento.
    * Modal de confirmación con advertencia de irreversibilidad antes de ejecutar la purga.
  * **Persistencia Atómica en Servidor y Almacenamiento**:
    * Actualización del backend en `public/api.php` (`delete_item` con `item_type: 'usuario_completo'`) para ejecutar la eliminación atómica en disco y añadir las reservas del usuario a la lista de exclusión (`deleted_reservas`), impidiendo que reaparezcan tras sincronizaciones.
    * Integración completa en `src/lib/storage.ts` con la nueva función `deleteUserCompletely()`.
  * **Sincronización en las 3 Capas (v1.4.4)**:
    * Actualización de la versión a `1.4.4` en `types.ts`, `package.json` y pie de página.
    * Generación de respaldo local en archivo ZIP `Reservas-Aula-ATECA-v.1.4.4.zip`.
    * Compilación con Vite y despliegue a producción Hostinger (`https://ateca.fpapps.es`).
    * Sincronización en GitHub (`main`, `backup/v1.4.4` y tag `v1.4.4`).

---

## [v1.4.3] - 2026-09-24
### 📧 Enrutamiento Universal de Avisos y Códigos 2FA al Buzón Educativo (`@canariaseducacion.es`) con Matrícula Centralizada (`@gobiernodecanarias.org`)
* **Objetivo**: Garantizar el 100% de la entregabilidad de correos electrónicos (códigos de acceso OTP de 6 dígitos, confirmaciones de reserva, avisos de coordinador, alertas de mantenimiento y recordatorios semanales), manteniendo la identidad institucional y matrícula de todos los docentes y administradores con su cuenta corporativa del Gobierno de Canarias (`@gobiernodecanarias.org`), pero remitiendo todas las notificaciones y códigos de forma universal e inequívoca a su buzón activo de **`@canariaseducacion.es`** (preservando exactamente el mismo login/nombre de usuario antes de la `@`).
* **Mejoras clave**:
  * **Regla Universal de Enrutamiento de Correos**:
    * Para toda cuenta registrada como `login@gobiernodecanarias.org`, el sistema despacha siempre los correos a `login@canariaseducacion.es`.
    * Aplica sin excepción a docentes, coordinadores y administración para sortear las restricciones y filtrados perimetrales del dominio corporativo.
    * Para la cuenta del administrador (`jpacdia` / `jpadiaz`), se preserva además la copia adicional inmediata de respaldo a `josedpdiaz@gmail.com`.
  * **Soporte Dual y Matrícula Transparente**:
    * Todos los docentes se dan de alta en la plataforma bajo su cuenta oficial corporativa `@gobiernodecanarias.org`.
    * En el formulario de autenticación, el usuario puede introducir tanto su cuenta `@gobiernodecanarias.org` como `@canariaseducacion.es`. El sistema almacena el código bajo ambos alias y lo entrega en `@canariaseducacion.es`.
  * **Indicadores Visuales y Aclaraciones en Interfaz**:
    * En la pantalla de login, tanto en el paso 1 (solicitud) como en el paso 2 (código de 6 dígitos), se indica explícitamente al usuario la dirección exacta a la que ha sido enviado el correo (`@canariaseducacion.es`).
    * En los formularios de registro de nuevos profesores (Panel de Administración y Panel de Coordinación), se añade texto de ayuda indicando que el docente debe ser matriculado con `@gobiernodecanarias.org` y que recibirá sus accesos en `@canariaseducacion.es`.
  * **Sincronización en las 3 Capas (v1.4.3)**:
    * Actualización de la versión a `1.4.3` en `types.ts`, `package.json` y pie de página.
    * Generación de respaldo local en archivo ZIP `Reservas-Aula-ATECA-v.1.4.3.zip`.
    * Compilación con Vite y despliegue a producción Hostinger (`https://ateca.fpapps.es`).
    * Sincronización en GitHub (`main`, `backup/v1.4.3` y tag `v1.4.3`).

---

## [v1.4.2] - 2026-09-24
### 🔐 Respaldo de Código de Acceso 2FA para Administración (`josedpdiaz@gmail.com`) y Compatibilidad de Cuentas Institucionales
* **Objetivo**: Resolver la incidencia de entrega de correos de autenticación de dos factores (código de 6 dígitos) provocada por el bloqueo o filtrado estricto de los servidores de correo institucional del Gobierno de Canarias (`@gobiernodecanarias.org`) ante mensajes procedentes de servidores externos, enviando automáticamente una copia de seguridad en tiempo real a `josedpdiaz@gmail.com` cada vez que se solicite acceso como administrador (`jpacdia@gobiernodecanarias.org` o `jpadiaz@gobiernodecanarias.org`), permitiendo la recepción inmediata y el acceso sin incidencias.
* **Mejoras clave**:
  * **Envío Simultáneo de Respaldo al Correo de Administrador (`josedpdiaz@gmail.com`)**:
    * Al solicitar el código de acceso con la cuenta institucional de administración (`jpacdia@gobiernodecanarias.org` o su variante `jpadiaz@gobiernodecanarias.org`), el backend despacha el correo tanto a la dirección corporativa como a la cuenta personal de respaldo autorizada `josedpdiaz@gmail.com`.
  * **Normalización y Soporte Dual de Alias**:
    * Registro simultáneo del código temporal (válido por 5 minutos) en el almacén de seguridad (`auth_codes.json`) tanto para `jpacdia@gobiernodecanarias.org` como para `jpadiaz@gobiernodecanarias.org`, asegurando que el código sea válido sin importar cuál de las dos variantes se introduzca.
    * Al verificar el código, se vincula y autentica directamente la sesión con el perfil y permisos completos de **Administrador del Sistema** (`José Domingo Pacheco Díaz`, `rol: ADMIN`).
  * **Aviso Visual en Pantalla de Acceso**:
    * Al solicitar el código con la cuenta de administración, se despliega una confirmación y aviso explícito en pantalla: *«✉️ Copia enviada también a: josedpdiaz@gmail.com»*, permitiendo al administrador abrir su correo de Gmail y copiar el código de 6 dígitos al instante.
  * **Sincronización en las 3 Capas (v1.4.2)**:
    * Actualización de la versión a `1.4.2` en `types.ts`, `package.json` y pie de página.
    * Generación de respaldo local en archivo ZIP `Reservas-Aula-ATECA-v.1.4.2.zip`.
    * Compilación con Vite y despliegue a producción Hostinger (`https://ateca.fpapps.es`).
    * Sincronización en GitHub (`main`, `backup/v1.4.2` y tag `v1.4.2`).

---

## [v1.4.1] - 2026-09-24
### 📱 Detección Inteligente de Dispositivos, Calendario Maximizado en Móviles/Tablets y Botón Persistente «Volver al Calendario»
* **Objetivo**: Detectar automáticamente el tipo de dispositivo y orientación de pantalla (móvil en vertical u horizontal, tablet y monitor de ordenador PC), maximizar el calendario a ancho completo (100%) en todos los dispositivos móviles y tablets eliminando la división en dos ventanas que dificultaba la visualización en pantallas reducidas, y garantizar una referencia y botón accesible y permanente de «Volver al Calendario» desde cualquier vista o subpantalla de la plataforma.
* **Mejoras clave**:
  * **Módulo de Detección Dinámica de Dispositivos (`useDeviceDetection.ts`)**:
    * Implementación de un hook de detección reactiva con debounce ante cambios de tamaño de ventana (`resize`) y giro de orientación (`orientationchange`).
    * Detección precisa de:
      * `isMobile`: teléfonos inteligentes (< 768px o User-Agent móvil).
      * `isTablet`: tabletas (iPad, tabletas Android, 768px ≤ ancho < 1024px, o User-Agent tablet con soporte táctil).
      * `isDesktop`: pantallas y monitores de PC de sobremesa o portátil (ancho ≥ 1024px sin emulación táctil reducida).
      * `isMobileOrTablet`: indicador unificado de dispositivos de pantalla reducida o táctil.
      * `isPortrait` e `isLandscape`: detección en tiempo real de modo vertical o apaisado.
  * **Calendario Siempre Maximizado en Móviles y Tablets**:
    * En pantallas de ordenador PC (`isDesktop`), se preserva el flujo de trabajo de doble ventana paralela (cuadrícula mensual + tarjeta de detalle del día con tirador deslizable de proporción ajustable).
    * En dispositivos móviles y tablets (tanto en modo vertical como horizontal), la cuadrícula mensual del calendario se abre y mantiene **siempre maximizada al 100% de la pantalla**, suprimiendo la segunda ventana lateral y evitando que las celdas de los días se compriman o deformen.
    * Al pulsar sobre cualquier celda de un día en móvil o tablet, se accede directamente a la vista completa de franjas horarias del día (`DayScheduleSheet`), que cuenta con su propio botón prominente de retorno a la vista mensual.
  * **Referencia y Botón Persistente «Volver al Calendario» en Toda la Aplicación**:
    * **Cabecera Principal**: El logotipo oficial y el título institucional de la aplicación (`Gestor Aula ATECA`) son interactivos y permiten retornar instantáneamente al calendario desde cualquier estado.
    * **Barra de Acceso Rápido en Móvil/Tablet**: Cuando el usuario se encuentra en un teléfono o tablet (especialmente en modo vertical) y navega a otra sección (*Mis Actividades*, *Panel Coordinador*, *Administración*, o cualquier formulario), se muestra una barra superior destacada con el botón `← Volver al Calendario`.
    * **Botones de Retorno Explícitos en Todas las Subpantallas**:
      * *Horario del Día (`DayScheduleSheet`)*: Se actualiza el botón de vuelta para que siempre muestre con claridad `← Volver al Calendario`.
      * *Formulario de Reserva (`BookingForm`)*: Botón superior `← Volver al Calendario`.
      * *Ficha de Detalle de Reserva (`App.tsx`)*: Se incorpora el botón `← Volver al Calendario`.
      * *Formulario de Valoración Pedagógica (`ValuationForm`)*: Botón `← Volver al Calendario`.
      * *Generador de Informes de Evidencia (`ReportPDF`)*: Botón `← Volver al Calendario`.
      * *Panel Mis Actividades (`MyBookingsView`)*: Botón `← Volver al Calendario` en la cabecera.
      * *Panel de Coordinación (`CoordinatorPanel`)*: Botón `← Volver al Calendario` en la barra superior.
      * *Consola de Administración (`AdminPanel`)*: Botón `← Volver al Calendario` en el banner superior.
  * **Sincronización en las 3 Capas (v1.4.1)**:
    * Actualización de la versión a `1.4.1` en `types.ts`, `package.json` y pie de página de la aplicación.
    * Generación de copia de seguridad local en archivo ZIP `Reservas-Aula-ATECA-v.1.4.1.zip` en la carpeta de respaldos.
    * Compilación de producción, pruebas de linting (`tsc --noEmit`), despliegue a servidor en Hostinger (`https://ateca.fpapps.es`) y subida a GitHub (`main`, rama `backup/v1.4.1` y tag `v1.4.1`).

---

## [v1.4.0] - 2026-09-24
### 🛡️ Permisos Configurables de Coordinación, Distintivo de Acreditación Docente ATECA, Aforo Máximo de 12 Alumnos e Integración del Departamento de Procesos de Gestión Administrativa
* **Objetivo**: Proporcionar al administrador el control granular de permisos para coordinadores (autorizar reservas y crear usuarios, mostrándose exclusivamente cuando el usuario tiene rol de Coordinador), dotar al sistema de una acreditación de formación básica en competencias ATECA gestionable por administradores y coordinadores con distintivo visual `🎓 Acreditado ATECA`, limitar estrictamente el aforo simultáneo del aula a un máximo de 12 alumnos con avisos emergentes preventivos, e incorporar formalmente el departamento de 'Procesos de Gestión Administrativa' con prioridad P1 de Formación Profesional.
* **Mejoras clave**:
  * **Permisos Configurables para Coordinadores (Panel de Administración)**:
    * El Administrador puede configurar mediante casillas/conmutadores los permisos específicos para cada coordinador:
      * **Autorizar reservas (`autorizar_reservas`)**: Determina si el coordinador puede aprobar, rechazar o reactivar reservas que queden en estado pendiente.
      * **Dar de alta usuarios (`crear_usuarios`)**: Determina si el coordinador tiene habilitada la facultad de registrar nuevos docentes y miembros en la plataforma.
    * **Restricción estricta de interfaz**: Estas casillas de permisos avanzados solo se muestran y son configurables en el formulario de alta y en el modal de edición cuando el rol asignado al usuario es estrictamente `COORDINADOR`.
    * **Aplicación efectiva de permisos**:
      * Si un coordinador tiene desactivado el permiso de autorizar reservas, las acciones de aprobación/rechazo quedan bloqueadas en el Panel de Coordinación y en el modal de detalle de reserva de la vista principal con aviso informativo explicativo.
      * En el Panel de Coordinación se añade una pestaña de gestión docente (`Docentes y Acreditaciones`). Si el coordinador tiene concedido el permiso `crear_usuarios`, se le despliega el formulario de registro; en caso contrario, se muestra un aviso de que dicha acción requiere autorización administrativa.
  * **Distintivo e Icono de Formación Docente en Competencias Básicas ATECA (`🎓 Acreditado`)**:
    * Tanto Administradores como Coordinadores pueden marcar y desmarcar a los docentes que hayan superado la formación para el uso seguro del aula y sus herramientas tecnológicas (`formacion_competencias`).
    * Se añade botón de alternancia rápida (*toggle*) en la tabla de usuarios del Panel de Administración y en la nueva pestaña de Docentes del Panel de Coordinación.
    * Muestra del distintivo visual `🎓 Acreditado ATECA` junto al nombre del docente en:
      * Ficha de detalle de la reserva (`App.tsx`).
      * Tarjetas de ocupación diaria y vista de lista del Calendario (`CalendarView.tsx`).
      * Panel del Coordinador en reservas pendientes, historial y lista de docentes (`CoordinatorPanel.tsx`).
      * Cabecera del panel de *Mi Agenda y Memorias* (`MyBookingsView.tsx`).
      * Formulario de reserva didáctica (`BookingForm.tsx`).
  * **Control Estricto de Aforo Máximo: Límite de 12 Alumnos y Modal Preventivo**:
    * En el formulario de reserva didáctica (`BookingForm.tsx`), el campo de número estimado de alumnos se acota estrictamente a un valor máximo de 12 (`min="1"`, `max="12"`).
    * Si el usuario intenta introducir un número superior a 12 o pegar un valor mayor, el campo se ajusta automáticamente a 12 y se despliega un cuadro emergente modal explicativo recordando que, por motivos de seguridad, prevención de riesgos laborales y dotación de puestos interactivos (VR, escaneado 3D, estudio audiovisual), el aforo simultáneo es de 12 alumnos como tope, sugiriendo la organización en turnos o desdobles.
    * Validación redundante en almacenamiento local (`storage.ts`) para garantizar que ninguna reserva supere el límite reglamentario de 12 alumnos.
  * **Incorporación Oficial del Departamento 'Procesos de Gestión Administrativa' (PGA)**:
    * Integrado de serie en el catálogo oficial de departamentos de Formación Profesional (`types.ts`).
    * Clasificado automáticamente como departamento de Ciclos de FP con prioridad preferente **P1 (Aprobación Automática Directa)**.
  * **Sincronización en las 3 Capas (v1.4.0)**:
    * Actualización de la versión a `1.4.0` en `types.ts`, `package.json` y pie de página institucional.
    * Respaldo local en ZIP `Reservas-Aula-ATECA-v.1.4.0.zip` en la carpeta de respaldos.
    * Despliegue en producción Hostinger (`https://ateca.fpapps.es`) y subida a GitHub (`main`, `backup/v1.4.0`, tag `v1.4.0`).

---

## [v1.3.9] - 2026-09-23
### ⏳ Pase Automático a Standby tras 48h sin Confirmación, Reasignación de Franjas y Desactivación de Liberación Post-Sesión
* **Objetivo**: Implementar la regla de expiración de 48 horas tras el recordatorio semanal para pasar reservas no confirmadas a estado *Standby* (`PENDIENTE`), permitiendo a la Administración o Coordinación reasignar el espacio o desplazar la reserva con solicitudes prioritarias (como FP), y desactivar automáticamente la acción de «Liberar Aula» una vez que el horario de la reserva ha concluido.
* **Mejoras clave**:
  * **Pase Automático a Standby tras 48 Horas sin Confirmar**:
    * Al remitir el recordatorio semanal preventivo (lunes 08:00 AM), el docente dispone de 48 horas para ratificar su asistencia.
    * Si transcurren 48 horas sin confirmación (`!confirmada_por_docente`), la reserva pasa automáticamente de `APROBADA` a `PENDIENTE` (Standby).
    * Notificación por correo a la Administración (`jpacdia@gobiernodecanarias.org`) y Coordinación informando de la reserva en standby y la disponibilidad de la franja.
    * Notificación por correo al docente explicando que su franja horaria pasa a standby por no confirmar y queda provisionalmente abierta a reasignación.
  * **Reasignación Administrativa y Desplazamiento Prioritario**:
    * Al encontrarse la reserva no confirmada en estado `PENDIENTE`, la franja horaria queda libre en el cómputo de solapamientos del calendario.
    * Cualquier nueva solicitud prioritaria de FP es aprobada directamente, o bien el Administrador/Coordinador puede autorizar otra solicitud de cualquier nivel formativo, desplazando automáticamente la reserva que no fue confirmada a tiempo.
    * Si la franja aún continúa libre y el docente accede a confirmar posteriormente, el sistema le permite reactivarla a `APROBADA`. Si la franja ya fue ocupada, se le informa de que expiró su plazo y la franja fue concedida a otra solicitud.
  * **Desactivación del Botón «Liberar Aula» tras Vencer el Tiempo**:
    * El botón de «Liberar Aula» (tanto en la ficha de detalle como en las tarjetas y la tabla de *Mis Actividades*) se desactiva automáticamente con estilo atenuado y cursor bloqueado una vez que la fecha y hora de fin de la sesión han transcurrido (`hasBookingConcluded`).
    * Protección complementaria en la recepción de enlaces por URL (`?release_booking=...`), impidiendo liberar reservas cuyo horario ya concluyó.
  * **Distintivo Visual de Standby**:
    * Muestra de distintivos visuales claros `⏳ Standby (48h)` en las tarjetas, tabla y ficha de detalle de la reserva.
  * **Sincronización en las 3 Capas (v1.3.9)**:
    * Actualización a `1.3.9` en `types.ts`, `package.json`, pie de página institucional, GitHub (`main`, `backup/v1.3.9`, tag `v1.3.9`), zip local y producción Hostinger.

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
