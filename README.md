# Scraping manual de un perfil público de Instagram (DevTools + JavaScript + Playwright)

**Autor:** JULIAN GUEVARA
**Materia:** ARQUITECTURA DE SISTEMAS SI7-001
**Fecha:** 14 de octubre de 2026

## 1. Objetivo

Extraer datos de una cuenta pública de Instagram, con autorización de su titular. Cada dato se ubica **manualmente en DevTools (Elements y Console)** y luego se automatiza con JavaScript, Playwright y Chromium.

## 2. Ética y privacidad

- La titular autorizó la práctica.
- Se usó la sesión personal del autor, iniciada manualmente. Ninguna contraseña ni cookie se copió, se escribió en el código ni se subió.
- Solo se usaron Elements y Console; no Network.
- Las listas de seguidores y seguidos quedan solo en local. Aquí hay únicamente cifras.
- No se eludieron bloqueos ni límites; pausas de 3 a 6 s y volumen reducido.
- Instagram restringe la automatización en sus términos. Trabajo académico.

## 3. Requisitos e instalación

Windows 11, Node.js v24.21.0, Playwright, Visual Studio Code.

```powershell
npm install
npx playwright install chromium
```

## 4. Método manual (selectores probados en Console)

| Dato | Selector | Resultado |
|---|---|---|
| Usuario | `header h2, header h1` | alondra_cgp |
| Contadores y biografía | `header span[dir="auto"]`, buscando por texto | 13 elementos con sesión |
| Lista de seguidores/seguidos | `header a` filtrado por texto | <a href="#"> con <span>; la lista abre <div role="dialog"> |
| Fecha | `time`, atributo `datetime` | 2026-08-08T04:44:00.000Z |
| Descripción | `meta[property="og:description"]` | texto, likes y comentarios |

Las clases (`_ap3a`...) las genera Instagram y cambian: no se usan.
Capturas de Elements: carpeta `evidencias_manual/`.

## 5. Scripts (ejecutar en orden)

| Script | Función |
|---|---|
| `paso2_sesion.js` | Inicio de sesión manual |
| `paso3_perfil.js` | Perfil: usuario, nombre, biografía, contadores |
| `paso4_publicaciones.js` | 50 publicaciones (JSON y CSV) y control de calidad |
| `paso5_listas.js` | Muestras de 100 seguidores y 100 seguidos, y resumen |

## 6. Resultados

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

## 7. Limitaciones

- Las listas son muestras de 100, no completas.
- `og:description` indica 2,516 seguidos y el HTML visible 2,444. No se determinó la causa.
- Los contadores cambiaron entre mediciones (publicaciones 347 a 348). Es un cambio real de la cuenta.
- El solape entre muestras varió entre ejecuciones (10, 19 y 31). No se determinó la causa.
- Los selectores dependen del diseño actual de Instagram.
- No se extrajeron hashtags ni ubicación.

## 8. Autoría

## 8. Fuentes y declaración de uso de IA

**Origen de los datos**

| Dato | Fuente | Cómo se obtuvo |
|---|---|---|
| Perfil (usuario, nombre, biografía, contadores) | Página pública de Instagram, con sesión personal del autor | Inspección en DevTools (Elements y Console) y script `paso3_perfil.js` |
| 50 publicaciones (enlace, fecha, descripción) | Páginas de cada publicación en Instagram | `time[datetime]` y `og:description`, scripts `paso4_publicaciones.js` |
| Muestras de seguidores y seguidos | Ventana emergente del perfil en Instagram | Script `paso5_listas.js` (solo cifras publicadas) |
| Contadores usados para porcentajes | Archivo local `datos/perfil.json`, generado por el script | Lectura del HTML visible |


**Uso de inteligencia artificial**

- Asistente utilizado: Claude (Anthropic), en la versión gratuita de claude.ai.
- Para qué se usó: guía paso a paso, redacción de los scripts en JavaScript, diagnóstico de errores y borrador del README.
- Los resultados numéricos provienen de las salidas de los scripts, no de la IA.
