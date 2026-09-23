// Botões de contato com borda em degradê correndo
import { C, T, textD, svg, r1, linGrad, SUNSET } from '../theme.mjs';

const GLYPH = {
  linkedin: (cx, cy) => `<rect x="${cx - 13}" y="${cy - 13}" width="26" height="26" rx="6" stroke="#fff" stroke-width="2.4"/>
    <path d="M${cx - 6.5} ${cy - 2}v9M${cx - 1} ${cy + 7}v-9M${cx - 1} ${cy + 1.5}c0-3 6.5-4.5 6.5 0V${cy + 7}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <circle cx="${cx - 6.5}" cy="${cy - 6.5}" r="1.7" fill="#fff"/>`,
  instagram: (cx, cy) => `<rect x="${cx - 13}" y="${cy - 13}" width="26" height="26" rx="8" stroke="#fff" stroke-width="2.4"/>
    <circle cx="${cx}" cy="${cy}" r="6" stroke="#fff" stroke-width="2.4"/><circle cx="${cx + 7.2}" cy="${cy - 7.2}" r="1.7" fill="#fff"/>`,
  email: (cx, cy) => `<rect x="${cx - 14}" y="${cy - 10}" width="28" height="20" rx="4" stroke="#fff" stroke-width="2.4"/>
    <path d="M${cx - 12} ${cy - 7}l12 9 12-9" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" fill="none"/>`,
};

function button(kind, label, handle, i) {
  const W = 400, H = 96, rx = 48;
  const t = textD('displayBold', label, 108, 46, 21, { tracking: 1.5 });
  const h = T('mono', handle, 108, 72, 15, { fill: C.muted });
  const defs = `
    ${linGrad('run', [...SUNSET, C.cyan, ...SUNSET], { x1: 0, y1: 0, x2: 1, y2: 0 })}
    ${linGrad('ib', [C.violet, C.magenta, C.orange], { x1: 0, y1: 0, x2: 1, y2: 1 })}
    ${linGrad('bg', [[0, '#16102e'], [1, '#0c0819']], { x2: 0, y2: 1 })}
    <mask id="ring"><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${rx - 1.5}" stroke="#fff" stroke-width="3" fill="none"/></mask>
    <clipPath id="pill"><rect width="${W}" height="${H}" rx="${rx}"/></clipPath>`;
  const css = `
    .run{animation:run 4s ${r1(i * 0.6)}s linear infinite}
    @keyframes run{from{transform:translateX(0)}to{transform:translateX(-${W * 1.5}px)}}
    .in{animation:in .8s ${r1(0.2 + i * 0.15)}s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes in{from{opacity:0;transform:translateY(12px)}}
    .sh{animation:sh 5s ${r1(2 + i * 0.8)}s ease-in-out infinite}
    @keyframes sh{0%{transform:translateX(-120px) skewX(-20deg)}35%,100%{transform:translateX(${W + 60}px) skewX(-20deg)}}
    .ar{animation:ar 2.4s ease-in-out infinite}
    @keyframes ar{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,-4px)}}`;
  const body = `<g class="in">
    <g clip-path="url(#pill)">
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect y="0" width="60" height="${H}" fill="#fff" opacity=".06" class="sh"/>
    </g>
    <g mask="url(#ring)"><rect width="${W * 3}" height="${H}" fill="url(#run)" class="run"/></g>
    <circle cx="56" cy="${H / 2}" r="30" fill="url(#ib)"/>
    ${GLYPH[kind](56, H / 2)}
    <path d="${t.d}" fill="${C.text}"/>
    ${h}
    <g class="ar"><path d="M${W - 58} ${H / 2 + 8}l14-14M${W - 55} ${H / 2 - 6}h11v11" stroke="${C.amber}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
  </g>`;
  return svg({ w: W, h: H, title: label, desc: handle, defs, css, body });
}

export function buttons(cfg) {
  const L = cfg.links;
  const handle = (u) => u.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return [
    ['btn-linkedin.svg', button('linkedin', 'LINKEDIN', handle(L.linkedin).replace('linkedin.com', ''), 0)],
    ['btn-instagram.svg', button('instagram', 'INSTAGRAM', '@' + handle(L.instagram).split('/').pop(), 1)],
    ['btn-email.svg', button('email', 'E-MAIL', handle(L.email), 2)],
  ];
}
