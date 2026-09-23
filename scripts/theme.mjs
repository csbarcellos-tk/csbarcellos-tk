// ─────────────────────────────────────────────────────────────
//  Tema "Pôr do sol na Barra" — paleta, fontes em vetor e helpers
// ─────────────────────────────────────────────────────────────
import opentype from 'opentype.js';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

export const C = {
  night: '#07050f',
  night2: '#0d0a1c',
  panel: '#0f0b22',
  panel2: '#150f2e',
  line: '#2a1f4a',
  line2: '#3b2d66',
  violet: '#8b5cf6',
  purple: '#a855f7',
  magenta: '#ff2e88',
  pink: '#ff4d6d',
  orange: '#ff8a3d',
  amber: '#ffc53d',
  gold: '#ffe08a',
  cyan: '#22d3ee',
  mint: '#5eead4',
  text: '#f5f3ff',
  soft: '#c9c2e8',
  muted: '#8b82b3',
  dim: '#5b5285',
};

// Degradê assinatura (passado → presente / céu → sol)
export const SUNSET = [C.violet, C.purple, C.magenta, C.pink, C.orange, C.amber];

// ── Fontes ────────────────────────────────────────────────────
const FONT_FILES = {
  display: '@fontsource/unbounded/files/unbounded-latin-800-normal.woff',
  displayBold: '@fontsource/unbounded/files/unbounded-latin-700-normal.woff',
  displayMid: '@fontsource/unbounded/files/unbounded-latin-500-normal.woff',
  ui: '@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff',
  uiBold: '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
  uiLight: '@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff',
  mono: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
  monoBold: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff',
  neon: '@fontsource/monoton/files/monoton-latin-400-normal.woff',
};
const cache = {};
export function font(key) {
  if (!cache[key]) cache[key] = opentype.loadSync(require.resolve(FONT_FILES[key]));
  return cache[key];
}

/** Mede e posiciona glifos (com kerning e tracking em px). */
export function layout(fontKey, str, size, { tracking = 0 } = {}) {
  const f = font(fontKey);
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(String(str));
  let x = 0;
  const out = [];
  glyphs.forEach((g, i) => {
    out.push({ g, x });
    x += g.advanceWidth * scale + tracking;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  const width = glyphs.length ? x - tracking : 0;
  return { glyphs: out, width, font: f };
}

export function textWidth(fontKey, str, size, opts = {}) {
  return layout(fontKey, str, size, opts).width;
}

/** Converte texto em <path d>. anchor: start | middle | end */
export function textD(fontKey, str, x, y, size, { anchor = 'start', tracking = 0, dp = 1 } = {}) {
  const L = layout(fontKey, str, size, { tracking });
  let x0 = x;
  if (anchor === 'middle') x0 = x - L.width / 2;
  if (anchor === 'end') x0 = x - L.width;
  let d = '';
  for (const { g, x: gx } of L.glyphs) d += g.getPath(x0 + gx, y, size).toPathData(dp);
  return { d, width: L.width, x0 };
}

/** Atalho: devolve um <path> pronto. */
export function T(fontKey, str, x, y, size, attrs = {}, opts = {}) {
  const { d } = textD(fontKey, str, x, y, size, opts);
  if (!d) return '';
  return `<path d="${d}"${attrStr(attrs)}/>`;
}

export function attrStr(a) {
  return Object.entries(a)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
}

/** Quebra texto em linhas por largura máxima. */
export function wrap(fontKey, str, size, maxWidth, maxLines = 3) {
  const words = String(str || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(fontKey, t, size) <= maxWidth) cur = t;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (textWidth(fontKey, last + '…', size) > maxWidth && last.includes(' ')) last = last.replace(/\s+\S+$/, '');
    kept[maxLines - 1] = last + '…';
    return kept;
  }
  return lines;
}

// ── Utilidades ────────────────────────────────────────────────
export function rng(seed = 7) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;

export function hexToRgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}
export function shade(h, f) {
  // f < 1 escurece, f > 1 clareia (em direção ao branco)
  if (f <= 1) return rgbToHex(hexToRgb(h).map((v) => v * f));
  return mix(h, '#ffffff', f - 1);
}
/** Cor ao longo de uma escala multi-ponto (t ∈ [0,1]). */
export function ramp(stops, t) {
  t = Math.max(0, Math.min(1, t));
  const n = stops.length - 1;
  const i = Math.min(n - 1, Math.floor(t * n));
  return mix(stops[i], stops[i + 1], t * n - i);
}
export function luminance(h) {
  const [r, g, b] = hexToRgb(h).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Envelope de SVG com fundo arredondado opcional e CSS. */
export function svg({ w, h, title, desc, defs = '', css = '', body = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="t d">
<title id="t">${esc(title || '')}</title><desc id="d">${esc(desc || '')}</desc>
<defs>${defs}</defs>
<style>${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}</style>
${body}
</svg>
`;
}

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function linGrad(id, stops, { x1 = 0, y1 = 0, x2 = 1, y2 = 0, units } = {}) {
  const s = stops
    .map((c, i) => {
      if (Array.isArray(c)) return `<stop offset="${c[0]}" stop-color="${c[1]}"${c[2] !== undefined ? ` stop-opacity="${c[2]}"` : ''}/>`;
      return `<stop offset="${r2(i / (stops.length - 1))}" stop-color="${c}"/>`;
    })
    .join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${units ? ` gradientUnits="${units}"` : ''}>${s}</linearGradient>`;
}

// Ícones desenhados à mão (a fonte não tem esses símbolos)
export const ICON = {
  star: (cx, cy, r, fill) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${r1(cx + Math.cos(a) * rr)},${r1(cy + Math.sin(a) * rr)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
  },
  sparkle: (cx, cy, r, fill, attrs = '') =>
    `<path d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z" fill="${fill}"${attrs}/>`,
  chevron: (x, y, s, stroke) =>
    `<path d="M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}" stroke="${stroke}" stroke-width="${r1(s * 0.42)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  arrow: (x, y, s, stroke) =>
    `<path d="M${x} ${y}H${x + s}M${x + s * 0.6} ${y - s * 0.38}L${x + s} ${y}L${x + s * 0.6} ${y + s * 0.38}" stroke="${stroke}" stroke-width="${r1(s * 0.16)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  repo: (x, y, s, fill) =>
    `<g transform="translate(${x} ${y}) scale(${r2(s / 16)})" fill="${fill}"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></g>`,
  fork: (x, y, s, fill) =>
    `<g transform="translate(${x} ${y}) scale(${r2(s / 16)})" fill="${fill}"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></g>`,
  clock: (cx, cy, r, stroke) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${stroke}" stroke-width="${r1(r * 0.22)}"/><path d="M${cx} ${cy - r * 0.55}V${cy}L${r1(cx + r * 0.4)} ${r1(cy + r * 0.3)}" stroke="${stroke}" stroke-width="${r1(r * 0.22)}" stroke-linecap="round" fill="none"/>`,
};

export const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const WEEKDAYS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function fmtInt(n) {
  return Number(n).toLocaleString('pt-BR');
}

export const OUT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'assets');

/**
 * Banco de glifos: cada glifo vira um <path id> nas defs e o texto usa <use>.
 * Reduz MUITO o tamanho de SVGs com bastante texto (terminal, cards, números).
 */
export function glyphBank(prefix = 'g') {
  const used = new Map();
  function G(fontKey, str, x, y, size, attrs = {}, opts = {}) {
    const { anchor = 'start', tracking = 0 } = opts;
    const L = layout(fontKey, str, size, { tracking });
    let x0 = x;
    if (anchor === 'middle') x0 = x - L.width / 2;
    if (anchor === 'end') x0 = x - L.width;
    const upm = L.font.unitsPerEm;
    const s = size / upm;
    let uses = '';
    for (const { g, x: gx } of L.glyphs) {
      if (!g.path || !g.path.commands || !g.path.commands.length) continue;
      const id = `${prefix}${fontKey}${g.index}`;
      if (!used.has(id)) used.set(id, g.getPath(0, 0, upm).toPathData(0));
      uses += `<use href="#${id}" x="${Math.round(gx / s)}"/>`;
    }
    if (!uses) return '';
    return `<g transform="translate(${r1(x0)} ${r1(y)}) scale(${s.toFixed(5)})"${attrStr(attrs)}>${uses}</g>`;
  }
  /** Registra um glifo isolado e devolve { id, adv, upm } (para odômetros etc.). */
  G.glyph = (fontKey, ch) => {
    const f = font(fontKey);
    const g = f.charToGlyph(ch);
    const id = `${prefix}${fontKey}${g.index}`;
    if (!used.has(id) && g.path && g.path.commands.length) used.set(id, g.getPath(0, 0, f.unitsPerEm).toPathData(0));
    return { id, adv: g.advanceWidth, upm: f.unitsPerEm };
  };
  G.defs = () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
  return G;
}
