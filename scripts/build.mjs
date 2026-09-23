// ─────────────────────────────────────────────────────────────
//  Gera todos os SVGs do perfil em /assets
//  uso:  node scripts/build.mjs                 (dados reais, precisa de GITHUB_TOKEN)
//        node scripts/build.mjs --fixture x.json (dados de exemplo, offline)
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { OUT_DIR } from './theme.mjs';
import { fetchData, loadFixture } from './data.mjs';
import { compute } from './compute.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const args = process.argv.slice(2);
const fxIdx = args.indexOf('--fixture');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;

fs.mkdirSync(OUT_DIR, { recursive: true });
const write = (name, content) => {
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, content);
  console.log(`  ✓ ${name.padEnd(28)} ${(content.length / 1024).toFixed(1)} KB`);
};

const components = {};
async function load(name) {
  return (components[name] ||= await import(`./components/${name}.mjs`));
}
const want = (n) => !only || only.includes(n);

const username = process.env.USERNAME || cfg.username;
console.log(`▸ perfil de ${username}`);

let data;
if (fxIdx >= 0) data = loadFixture(args[fxIdx + 1]);
else data = await fetchData(username);
const now = process.env.NOW ? new Date(process.env.NOW) : new Date();
const S = compute(data, cfg, now);
console.log(`▸ ${S.allTime} contribuições no total, ${S.lastYear} no último ano, sequência atual ${S.current}, recorde ${S.longest.len}`);

// estáticos (não dependem de dados)
if (want('hero')) write('hero.svg', (await load('hero')).hero(cfg));
if (want('headings')) {
  const { headings } = await load('headings');
  for (const [file, content] of headings(cfg)) write(file, content);
}
if (want('stack')) write('stack.svg', (await load('stack')).stack(cfg));
if (want('buttons')) {
  const { buttons } = await load('buttons');
  for (const [file, content] of buttons(cfg)) write(file, content);
}
if (want('footer')) write('footer.svg', (await load('footer')).footer(cfg));

// dinâmicos
if (want('terminal')) write('terminal.svg', (await load('terminal')).terminal(cfg, data, S));
if (want('city')) write('skyline.svg', (await load('city')).city(cfg, data, S));
if (want('stats')) write('stats.svg', (await load('stats')).stats(cfg, data, S));
if (want('cards')) {
  const { cards } = await load('cards');
  for (const [file, content] of cards(cfg, data, S)) write(file, content);
}
if (want('readme')) {
  const { readme } = await load('readme');
  const md = readme(cfg, data, S);
  fs.writeFileSync(path.join(root, 'README.md'), md);
  console.log(`  ✓ ${'README.md'.padEnd(28)} ${(md.length / 1024).toFixed(1)} KB`);
}
console.log('▸ pronto');
