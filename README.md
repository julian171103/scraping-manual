# Scraping manual de un perfil público de Instagram (DevTools + JavaScript + Playwright)

**Autor:** JULIAN GUEVARA
**Materia:** ARQUITECTURA DE SISTEMAS SI7-001
**Fecha:** 14 de octubre de 2026

## Tabla de contenido

1. [Objetivo](#1-objetivo)
2. [Ética y privacidad](#2-ética-y-privacidad)
3. [Tecnologías](#3-tecnologías)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Guía de uso (para quien descarga el proyecto)](#5-guía-de-uso-para-quien-descarga-el-proyecto)
6. [Método manual (selectores probados en Console)](#6-método-manual-selectores-probados-en-console)
7. [Cómo funciona cada script](#7-cómo-funciona-cada-script)
8. [Archivos generados](#8-archivos-generados)
9. [Dashboard de resultados](#9-dashboard-de-resultados)
10. [Resultados](#10-resultados)
11. [Limitaciones](#11-limitaciones)
12. [Solución de problemas](#12-solución-de-problemas)
13. [Fuentes y declaración de uso de IA](#13-fuentes-y-declaración-de-uso-de-ia)

---

## 1. Objetivo

Extraer datos de una cuenta pública de Instagram, con autorización de su titular. Cada dato se ubica **manualmente en DevTools (Elements y Console)** y luego se automatiza con JavaScript, Playwright y Chromium.

Datos que se extraen:

- Perfil: usuario, nombre visible, biografía y contadores (publicaciones, seguidores, seguidos).
- Publicaciones: enlace, tipo (reel o publicación), fecha y descripción (incluye likes y comentarios).
- Muestras de las listas de seguidores y seguidos (solo nombres de usuario).

## 2. Ética y privacidad

- La titular autorizó la práctica.
- Se usó la sesión personal del autor, iniciada manualmente. Ninguna contraseña ni cookie se copió, se escribió en el código ni se subió.
- Solo se usaron Elements y Console; no Network.
- Las listas de seguidores y seguidos quedan solo en local. Aquí hay únicamente cifras.
- No se eludieron bloqueos ni límites; pausas de 3 a 6 s y volumen reducido.
- Instagram restringe la automatización en sus términos. Trabajo académico.

> **Si vas a usar este proyecto con otra cuenta:** hazlo solo con autorización de su titular, con tu propia sesión y con volúmenes pequeños. Un uso intensivo puede provocar que Instagram limite o bloquee tu cuenta.

## 3. Tecnologías

| Herramienta | Uso |
|---|---|
| Node.js | Entorno para ejecutar los scripts JavaScript |
| Playwright | Automatiza el navegador (abrir páginas, hacer clic, hacer scroll) |
| Chromium | Navegador que controla Playwright |
| DevTools (Elements y Console) | Ubicar y probar los selectores a mano |
| Módulo `fs` de Node | Guardar los resultados en JSON y CSV |

## 4. Estructura del proyecto

```
scraping-manual/
├── paso2_sesion.js          # Inicio de sesión manual (guarda la sesión)
├── paso3_perfil.js          # Extrae el perfil
├── paso4_publicaciones.js   # Extrae las publicaciones
├── paso5_listas.js          # Extrae muestras de seguidores y seguidos
├── dashboard.html           # Panel para visualizar los resultados
├── package.json             # Dependencias (Playwright)
├── evidencias_manual/       # Capturas del método manual (DevTools)
├── datos/                   # Resultados (se crea al ejecutar; no se sube a GitHub)
└── sesion/                  # Sesión del navegador (se crea al ejecutar; no se sube a GitHub)
```

Las carpetas `datos/`, `sesion/`, `node_modules/` y las de evidencias están en `.gitignore`: **no vienen en el repositorio** y se generan en tu equipo.

## 5. Guía de uso (para quien descarga el proyecto)

### 5.1 Requisitos

- **Node.js** (se recomienda una versión reciente; el proyecto se probó con v24.21.0). Descarga: <https://nodejs.org>
- **Git** (solo si vas a clonar el repositorio).
- Una **cuenta de Instagram propia**, ya que los scripts usan tu sesión.
- Conexión a internet y espacio para descargar Chromium (cientos de MB).
- Sistema probado: Windows 11 con Visual Studio Code. Los comandos son los mismos en macOS y Linux.

Comprueba que Node está instalado:

```powershell
node -v
npm -v
```

### 5.2 Descargar el proyecto

**Opción A: clonar con Git**

```powershell
git clone https://github.com/julian171103/scraping-manual.git
cd scraping-manual
```

**Opción B: descargar el ZIP**

En GitHub: botón verde **Code** → **Download ZIP**. Descomprime y abre una terminal dentro de la carpeta `scraping-manual`.

### 5.3 Instalar dependencias

```powershell
npm install
npx playwright install chromium
```

- `npm install` instala Playwright (la carpeta `node_modules/` no viene en el repositorio).
- `npx playwright install chromium` descarga el navegador que Playwright controla.

### 5.4 Configurar la cuenta a analizar

El nombre de usuario está escrito dentro de **tres archivos**: `paso3_perfil.js`, `paso4_publicaciones.js` y `paso5_listas.js`. En cada uno, cambia esta línea por el usuario de la cuenta autorizada (sin `@`):

```js
const USUARIO = "alondra_cgp";   // cambia por el usuario que vas a analizar
```

Debes cambiarlo en los **tres** archivos, o los datos saldrán mezclados.

### 5.5 Ejecutar los scripts (en orden)

Ejecuta cada comando desde la carpeta del proyecto, uno después de otro y esperando a que termine.

| Paso | Comando | Qué hace |
|---|---|---|
| 1 | `node paso2_sesion.js` | Abre Chromium. **Inicia sesión manualmente** en Instagram y, cuando veas tu feed, **cierra la ventana**. La sesión queda guardada en `sesion/`. Solo se hace una vez. |
| 2 | `node paso3_perfil.js` | Lee el perfil y crea `datos/perfil.json`. Imprime si detectó sesión activa. |
| 3 | `node paso4_publicaciones.js` | Hace scroll, junta los enlaces y entra a cada publicación. Crea `datos/publicaciones.json` y `datos/publicaciones.csv`. |
| 4 | `node paso5_listas.js` | Abre las ventanas de seguidores y seguidos y guarda una muestra. Crea los archivos `*_muestra` y `resumen_listas.json`. |

Notas importantes:

- **El orden importa.** Los pasos 4 y 5 leen `datos/perfil.json`, que crea el paso 3. Todos necesitan la sesión del paso 1.
- **No cierres ni toques la ventana de Chromium** mientras un script está trabajando.
- Los scripts muestran el avance en la terminal (por ejemplo `Scroll 3: 24 enlaces` o `12/50 ok`).
- Cada ejecución **sobrescribe** los archivos de `datos/`. Si quieres conservar resultados anteriores, cópialos a otra carpeta antes.

### 5.6 Ajustar cuánto se extrae

| Quiero cambiar... | Archivo | Constantes |
|---|---|---|
| Cantidad de publicaciones | `paso4_publicaciones.js` | `META` (por defecto 50) y `MAX_SCROLLS` (por defecto 15) |
| Cantidad de seguidores y seguidos | `paso5_listas.js` | `META` (por defecto 100) y `MAX_VUELTAS` (por defecto 14) |

`META` es la cantidad objetivo y `MAX_SCROLLS` / `MAX_VUELTAS` es el máximo de scrolls permitido. Si subes `META`, sube también el máximo; de lo contrario el script se detiene antes de llegar. Ejemplo para 200 publicaciones:

```js
const META = 200;
const MAX_SCROLLS = 60;
```

Más cantidad implica más tiempo (cada publicación espera unos 4 segundos) y más riesgo de que Instagram limite la cuenta. Sube de a poco.

### 5.7 Ver los resultados

- Abre los archivos de `datos/` (el CSV se abre directamente en Excel).
- O usa el dashboard (ver [sección 9](#9-dashboard-de-resultados)).

## 6. Método manual (selectores probados en Console)

| Dato | Selector | Resultado |
|---|---|---|
| Usuario | `header h2, header h1` | alondra_cgp |
| Contadores y biografía | `header span[dir="auto"]`, buscando por texto | 13 elementos con sesión |
| Lista de seguidores/seguidos | `header a` filtrado por texto | `<a href="#">` con `<span>`; la lista abre `<div role="dialog">` |
| Fecha | `time`, atributo `datetime` | 2026-08-08T04:44:00.000Z |
| Descripción | `meta[property="og:description"]` | texto, likes y comentarios |

Las clases (`_ap3a`...) las genera Instagram y cambian: no se usan.
Capturas de Elements: carpeta `evidencias_manual/`.

## 7. Cómo funciona cada script

| Script | Función |
|---|---|
| `paso2_sesion.js` | Abre Chromium con un perfil persistente (`sesion/`) para que el usuario inicie sesión a mano. Espera hasta que se cierre la ventana. |
| `paso3_perfil.js` | Abre el perfil, espera 6 s y, con `page.evaluate()`, lee usuario, nombre, biografía y contadores. Guarda `datos/perfil.json`. |
| `paso4_publicaciones.js` | **Fase 1:** hace scroll y recoge enlaces `/p/` y `/reel/` sin repetirlos. **Fase 2:** abre cada enlace y lee `time[datetime]` y `og:description`. Un `try/catch` registra los errores sin detener el proceso. Al final imprime un control de calidad. |
| `paso5_listas.js` | Hace clic en "seguidores" o "seguidos", detecta la zona desplazable del `div[role="dialog"]`, hace scroll por lotes y recoge los nombres de usuario con una expresión regular sobre los `href`. Calcula el resumen y los porcentajes. |

Todas las pausas (3 a 6 s) son intencionales: dan tiempo a que cargue la página y evitan un ritmo de peticiones de bot.

## 8. Archivos generados

Todos se guardan en `datos/`:

| Archivo | Contenido |
|---|---|
| `perfil.json` | Usuario, nombre visible, biografía, publicaciones, seguidores y seguidos |
| `publicaciones.json` / `.csv` | n, enlace, tipo, cuenta en el enlace, fecha y hora, descripción, error |
| `seguidores_muestra.json` / `.csv` | Muestra de nombres de usuario de seguidores |
| `seguidos_muestra.json` / `.csv` | Muestra de nombres de usuario de seguidos |
| `resumen_listas.json` | Cantidades, únicos, porcentaje del total y usuarios en ambas muestras |

Los CSV incluyen BOM (`\uFEFF`) para que Excel muestre bien las tildes y la ñ.

## 9. Dashboard de resultados

`dashboard.html` es un panel que funciona **en tu navegador, sin servidor**: los datos no se suben a ningún sitio.

1. Abre `dashboard.html` con doble clic.
2. Arrastra a la zona indicada (o usa **Elegir archivos**) estos archivos de la carpeta `datos/`: `publicaciones.json`, `perfil.json` y `resumen_listas.json`.
3. El panel muestra el resumen, reels frente a publicaciones, publicaciones por mes, calidad de los datos y una tabla con filtros.

> **No cargues** `seguidores_muestra.json` ni `seguidos_muestra.json`: contienen nombres de terceros y el panel no los necesita. Mientras no cargues nada, el panel muestra las cifras verificadas de la ejecución original.

## 10. Resultados

**Perfil:** 348 publicaciones, 2,593 seguidores, 2,444 seguidos.

| Medida | Valor |
|---|---|
| Publicaciones extraídas | 50 (50 únicas) |
| Con fecha / con descripción | 50 / 50 |
| Reels / publicaciones | 24 / 26 |
| De otras cuentas | 2 |
| Rango de fechas | 2026-05-07 a 2026-10-14 |

| Lista | En muestra | Únicos | % del total |
|---|---|---|---|
| Seguidores | 100 | 100 | 3.86 % |
| Seguidos | 100 | 100 | 4.09 % |

31 usuarios aparecen en ambas muestras.

## 11. Limitaciones

- Las listas son muestras de 100, no completas. Se limitó a propósito por ética, tiempo y riesgo de bloqueo.
- `og:description` indica 2,516 seguidos y el HTML visible 2,444. No se determinó la causa.
- Los contadores cambiaron entre mediciones (publicaciones 347 a 348). Es un cambio real de la cuenta.
- El solape entre muestras varió entre ejecuciones (10, 19 y 31). No se determinó la causa.
- Los selectores dependen del diseño actual de Instagram y de que la interfaz esté en español (se busca por los textos "publicaciones", "seguidores" y "seguidos").
- El nombre de usuario está repetido en tres scripts y debe cambiarse en cada uno.
- Solo funciona con cuentas públicas, o privadas que la cuenta del usuario ya sigue.
- Los likes y comentarios quedan dentro del texto de `og_description`; no están separados en columnas.
- No se extrajeron hashtags ni ubicación.
- Solo se probó con el navegador visible (`headless: false`).

## 12. Solución de problemas

| Problema | Posible causa y solución |
|---|---|
| `Cannot find module 'playwright'` | Falta ejecutar `npm install`. |
| `Executable doesn't exist` (Chromium) | Falta ejecutar `npx playwright install chromium`. |
| `paso3` imprime "NO hay sesión activa" | Ejecuta de nuevo `node paso2_sesion.js` e inicia sesión. |
| `ENOENT ... datos/perfil.json` | Ejecuta `node paso3_perfil.js` antes de los pasos 4 y 5. |
| Todos los campos salen `null` | Instagram cambió el diseño, la cuenta es privada o la interfaz no está en español. |
| "No encuentro el enlace de seguidores" | La sesión caducó o la cuenta no muestra la lista. Revisa que el perfil cargó bien. |
| Se detiene antes de llegar a `META` | Sube `MAX_SCROLLS` / `MAX_VUELTAS`, o Instagram dejó de cargar más resultados. |
| Instagram pide verificación o limita la cuenta | Detén los scripts, espera unas horas y reduce el volumen. No intentes saltarte el bloqueo. |

## 13. Fuentes y declaración de uso de IA

**Origen de los datos**

| Dato | Fuente | Cómo se obtuvo |
|---|---|---|
| Perfil (usuario, nombre, biografía, contadores) | Página pública de Instagram, con sesión personal del autor | Inspección en DevTools (Elements y Console) y script `paso3_perfil.js` |
| 50 publicaciones (enlace, fecha, descripción) | Páginas de cada publicación en Instagram | `time[datetime]` y `og:description`, script `paso4_publicaciones.js` |
| Muestras de seguidores y seguidos | Ventana emergente del perfil en Instagram | Script `paso5_listas.js` (solo cifras publicadas) |
| Contadores usados para porcentajes | Archivo local `datos/perfil.json`, generado por el script | Lectura del HTML visible |

**Uso de inteligencia artificial**

- Asistente utilizado: Claude (Anthropic), en la versión gratuita de claude.ai.
- Para qué se usó: guía paso a paso, redacción de los scripts en JavaScript, diagnóstico de errores y borrador del README.
