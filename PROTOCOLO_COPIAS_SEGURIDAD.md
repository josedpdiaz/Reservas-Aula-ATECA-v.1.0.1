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
  * **Ramas subyacentes de respaldo (`backup/v.X.X.X`)**: Se crea una rama aislada e inmutable por cada versión o checkpoint que actúa como instantánea permanente sin tocar la rama principal.
  * **Etiquetas oficiales (`vX.X.X`)**: Releases publicadas en GitHub.
