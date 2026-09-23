// Números: odômetros que giram até o valor real + linguagens + ritmo da semana
import { C, svg, r1, r2, linGrad, ramp, SUNSET, fmtInt, glyphBank, textWidth, MONTHS_PT } from '../theme.mjs';
import { fmtDate } from '../compute.mjs';

const LANG_COLORS = [C.violet, C.magenta, C.orange, C.amber, C.cyan, C.pink, C.purple, C.mint];

export function stats(cfg, data, S) {
  const W = 1200, H = 470;
  const G = glyphBank();
  let css = '';
  let clips = '';
  let body = '';

  // ── odômetro
  let odoN = 0;
  function odometer(value, x, baseline, size, delay) {
    const str = fmtInt(value);
    const f = G.glyph('display', '0');
    const s = size / f.upm;
    const digits = '0123456789'.split('').map((d) => G.glyph('display', d));
    const cell = Math.max(...digits.map((d) => d.adv)) * s;
    const LH = size * 1.45;
    let cx = x;
    let out = '';
    [...str].forEach((ch, i) => {
      if (!/\d/.test(ch)) {
        const gsep = G.glyph('display', ch);
        out += `<g transform="translate(${r1(cx)} ${baseline}) scale(${s.toFixed(5)})" fill="url(#dg)"><use href="#${gsep.id}"/></g>`;
        cx += gsep.adv * s * 0.9;
        return;
      }
      const k = +ch;
      const seq = [...'0123456789'.split('').map(Number), ...Array.from({ length: k + 1 }, (_, j) => j)];
      const id = `oc${odoN++}`;
      clips += `<mask id="${id}"><rect x="${r1(cx - 4)}" y="${r1(baseline - size * 0.98)}" width="${r1(cell + 8)}" height="${r1(size * 1.26)}" fill="url(#fadeV)"/></mask>`;
      const shift = -(seq.length - 1) * LH;
      const uses = seq
        .map((n, j) => {
          const gd = digits[n];
          const off = ((cell / s - gd.adv) / 2) | 0;
          return `<use href="#${gd.id}" x="${off}" y="${r1((j * LH) / s)}"/>`;
        })
        .join('');
      out += `<g mask="url(#${id})"><g class="od" style="--f:${r1(shift)}px;animation-delay:${r2(delay + i * 0.08)}s"><g transform="translate(${r1(cx)} ${baseline}) scale(${s.toFixed(5)})" fill="url(#dg)">${uses}</g></g></g>`;
      cx += cell;
    });
    return { svg: out, width: cx - x };
  }

  // ── 4 cards de números
  const t = data.totals || {};
  const firstMonth = (() => {
    const d = new Date(data.user.createdAt);
    return `${MONTHS_PT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  })();
  const L = S.longest;
  const cards = [
    ['CONTRIBUIÇÕES', S.allTime, `desde ${firstMonth}`, C.violet],
    ['COMMITS · 12 MESES', t.commits ?? 0, `${fmtInt(t.prs ?? 0)} ${(t.prs ?? 0) === 1 ? 'PR' : 'PRs'} · ${fmtInt(t.issues ?? 0)} ${(t.issues ?? 0) === 1 ? 'issue' : 'issues'}`, C.magenta],
    ['REPOSITÓRIOS', S.repoCount, `${fmtInt(S.stars)} estrelas · ${fmtInt(S.forks)} forks`, C.orange],
    ['MAIOR SEQUÊNCIA', L.len, L.from ? (L.from === L.to ? fmtDate(L.from) : `${fmtDate(L.from, { year: false })} a ${fmtDate(L.to)}`) : '—', C.amber],
  ];
  const gap = 16, cw = (W - gap * 3) / 4, ch = 184;
  cards.forEach(([label, val, sub, col], i) => {
    const x = r1(i * (cw + gap));
    const od = odometer(val, x + 26, 132, 62, 0.5 + i * 0.18);
    const suffix = label === 'MAIOR SEQUÊNCIA' ? (val === 1 ? 'dia' : 'dias') : '';
    body += `<g class="card" style="animation-delay:${r1(0.1 + i * 0.12)}s">
      <rect x="${x}" y="0" width="${r1(cw)}" height="${ch}" rx="22" fill="url(#cardG)" stroke="${C.line2}" stroke-width="1.2"/>
      <rect x="${x}" y="0" width="${r1(cw)}" height="${ch}" rx="22" fill="url(#shine${i})" opacity=".9"/>
      <circle cx="${r1(x + 30)}" cy="36" r="5" fill="${col}"/>
      <circle cx="${r1(x + 30)}" cy="36" r="5" fill="none" stroke="${col}" class="ring" style="animation-delay:${r1(i * 0.5)}s"/>
      ${G('monoBold', label, x + 44, 41, 13, { fill: col }, { tracking: 1.4 })}
      ${od.svg}
      ${suffix ? G('uiBold', suffix, x + 26 + od.width + 10, 132, 22, { fill: C.soft }) : ''}
      ${G('mono', sub, x + 26, 164, 14, { fill: C.muted })}
    </g>`;
  });

  // ── linguagens
  const LX = 0, LY = ch + 20, LW = 720, LH2 = H - LY;
  const langs = S.languages.slice(0, 6);
  const rest = S.languages.slice(6).reduce((s, l) => s + l.score, 0);
  const segs = [...langs.map((l, i) => ({ name: l.name, score: l.score, color: LANG_COLORS[i] })), ...(rest > 0.005 ? [{ name: 'Outras', score: rest, color: C.dim }] : [])];
  const tot = segs.reduce((s, l) => s + l.score, 0) || 1;
  const barX = LX + 28, barY = LY + 70, barW = LW - 56, barH = 26;
  let bx = barX;
  let bar = '';
  segs.forEach((sg, i) => {
    const w = (sg.score / tot) * barW;
    bar += `<rect x="${r1(bx)}" y="${barY}" width="${r1(Math.max(0, w - 3))}" height="${barH}" rx="4" fill="${sg.color}" class="seg" style="animation-delay:${r2(0.9 + i * 0.12)}s"/>`;
    bx += w;
  });
  let legend = '';
  segs.forEach((sg, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = barX + col * ((barW + 10) / 3), y = barY + 70 + row * 36;
    const pct = ((sg.score / tot) * 100).toFixed(1).replace('.', ',') + '%';
    legend += `<g class="lg" style="animation-delay:${r2(1.1 + i * 0.08)}s">
      <rect x="${r1(x)}" y="${y - 12}" width="14" height="14" rx="4" fill="${sg.color}"/>
      ${G('uiBold', sg.name, x + 24, y, 17, { fill: C.text })}
      ${G('mono', pct, x + 24 + textWidth('uiBold', sg.name, 17) + 10, y, 14, { fill: C.muted })}
    </g>`;
  });
  const langPanel = `<g class="card" style="animation-delay:.6s">
    <rect x="${LX}" y="${LY}" width="${LW}" height="${LH2}" rx="22" fill="url(#cardG)" stroke="${C.line2}" stroke-width="1.2"/>
    ${G('monoBold', 'LINGUAGENS MAIS USADAS', barX, LY + 40, 13, { fill: C.cyan }, { tracking: 1.4 })}
    ${G('mono', `em ${S.repoCount} repositórios`, LX + LW - 28, LY + 40, 13, { fill: C.muted }, { anchor: 'end' })}
    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="5" fill="#0c0819"/>
    ${bar}
    ${legend}
    <rect x="${barX}" y="${LY + LH2 - 58}" width="${barW}" height="1" fill="${C.line}"/>
    ${G('mono', `mais código em ${S.byBytes} · presente em mais projetos: ${S.bySpread[0]} (${S.bySpread[1]})`, barX, LY + LH2 - 26, 14, { fill: C.soft })}
  </g>`;

  // ── ritmo da semana
  const RX = LW + 16, RW = W - RX;
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const maxW = Math.max(1, ...S.byWeekday);
  const colW = 40, colGap = (RW - 56 - 7 * colW) / 6;
  const baseY = LY + LH2 - 50, maxBar = LH2 - 124;
  let cols = '';
  S.byWeekday.forEach((v, i) => {
    const h = Math.max(6, (v / maxW) * maxBar);
    const x = RX + 28 + i * (colW + colGap);
    const fav = i === S.favWeekday;
    cols += `<g>
      <rect x="${r1(x)}" y="${r1(baseY - maxBar)}" width="${colW}" height="${r1(maxBar)}" rx="10" fill="#0c0819"/>
      <rect x="${r1(x)}" y="${r1(baseY - h)}" width="${colW}" height="${r1(h)}" rx="10" fill="${fav ? 'url(#favG)' : ramp(SUNSET, i / 6)}" opacity="${fav ? 1 : 0.55}" class="col" style="animation-delay:${r2(1 + i * 0.07)}s"/>
      ${G('monoBold', labels[i], x + colW / 2, baseY + 26, 14, { fill: fav ? C.amber : C.muted }, { anchor: 'middle' })}
      ${fav ? G('monoBold', fmtInt(v), x + colW / 2, baseY - h - 10, 13, { fill: C.amber }, { anchor: 'middle' }) : ''}
    </g>`;
  });
  const rhythm = `<g class="card" style="animation-delay:.75s">
    <rect x="${RX}" y="${LY}" width="${RW}" height="${LH2}" rx="22" fill="url(#cardG)" stroke="${C.line2}" stroke-width="1.2"/>
    ${G('monoBold', 'RITMO DA SEMANA', RX + 28, LY + 40, 13, { fill: C.magenta }, { tracking: 1.4 })}
    ${cols}
  </g>`;

  body += langPanel + rhythm;

  const shines = cards.map((c, i) => linGrad(`shine${i}`, [[0, c[3], 0.16], [0.5, c[3], 0.02], [1, c[3], 0]], { x1: 0, y1: 0, x2: 1, y2: 1 })).join('');
  const defs = `${G.defs()}${clips}
    ${linGrad('cardG', [[0, '#150f2e'], [1, '#0c0819']], { x2: 0, y2: 1 })}
    ${linGrad('dg', [[0, '#ffffff'], [0.55, '#ffe3f4'], [1, C.amber]], { x2: 0, y2: 1 })}
    ${linGrad('fadeV', [[0, '#fff', 0], [0.2, '#fff', 1], [0.82, '#fff', 1], [1, '#fff', 0]], { x2: 0, y2: 1 })}
    ${linGrad('favG', [[0, C.amber], [1, C.magenta]], { x2: 0, y2: 1 })}
    ${shines}`;
  css += `
    .card{animation:up .8s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes up{from{opacity:0;transform:translateY(14px)}}
    .od{transform:translateY(var(--f));animation:roll 2.2s cubic-bezier(.15,.75,.2,1) backwards}
    @keyframes roll{from{transform:translateY(0)}}
    .seg{transform-box:fill-box;transform-origin:left;animation:grow 1s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes grow{from{transform:scaleX(0)}}
    .col{transform-box:fill-box;transform-origin:bottom;animation:growY 1s cubic-bezier(.25,1.3,.45,1) backwards}
    @keyframes growY{from{transform:scaleY(0)}}
    .lg{animation:fade .6s backwards}@keyframes fade{from{opacity:0}}
    .ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}
    @keyframes ring{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}`;

  return svg({
    w: W, h: H,
    title: 'Números do GitHub',
    desc: `${S.allTime} contribuições, ${t.commits ?? 0} commits no último ano, ${S.repoCount} repositórios, maior sequência de ${L.len} dias. Linguagens: ${segs.map((s) => s.name).join(', ')}.`,
    defs, css, body,
  });
}
