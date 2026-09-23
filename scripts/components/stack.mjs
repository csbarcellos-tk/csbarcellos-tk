// Arsenal: logos oficiais (Simple Icons) em azulejos de vidro, com onda de luz passando
import * as si from 'simple-icons';
import { C, T, textD, svg, r1, linGrad, luminance, mix, SUNSET, ramp } from '../theme.mjs';

function icon(slug) {
  const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
  const ic = si[key];
  if (!ic) throw new Error(`ícone não encontrado: ${slug}`);
  let color = '#' + ic.hex;
  const L = luminance(color);
  if (L < 0.03) color = C.text; // marcas pretas (GitHub, Vercel…) viram claras
  else if (L < 0.14) color = mix(color, '#ffffff', 0.38); // marcas escuras ganham luz
  return { path: ic.path, color };
}

export function stack(cfg) {
  const W = 1200;
  const labelW = 300, tile = 110, gap = 14, rowH = 136, top = 8;
  const groups = cfg.stack;
  const H = top + groups.length * rowH + 4;
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  let gi = 0;
  let body = '';
  let defs = `${linGrad('tileG', [[0, '#1c1538'], [1, '#100b22']], { x2: 0, y2: 1 })}
    ${linGrad('edge', [[0, '#ffffff', 0.22], [0.5, '#ffffff', 0.04], [1, '#ffffff', 0]], { x2: 0, y2: 1 })}`;

  groups.forEach((g, r) => {
    const y = top + r * rowH;
    const accent = ramp(SUNSET, r / (groups.length - 1));
    defs += linGrad(`acc${r}`, [[0, accent], [1, accent, 0.1]], { x2: 0, y2: 1 });
    body += `<g class="row" style="animation-delay:${r1(r * 0.12)}s">
      <rect x="0" y="${y + 6}" width="4" height="${rowH - 24}" rx="2" fill="url(#acc${r})"/>
      ${T('displayBold', g.group, 22, y + 52, 20, { fill: C.text }, { tracking: 1.2 })}
      ${T('mono', String(g.items.length).padStart(2, '0') + ' ferramentas', 22, y + 80, 16, { fill: accent })}
    </g>`;
    g.items.forEach(([slug, label], i) => {
      const x = labelW + i * (tile + gap);
      const ic = icon(slug);
      const s = 46 / 24;
      const delay = r1(0.25 + gi * 0.045);
      const wave = r1(1.4 + (gi / total) * 3.2);
      body += `<g class="tile" style="animation-delay:${delay}s">
        <rect x="${x}" y="${y}" width="${tile}" height="${rowH - 18}" rx="18" fill="url(#tileG)"/>
        <rect x="${x + 0.75}" y="${y + 0.75}" width="${tile - 1.5}" height="${rowH - 19.5}" rx="17.25" stroke="url(#edge)" stroke-width="1.5"/>
        <rect x="${x + 0.75}" y="${y + 0.75}" width="${tile - 1.5}" height="${rowH - 19.5}" rx="17.25" stroke="${accent}" stroke-width="2" class="hl" style="animation-delay:${wave}s"/>
        <ellipse cx="${x + tile / 2}" cy="${y + 50}" rx="30" ry="22" fill="${ic.color}" opacity=".13" class="halo" style="animation-delay:${wave}s"/>
        <g class="ic" style="animation-delay:${wave}s"><path d="${ic.path}" fill="${ic.color}" transform="translate(${x + (tile - 46) / 2} ${y + 22}) scale(${s})"/></g>
        ${T('uiBold', label, x + tile / 2, y + rowH - 32, 15, { fill: C.soft }, { anchor: 'middle' })}
      </g>`;
      gi++;
    });
  });

  const css = `
    .row{animation:rowIn .9s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes rowIn{from{opacity:0;transform:translateX(-20px)}}
    .tile{transform-box:fill-box;transform-origin:center;animation:tileIn .7s cubic-bezier(.3,1.4,.5,1) backwards}
    @keyframes tileIn{from{opacity:0;transform:scale(.6)}}
    .hl{opacity:0;animation:hl 5.5s 1.4s ease-in-out infinite}
    @keyframes hl{0%,100%{opacity:0}6%{opacity:1}16%{opacity:0}}
    .halo{animation:halo 5.5s 1.4s ease-in-out infinite}
    @keyframes halo{0%,100%{opacity:.1}6%{opacity:.38}16%{opacity:.1}}
    .ic{animation:ic 5.5s 1.4s ease-in-out infinite}
    @keyframes ic{0%,100%{transform:translateY(0)}6%{transform:translateY(-5px)}16%{transform:translateY(0)}}`;

  return svg({
    w: W, h: H,
    title: 'Arsenal de tecnologias',
    desc: groups.map((g) => `${g.group}: ${g.items.map((i) => i[1]).join(', ')}`).join(' · '),
    defs, css, body,
  });
}
