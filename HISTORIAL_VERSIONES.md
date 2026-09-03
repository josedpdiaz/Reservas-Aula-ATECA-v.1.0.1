# 📚 Historial de Versiones y Mejoras (Changelog)
### Sistema de Gestión de Reservas y Memorias Didácticas - Aula ATECA

Este documento recopila de forma cronológica, concisa y estructurada todos los upgrades, updates y mejoras implementadas en la rama principal (`main`) del proyecto, asociadas a sus respectivas *Releases* en GitHub.

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
