// Rodapé: Salvador à noite — Cidade Alta, Pelourinho, Elevador Lacerda, saveiro no mar e letreiro neon
import { C, T, textD, svg, rng, r1, r2, linGrad, ICON, mix } from '../theme.mjs';

export function footer(cfg) {
  const W = 1200, H = 420, SEA = 300;
  const R = rng(1873); // inauguração do Elevador Lacerda
  const cliffTop = 214;

  // ── céu
  let stars = '';
  for (let i = 0; i < 90; i++) {
    const x = r1(R() * W), y = r1(R() * 170);
    stars += `<circle cx="${x}" cy="${y}" r="${r2(0.4 + R() ** 3 * 1.3)}" fill="#fff" opacity="${r2(0.2 + R() * 0.6)}"${R() < 0.4 ? ` class="tw" style="animation-duration:${r1(2 + R() * 4)}s;animation-delay:-${r1(R() * 5)}s"` : ''}/>`;
  }

  // ── Cidade Alta: escarpa + casario colonial do Pelourinho
  const cliff = `<path d="M0 ${cliffTop + 8} L40 ${cliffTop + 4} L120 ${cliffTop + 10} L220 ${cliffTop + 2} L330 ${cliffTop + 8} L470 ${cliffTop} L560 ${cliffTop + 6} L590 ${cliffTop + 12} L600 ${SEA - 34} L614 ${SEA} L0 ${SEA} Z" fill="url(#cliffG)"/>
    <path d="M0 ${cliffTop + 8} L40 ${cliffTop + 4} L120 ${cliffTop + 10} L220 ${cliffTop + 2} L330 ${cliffTop + 8} L470 ${cliffTop} L560 ${cliffTop + 6} L590 ${cliffTop + 12}" stroke="${C.magenta}" stroke-opacity=".25"/>
    ${Array.from({ length: 26 }, () => `<circle cx="${r1(20 + R() * 560)}" cy="${r1(cliffTop + 24 + R() * 70)}" r="${r2(4 + R() * 9)}" fill="#0c0a18" opacity=".8"/>`).join('')}`;

  const facade = [C.magenta, C.amber, C.cyan, C.orange, C.violet, C.pink, C.mint];
  let houses = '';
  let hx = 18;
  const winAnim = () => (R() < 0.18 ? ` class="win" style="animation-delay:-${r1(R() * 12)}s"` : '');
  while (hx < 400) {
    const w = 38 + R() * 26, h = 34 + R() * 34;
    const base = cliffTop + 10;
    const col = facade[Math.floor(R() * facade.length)];
    const body = mix(col, '#0b0716', 0.76);
    houses += `<rect x="${r1(hx)}" y="${r1(base - h)}" width="${r1(w)}" height="${r1(h + 6)}" fill="${body}"/>`;
    houses += `<path d="M${r1(hx - 3)} ${r1(base - h)} L${r1(hx + w / 2)} ${r1(base - h - 12)} L${r1(hx + w + 3)} ${r1(base - h)} Z" fill="#1a0e22"/>`;
    houses += `<rect x="${r1(hx)}" y="${r1(base - h)}" width="${r1(w)}" height="2" fill="${col}" opacity=".45"/>`;
    const floors = Math.max(1, Math.floor(h / 22));
    for (let f = 0; f < floors; f++)
      for (let wx = hx + 7; wx < hx + w - 10; wx += 13) {
        const lit = R() < 0.62;
        houses += `<path d="M${r1(wx)} ${r1(base - h + 10 + f * 22 + 12)}v-7a3.5 3.5 0 0 1 7 0v7z" fill="${lit ? C.amber : '#1a1030'}" opacity="${lit ? r2(0.55 + R() * 0.4) : 1}"${lit ? winAnim() : ''}/>`;
      }
    hx += w + 3;
  }
  // igreja com duas torres (Pelourinho)
  const cx0 = 430, cb = cliffTop + 4;
  const church = `
    <rect x="${cx0}" y="${cb - 58}" width="96" height="62" fill="#1c1030"/>
    <rect x="${cx0 - 6}" y="${cb - 88}" width="26" height="106" fill="#1c1030"/>
    <rect x="${cx0 + 76}" y="${cb - 88}" width="26" height="106" fill="#1c1030"/>
    <path d="M${cx0 - 6} ${cb - 88} Q${cx0 + 7} ${cb - 112} ${cx0 + 20} ${cb - 88} Z" fill="#241438"/>
    <path d="M${cx0 + 76} ${cb - 88} Q${cx0 + 89} ${cb - 112} ${cx0 + 102} ${cb - 88} Z" fill="#241438"/>
    <path d="M${cx0 + 7} ${cb - 106}v-12M${cx0 + 2} ${cb - 112}h10M${cx0 + 89} ${cb - 106}v-12M${cx0 + 84} ${cb - 112}h10" stroke="${C.gold}" stroke-opacity=".7" stroke-width="2"/>
    <path d="M${cx0 + 20} ${cb - 58} L${cx0 + 48} ${cb - 82} L${cx0 + 76} ${cb - 58} Z" fill="#241438"/>
    <path d="M${cx0 + 40} ${cb + 2}v-22a8 8 0 0 1 16 0v22z" fill="${C.amber}" opacity=".7"/>
    <circle cx="${cx0 + 48}" cy="${cb - 64}" r="5" fill="${C.gold}" opacity=".8" class="bell"/>
    <path d="M${cx0 + 2} ${cb - 76}v-10a5 5 0 0 1 10 0v10zM${cx0 + 84} ${cb - 76}v-10a5 5 0 0 1 10 0v10z" fill="${C.amber}" opacity=".6"/>`;

  // ── Elevador Lacerda
  const ex = 612, eTop = cliffTop - 44;
  const elevador = `
    <path d="M556 ${cliffTop + 8} H${ex - 2} V${cliffTop + 16} H556 Z" fill="#2a1a40"/>
    <rect x="${ex}" y="${eTop}" width="54" height="${SEA - eTop}" fill="url(#elevG)"/>
    <rect x="${ex - 8}" y="${eTop}" width="70" height="30" fill="#2b1942"/>
    <rect x="${ex - 8}" y="${eTop - 6}" width="70" height="6" fill="#351f52"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${ex - 2 + i * 13}" y="${eTop + 8}" width="7" height="14" fill="${C.cyan}" opacity=".75"/>`).join('')}
    ${[0, 1, 2].map((i) => `<rect x="${ex + 9 + i * 14}" y="${eTop + 40}" width="4" height="${SEA - eTop - 50}" fill="${C.amber}" opacity=".22"/>`).join('')}
    <rect x="${ex + 21}" y="${eTop + 40}" width="12" height="16" rx="2" fill="${C.gold}" class="cab"/>
    ${T('monoBold', 'LACERDA', ex + 27, eTop - 12, 11, { fill: C.magenta, opacity: '.9' }, { anchor: 'middle', tracking: 1.5 })}`;

  // ── Cidade Baixa: Mercado Modelo + prédios do Comércio
  const mm = `
    <rect x="690" y="${SEA - 46}" width="130" height="48" fill="#1f1233"/>
    <rect x="684" y="${SEA - 52}" width="142" height="8" fill="#2c1a45"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${702 + i * 24} ${SEA}v-20a8 8 0 0 1 16 0v20z" fill="${C.amber}" opacity=".55"/>`).join('')}`;
  let downtown = '';
  let dx = 846;
  while (dx < W + 10) {
    const w = 26 + R() * 40, h = 50 + R() ** 1.6 * 130;
    downtown += `<rect x="${r1(dx)}" y="${r1(SEA - h)}" width="${r1(w)}" height="${r1(h)}" fill="${R() < 0.5 ? '#170d28' : '#1d1131'}"/>`;
    for (let wy = SEA - h + 8; wy < SEA - 8; wy += 9)
      for (let wx = dx + 5; wx < dx + w - 6; wx += 8)
        if (R() < 0.3) downtown += `<rect x="${r1(wx)}" y="${r1(wy)}" width="3" height="4" fill="${R() < 0.75 ? C.amber : C.cyan}" opacity="${r2(0.35 + R() * 0.5)}"${winAnim()}/>`;
    if (R() < 0.3) downtown += `<circle cx="${r1(dx + w / 2)}" cy="${r1(SEA - h - 6)}" r="2" fill="${C.pink}" class="bcn" style="animation-delay:-${r1(R() * 2)}s"/><line x1="${r1(dx + w / 2)}" y1="${r1(SEA - h)}" x2="${r1(dx + w / 2)}" y2="${r1(SEA - h - 6)}" stroke="#2a1a40"/>`;
    dx += w + 4 + R() * 8;
  }
  // coqueiros
  const palm = (x, h, s = 1) => `<g transform="translate(${x} ${SEA}) scale(${s})" class="palm">
    <path d="M0 0 Q4 ${-h / 2} -2 ${-h}" stroke="#120a1e" stroke-width="5" fill="none"/>
    <g transform="translate(-2 ${-h})" fill="#120a1e">
      <path d="M0 0 Q-20 -12 -38 4 Q-20 -4 0 0Z"/><path d="M0 0 Q20 -14 40 2 Q20 -4 0 0Z"/>
      <path d="M0 0 Q-10 -24 -28 -26 Q-12 -14 0 0Z"/><path d="M0 0 Q12 -24 30 -24 Q12 -12 0 0Z"/><path d="M0 0 Q2 -22 -4 -32 Q6 -18 0 0Z"/>
    </g></g>`;

  // ── mar: reflexos, ondas e saveiro
  let refl = '';
  for (let i = 0; i < 70; i++) {
    const x = r1(R() * W);
    refl += `<rect x="${x}" y="${r1(SEA + 6 + R() * 60)}" width="${r1(6 + R() * 26)}" height="1.6" rx=".8" fill="${R() < 0.7 ? C.amber : C.magenta}" opacity="${r2(0.12 + R() * 0.35)}" class="rf" style="animation-delay:-${r1(R() * 4)}s"/>`;
  }
  const wave = (y, amp, len, col, op, dur, rev) => {
    let d = `M${-len * 2} ${y}`;
    for (let x = -len * 2; x < W + len * 2; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    return `<path d="${d}" stroke="${col}" stroke-opacity="${op}" stroke-width="1.5" fill="none" style="animation:${rev ? 'wr' : 'wv'} ${dur}s linear infinite;--l:${len}px"/>`;
  };
  const waves = [
    wave(SEA + 34, 3, 60, C.violet, 0.5, 6),
    wave(SEA + 58, 4, 80, C.magenta, 0.35, 8, true),
    wave(SEA + 86, 5, 110, C.cyan, 0.22, 11),
  ].join('');
  const saveiro = `<g class="boat"><g transform="translate(0 ${SEA + 22})">
    <path d="M-34 0 L34 0 L24 12 L-26 12 Z" fill="#120a1e"/>
    <path d="M-2 -2 L-2 -62 L30 -4 Z" fill="${mix(C.orange, '#150a24', 0.45)}"/>
    <path d="M-6 -2 L-6 -48 L-30 -4 Z" fill="${mix(C.amber, '#150a24', 0.55)}"/>
    <line x1="-4" y1="0" x2="-4" y2="-66" stroke="#120a1e" stroke-width="2"/>
    <circle cx="-4" cy="-68" r="2.2" fill="${C.gold}" class="bcn"/>
  </g></g>`;

  // ── letreiro neon
  const sign = textD('neon', 'VALEU PELA VISITA', W / 2, 92, 50, { anchor: 'middle', tracking: 4 });
  const credit = textD('mono', 'feito à mão com SVG, CSS e café, em Salvador', W / 2, H - 26, 15, { anchor: 'middle' });

  const defs = `
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    ${linGrad('sky', [[0, '#05030b'], [0.55, '#140a2a'], [1, '#3a1043']], { x2: 0, y2: 1 })}
    ${linGrad('sea', [[0, '#1d0b2c'], [1, '#05030a']], { x2: 0, y2: 1 })}
    ${linGrad('cliffG', [[0, '#1a0f2a'], [1, '#0b0714']], { x2: 0, y2: 1 })}
    ${linGrad('elevG', [[0, '#2a1840'], [0.5, '#3a2156'], [1, '#22133a']])}
    ${linGrad('signG', [C.magenta, C.orange, C.amber, C.orange, C.magenta])}
    <radialGradient id="moonGlow"><stop offset="0" stop-color="${C.gold}" stop-opacity=".35"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
    <mask id="moonCut"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="1066" cy="70" r="26" fill="#000"/></mask>
    <filter id="neon" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  const css = `
    .tw{animation:tw 3s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
    .win{animation:win 12s steps(1) infinite}@keyframes win{0%,70%{opacity:.85}71%,100%{opacity:.08}}
    .bcn{animation:bcn 1.6s steps(1) infinite}@keyframes bcn{50%{opacity:.15}}
    .cab{animation:cab 6s ease-in-out infinite}@keyframes cab{0%,100%{transform:translateY(0)}45%,55%{transform:translateY(${SEA - eTop - 76}px)}}
    .rf{transform-box:fill-box;transform-origin:center;animation:rf 3s ease-in-out infinite}@keyframes rf{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.5)}}
    @keyframes wv{to{transform:translateX(var(--l))}}@keyframes wr{to{transform:translateX(calc(var(--l) * -1))}}
    .boat{animation:boat 38s linear infinite}@keyframes boat{from{transform:translateX(-80px)}to{transform:translateX(${W + 80}px)}}
    .boat>g{animation:bob 3s ease-in-out infinite}@keyframes bob{0%,100%{transform:translate(0,${SEA + 22}px) rotate(-2deg)}50%{transform:translate(0,${SEA + 25}px) rotate(2deg)}}
    .sign{animation:flick 7s linear infinite}
    @keyframes flick{0%,18%,22%,24%,55%,100%{opacity:1}19%,23%{opacity:.25}56%{opacity:.6}57%{opacity:1}}
    .signIn{animation:signIn 1.8s .3s ease-out backwards}@keyframes signIn{0%{opacity:0}20%{opacity:.8}25%{opacity:.1}45%{opacity:1}50%{opacity:.3}70%,100%{opacity:1}}
    .bell{animation:bcn 3s steps(1) infinite}
    .palm{transform-box:fill-box;transform-origin:bottom center;animation:sway 5s ease-in-out infinite}@keyframes sway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}`;

  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}
    <circle cx="1050" cy="78" r="80" fill="url(#moonGlow)"/>
    <circle cx="1050" cy="78" r="30" fill="${C.gold}" mask="url(#moonCut)" opacity=".95"/>
    <g class="signIn"><g class="sign" filter="url(#neon)"><path d="${sign.d}" fill="url(#signG)"/></g></g>
    ${cliff}${houses}${church}
    ${palm(560, 60, 0.9)}${palm(830, 70)}${palm(1180, 58, 0.85)}
    ${mm}${downtown}${elevador}
    <rect y="${SEA}" width="${W}" height="${H - SEA}" fill="url(#sea)"/>
    <rect y="${SEA}" width="${W}" height="1.5" fill="${C.amber}" opacity=".35"/>
    ${refl}${waves}${saveiro}
    <path d="${credit.d}" fill="${C.muted}"/>
    ${ICON.sparkle(r1(W / 2 - credit.width / 2 - 18), H - 31, 6, C.magenta)}
    ${ICON.sparkle(r1(W / 2 + credit.width / 2 + 18), H - 31, 6, C.magenta)}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="27.5" stroke="${C.line2}" stroke-width="1.5"/>`;

  return svg({ w: W, h: H, title: 'Valeu pela visita!', desc: 'Salvador à noite: Pelourinho, Elevador Lacerda, Mercado Modelo e um saveiro navegando.', defs, css, body });
}
