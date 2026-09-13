# 🛡️ Protocolo Oficial de Copias de Seguridad (4 Capas de Respaldo)
### Sistema de Gestión Aula ATECA

Cada vez que el usuario indique **«guardar una copia de seguridad»** o cerremos una sesión de trabajo con una versión estable, se ejecutarán de forma obligatoria y sincronizada las siguientes **4 capas de seguridad**:

---

### 1. 🖥️ Capa 1: Copia de Trabajo en el Escritorio de Windows
* **Ubicación**: `C:\Users\josed\Desktop\Reservas-Aula-ATECA-v.X.X.X`
* **Naturaleza**: Desplegada, operativa y funcional.
* **Función**: Es donde se desarrolla el código, corre el servidor local `npm run dev` y se ejecutan las pruebas.

---

### 2. 📦 Capa 2: Copia de Archivo en la Nube (Siempre Comprimida en .ZIP)
* **Ubicación**: `C:\Users\josed\Desktop\9-D-SEP.26\01-IA-APP-ATECA-GESTIÓN-DE-RESERVAS`
* **Naturaleza**: Archivo `.zip` limpio y optimizado (`Reservas-Aula-ATECA-v.X.X.X.zip`) sin directorios pesados (`node_modules`).
* **Documentación adjunta**: Manuales PDF, registros de versiones y documentación de referencia.
* **Función**: Almacén histórico de copias congeladas sin saturar la nube.

---

### 3. 🌐 Capa 3: Actualización de Servidores Remotos (Hostinger)
* **Entorno de Pruebas (Piloto/Ensayos)**: `https://ateca.josedpdiaz.net` (`domains/josedpdiaz.net/public_html/ateca/`)
  * Despliegue individual: `npm run deploy:test`
  * Mantiene datos de prueba/piloto y características en validación.
* **Entorno de Producción (Oficial de Centro)**: `https://ateca.fpapps.es` (`domains/fpapps.es/public_html/ateca/`)
  * Despliegue individual: `npm run deploy:prod`
  * Aloja los datos reales de profesorado y reservas del centro.
* **Regla de Operación**:
  * Si el usuario pide cambios para **Producción (`ateca.fpapps.es`)**, los cambios se publican en producción de forma aislada para no alterar el entorno de pruebas, salvo que indique expresamente que deben trasladarse a todas las capas.
  * Si el usuario pide cambios o pruebas en **Pruebas (`ateca.josedpdiaz.net`)**, producción queda intacta.
  * Cuando se trate de **actualizaciones globales o hitos importantes**, se compilará y desplegará unificadamente con `npm run deploy` y se replicará en las 4 capas.
* **Naturaleza**: Aplicaciones web en vivo compiladas (`dist/`), protegidas con HTTPS y reglas SPA `.htaccess`.
* **Credenciales SSH**: Mismo host (`109.106.243.32`), puerto (`65002`) y usuario (`u220313307`) mediante clave ED25519.

---

### 4. 🐙 Capa 4: Gestor de Versiones con Ramas Subyacentes (Git & GitHub)
* **Repositorio**: `https://github.com/josedpdiaz/Reservas-Aula-ATECA-v.1.0.1.git`
* **Ramas y capas**:
  * **Rama principal (`main`)**: Código fuente consolidado.
  * **Ramas subyacentes de respaldo (`backup/vX.X.X`)**: Se crea una rama aislada e inmutable por cada versión o checkpoint que actúa como instantánea permanente sin tocar la rama principal.
  * **Etiquetas oficiales (`vX.X.X`)**: Releases publicadas en GitHub.

---

## 🚦 Reglas de Clasificación de Cambios y Protocolo de Sincronización

### 🅰️ Tipo A: Cambios Funcionales (Código, lógica, diseño, nuevas funciones, correcciones)
* **Alcance**: Universal. Afecta a la arquitectura y comportamiento del software.
* **Acción por defecto**: Se sincronizan de forma integral las **4 capas**:
  1. Escritorio (carpeta de desarrollo).
  2. Nube comprimida (.zip en `9-D-SEP.26`).
  3. Servidores Remotos (tanto Producción `ateca.fpapps.es` como Pruebas `ateca.josedpdiaz.net`).
  4. GitHub (rama `main` + rama subyacente inmutable `backup/vX.X.X`).

### 🅱️ Tipo B: Cambios de Datos / Configuración Específica de Centro
* **Alcance**: Específico (datos de profesorado, departamentos, reservas reales, credenciales de centro).
* **Acción por defecto**: Afecta **únicamente a Producción (`ateca.fpapps.es`)**, manteniendo el entorno de pruebas limpio para ensayos sin comprometer la privacidad o el histórico real del centro.

### 🧪 Tipo C: Pruebas de Ajuste o Ensayos Piloto
* **Alcance**: Experimental.
* **Acción por defecto**: Afecta **únicamente al entorno de Pruebas (`ateca.josedpdiaz.net`)**.

---

## ❓ Regla de Oro: Confirmación Obligatoria del Asistente
Antes de realizar cualquier despliegue o sincronización, el asistente **siempre debe consultar y confirmar** con el usuario:
> *«¿Cómo deseas sincronizar esta actualización?»*
> 1. **Solo Producción (`ateca.fpapps.es`)**
> 2. **Solo Pruebas (`ateca.josedpdiaz.net`)**
> 3. **Ambos servidores (`ateca.fpapps.es` y `ateca.josedpdiaz.net`)**
> 4. **Sincronización Completa en las 4 Capas** (Escritorio + Nube .zip + Ambos Servidores + GitHub con rama subyacente)
> 
> *Ante cualquier duda o ambigüedad, el asistente se detendrá a preguntar antes de alterar servidores o repositorios.*
