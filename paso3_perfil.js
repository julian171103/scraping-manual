const { chromium } = require("playwright");
const fs = require("fs");

const USUARIO = "alondra_cgp";
const URL = `https://www.instagram.com/${USUARIO}/`;

(async () => {
  fs.mkdirSync("datos", { recursive: true });
  const contexto = await chromium.launchPersistentContext("sesion", { headless: false });
  const pagina = await contexto.newPage();
  await pagina.goto(URL, { waitUntil: "domcontentloaded" });
  await pagina.waitForTimeout(6000);

  const pideLogin =
    pagina.url().includes("/accounts/login") ||
    (await pagina.locator('input[name="username"]').count()) > 0;
  console.log(pideLogin ? "RESULTADO: NO hay sesión activa." : "RESULTADO: parece haber sesión activa.");

  const d = await pagina.evaluate(() => {
    const textos = [...document.querySelectorAll('header span[dir="auto"]')].map((e) =>
      e.innerText.replace(/\n/g, " ").trim()
    );
    const buscar = (p) => textos.find((t) => t.includes(p)) ?? null;
    const numero = (t) => (t ? t.split(" ")[0] : null);
    const og = document.querySelector('meta[property="og:description"]')?.content ?? "";
    const bios = textos.filter((t) => t.length > 40 && !/(publicaciones|seguidores|seguidos)$/.test(t));
    return {
      usuario: document.querySelector("header h2, header h1")?.innerText ?? null,
      nombre_visible: document.title.match(/^(.*?)\s*\(@/)?.[1] ?? null,
      biografia: bios[0] ?? null,
      seguidores: numero(buscar("seguidores")),
      seguidos: numero(buscar("seguidos")),
      publicaciones: numero(buscar("publicaciones")) ?? og.match(/([\d.,]+)\s+publicaciones/)?.[1] ?? null,
    };
  });

  await contexto.close();
  fs.writeFileSync("datos/perfil.json", JSON.stringify(d, null, 2), "utf-8");
  console.log(d);
})();