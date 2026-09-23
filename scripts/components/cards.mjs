// Cards de projeto: cometa de luz correndo na borda, brilho de fundo e dados reais do repositório
import { C, svg, r1, r2, linGrad, glyphBank, textWidth, wrap, fmtInt, ICON, mix } from '../theme.mjs';
import { relTime } from '../compute.mjs';

const ACCENTS = [C.violet, C.magenta, C.orange, C.amber, C.cyan, C.pink];
const LANG_COLORS = [C.violet, C.magenta, C.orange, C.amber, C.cyan, C.pink, C.purple, C.mint];

export function featuredRepos(cfg, data) {
  const byName = new Map(data.repos.map((r) => [r.name.toLowerCase(), r]));
  const names = (cfg.featured && cfg.featured.length ? cfg.featured : data.pinned) || [];
  const list = names.map((n) => byName.get(n.toLowerCase())).filter(Boolean);
  const excl = new Set(cfg.excludeRepos || []);
  for (const r of [...data.repos].sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt))) {
    if (list.length >= 4) break;
    if (!list.includes(r) && !excl.has(r.name) && !r.fork) list.push(r);
  }
  return list.slice(0, 4);
}

function card(repo, i, cfg, S) {
  const W = 600, H = 260, P = 32;
  const G = glyphBank();
  const acc = ACCENTS[i % ACCENTS.length];
  const rank = new Map(S.languages.map((l, k) => [l.name, k]));
  const desc = (cfg.descriptions && cfg.descriptions[repo.name]) || repo.description || 'Projeto sem descrição (ainda).';
  const nameSize = textWidth('uiBold', repo.name, 30) > W - P * 2 - 40 ? 24 : 30;
  const lines = wrap('ui', desc, 18, W - P * 2, 3);
  const langs = repo.languages.filter((l) => !(cfg.excludeLanguages || []).includes(l.name)).slice(0, 3);
  const totL = langs.reduce((s, l) => s + l.size, 0) || 1;
  const tags = (cfg.tags && cfg.tags[repo.name]) || null;
  const chipList = tags
    ? tags.map((t, k) => ({ label: t, col: LANG_COLORS[(rank.get(t) ?? k + 2) % LANG_COLORS.length] }))
    : langs.map((l) => ({ label: `${l.name} ${Math.round((l.size / totL) * 100)}%`, col: LANG_COLORS[rank.get(l.name) ?? 7] || C.dim }));

  let chips = '';
  let cx = P;
  chipList.forEach(({ label, col }, k) => {
    const w = textWidth('monoBold', label, 13) + 34;
    chips += `<g class="chip" style="animation-delay:${r2(0.8 + k * 0.1)}s">
      <rect x="${r1(cx)}" y="${H - 58}" width="${r1(w)}" height="30" rx="15" fill="${mix(col, '#0c0819', 0.82)}" stroke="${col}" stroke-opacity=".55"/>
      <circle cx="${r1(cx + 15)}" cy="${H - 43}" r="4.5" fill="${col}"/>
      ${G('monoBold', label, cx + 26, H - 38.5, 13, { fill: C.text })}
    </g>`;
    cx += w + 8;
  });

  const upd = relTime(repo.pushedAt, S.now);
  const RX = W - 70;
  const updW = textWidth('mono', upd, 13);
  const starTxt = fmtInt(repo.stars);
  const right = `
    ${ICON.clock(r1(RX - updW - 12), 39.5, 6, C.muted)}
    ${G('mono', upd, RX, 44, 13, { fill: C.muted }, { anchor: 'end' })}
    ${G('monoBold', starTxt, RX - updW - 30, 44, 14, { fill: C.amber }, { anchor: 'end' })}
    ${ICON.star(r1(RX - updW - 30 - textWidth('monoBold', starTxt, 14) - 11), 39.5, 7, C.amber)}`;

  const body = `
  <g class="in">
    <g clip-path="url(#cl)">
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <circle cx="${W - 40}" cy="20" r="220" fill="url(#glow)" class="glow"/>
      <g opacity=".045">${G('display', String(i + 1).padStart(2, '0'), W - 20, H - 14, 128, { fill: '#fff' }, { anchor: 'end' })}</g>
      <rect x="-200" y="0" width="120" height="${H}" fill="url(#shineG)" class="sh"/>
    </g>
    <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="23.25" stroke="${C.line2}" stroke-width="1.5"/>
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="23" pathLength="100" stroke="${acc}" stroke-width="5" stroke-dasharray="10 90" stroke-linecap="round" filter="url(#bl)" class="comet"/>
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="23" pathLength="100" stroke="url(#cometG)" stroke-width="2.2" stroke-dasharray="10 90" stroke-linecap="round" class="comet"/>
    ${ICON.repo(P, 30, 18, acc)}
    ${G('monoBold', `PROJETO ${String(i + 1).padStart(2, '0')}`, P + 28, 44, 13, { fill: acc }, { tracking: 1.6 })}
    <g class="ar"><path d="M${W - 50} 50l14-14M${W - 47} 36h11v11" stroke="${C.soft}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
    ${G('uiBold', repo.name, P, 90, nameSize, { fill: C.text })}
    ${lines.map((ln, k) => G('ui', ln, P, 126 + k * 26, 18, { fill: C.soft })).join('')}
    ${chips}
    ${right}
  </g>`;

  const defs = `${G.defs()}
    <clipPath id="cl"><rect width="${W}" height="${H}" rx="24"/></clipPath>
    ${linGrad('bg', [[0, '#150f2e'], [1, '#0b0818']], { x1: 0, y1: 0, x2: 0.4, y2: 1 })}
    ${linGrad('cometG', [[0, '#fff'], [1, acc]])}
    ${linGrad('shineG', [[0, '#fff', 0], [0.5, '#fff', 0.07], [1, '#fff', 0]])}
    <radialGradient id="glow"><stop offset="0" stop-color="${acc}" stop-opacity=".28"/><stop offset=".55" stop-color="${acc}" stop-opacity=".06"/><stop offset="1" stop-color="${acc}" stop-opacity="0"/></radialGradient>
    <filter id="bl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter>`;
  const css = `
    .in{animation:in .9s ${r1(i * 0.15)}s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes in{from{opacity:0;transform:translateY(16px)}}
    .comet{animation:comet 6s ${r1(i * 1.3)}s linear infinite}
    @keyframes comet{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}
    .sh{animation:sh 7s ${r1(2 + i * 1.1)}s ease-in-out infinite}
    @keyframes sh{0%{transform:translateX(0) skewX(-18deg)}30%,100%{transform:translateX(${W + 360}px) skewX(-18deg)}}
    .glow{transform-box:fill-box;transform-origin:center;animation:gl 6s ease-in-out infinite}
    @keyframes gl{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
    .ar{animation:ar 2.4s ease-in-out infinite}
    @keyframes ar{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,-4px)}}
    .chip{animation:chip .6s cubic-bezier(.3,1.4,.5,1) backwards}
    @keyframes chip{from{opacity:0;transform:translateY(8px)}}`;
  return svg({ w: W, h: H, title: repo.name, desc, defs, css, body });
}

export function cards(cfg, data, S) {
  return featuredRepos(cfg, data).map((r, i) => [`card-${i + 1}.svg`, card(r, i, cfg, S)]);
}
