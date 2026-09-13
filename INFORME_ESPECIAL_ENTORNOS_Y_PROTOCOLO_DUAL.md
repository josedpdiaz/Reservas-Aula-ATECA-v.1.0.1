# 📄 INFORME ESPECIAL: ARQUITECTURA DUAL Y PROTOCOLO DE SINCRONIZACIÓN
### Plataforma de Gestión de Reservas y Memorias Didácticas - Aula ATECA
**Fecha de emisión:** 13 de septiembre de 2026  
**Versión del sistema:** v1.3.4  
**Autor:** Equipo de Desarrollo e Inteligencia del Proyecto / José Díaz  
**Ámbito:** Entorno de Producción de Centro y Entorno de Pruebas Piloto  

---

## 1. Resumen Ejecutivo
El presente informe formaliza la transición y coexistencia del sistema de gestión de Aula ATECA entre dos entornos operativos plenamente diferenciados sobre la infraestructura de Hostinger:

1. **Entorno de Producción Oficial de Centro (`https://ateca.fpapps.es`):**  
   Destinado al claustro, coordinadores y equipos directivos del centro educativo para la reserva real de espacios, equipamiento y generación de memorias pedagógicas oficiales.
2. **Entorno de Pruebas y Piloto (`https://ateca.josedpdiaz.net`):**  
   Mantenido como banco de ensayos, validación de nuevas características con profesorado colaborador y pruebas piloto sin riesgo de contaminar la base de datos real del centro.

Asimismo, se establece la **regla de sincronización por tipología de cambio** y la **regla de consulta obligatoria previa** por parte del asistente de desarrollo.

---

## 2. Mapa de Infraestructura y Servidores

Ambos entornos residen en el mismo servidor de Hostinger y comparten las mismas credenciales de autenticación segura por clave pública criptográfica ED25519 (`id_ed25519`), lo que elimina la necesidad de configurar usuarios o credenciales SSH adicionales.

| Parámetro | 🚀 Producción Oficial | 🧪 Pruebas / Piloto |
| :--- | :--- | :--- |
| **URL Pública** | [https://ateca.fpapps.es](https://ateca.fpapps.es) | [https://ateca.josedpdiaz.net](https://ateca.josedpdiaz.net) |
| **Servidor Host** | `109.106.243.32` | `109.106.243.32` |
| **Puerto SSH** | `65002` | `65002` |
| **Usuario SSH** | `u220313307` | `u220313307` |
| **Directorio Web** | `domains/fpapps.es/public_html/ateca/` | `domains/josedpdiaz.net/public_html/ateca/` |
| **Seguridad SSL** | Certificado HTTPS activo (TLS v1.3) | Certificado HTTPS activo (TLS v1.3) |
| **Enrutamiento SPA** | Reglas Apache/LiteSpeed en `.htaccess` | Reglas Apache/LiteSpeed en `.htaccess` |
| **Comando Despliegue** | `npm run deploy:prod` | `npm run deploy:test` |

---

## 3. Clasificación de Cambios y Reglas de Despliegue

Para garantizar la estabilidad institucional y la agilidad en el desarrollo, las modificaciones se dividen estrictamente en tres categorías:

### 🅰️ Tipo A: Cambios Funcionales (Código y Arquitectura)
* **Definición**: Nuevos componentes, refactorizaciones, diseño visual, optimización de algoritmos, lógica de permisos, nuevos filtros de reservas o resolución de bugs.
* **Alcance**: **Universal**. Afecta al motor del software.
* **Flujo de sincronización**: Se propaga a las **4 capas de seguridad**:
  1. Carpeta local de desarrollo en Escritorio (`Reservas-Aula-ATECA-v.X.X.X`).
  2. Archivo comprimido `.zip` optimizado en la nube (`9-D-SEP.26`).
  3. Despliegue unificado en servidores remotos (`npm run deploy`: Producción y Pruebas).
  4. Repositorio GitHub: Rama `main` limpia y rama subyacente de respaldo (`backup/vX.X.X`).

### 🅱️ Tipo B: Cambios de Datos y Configuración Específica de Centro
* **Definición**: Alta/edición de profesorado del centro, asignación de turnos y departamentos reales, personalización de equipamiento del aula ATECA local o enlaces a hojas Google Sheets oficiales.
* **Alcance**: **Exclusivo de Producción**.
* **Flujo de sincronización**: Se aplica de forma aislada sobre `https://ateca.fpapps.es` (`npm run deploy:prod`). El entorno de pruebas se mantiene con datos ficticios para que los compañeros puedan seguir testeando libremente.

### 🧪 Tipo C: Pruebas de Ajuste o Ensayos Piloto
* **Definición**: Pruebas de carga, ensayos de formularios con compañeros o verificación de nuevas propuestas antes de ser aprobadas.
* **Alcance**: **Exclusivo de Pruebas**.
* **Flujo de sincronización**: Se despliega únicamente en `https://ateca.josedpdiaz.net` (`npm run deploy:test`). Producción queda totalmente protegida e inalterada.

---

## 4. Regla de Oro: Protocolo de Confirmación Obligatoria

El asistente de desarrollo tiene programada la siguiente directriz inquebrantable antes de iniciar cualquier despliegue o archivado:

> **Protocolo de Consulta Previa:**  
> Ante cualquier modificación realizada en la sesión, el asistente preguntará al usuario:  
> *«¿Cómo deseas que apliquemos y sincronicemos esta actualización?»*  
> 1. **Solo Producción** (`ateca.fpapps.es`)  
> 2. **Solo Pruebas** (`ateca.josedpdiaz.net`)  
> 3. **Ambos servidores** (`ateca.fpapps.es` y `ateca.josedpdiaz.net`)  
> 4. **Sincronización Completa en las 4 Capas** (Escritorio + Nube .zip + Ambos Servidores + GitHub rama subyacente)  
>  
> *Si existe la más mínima ambigüedad, el asistente se detendrá a solicitar confirmación explícita.*

---

## 5. Cuadro de Comandos de Operación Rápida

| Acción requerida | Comando en terminal |
| :--- | :--- |
| Iniciar servidor local de pruebas | `npm run dev` |
| Validar tipos de TypeScript | `npm run lint` |
| Compilar para producción (Vite) | `npm run build` |
| Desplegar únicamente a **Pruebas** | `npm run deploy:test` |
| Desplegar únicamente a **Producción** | `npm run deploy:prod` |
| Desplegar a **ambos servidores** a la vez | `npm run deploy` |

---

*Informe formalizado y archivado para el registro de gobernanza técnica del proyecto Aula ATECA.*