# 📄 INFORME ESPECIAL: PRODUCCIÓN OFICIAL IES AGUSTÍN DE BETANCOURT Y ARQUITECTURA DUAL
### Plataforma de Gestión de Reservas y Memorias Didácticas - Aula ATECA
**Fecha de emisión:** 13 de septiembre de 2026  
**Versión del sistema:** v1.3.4  
**Centro Educativo:** IES Agustín de Betancourt  
**Administración Oficial:** jpacdia@gobiernodecanarias.org  
**Ámbito:** Entorno de Producción Oficial de Centro y Entorno Técnico Auxiliar  

---

## 1. Resumen Ejecutivo
El presente informe formaliza el despliegue definitivo en producción del sistema **Gestor Aula ATECA** para el **IES Agustín de Betancourt**, desvinculando cualquier formato de evaluación o modo de pruebas en su versión oficial:

1. **Entorno de Producción Oficial de Centro (`https://ateca.fpapps.es`):**  
   Plataforma plenamente operativa y en producción para el claustro, coordinadores y equipo directivo del **IES Agustín de Betancourt**. La autenticación se realiza exclusivamente mediante cuentas corporativas del Gobierno de Canarias terminadas en **`@gobiernodecanarias.org`** (Google Workspace Educativo), contando con la cuenta oficial de administración **`jpacdia@gobiernodecanarias.org`**.
2. **Entorno Técnico Auxiliar (`https://ateca.josedpdiaz.net`):**  
   Mantenido como plataforma secundaria de respaldo técnico y verificación de compilaciones previas.

Asimismo, se ratifican las **reglas de gobernanza por tipología de cambio** y la **regla de consulta obligatoria previa** por parte del asistente de desarrollo.

---

## 2. Mapa de Infraestructura y Servidores

Ambos entornos residen en el servidor de Hostinger y comparten la misma llave criptográfica segura ED25519 (`id_ed25519`), garantizando un mantenimiento ágil y seguro sin credenciales dispersas:

| Parámetro | 🏛️ Producción Oficial IES Agustín de Betancourt | 🛠️ Entorno Técnico Auxiliar |
| :--- | :--- | :--- |
| **URL Pública** | [https://ateca.fpapps.es](https://ateca.fpapps.es) | [https://ateca.josedpdiaz.net](https://ateca.josedpdiaz.net) |
| **Estado** | **En Producción Operativa Oficial** | Plataforma Técnica Auxiliar |
| **Autenticación** | Cuentas Google `@gobiernodecanarias.org` | Libre / Simulada |
| **Administrador** | `jpacdia@gobiernodecanarias.org` | José Díaz |
| **Servidor Host** | `109.106.243.32` | `109.106.243.32` |
| **Puerto SSH** | `65002` | `65002` |
| **Usuario SSH** | `u220313307` | `u220313307` |
| **Directorio Web** | `domains/fpapps.es/public_html/ateca/` | `domains/josedpdiaz.net/public_html/ateca/` |
| **Seguridad SSL** | Certificado HTTPS activo (TLS v1.3) | Certificado HTTPS activo (TLS v1.3) |
| **Enrutamiento SPA** | Reglas Apache/LiteSpeed en `.htaccess` | Reglas Apache/LiteSpeed en `.htaccess` |
| **Comando Despliegue** | `npm run deploy:prod` | `npm run deploy:test` |

---

## 3. Clasificación de Cambios y Reglas de Despliegue

Las intervenciones en el software se rigen por la siguiente matriz de gobernanza:

### 🅰️ Tipo A: Cambios Funcionales (Código y Arquitectura)
* **Definición**: Nuevos componentes, refactorizaciones, diseño visual, optimización de algoritmos, lógica de permisos, nuevos filtros de reservas o resolución de incidencias.
* **Alcance**: **Universal**. Afecta al motor del software.
* **Flujo de sincronización**: Se propaga a las **4 capas de seguridad**:
  1. Carpeta local de desarrollo en Escritorio (`Reservas-Aula-ATECA-v.X.X.X`).
  2. Archivo comprimido `.zip` optimizado en la nube (`9-D-SEP.26`).
  3. Despliegue en servidores remotos (`npm run deploy`: Producción y Auxiliar).
  4. Repositorio GitHub: Rama `main` limpia y rama subyacente de respaldo (`backup/vX.X.X`).

### 🅱️ Tipo B: Cambios de Datos y Configuración de Centro
* **Definición**: Alta/edición de profesorado del centro, asignación de turnos y departamentos reales, personalización de equipamiento del aula ATECA local o enlaces a hojas Google Sheets oficiales.
* **Alcance**: **Exclusivo de Producción (`ateca.fpapps.es`)**.
* **Flujo de sincronización**: Se aplica de forma aislada sobre `https://ateca.fpapps.es` (`npm run deploy:prod`).

### 🧪 Tipo C: Ajustes Técnicos Auxiliares
* **Definición**: Ensayos de laboratorio, pruebas de compatibilidad o verificaciones puntuales de arquitectura.
* **Alcance**: **Exclusivo del Entorno Auxiliar (`ateca.josedpdiaz.net`)**.
* **Flujo de sincronización**: Se despliega únicamente en `https://ateca.josedpdiaz.net` (`npm run deploy:test`). La producción oficial del centro permanece blindada.

---

## 4. Regla de Oro: Protocolo de Confirmación Obligatoria

Antes de iniciar cualquier despliegue o sincronización, el asistente formulará siempre la siguiente consulta:

> **Protocolo de Consulta Previa:**  
> *«¿Cómo deseas que apliquemos y sincronicemos esta actualización?»*  
> 1. **Solo Producción** (`ateca.fpapps.es`)  
> 2. **Solo Auxiliar / Pruebas** (`ateca.josedpdiaz.net`)  
> 3. **Ambos servidores** (`ateca.fpapps.es` y `ateca.josedpdiaz.net`)  
> 4. **Sincronización Completa en las 4 Capas** (Escritorio + Nube .zip + Ambos Servidores + GitHub rama subyacente)  
>  
> *Ante cualquier duda o ambigüedad, el asistente se detendrá a solicitar confirmación explícita.*

---

## 5. Cuadro de Comandos de Operación Rápida

| Acción requerida | Comando en terminal |
| :--- | :--- |
| Iniciar servidor local de desarrollo | `npm run dev` |
| Validar tipos de TypeScript | `npm run lint` |
| Compilar para producción (Vite) | `npm run build` |
| Desplegar únicamente a **Entorno Auxiliar** | `npm run deploy:test` |
| Desplegar únicamente a **Producción Oficial (Centro)** | `npm run deploy:prod` |
| Desplegar a **ambos servidores** a la vez | `npm run deploy` |

---

*Informe formalizado y archivado para el registro de gobernanza técnica del proyecto Aula ATECA - IES Agustín de Betancourt.*