// Terminal "neofetch" com dados reais: digitação, farol em ASCII e status ao vivo
import { C, textWidth, svg, r1, linGrad, ramp, SUNSET, fmtInt, ICON, glyphBank } from '../theme.mjs';
import { relTime } from '../compute.mjs';

const ART = [
  String.raw`    \    .    /    `,
  String.raw`  --   [ * ]   --  `,
  String.raw`    /  |___|  \    `,
  String.raw`       |   |       `,
  String.raw`       |===|       `,
  String.raw`       |   |       `,
  String.raw`       |===|       `,
  String.raw`      /|   |\      `,
  String.raw`     / |===| \     `,
  String.raw`    /__|___|__\    `,
  String.raw`  _[___________]_  `,
  String.raw` /_______________\ `,
];

export function terminal(cfg, data, S) {
  const W = 1200, FS = 17, LH = 28;
  const T = glyphBank();
  const textD = (f, str, x, y, size) => ({ g: T(f, str, x, y, size), width: textWidth(f, str, size) });
  const P = 40; // margem interna
  const typeCss = [];
  let body = '';
  let t = 0.4; // relógio da animação (s)

  const prompt = (y, cmd, at) => {
    const pw = textWidth('monoBold', 'cauã@barra', FS);
    const dir = '~';
    let out = T('monoBold', 'cauã@barra', P, y, FS, { fill: C.magenta });
    out += T('mono', dir, P + pw + 12, y, FS, { fill: C.cyan });
    const cx = P + pw + 12 + textWidth('mono', dir, FS) + 14;
    out += ICON.chevron(cx, y - 6, 5.5, C.amber);
    const cmdX = cx + 20;
    if (cmd) {
      const c = textD('mono', cmd, cmdX, y, FS);
      const id = `ty${typeCss.length}`;
      const dur = Math.max(0.35, cmd.length * 0.055);
      typeCss.push(`.${id}{animation:type ${r1(dur)}s ${r1(at)}s steps(${cmd.length}) backwards}`);
      out += `<g fill="${C.text}" class="${id}">${c.g}</g>`;
      return { svg: `<g class="ln" style="animation-delay:${r1(at - 0.25)}s">${out}</g>`, end: at + dur, cmdX, width: c.width };
    }
    return { svg: `<g class="ln" style="animation-delay:${r1(at)}s">${out}</g>`, end: at, cmdX, width: 0 };
  };

  // ── 1) neofetch
  let y = 96;
  const p1 = prompt(y, 'neofetch --ascii farol-da-barra', t);
  body += p1.svg;
  t = p1.end + 0.3;
  y += 48;

  // arte ASCII (esquerda)
  const artX = P + 8, artLH = 25;
  ART.forEach((line, i) => {
    const col = ramp([C.gold, C.amber, C.orange, C.magenta, C.purple, C.violet], i / (ART.length - 1));
    body += `<g class="ln" style="animation-delay:${r1(t + i * 0.05)}s">${T('monoBold', line, artX, y + 6 + i * artLH, 18, { fill: col })}</g>`;
  });
  // lâmpada piscando por cima do "*"
  const starX = artX + textWidth('monoBold', '  --   [ ', 18) + textWidth('monoBold', '*', 18) / 2;
  body += `<circle cx="${r1(starX)}" cy="${r1(y + 6 + artLH - 6)}" r="9" fill="${C.gold}" class="lamp"/>`;
  // ondas
  const waveY = y + 6 + ART.length * artLH + 4;
  body += `<g class="ln" style="animation-delay:${r1(t + ART.length * 0.05)}s">
    <g class="wA">${T('monoBold', '~^~^~^~^~^~^~^~^~^~', artX, waveY, 18, { fill: C.cyan, opacity: '.8' })}</g>
    <g class="wB">${T('monoBold', '^~^~^~^~^~^~^~^~^~^', artX, waveY, 18, { fill: C.cyan, opacity: '.8' })}</g>
  </g>`;

  // info (direita)
  const ix = 470, kw = 176;
  const title = 'cauã@barra';
  body += `<g class="ln" style="animation-delay:${r1(t)}s">
    ${T('monoBold', 'cauã', ix, y, FS + 2, { fill: C.magenta })}
    ${T('monoBold', '@', ix + textWidth('monoBold', 'cauã', FS + 2), y, FS + 2, { fill: C.text })}
    ${T('monoBold', 'barra', ix + textWidth('monoBold', 'cauã@', FS + 2), y, FS + 2, { fill: C.amber })}
    <rect x="${ix}" y="${y + 12}" width="${r1(textWidth('monoBold', title, FS + 2))}" height="2" fill="url(#sep)"/>
  </g>`;
  const recent = S.recent;
  const info = [
    ['Nome', cfg.name],
    ['Função', cfg.role],
    ['Local', cfg.location],
    ['Formação', cfg.education],
    ['Stack', cfg.stackLine],
    ['Uptime', `${S.uptime} no GitHub`],
    ['Repos', `${S.repoCount} públicos · ${fmtInt(S.stars)} ${S.stars === 1 ? 'estrela' : 'estrelas'}`],
    ['Contribuições', `${fmtInt(S.lastYear)} no último ano · ${fmtInt(S.allTime)} no total`],
    ['Sequência', `${S.current} ${S.current === 1 ? 'dia' : 'dias'} · recorde de ${S.longest.len}`],
    ['Top linguagem', S.topLang],
    ['Último push', recent ? `${recent.name} · ${relTime(recent.pushedAt, S.now)}` : '—'],
    ['Status', cfg.status],
  ];
  let iy = y + 44;
  info.forEach(([k, v], i) => {
    const kc = ramp(SUNSET, i / (info.length - 1));
    const at = r1(t + 0.15 + i * 0.11);
    let val;
    if (k === 'Status') {
      val = `<circle cx="${ix + kw + 7}" cy="${iy - 6}" r="6" fill="${C.mint}" class="pulse"/>
        <circle cx="${ix + kw + 7}" cy="${iy - 6}" r="6" stroke="${C.mint}" class="ring"/>
        ${T('mono', v, ix + kw + 22, iy, FS, { fill: C.mint })}`;
    } else val = T('mono', fit(v, 44), ix + kw, iy, FS, { fill: C.text });
    body += `<g class="ln" style="animation-delay:${at}s">${T('monoBold', k, ix, iy, FS, { fill: kc })}${val}</g>`;
    iy += LH + 2;
  });
  // blocos de cor
  const blocks = [C.night2, C.violet, C.purple, C.magenta, C.pink, C.orange, C.amber, C.cyan];
  body += `<g class="ln" style="animation-delay:${r1(t + 0.2 + info.length * 0.11)}s">${blocks
    .map((c, i) => `<rect x="${ix + i * 34}" y="${iy - 4}" width="30" height="18" rx="3" fill="${c}"${i === 0 ? ` stroke="${C.line2}"` : ''}/>`)
    .join('')}</g>`;
  t = t + 0.5 + info.length * 0.11;

  // ── 2) lema
  y = Math.max(iy, waveY) + 64;
  const p2 = prompt(y, 'echo $LEMA', t + 0.2);
  body += p2.svg;
  y += 36;
  const motto = textD('mono', `"${cfg.motto}"`, P, y, FS);
  typeCss.push(`.motto{animation:type 1.2s ${r1(p2.end + 0.25)}s steps(${cfg.motto.length + 2}) backwards}`);
  body += `<g fill="${C.amber}" class="motto">${motto.g}</g>`;
  y += 48;
  const p3 = prompt(y, '', p2.end + 1.5);
  body += p3.svg;
  body += `<rect x="${r1(p3.cmdX)}" y="${y - 17}" width="11" height="21" fill="${C.cyan}" class="cur" style="animation-delay:${r1(p2.end + 1.5)}s"/>`;

  const H = y + 40;
  const winTitle = T('mono', 'cauã@barra: ~ — zsh — 120×32', W / 2, 28, 14, { fill: C.muted }, { anchor: 'middle' });
  const defs = `${T.defs()}
    <clipPath id="win"><rect width="${W}" height="${H}" rx="22"/></clipPath>
    ${linGrad('bg', [[0, '#0e0a20'], [1, '#08060f']], { x2: 0, y2: 1 })}
    ${linGrad('bar', [[0, '#1a1333'], [1, '#141029']], { x2: 0, y2: 1 })}
    ${linGrad('sep', [C.magenta, C.orange, C.amber])}
    ${linGrad('mottoG', [C.amber, C.orange, C.magenta])}
    ${linGrad('border', [C.violet, C.magenta, C.orange, C.amber], { x1: 0, y1: 0, x2: 1, y2: 1 })}
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.2" fill="#fff" opacity=".035"/></pattern>
    <radialGradient id="vig" cx=".5" cy=".5" r=".7"><stop offset=".65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>`;
  const css = `
    .ln{animation:ln .45s ease-out backwards}
    @keyframes ln{from{opacity:0;transform:translateX(-8px)}}
    @keyframes type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
    ${typeCss.join('\n')}
    .cur{animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    .lamp{animation:lamp 2.4s ease-in-out infinite;mix-blend-mode:screen}
    @keyframes lamp{0%,100%{opacity:.15}50%{opacity:.75}}
    .wA{animation:wA 1.6s steps(1) infinite}.wB{animation:wB 1.6s steps(1) infinite}
    @keyframes wA{50%{opacity:0}}@keyframes wB{0%{opacity:0}50%{opacity:1}}
    .pulse{animation:blink 2s steps(1) infinite}
    .ring{transform-box:fill-box;transform-origin:center;animation:ring 2s ease-out infinite}
    @keyframes ring{from{transform:scale(1);opacity:.9;stroke-width:2}to{transform:scale(3);opacity:0;stroke-width:.4}}
    .scan{animation:scan 8s linear infinite}
    @keyframes scan{from{transform:translateY(-120px)}to{transform:translateY(${H + 40}px)}}`;

  const dots = [C.magenta, C.orange, C.amber].map((c, i) => `<circle cx="${30 + i * 22}" cy="22" r="7" fill="${c}"/>`).join('');
  const full = `
  <g clip-path="url(#win)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="44" fill="url(#bar)"/>
    <rect y="44" width="${W}" height="1" fill="${C.line}"/>
    ${dots}
    ${winTitle}
    ${body}
    <rect y="44" width="${W}" height="${H}" fill="url(#scan)"/>
    <rect y="0" width="${W}" height="90" fill="url(#bar)" opacity=".05" class="scan"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="21" stroke="url(#border)" stroke-width="2" stroke-opacity=".7"/>`;

  return svg({
    w: W, h: H,
    title: 'neofetch — cauã@barra',
    desc: info.map(([k, v]) => `${k}: ${v}`).join(' · '),
    defs, css, body: full,
  });
}

function fit(s, max) {
  s = String(s);
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
