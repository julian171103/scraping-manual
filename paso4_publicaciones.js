const { chromium } = require("playwright");
const fs = require("fs");

const USUARIO = "alondra_cgp";
const URL = `https://www.instagram.com/${USUARIO}/`;
const META = 50;
const MAX_SCROLLS = 15;

(async () => {
  fs.mkdirSync("datos", { recursive: true });
  const contexto = await chromium.launchPersistentContext("sesion", { headless: false });
  const pagina = await contexto.newPage();
  await pagina.goto(URL, { waitUntil: "domcontentloaded" });
  await pagina.waitForTimeout(6000);

  // Corregir nombre visible: el span justo antes de "publicaciones"
  const nombre = await pagina.evaluate(() => {
    const t = [...document.querySelectorAll('header span[dir="auto"]')].map((e) =>
      e.innerText.replace(/\n/g, " ").trim()
    );
    const i = t.findIndex((x) => x.includes("publicaciones"));
    return i > 0 ? t[i - 1] : null;
  });
  const perfil = JSON.parse(fs.readFileSync("datos/perfil.json", "utf-8"));
  perfil.nombre_visible = nombre;
  fs.writeFileSync("datos/perfil.json", JSON.stringify(perfil, null, 2), "utf-8");
  console.log("Nombre visible:", nombre);

  // Fase 1: enlaces con scroll
  const enlaces = [];
  let sinCambios = 0;
  for (let i = 0; i < MAX_SCROLLS; i++) {
    const antes = enlaces.length;
    const actuales = await pagina.evaluate(() => [
      ...new Set([...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map((a) => a.href)),
    ]);
    for (const e of actuales) if (!enlaces.includes(e)) enlaces.push(e);
    console.log(`Scroll ${i}: ${enlaces.length} enlaces`);
    if (enlaces.length >= META) break;
    sinCambios = enlaces.length === antes ? sinCambios + 1 : 0;
    if (sinCambios >= 3) { console.log("No aparecen más enlaces."); break; }
    await pagina.mouse.wheel(0, 1500);
    await pagina.waitForTimeout(3000);
  }
  const lista = enlaces.slice(0, META);

  // Fase 2: leer cada publicación
  const filas = [];
  for (let n = 0; n < lista.length; n++) {
    const enlace = lista[n];
    const fila = {
      n: n + 1,
      enlace,
      tipo: enlace.includes("/reel/") ? "reel" : "publicacion",
      cuenta_en_enlace: enlace.split("instagram.com/")[1].split("/")[0],
      fecha_hora: null,
      og_description: null,
      error: null,
    };
    try {
      await pagina.goto(enlace, { waitUntil: "domcontentloaded" });
      await pagina.waitForTimeout(4000);
      Object.assign(fila, await pagina.evaluate(() => ({
        fecha_hora: document.querySelector("time")?.getAttribute("datetime") ?? null,
        og_description: document.querySelector('meta[property="og:description"]')?.content ?? null,
      })));
    } catch (e) {
      fila.error = String(e.message).slice(0, 200);
    }
    filas.push(fila);
    console.log(`${n + 1}/${lista.length}`, fila.error ? "ERROR" : "ok");
  }
  await contexto.close();

  fs.writeFileSync("datos/publicaciones.json", JSON.stringify(filas, null, 2), "utf-8");
  const cols = ["n", "enlace", "tipo", "cuenta_en_enlace", "fecha_hora", "og_description", "error"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(",")].concat(filas.map((f) => cols.map((c) => esc(f[c])).join(","))).join("\n");
  fs.writeFileSync("datos/publicaciones.csv", "\uFEFF" + csv, "utf-8");

  const fechas = filas.map((f) => f.fecha_hora).filter(Boolean).sort();
  console.log("Filas guardadas:", filas.length);
  console.log("Con error:", filas.filter((f) => f.error).length);
  console.log("Sin fecha:", filas.filter((f) => !f.fecha_hora).length);
  console.log("Sin descripción:", filas.filter((f) => !f.og_description).length);
  console.log("Únicas:", new Set(filas.map((f) => f.enlace)).size);
  console.log("Reels:", filas.filter((f) => f.tipo === "reel").length,
              "| Publicaciones:", filas.filter((f) => f.tipo === "publicacion").length);
  console.log("De otras cuentas:", filas.filter((f) => f.cuenta_en_enlace !== USUARIO).length);
  console.log("Rango:", fechas[0], "->", fechas[fechas.length - 1]);
})();