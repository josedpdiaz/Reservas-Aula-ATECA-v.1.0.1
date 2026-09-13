# 📄 INFORME ESPECIAL: PRODUCCIÓN OFICIAL IES AGUSTÍN DE BETANCOURT Y ARQUITECTURA DE 3 CAPAS
### Plataforma de Gestión de Reservas y Memorias Didácticas - Aula ATECA
**Fecha de emisión:** 13 de septiembre de 2026  
**Versión del sistema:** v1.3.4  
**Centro Educativo:** IES Agustín de Betancourt  
**Administración Oficial:** jpacdia@gobiernodecanarias.org  
**Ámbito:** Arquitectura Unificada de 3 Capas (Local, Git y Producción Oficial)  

---

## 1. Resumen Ejecutivo
El presente informe formaliza la arquitectura del sistema **Gestor Aula ATECA** para el **IES Agustín de Betancourt**, suprimiendo de manera definitiva el entorno de pruebas para operar bajo un modelo simplificado, robusto y eficiente estructurado en **3 capas fundamentales**:

1. **Capa 1: Guardado en Local**: Código fuente en el entorno de trabajo local y paquetes comprimidos `.zip` de respaldo en el directorio de versiones.
2. **Capa 2: Control de Versiones en Git**: Repositorio GitHub sincronizado en rama `main` y ramas de respaldo.
3. **Capa 3: Despliegue en Producción (`https://ateca.fpapps.es`)**: Servidor oficial en Hostinger con enrutamiento HTTPS/SPA, exclusivo para el IES Agustín de Betancourt, autenticado mediante cuentas corporativas Google Workspace del Gobierno de Canarias (`@gobiernodecanarias.org`).

---

## 2. Mapa de Infraestructura

| Parámetro | 🏛️ Producción Oficial IES Agustín de Betancourt |
| :--- | :--- |
| **URL Pública** | [https://ateca.fpapps.es](https://ateca.fpapps.es) |
| **Estado** | **En Producción Operativa Oficial** |
| **Centro Educativo** | IES Agustín de Betancourt |
| **Autenticación** | Cuentas Google `@gobiernodecanarias.org` |
| **Administrador Oficial**| `jpacdia@gobiernodecanarias.org` |
| **Servidor Host** | `109.106.243.32` |
| **Puerto SSH** | `65002` |
| **Usuario SSH** | `u220313307` |
| **Directorio Web** | `domains/fpapps.es/public_html/ateca/` |
| **Seguridad SSL** | Certificado HTTPS activo (TLS v1.3) |
| **Enrutamiento SPA** | Reglas Apache/LiteSpeed en `.htaccess` |
| **Comando Despliegue** | `npm run deploy` (o `npm run deploy:prod`) |

---

## 3. Las 3 Capas de la Arquitectura

### 💻 Capa 1: Entorno de Desarrollo y Guardado Local
* Ubicación de trabajo: `C:\Users\josed\Desktop\Reservas-Aula-ATECA-v.1.3.3` (actualizado a v1.3.4).
* Copias de seguridad comprimidas en almacenamiento local: `C:\Users\josed\Desktop\9-D-SEP.26\01-IA-APP-ATECA-GESTIÓN-DE-RESERVAS\`.
* Compilación mediante Vite y verificación de tipado con TypeScript (`tsc --noEmit`).

### 🐙 Capa 2: Repositorio Git y GitHub
* Control de versiones en GitHub: rama principal `main`.
* Historial íntegro de versiones con trazabilidad de cada mejora.
* Blindaje de datos: ninguna reserva, valoración o usuario real de producción se versiona en Git.

### 🚀 Capa 3: Despliegue en Servidor de Producción
* Servidor Hostinger accesible globalmente en `https://ateca.fpapps.es`.
* Despliegue automatizado seguro por SSH / SCP con asignación inmediata de permisos (`755` directorios, `644` ficheros).
* Soporte para Google Sheets Apps Script API en tiempo real con persistencia en segundo plano.

---

## 4. Cuadro de Comandos de Operación

| Acción requerida | Comando en terminal |
| :--- | :--- |
| Iniciar servidor local de desarrollo | `npm run dev` |
| Validar tipos de TypeScript | `npm run lint` |
| Compilar para producción (Vite) | `npm run build` |
| Desplegar a Producción Oficial | `npm run deploy` |

---

*Informe formalizado y archivado para el registro de gobernanza técnica del proyecto Aula ATECA - IES Agustín de Betancourt.*