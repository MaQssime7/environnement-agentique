#!/usr/bin/env node
// Contrastes WCAG d'un thème, en clair et en sombre.
// Usage : node contraste.mjs <nom tweakcn | URL .json | fichier .json/.css>
// Code de sortie : 0 si tout est conforme, 1 si une paire échoue, 2 si le thème est illisible.
import { readFileSync, existsSync } from "node:fs";

const PAIRES = [
  // [fond, texte, seuil, rôle]
  ["background", "foreground", 4.5, "texte courant"],
  ["card", "card-foreground", 4.5, "texte des cartes"],
  ["popover", "popover-foreground", 4.5, "menus et fenêtres"],
  ["primary", "primary-foreground", 4.5, "bouton principal"],
  ["secondary", "secondary-foreground", 4.5, "bouton secondaire"],
  ["muted", "muted-foreground", 4.5, "texte atténué sur fond atténué"],
  ["background", "muted-foreground", 4.5, "texte atténué sur la page"],
  ["accent", "accent-foreground", 4.5, "survol, sélection"],
  ["background", "destructive", 4.5, "message d'erreur"],
  ["background", "primary", 3, "lien ou icône principale"],
  ["background", "ring", 3, "contour du focus clavier"],
  ["background", "input", 3, "bordure des champs"],
];

async function charger(arg) {
  if (!arg) throw new Error("donne un nom de thème tweakcn, une URL ou un fichier");
  let texte;
  if (existsSync(arg)) texte = readFileSync(arg, "utf8");
  else {
    const url = arg.startsWith("http") ? arg : `https://tweakcn.com/r/themes/${arg}.json`;
    const rep = await fetch(url);
    if (!rep.ok) throw new Error(`${url} répond ${rep.status}`);
    texte = await rep.text();
  }
  try {
    const j = JSON.parse(texte);
    const v = j.cssVars ?? j;
    if (v.light) return { clair: v.light, sombre: v.dark ?? {} };
  } catch {}
  // Export CSS : :root { --x: ... } et .dark { --x: ... }
  const bloc = (sel) => {
    const m = texte.match(new RegExp(sel + "\\s*\\{([^}]*)\\}"));
    const o = {};
    if (m) for (const [, k, val] of m[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) o[k] = val.trim();
    return o;
  };
  const clair = bloc(":root"), sombre = bloc("\\.dark");
  if (!clair.background) throw new Error("aucune variable --background trouvée");
  return { clair, sombre };
}

const versLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const versGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const borne = (x) => Math.min(1, Math.max(0, x));

// Renvoie { rgb: [r,g,b] en gamma 0..1, a: alpha }
function lire(val) {
  val = val.trim().toLowerCase();
  let alpha = 1;
  const a = val.match(/\/\s*([\d.]+)(%?)\s*\)/);
  if (a) alpha = a[2] ? +a[1] / 100 : +a[1];
  const nums = (s) => s.replace(/\/.*$/, "").match(/-?[\d.]+%?/g).map((n) => n);
  if (val.startsWith("#")) {
    let h = val.slice(1);
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    if (h.length === 8) alpha = parseInt(h.slice(6, 8), 16) / 255;
    return { rgb, a: alpha };
  }
  if (val.startsWith("oklch")) {
    let [L, C, H] = nums(val.slice(val.indexOf("(") + 1));
    L = L.endsWith("%") ? parseFloat(L) / 100 : +L;
    C = C.endsWith("%") ? (parseFloat(C) / 100) * 0.4 : +C;
    H = (parseFloat(H) * Math.PI) / 180;
    const A = C * Math.cos(H), B = C * Math.sin(H);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    return { rgb: lin.map((c) => versGamma(borne(c))), a: alpha };
  }
  if (val.startsWith("rgb")) {
    const [r, g, b] = nums(val.slice(val.indexOf("(") + 1)).map((n) => (n.endsWith("%") ? parseFloat(n) / 100 : +n / 255));
    return { rgb: [r, g, b], a: alpha };
  }
  // hsl(...) ou triplet nu "210 40% 98%" (ancien format shadcn)
  const corps = val.startsWith("hsl") ? val.slice(val.indexOf("(") + 1) : val;
  const [h, s, l] = nums(corps).map(parseFloat);
  const S = s / 100, Lu = l / 100, k = (n) => (n + h / 30) % 12;
  const f = (n) => Lu - S * Math.min(Lu, 1 - Lu) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { rgb: [f(0), f(8), f(4)], a: alpha };
}

const sur = (haut, fond) => haut.rgb.map((c, i) => c * haut.a + fond.rgb[i] * (1 - haut.a));
const lum = (rgb) => 0.2126 * versLin(rgb[0]) + 0.7152 * versLin(rgb[1]) + 0.0722 * versLin(rgb[2]);
const rapport = (x, y) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };

function mesurer(vars, f, t) {
  const page = { rgb: lire(vars.background).rgb, a: 1 };
  const fond = { rgb: sur(lire(vars[f]), page), a: 1 };
  return rapport(fond.rgb, sur(lire(vars[t]), fond));
}

// Déplace la luminosité OKLCH d'un jeton, teinte et saturation inchangées, jusqu'au seuil.
// Cherche dans les deux sens et garde le plus petit déplacement. Renvoie la nouvelle valeur ou null.
// Toute couleur lisible (hex, rgb, hsl) réécrite en OKLCH, pour pouvoir bouger sa seule luminosité
function versOklch(val) {
  if (/^oklch\(/i.test(val.trim())) return val.trim();
  const { rgb, a } = lire(val);
  const [r, g, b] = rgb.map(versLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B), H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)}${a < 1 ? ` / ${+a.toFixed(3)}` : ""})`;
}

function ajuster(vars, f, t, cle, seuil) {
  let m;
  try { m = versOklch(vars[cle]).match(/^oklch\(\s*([\d.]+%?)\s+(.*)\)$/i); } catch { return null; }
  if (!m) return null;
  const L0 = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : +m[1];
  for (let d = 0.005; d <= 1; d += 0.005) {
    for (const L of [L0 + d, L0 - d]) {
      if (L < 0 || L > 1) continue;
      const essai = `oklch(${L.toFixed(4)} ${m[2]})`;
      if (mesurer({ ...vars, [cle]: essai }, f, t) >= seuil) return essai;
    }
  }
  return null;
}

// Corrige jusqu'à stabilité : une correction peut en défaire une autre quand deux paires partagent un jeton.
function corrigerTout(vars, mode, changes) {
  for (let passe = 0; passe < 6; passe++) {
    let bouge = false;
    for (const [f, t, seuil] of PAIRES) {
      if (!vars[f] || !vars[t] || mesurer(vars, f, t) >= seuil) continue;
      // D'abord la couleur du texte ou de l'élément, puis son fond — jamais la page elle-même.
      for (const cle of f === "background" ? [t] : [t, f]) {
        const v = ajuster(vars, f, t, cle, seuil);
        if (v) { changes.push(`${mode} --${cle} : ${vars[cle]} → ${v}`); vars[cle] = v; bouge = true; break; }
      }
    }
    if (!bouge) return;
  }
}

const args = process.argv.slice(2);
const iCorr = args.indexOf("--corriger");
const sortie = iCorr >= 0 ? args.splice(iCorr, 2)[1] : null;
if (iCorr >= 0 && !sortie) { console.error("--corriger attend un fichier de sortie"); process.exit(2); }

let theme;
try { theme = await charger(args[0]); }
catch (e) { console.error(`Thème illisible : ${e.message}`); process.exit(2); }

let echecs = 0;
const changes = [];
for (const [mode, vars] of [["clair", theme.clair], ["sombre", theme.sombre]]) {
  if (!vars.background) { console.log(`\n${mode} : absent`); continue; }
  console.log(`\nMode ${mode}`);
  const avant = { ...vars };
  if (sortie) corrigerTout(vars, mode, changes);
  for (const [f, t, seuil, role] of PAIRES) {
    if (!avant[f] || !avant[t]) continue;
    let r;
    try { r = mesurer(avant, f, t); }
    catch { console.log(`  ?     ${role} : valeur illisible`); continue; }
    const ok = r >= seuil;
    if (!ok) echecs++;
    let note = "";
    if (sortie && !ok) {
      const apres = mesurer(vars, f, t);
      note = apres >= seuil ? `  → corrigé : ${apres.toFixed(2)}:1` : "  → correction automatique impossible";
    }
    console.log(`  ${ok ? "OK " : "NON"}  ${r.toFixed(2).padStart(5)}:1 (min ${seuil}:1)  ${role}  [${f} / ${t}]${note}`);
  }
}

if (sortie) {
  let restants = 0;
  for (const vars of [theme.clair, theme.sombre]) {
    if (!vars.background) continue;
    for (const [f, t, seuil] of PAIRES) if (vars[f] && vars[t] && mesurer(vars, f, t) < seuil) restants++;
  }
  const css = (sel, v) => `${sel} {\n${Object.entries(v).map(([k, x]) => `  --${k}: ${x};`).join("\n")}\n}\n`;
  const { writeFileSync } = await import("node:fs");
  writeFileSync(sortie, css(":root", theme.clair) + (theme.sombre.background ? "\n" + css(".dark", theme.sombre) : ""));
  console.log(`\nModifications :\n${changes.map((c) => "  " + c).join("\n") || "  aucune"}`);
  console.log(`\nThème corrigé écrit dans ${sortie}. Paires encore insuffisantes après correction : ${restants}.`);
  process.exit(restants ? 1 : 0);
}
console.log(echecs ? `\n${echecs} paire(s) insuffisante(s). Relance avec --corriger <fichier.css> pour corriger.` : "\nToutes les paires sont conformes.");
process.exit(echecs ? 1 : 0);
