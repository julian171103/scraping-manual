const { chromium } = require("playwright");
const fs = require("fs");

const USUARIO = "alondra_cgp";
const URL = `https://www.instagram.com/${USUARIO}/`;
const META = 100;
const MAX_VUELTAS = 14;

const MEDIR = () => {
  const d = document.querySelector('div[role="dialog"]');
  if (!d) return null;
  const z = [...d.querySelectorAll("*")].find(
    (e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 5
  );
  if (!z) return null;
  const usuarios = [
    ...new Set(
      [...d.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter((h) => /^\/[A-Za-z0-9._]+\/$/.test(h))
        .map((h) => h.replaceAll("/", ""))
    ),
  ];
  return { scrollTop: Math.round(z.scrollTop), scrollHeight: z.scrollHeight, clientHeight: z.clientHeight, usuarios };
};

async function extraerLista(pagina, lista) {
  await pagina.goto(URL, { waitUntil: "domcontentloaded" });
  await pagina.waitForTimeout(6000);

  const enlace = pagina.locator("header a").filter({ hasText: lista });
  if ((await enlace.count()) === 0) {
    console.log(`No encuentro el enlace de ${lista}.`);
    return [];
  }
  await enlace.first().click();
  await pagina.waitForTimeout(5000);

  const caja = await pagina.locator('div[role="dialog"]').first().boundingBox();
  await pagina.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);

  const usuarios = [];
  let ultimo = 0;
  let sinCambios = 0;
  for (let i = 0; i < MAX_VUELTAS; i++) {
    const m = await pagina.evaluate(MEDIR);
    if (!m) { console.log("No encuentro la zona desplazable."); break; }
    for (const u of m.usuarios) if (!usuarios.includes(u)) usuarios.push(u);
    console.log(`${lista} - vuelta ${i}: ${usuarios.length} usuarios`);
    if (usuarios.length >= META) break;
    sinCambios = usuarios.length === ultimo ? sinCambios + 1 : 0;
    if (sinCambios >= 3) { console.log("Sin usuarios nuevos."); break; }
    ultimo = usuarios.length;
    const distancia = m.scrollHeight - m.clientHeight - m.scrollTop;
    await pagina.mouse.wheel(0, Math.max(distancia, 100));
    await pagina.waitForTimeout(4000);
  }
  return usuarios.slice(0, META);
}

(async () => {
  fs.mkdirSync("datos", { recursive: true });
  const perfil = JSON.parse(fs.readFileSync("datos/perfil.json", "utf-8"));
  const contexto = await chromium.launchPersistentContext("sesion", { headless: false });
  const pagina = await contexto.newPage();

  const resultado = {};
  for (const lista of ["seguidores", "seguidos"]) {
    resultado[lista] = await extraerLista(pagina, lista);
    fs.writeFileSync(
      `datos/${lista}_muestra.json`,
      JSON.stringify({ cuenta: USUARIO, lista, total_muestra: resultado[lista].length, usuarios: resultado[lista] }, null, 2),
      "utf-8"
    );
    const csv = "n,usuario\n" + resultado[lista].map((u, i) => `${i + 1},${u}`).join("\n");
    fs.writeFileSync(`datos/${lista}_muestra.csv`, "\uFEFF" + csv, "utf-8");
  }
  await contexto.close();

  const resumir = (u, total) => ({
    usuarios_en_muestra: u.length,
    usuarios_unicos: new Set(u).size,
    vacios: u.filter((x) => !x).length,
    contador_publico: Number(total),
    porcentaje_del_total: Number(((u.length / Number(total)) * 100).toFixed(2)),
  });
  const setSeguidos = new Set(resultado.seguidos);
  const resumen = {
    seguidores: resumir(resultado.seguidores, perfil.seguidores),
    seguidos: resumir(resultado.seguidos, perfil.seguidos),
    usuarios_en_ambas_muestras: resultado.seguidores.filter((u) => setSeguidos.has(u)).length,
  };
  fs.writeFileSync("datos/resumen_listas.json", JSON.stringify(resumen, null, 2), "utf-8");
  console.log(resumen);
})();