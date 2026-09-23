// Banner de abertura: pôr do sol synthwave na Barra, Farol com feixe girando e nome em cromado
import { C, T, textD, svg, rng, r1, r2, linGrad, ICON } from '../theme.mjs';

export function hero(cfg) {
  const W = 1200, H = 540, HZ = 352; // horizonte
  const R = rng(1549); // ano da fundação de Salvador
  const sunX = 600, sunY = 436, sunR = 206;

  // ── estrelas
  let stars = '';
  for (let i = 0; i < 130; i++) {
    const x = r1(R() * W), y = r1(R() * (HZ - 70));
    const r = r2(0.4 + R() ** 3 * 1.5);
    const o = r2(0.25 + R() * 0.7);
    const tw = R() < 0.45;
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${R() < 0.15 ? C.gold : '#fff'}" opacity="${o}"${tw ? ` class="tw" style="animation-duration:${r1(2 + R() * 4)}s;animation-delay:-${r1(R() * 5)}s"` : ''}/>`;
  }
  const bigStars = [[118, 64], [1080, 96], [890, 40], [330, 250], [880, 240]]
    .map(([x, y], i) => ICON.sparkle(x, y, 7 + (i % 2) * 3, '#fff', ` class="sp" style="animation-delay:-${i * 1.3}s" opacity=".9"`))
    .join('');

  // ── listras do sol (máscara)
  let stripes = '';
  let y = HZ - 92, gap = 2.2;
  while (y < HZ) {
    stripes += `<rect x="${sunX - sunR}" y="${r1(y)}" width="${sunR * 2}" height="${r1(gap)}" fill="#000"/>`;
    y += gap + 9;
    gap += 1.35;
  }

  // ── grade em perspectiva sobre o mar (linhas horizontais "vindo" na sua direção)
  const hLines = [];
  const N = 11, vpY = HZ;
  const yAt = (k) => vpY + 1900 / (N + 1.2 - k) - 1900 / (N + 1.2); // k: 0..N
  let gridCss = '';
  for (let k = 0; k < N; k++) {
    const y0 = r1(yAt(k)), y1 = r1(yAt(k + 1));
    hLines.push(`<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" class="gl g${k}"/>`);
    gridCss += `.g${k}{animation:gm${k} 1.6s linear infinite}@keyframes gm${k}{to{transform:translateY(${r1(y1 - y0)}px)}}`;
  }
  let vLines = '';
  for (let i = -18; i <= 18; i++) {
    const xb = sunX + i * 95;
    vLines += `<line x1="${sunX + i * 5}" y1="${HZ}" x2="${xb}" y2="${H + 40}" class="gl"/>`;
  }

  // ── reflexo do sol na água
  let refl = '';
  for (let i = 0; i < 16; i++) {
    const yy = HZ + 8 + i * 9.5 + i * i * 0.35;
    const w = 330 - i * 16 + (R() - 0.5) * 30;
    const col = i < 5 ? C.amber : i < 10 ? C.orange : C.magenta;
    refl += `<rect x="${r1(sunX - w / 2)}" y="${r1(yy)}" width="${r1(w)}" height="${r1(2.2 + i * 0.12)}" rx="1.5" fill="${col}" opacity="${r2(0.75 - i * 0.04)}" class="rf" style="animation-delay:-${r2(R() * 3)}s;animation-duration:${r2(2.2 + R() * 2)}s"/>`;
  }

  // ── cidade distante (skyline à direita, janelas acesas)
  let city = '';
  let cx = 760;
  while (cx < W + 20) {
    const bw = 14 + R() * 30, bh = 10 + R() ** 2 * 46;
    city += `<rect x="${r1(cx)}" y="${r1(HZ - bh)}" width="${r1(bw)}" height="${r1(bh + 2)}" fill="#1a0a26"/>`;
    for (let wy = HZ - bh + 5; wy < HZ - 4; wy += 7)
      for (let wx = cx + 3; wx < cx + bw - 3; wx += 6)
        if (R() < 0.22) city += `<rect x="${r1(wx)}" y="${r1(wy)}" width="2" height="2.4" fill="${R() < 0.7 ? C.amber : C.cyan}" opacity="${r2(0.35 + R() * 0.5)}"${R() < 0.2 ? ` class="win" style="animation-delay:-${r1(R() * 8)}s"` : ''}/>`;
    cx += bw + 2 + R() * 6;
  }

  // ── Farol da Barra (forte + torre + lanterna)
  const fx = 212; // centro da torre
  const towerTop = 176, towerBase = 318;
  const fort = `
    <path d="M40 ${HZ + 6} L58 312 L74 312 L74 302 L86 302 L86 312 L118 312 L118 302 L130 302 L130 312 L300 312 L300 302 L312 302 L312 312 L344 312 L344 302 L356 302 L356 312 L372 312 L392 ${HZ + 6} Z" fill="url(#rock)"/>
    <path d="M58 312 L372 312" stroke="${C.magenta}" stroke-opacity=".35" stroke-width="1.2"/>
    <path d="M18 ${HZ + 18} L34 ${HZ + 2} L52 ${HZ + 8} L66 ${HZ - 4} L92 ${HZ + 5} L118 ${HZ - 2} L150 ${HZ + 6} L186 ${HZ} L222 ${HZ + 7} L262 ${HZ + 1} L300 ${HZ + 8} L338 ${HZ + 2} L372 ${HZ + 9} L398 ${HZ + 5} L428 ${HZ + 20} Q220 ${HZ + 30} 18 ${HZ + 18} Z" fill="#0a0612"/>
    <path d="M34 ${HZ + 2} L52 ${HZ + 8} L66 ${HZ - 4} L92 ${HZ + 5} L118 ${HZ - 2} L150 ${HZ + 6} L186 ${HZ} L222 ${HZ + 7} L262 ${HZ + 1} L300 ${HZ + 8} L338 ${HZ + 2} L372 ${HZ + 9} L398 ${HZ + 5}" stroke="${C.magenta}" stroke-opacity=".28" stroke-width="1"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${r1(60 + i * 72)}" y="${HZ + 24 + (i % 2) * 6}" width="${28 + (i % 3) * 10}" height="1.6" rx=".8" fill="${C.soft}" opacity=".35" class="rf" style="animation-delay:-${i * 0.7}s"/>`).join('')}
    <rect x="${fx - 2}" y="${HZ + 26}" width="4" height="70" fill="url(#lampRefl)" class="lamp"/>`;
  const tower = `
    <path d="M${fx - 19} ${towerBase} L${fx - 12} ${towerTop + 14} L${fx + 12} ${towerTop + 14} L${fx + 19} ${towerBase} Z" fill="url(#towerG)"/>
    <path d="M${fx - 15.5} ${towerTop + 88} L${fx + 15.5} ${towerTop + 88} L${fx + 16.4} ${towerTop + 100} L${fx - 16.4} ${towerTop + 100} Z" fill="#0b0615" opacity=".55"/>
    <rect x="${fx - 22}" y="${towerTop + 8}" width="44" height="6" rx="1" fill="#1b0f2c"/>
    <rect x="${fx - 10}" y="${towerTop - 12}" width="20" height="20" fill="#1b0f2c"/>
    <rect x="${fx - 7}" y="${towerTop - 9}" width="14" height="14" fill="${C.gold}" class="lamp"/>
    <path d="M${fx - 12} ${towerTop - 12} Q${fx} ${towerTop - 30} ${fx + 12} ${towerTop - 12} Z" fill="#1b0f2c"/>
    <line x1="${fx}" y1="${towerTop - 26}" x2="${fx}" y2="${towerTop - 36}" stroke="#1b0f2c" stroke-width="2"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${fx - 3}" y="${towerTop + 30 + i * 22}" width="6" height="8" rx="1" fill="${C.amber}" opacity=".5"/>`).join('')}`;
  const lampY = towerTop - 2;
  const beam = `
    <g class="beam"><polygon points="${fx},${lampY} ${fx + 1150},${lampY - 120} ${fx + 1150},${lampY + 70}" fill="url(#beamG)"/></g>
    <circle cx="${fx}" cy="${lampY}" r="34" fill="url(#flare)" class="flare"/>`;

  // ── nome em cromado + glitch
  const nameSize = 78;
  const name = textD('display', cfg.heroName, W / 2, 158, nameSize, { anchor: 'middle', tracking: 2 });
  const role = T('uiBold', cfg.roleHero, W / 2, 205, 21, { fill: C.text }, { anchor: 'middle', tracking: 9 });
  const roleW = textD('uiBold', cfg.roleHero, W / 2, 205, 21, { anchor: 'middle', tracking: 9 }).width;

  // ── HUD
  const hud = `
    <g stroke="${C.cyan}" stroke-width="2" stroke-linecap="round" opacity=".75">
      <path d="M28 58V28H58"/><path d="M${W - 58} 28H${W - 28}V58"/><path d="M28 ${H - 58}V${H - 28}H58"/><path d="M${W - 58} ${H - 28}H${W - 28}V${H - 58}"/>
    </g>
    ${T('mono', "SSA // 13°00'S 38°31'W", 72, 48, 13, { fill: C.cyan, opacity: '.8' }, { tracking: 1 })}
    ${T('mono', 'PÔR DO SOL NA BARRA // v2', W - 72, 48, 13, { fill: C.soft, opacity: '.7' }, { anchor: 'end', tracking: 1 })}`;

  const tagline = '> ' + cfg.tagline;
  const tag = textD('mono', tagline, 72, H - 50, 19);
  const status = `
    <g transform="translate(${W - 72} ${H - 56})">
      <circle cx="-150" cy="-6" r="5" fill="${C.mint}" class="pulse"/>
      <circle cx="-150" cy="-6" r="5" fill="none" stroke="${C.mint}" class="ring"/>
      ${T('monoBold', 'ONLINE', -136, 0, 15, { fill: C.mint }, { tracking: 2 })}
      ${T('mono', 'atualizado todo dia', 0, 22, 12, { fill: C.muted }, { anchor: 'end' })}
    </g>`;

  const defs = `
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    <clipPath id="above"><rect width="${W}" height="${HZ}"/></clipPath>
    <clipPath id="below"><rect y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
    ${linGrad('sky', [[0, '#05030b'], [0.42, '#130a29'], [0.7, '#3a0f46'], [0.88, '#8c1f58'], [1, '#e2456a']], { x2: 0, y2: 1 })}
    ${linGrad('sea', [[0, '#240c33'], [0.25, '#12081f'], [1, '#05030a']], { x2: 0, y2: 1 })}
    ${linGrad('sunG', [[0, '#fff3b0'], [0.28, C.amber], [0.55, C.orange], [0.8, C.magenta], [1, '#c02a7a']], { x1: 0, y1: sunY - sunR, x2: 0, y2: HZ, units: 'userSpaceOnUse' })}
    ${linGrad('chrome', [[0, '#ffffff'], [0.4, '#ffd9f4'], [0.49, '#e9a5ff'], [0.5, '#2a0838'], [0.53, C.magenta], [0.78, C.orange], [1, C.gold]], { x2: 0, y2: 1 })}
    ${linGrad('towerG', [[0, '#150b24'], [0.55, '#241236'], [1, '#6d1f4f']])}
    ${linGrad('rock', [[0, '#0e0718'], [1, '#1d0c2a']], { x2: 0, y2: 1 })}
    ${linGrad('beamG', [[0, C.gold, 0.55], [0.35, C.amber, 0.16], [1, C.amber, 0]])}
    ${linGrad('gridFade', [[0, '#fff', 0], [0.12, '#fff', 0.15], [1, '#fff', 1]], { x2: 0, y2: 1 })}
    ${linGrad('lampRefl', [[0, C.gold, 0.7], [1, C.gold, 0]], { x2: 0, y2: 1 })}
    ${linGrad('tagFade', [[0, C.cyan], [1, C.mint]])}
    <radialGradient id="glow"><stop offset="0" stop-color="${C.magenta}" stop-opacity=".55"/><stop offset=".5" stop-color="${C.magenta}" stop-opacity=".18"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></radialGradient>
    <radialGradient id="flare"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="${C.gold}" stop-opacity=".7"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></radialGradient>
    <radialGradient id="vign" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
    <mask id="sunMask"><rect width="${W}" height="${H}" fill="#fff"/>${stripes}</mask>
    <mask id="gridMask"><rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#gridFade)"/></mask>
    <filter id="blur6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
    <clipPath id="slice1"><rect x="0" y="100" width="${W}" height="14" class="sl1"/></clipPath>
    <clipPath id="slice2"><rect x="0" y="128" width="${W}" height="10" class="sl2"/></clipPath>`;

  const css = `
    .tw{animation:tw 3s ease-in-out infinite}
    @keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
    .sp{transform-box:fill-box;transform-origin:center;animation:sp 4s ease-in-out infinite}
    @keyframes sp{0%,100%{transform:scale(.4) rotate(0);opacity:.3}50%{transform:scale(1) rotate(45deg);opacity:1}}
    .sunGroup{animation:rise 2.6s cubic-bezier(.2,.7,.2,1) backwards}
    @keyframes rise{from{transform:translateY(90px)}}
    .glow{transform-box:fill-box;transform-origin:center;animation:gp 5s ease-in-out infinite}
    @keyframes gp{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
    .gl{stroke:${C.magenta};stroke-width:1.2;stroke-opacity:.55}
    .rf{transform-box:fill-box;transform-origin:center;animation:rf 3s ease-in-out infinite}
    @keyframes rf{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.72)}}
    .win{animation:win 9s steps(1) infinite}
    @keyframes win{0%,60%{opacity:.8}61%,100%{opacity:.05}}
    .beam{transform-box:view-box;transform-origin:${fx}px ${lampY}px;mix-blend-mode:screen;animation:beam 7s linear infinite}
    @keyframes beam{
      0%{transform:scaleX(1);opacity:.85} 12.5%{transform:scaleX(.7);opacity:.9} 25%{transform:scaleX(.02);opacity:1}
      37.5%{transform:scaleX(-.7);opacity:.9} 50%{transform:scaleX(-1);opacity:.85} 62.5%{transform:scaleX(-.7);opacity:.35}
      75%{transform:scaleX(-.02);opacity:.1} 87.5%{transform:scaleX(.7);opacity:.35} 100%{transform:scaleX(1);opacity:.85}}
    .flare{transform-box:fill-box;transform-origin:center;animation:flare 7s linear infinite;mix-blend-mode:screen}
    @keyframes flare{0%,100%{transform:scale(.8);opacity:.6}25%{transform:scale(2.4);opacity:1}40%{transform:scale(.9);opacity:.6}75%{transform:scale(.4);opacity:.2}}
    .lamp{animation:lamp 7s linear infinite}
    @keyframes lamp{0%,100%{opacity:.8}25%{opacity:1}75%{opacity:.35}}
    .name{animation:nameIn 1.4s .5s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes nameIn{from{opacity:0;transform:translateY(18px)}}
    .gA,.gB{opacity:0;mix-blend-mode:screen}
    .gA{animation:gA 5s 3s infinite}.gB{animation:gB 5s 3s infinite}
    @keyframes gA{0%,86%,100%{opacity:0;transform:none}87%{opacity:.9;transform:translate(-6px,1px)}89%{opacity:.8;transform:translate(4px,-2px)}91%{opacity:.9;transform:translate(-3px,0)}92%{opacity:0}}
    @keyframes gB{0%,86%,100%{opacity:0;transform:none}87%{opacity:.9;transform:translate(6px,-1px)}89%{opacity:.8;transform:translate(-5px,2px)}91%{opacity:.9;transform:translate(3px,1px)}92%{opacity:0}}
    .s1,.s2{opacity:0}
    .s1{animation:s1 5s 3s infinite}.s2{animation:s2 5s 3s infinite}
    @keyframes s1{0%,87%,93%,100%{opacity:0;transform:none}88%{opacity:1;transform:translateX(22px)}90%{opacity:1;transform:translateX(-14px)}}
    @keyframes s2{0%,88%,94%,100%{opacity:0;transform:none}89%{opacity:1;transform:translateX(-26px)}91%{opacity:1;transform:translateX(10px)}}
    .role{animation:roleIn 1.2s 1.2s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes roleIn{from{clip-path:inset(0 50% 0 50%);opacity:0}}
    .rule{transform-box:fill-box;transform-origin:center;animation:ruleIn 1.2s 1.2s cubic-bezier(.2,.8,.2,1) backwards}
    @keyframes ruleIn{from{transform:scaleX(0)}}
    .tag{animation:type 2.4s 2s steps(${tagline.length}) backwards}
    @keyframes type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
    .cur{animation:curMove 2.4s 2s steps(${tagline.length}) backwards,blink 1s 4.4s steps(1) infinite}
    @keyframes curMove{from{transform:translateX(var(--tw))}to{transform:translateX(0)}}
    @keyframes blink{50%{opacity:0}}
    .pulse{animation:blink 2s steps(1) infinite}
    .ring{transform-box:fill-box;transform-origin:center;animation:ring 2s ease-out infinite}
    @keyframes ring{from{transform:scale(1);opacity:.9;stroke-width:2}to{transform:scale(3.2);opacity:0;stroke-width:.5}}
    .shoot{animation:shoot 9s 4s ease-in infinite;opacity:0}
    @keyframes shoot{0%{opacity:0;transform:translate(0,0)}2%{opacity:1}9%{opacity:0;transform:translate(-420px,150px)}100%{opacity:0;transform:translate(-420px,150px)}}
    ${gridCss}`;

  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}${bigStars}
    <path d="M1050 70 l60 -22" stroke="#fff" stroke-width="2" stroke-linecap="round" class="shoot"/>
    <g class="sunGroup" clip-path="url(#above)">
      <circle cx="${sunX}" cy="${sunY}" r="${sunR * 1.75}" fill="url(#glow)" class="glow"/>
      <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="url(#sunG)" mask="url(#sunMask)"/>
    </g>
    ${city}
    <rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#sea)"/>
    <g mask="url(#gridMask)">${vLines}${hLines.join('')}</g>
    <g class="sunGroup">${refl}</g>
    <rect y="${HZ - 1}" width="${W}" height="2" fill="${C.amber}" opacity=".55"/>
    ${beam}
    ${fort}
    ${tower}
    <rect width="${W}" height="${H}" fill="url(#vign)"/>

    <g class="name">
      <path d="${name.d}" fill="${C.magenta}" filter="url(#blur6)" opacity=".7"/>
      <path d="${name.d}" fill="${C.cyan}" class="gA"/>
      <path d="${name.d}" fill="${C.magenta}" class="gB"/>
      <path d="${name.d}" fill="url(#chrome)" stroke="#fff" stroke-opacity=".55" stroke-width=".8"/>
      <path d="${name.d}" fill="url(#chrome)" clip-path="url(#slice1)" class="s1"/>
      <path d="${name.d}" fill="url(#chrome)" clip-path="url(#slice2)" class="s2"/>
    </g>
    <g class="role">
      <rect x="${r1(W / 2 - roleW / 2 - 22)}" y="182" width="${r1(roleW + 44)}" height="34" rx="17" fill="#0b0716" fill-opacity=".72" stroke="${C.magenta}" stroke-opacity=".6"/>
      ${role}
    </g>
    ${hud}
    <g>
      <path d="${tag.d}" fill="url(#tagFade)" class="tag"/>
      <rect x="${r1(72 + tag.width + 6)}" y="${H - 66}" width="11" height="20" fill="${C.cyan}" class="cur" style="--tw:-${r1(tag.width + 6)}px"/>
    </g>
    ${status}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="27.5" stroke="${C.line2}" stroke-width="1.5"/>`;

  return svg({ w: W, h: H, title: `${cfg.name} — ${cfg.roleHero}`, desc: 'Banner animado: pôr do sol synthwave na Barra, em Salvador, com o Farol da Barra.', defs, css, body });
}
