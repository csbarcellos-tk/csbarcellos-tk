// Títulos de seção: número vazado em degradê, título, legenda e linha com brilho viajando
import { C, T, textD, svg, r1, linGrad } from '../theme.mjs';

export const SECTIONS = [
  ['00', 'WHOAMI', 'quem está do outro lado do teclado'],
  ['01', 'ARSENAL', 'ferramentas que eu uso pra tirar ideia do papel'],
  ['02', 'PROJETOS', 'o que eu ando construindo'],
  ['03', 'SKYLINE', 'cada prédio é um dia de código'],
  ['04', 'NÚMEROS', 'atualizados sozinhos todo dia, às 3h da manhã'],
  ['05', 'COBRINHA', 'ela vive de commits'],
];

export function heading(idx, title, caption, i) {
  const W = 1200, H = 132;
  const num = textD('display', idx, 2, 86, 74, { tracking: 2 });
  const tx = r1(num.width + 26);
  const t = textD('displayBold', title, tx, 64, 40, { tracking: 3 });
  const lineX = r1(tx + t.width + 28);
  const cap = T('mono', '// ' + caption, tx, 100, 19, { fill: C.muted }, { tracking: 0.3 });
  const hue = [C.violet, C.magenta, C.orange, C.amber, C.pink, C.cyan][i % 6];

  const defs = `
    ${linGrad('ng', [C.violet, C.magenta, C.orange, C.amber], { x1: 0, y1: 0, x2: 1, y2: 1 })}
    ${linGrad('lg', [[0, hue, 0.9], [0.5, C.magenta, 0.45], [1, C.violet, 0]])}
    ${linGrad('gl', [[0, '#fff', 0], [0.5, '#fff', 1], [1, '#fff', 0]])}
    <clipPath id="lc"><rect x="${lineX}" y="42" width="${W - lineX}" height="16"/></clipPath>`;
  const css = `
    .num{animation:numIn 1s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes numIn{from{opacity:0;transform:translateX(-24px)}}
    .ttl{animation:ttlIn 1s .15s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes ttlIn{from{opacity:0;transform:translateY(10px)}}
    .cap{animation:capIn 1.4s .4s steps(24) backwards}
    @keyframes capIn{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
    .ln{transform-box:fill-box;transform-origin:left;animation:lnIn 1.4s .3s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes lnIn{from{transform:scaleX(0)}}
    .glint{animation:glint 4.5s ${r1(1.5 + i * 0.4)}s ease-in-out infinite}
    @keyframes glint{0%{transform:translateX(-160px)}60%,100%{transform:translateX(${r1(W - lineX + 40)}px)}}
    .nf{animation:nf 6s ease-in-out infinite}
    @keyframes nf{0%,100%{fill-opacity:.08}50%{fill-opacity:.28}}`;
  const body = `
    <g class="num">
      <path d="${num.d}" fill="url(#ng)" class="nf"/>
      <path d="${num.d}" stroke="url(#ng)" stroke-width="1.6"/>
    </g>
    <path d="${t.d}" fill="${C.text}" class="ttl"/>
    <g class="cap">${cap}</g>
    <g class="ln">
      <rect x="${lineX}" y="49" width="${W - lineX - 14}" height="2" rx="1" fill="url(#lg)"/>
      <rect x="${W - 12}" y="46" width="8" height="8" transform="rotate(45 ${W - 8} 50)" fill="${hue}" opacity=".8"/>
    </g>
    <g clip-path="url(#lc)"><rect x="${lineX}" y="47" width="140" height="6" rx="3" fill="url(#gl)" class="glint" opacity=".9"/></g>`;
  return svg({ w: W, h: H, title: `${idx} ${title}`, desc: caption, defs, css, body });
}

export function headings() {
  return SECTIONS.map(([n, t, c], i) => [`h${n}.svg`, heading(n, t, c, i)]);
}
