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

### 3. 🌐 Capa 3: Actualización del Servidor en Producción (Hostinger)
* **Ubicación**: `https://ateca.josedpdiaz.net`
* **Naturaleza**: Aplicación web en vivo compilada con Vite (`dist/`) y enrutamiento `.htaccess`.
* **Función**: Garantizar que la versión pública que utilizan los docentes del centro refleje siempre las mejoras estables. Se actualiza mediante `npm run deploy` por SSH.

---

### 4. 🐙 Capa 4: Gestor de Versiones con Ramas Subyacentes (Git & GitHub)
* **Repositorio**: `https://github.com/josedpdiaz/Reservas-Aula-ATECA-v.1.0.1.git`
* **Ramas y capas**:
  * **Rama principal (`main`)**: Código fuente consolidado.
  * **Ramas subyacentes de respaldo (`backup/v.X.X.X`)**: Se crea una rama aislada e inmutable por cada versión o checkpoint que actúa como instantánea permanente sin tocar la rama principal.
  * **Etiquetas oficiales (`vX.X.X`)**: Releases publicadas en GitHub.
