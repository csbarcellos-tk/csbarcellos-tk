// Skyline 3D de contribuições: cada dia vira um prédio; a cor acompanha o tempo (violeta → âmbar)
import { C, svg, r1, r2, linGrad, ramp, mix, shade, SUNSET, rng, fmtInt, glyphBank, textWidth, MONTHS_PT } from '../theme.mjs';
import { fmtDate } from '../compute.mjs';

export function city(cfg, data, S) {
  const W = 1200, H = 664;
  const G = glyphBank();
  const R = rng(2025);
  const weeks = S.weeks;
  const NW = weeks.length;

  // projeção axonométrica: semanas → direita/baixo, dias → esquerda/baixo
  const wv = [16.6, 3.3], dv = [-9.4, 7.3];
  const spanX = NW * wv[0] + 7 * -dv[0];
  const O = [r1((W - spanX) / 2 + 7 * -dv[0] + 18), 362];
  const P = (w, d) => [O[0] + w * wv[0] + d * dv[0], O[1] + w * wv[1] + d * dv[1]];
  const pt = (p) => `${r1(p[0])},${r1(p[1])}`;

  const maxC = Math.max(1, ...S.yearDays.map((d) => d.count));
  const HMAX = 176;
  const hOf = (c) => (c <= 0 ? 0 : 8 + (HMAX - 8) * Math.sqrt(c / maxC));

  const g = 0.14; // folga entre prédios
  let tiles = '', bars = '';
  const tops = [];
  weeks.forEach((wk, w) => {
    const col = ramp(SUNSET, w / (NW - 1));
    wk.forEach((day) => {
      const d = day.weekday;
      const A = P(w + g, d + g), B = P(w + 1 - g, d + g), Cc = P(w + 1 - g, d + 1 - g), D = P(w + g, d + 1 - g);
      if (!day.count) {
        tiles += `<polygon points="${pt(A)} ${pt(B)} ${pt(Cc)} ${pt(D)}"/>`;
        return;
      }
      const h = hOf(day.count);
      const up = (p) => [p[0], p[1] - h];
      const top = shade(col, 1.14), right = shade(col, 0.78), front = shade(col, 0.5);
      tops.push({ day, w, d, h, A: up(A), B: up(B), C: up(Cc), D: up(D), col });
      bars += `<g class="b" style="animation-delay:${r2(0.35 + w * 0.034 + d * 0.01)}s">`
        + `<polygon points="${pt(D)} ${pt(Cc)} ${pt(up(Cc))} ${pt(up(D))}" fill="${front}"/>`
        + `<polygon points="${pt(B)} ${pt(Cc)} ${pt(up(Cc))} ${pt(up(B))}" fill="${right}"/>`
        + `<polygon points="${pt(up(A))} ${pt(up(B))} ${pt(up(Cc))} ${pt(up(D))}" fill="${top}"/>`
        + (h > 40 ? `<line x1="${r1(up(D)[0])}" y1="${r1(up(D)[1])}" x2="${r1(up(Cc)[0])}" y2="${r1(up(Cc)[1])}" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>` : '')
        + `</g>`;
    });
  });

  // brilho no topo dos dias mais fortes
  const glowTops = [...tops].sort((a, b) => b.day.count - a.day.count).slice(0, 6)
    .map((t, i) => `<polygon points="${pt(t.A)} ${pt(t.B)} ${pt(t.C)} ${pt(t.D)}" fill="${shade(t.col, 1.5)}" filter="url(#bl)" class="gt" style="animation-delay:${r1(2.6 + i * 0.35)}s"/>`)
    .join('');

  // base (laje) com borda neon
  const pad = 0.7;
  const b0 = P(-pad, -pad), b1 = P(NW + pad, -pad), b2 = P(NW + pad, 7 + pad), b3 = P(-pad, 7 + pad);
  const th = 12;
  const slab = `
    <polygon points="${pt(b3)} ${pt(b2)} ${pt([b2[0], b2[1] + th])} ${pt([b3[0], b3[1] + th])}" fill="#0f0a20"/>
    <polygon points="${pt(b1)} ${pt(b2)} ${pt([b2[0], b2[1] + th])} ${pt([b1[0], b1[1] + th])}" fill="#170f2e"/>
    <polygon points="${pt(b0)} ${pt(b1)} ${pt(b2)} ${pt(b3)}" fill="url(#plate)"/>
    <polyline points="${pt(b3)} ${pt(b2)} ${pt(b1)}" stroke="url(#edgeG)" stroke-width="2" fill="none" filter="url(#bl2)" opacity=".9"/>
    <polyline points="${pt(b3)} ${pt(b2)} ${pt(b1)}" stroke="url(#edgeG)" stroke-width="1.4" fill="none"/>
    <polyline points="${pt([b3[0], b3[1] + th])} ${pt([b2[0], b2[1] + th])} ${pt([b1[0], b1[1] + th])}" stroke="${C.magenta}" stroke-opacity=".25" fill="none"/>`;

  // scanner (cortina de luz que varre as semanas)
  const s0 = P(-2, -0.4), s1 = P(-2, 7.4), s2 = P(-0.8, 7.4), s3 = P(-0.8, -0.4);
  const HS = HMAX + 30;
  const scan = `<g class="scan">
    <polygon points="${pt(s0)} ${pt(s1)} ${pt(s2)} ${pt(s3)}" fill="${C.cyan}" opacity=".18"/>
    <polygon points="${pt(s3)} ${pt(s2)} ${pt([s2[0], s2[1] - HS])} ${pt([s3[0], s3[1] - HS])}" fill="url(#curtain)"/>
    <line x1="${r1(s3[0])}" y1="${r1(s3[1])}" x2="${r1(s2[0])}" y2="${r1(s2[1])}" stroke="${C.cyan}" stroke-width="2.5"/>
    <line x1="${r1(s2[0])}" y1="${r1(s2[1])}" x2="${r1(s2[0])}" y2="${r1(s2[1] - HS)}" stroke="${C.cyan}" stroke-opacity=".5"/>
  </g>`;
  const travel = [r1((NW + 3.5) * wv[0]), r1((NW + 3.5) * wv[1])];

  // hoje
  let today = '';
  {
    const lw = weeks[NW - 1];
    const td = lw[lw.length - 1];
    const w = NW - 1, d = td.weekday;
    const t = tops.find((x) => x.w === w && x.d === d);
    const h = t ? t.h : 0;
    const q = [P(w + g, d + g), P(w + 1 - g, d + g), P(w + 1 - g, d + 1 - g), P(w + g, d + 1 - g)].map((p) => [p[0], p[1] - h]);
    const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
    const ly = Math.min(cy - 40, O[1] + (NW - 1) * wv[1] - HMAX - 10);
    today = `<g class="today">
      <polygon points="${q.map(pt).join(' ')}" fill="none" stroke="${C.cyan}" stroke-width="2" class="tp"/>
      <line x1="${r1(cx)}" y1="${r1(cy - 4)}" x2="${r1(cx)}" y2="${r1(ly + 8)}" stroke="${C.cyan}" stroke-dasharray="3 3"/>
      <circle cx="${r1(cx)}" cy="${r1(ly + 4)}" r="4" fill="${C.cyan}"/>
      ${G('monoBold', 'HOJE', cx, ly - 8, 14, { fill: C.cyan }, { anchor: 'middle', tracking: 2 })}
    </g>`;
  }

  // pico
  let peak = '';
  if (tops.length) {
    const t = [...tops].sort((a, b) => b.day.count - a.day.count)[0];
    const cx = (t.A[0] + t.C[0]) / 2, cy = (t.A[1] + t.C[1]) / 2;
    let ly = Math.max(58, cy - 56);
    const label = `${fmtInt(t.day.count)} contribuições`;
    const sub = fmtDate(t.day.date);
    const lw = Math.max(textWidth('uiBold', label, 17), textWidth('mono', sub, 13)) + 28;
    const flip = cx + lw + 30 > W - 20;
    const bx = flip ? cx - lw - 18 : cx + 18;
    if (bx < 520 && ly < 222) ly = 222; // não invade o título
    if (bx + lw > W - 44 - 3 * 176 - 24 && ly < 156) ly = 156; // nem os cards
    peak = `<g class="peak">
      <line x1="${r1(cx)}" y1="${r1(cy - 3)}" x2="${r1(cx)}" y2="${r1(ly + 22)}" stroke="${C.amber}" stroke-width="1.5"/>
      <circle cx="${r1(cx)}" cy="${r1(cy - 3)}" r="3" fill="${C.amber}"/>
      <path d="M${r1(cx)} ${r1(ly + 22)} H${r1(flip ? bx + lw : bx)}" stroke="${C.amber}" stroke-width="1.5"/>
      <rect x="${r1(bx)}" y="${r1(ly - 4)}" width="${r1(lw)}" height="52" rx="10" fill="#120c26" fill-opacity=".92" stroke="${C.amber}" stroke-opacity=".7"/>
      ${G('uiBold', label, bx + 14, ly + 19, 17, { fill: C.text })}
      ${G('mono', sub, bx + 14, ly + 38, 13, { fill: C.amber })}
    </g>`;
  }

  // meses ao longo da borda da frente
  let months = '';
  const ang = r2((Math.atan2(wv[1], wv[0]) * 180) / Math.PI);
  let lastM = -1;
  weeks.forEach((wk, w) => {
    const first = wk.find((d) => d.date.endsWith('-01')) || (w === 0 ? wk[0] : null);
    if (!first) return;
    const m = +first.date.slice(5, 7) - 1;
    if (m === lastM || (w === 0 && wk.length && !wk.some((d) => d.date.endsWith('-01')) && false)) return;
    lastM = m;
    if (w > NW - 2) return;
    if (w === 0 && weeks.slice(1, 4).some((k) => k.some((d) => d.date.endsWith('-01')))) return;
    const p = P(w + 0.2, 7 + pad + 1.2);
    const yy = first.date.slice(2, 4);
    const txt = m === 0 ? `${MONTHS_PT[m].toUpperCase()} ${yy}` : MONTHS_PT[m].toUpperCase();
    months += `<g transform="rotate(${ang} ${r1(p[0])} ${r1(p[1] + 14)})">${G('mono', txt, p[0], p[1] + 14, 12.5, { fill: m === 0 ? C.amber : C.muted }, { tracking: 1 })}</g>`;
  });

  // céu
  let stars = '';
  for (let i = 0; i < 70; i++) {
    const x = r1(R() * W), y = r1(R() * 300);
    stars += `<circle cx="${x}" cy="${y}" r="${r2(0.4 + R() ** 3 * 1.2)}" fill="#fff" opacity="${r2(0.15 + R() * 0.5)}"${R() < 0.4 ? ` class="tw" style="animation-delay:-${r1(R() * 5)}s"` : ''}/>`;
  }

  // textos: título e cards
  const head = `
    ${G('monoBold', 'CONTRIBUIÇÕES · ÚLTIMOS 12 MESES', 48, 62, 14, { fill: C.cyan }, { tracking: 1.5 })}
    <g class="bign">${G('display', fmtInt(S.lastYear), 46, 136, 66, { fill: 'url(#numG)' })}</g>
    ${G('ui', `${fmtInt(S.allTime)} no total · ${fmtInt(S.activeDays)} dias com código`, 48, 172, 18, { fill: C.soft })}
    ${G('mono', 'um prédio por dia · a cor segue o tempo', 48, 198, 13.5, { fill: C.muted })}`;
  const chips = [
    ['MELHOR DIA', fmtInt(S.best.count), S.best.date ? fmtDate(S.best.date) : '—', C.amber],
    ['DIA FAVORITO', S.favWeekdayName, 'mais commits', C.magenta],
    ['SEQUÊNCIA', `${S.current} ${S.current === 1 ? 'dia' : 'dias'}`, `recorde: ${S.longest.len}`, C.cyan],
  ];
  const cw = 176, cg = 12, cx0 = W - 44 - chips.length * cw - (chips.length - 1) * cg;
  const chipSvg = chips.map(([k, v, sub, c], i) => {
    const x = cx0 + i * (cw + cg);
    return `<g class="chip" style="animation-delay:${r1(0.6 + i * 0.12)}s">
      <rect x="${x}" y="40" width="${cw}" height="98" rx="16" fill="#120c26" fill-opacity=".85" stroke="${C.line2}"/>
      <rect x="${x + 16}" y="40" width="34" height="3" rx="1.5" fill="${c}"/>
      ${G('monoBold', k, x + 16, 66, 12, { fill: c }, { tracking: 1.2 })}
      ${G('displayBold', v, x + 16, 100, v.length > 7 ? 19 : 24, { fill: C.text })}
      ${G('mono', sub, x + 16, 124, 12.5, { fill: C.muted })}
    </g>`;
  }).join('');

  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}
    <ellipse cx="${W / 2}" cy="${O[1] + 150}" rx="560" ry="170" fill="url(#halo)"/>
    ${slab}
    <g fill="#140e2a" stroke="#241b45" stroke-width=".6">${tiles}</g>
    ${bars}
    ${glowTops}
    ${scan}
    ${today}
    ${peak}
    ${months}
    ${head}
    ${chipSvg}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="27.5" stroke="${C.line2}" stroke-width="1.5"/>`;

  const defs = `${G.defs()}
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    ${linGrad('sky', [[0, '#07050f'], [0.55, '#0f0a22'], [1, '#1c0c2c']], { x2: 0, y2: 1 })}
    ${linGrad('plate', [[0, '#120c26'], [1, '#1b1236']], { x2: 0, y2: 1 })}
    ${linGrad('edgeG', SUNSET)}
    ${linGrad('numG', [C.violet, C.magenta, C.orange, C.amber], { x1: 0, y1: 0, x2: 1, y2: 0 })}
    ${linGrad('curtain', [[0, C.cyan, 0], [0.75, C.cyan, 0.1], [1, C.cyan, 0.4]], { x2: 0, y2: 1 })}
    <radialGradient id="halo"><stop offset="0" stop-color="${C.magenta}" stop-opacity=".22"/><stop offset=".6" stop-color="${C.violet}" stop-opacity=".07"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
    <filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="bl2" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>`;

  const css = `
    .b{transform-box:fill-box;transform-origin:50% 100%;animation:rise .9s cubic-bezier(.25,1.35,.45,1) backwards}
    @keyframes rise{from{transform:scaleY(0)}}
    .gt{mix-blend-mode:screen;animation:gt 3.2s ease-in-out infinite}
    @keyframes gt{0%,100%{opacity:.2}50%{opacity:.9}}
    .scan{mix-blend-mode:screen;opacity:0;animation:scan 9s 2.6s cubic-bezier(.45,0,.55,1) infinite}
    @keyframes scan{0%{transform:translate(0,0);opacity:0}6%{opacity:1}64%{opacity:1}70%{transform:translate(${travel[0]}px,${travel[1]}px);opacity:0}100%{transform:translate(${travel[0]}px,${travel[1]}px);opacity:0}}
    .tp{animation:tp 1.6s ease-in-out infinite}
    @keyframes tp{0%,100%{stroke-opacity:1}50%{stroke-opacity:.2}}
    .today{animation:fade .8s 2.4s backwards}
    .peak{animation:fade .8s 2.8s backwards}
    @keyframes fade{from{opacity:0}}
    .chip{animation:up .8s cubic-bezier(.2,.8,.2,1) backwards}
    .bign{animation:up .9s .2s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes up{from{opacity:0;transform:translateY(12px)}}
    .tw{animation:tw 3.5s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.1}50%{opacity:.8}}`;

  return svg({
    w: W, h: H,
    title: `Skyline de contribuições de ${cfg.name}`,
    desc: `${S.lastYear} contribuições nos últimos 12 meses; melhor dia: ${S.best.count} em ${S.best.date}.`,
    defs, css, body,
  });
}
