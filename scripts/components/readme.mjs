// README.md gerado junto com as imagens (assim links e projetos nunca ficam dessincronizados)
import { featuredRepos } from './cards.mjs';
import { SECTIONS } from './headings.mjs';

export function readme(cfg, data, S) {
  const u = cfg.username;
  const L = cfg.links;
  const repos = featuredRepos(cfg, data);
  const h = (i) => `<img src="./assets/h${SECTIONS[i][0]}.svg" width="100%" alt="${SECTIONS[i][0]} // ${SECTIONS[i][1]} — ${SECTIONS[i][2]}"/>`;
  const card = (r, i) => `<a href="https://github.com/${u}/${r.name}"><img src="./assets/card-${i + 1}.svg" width="49%" alt="${r.name}"/></a>`;

  return `<!--
  ⚡ Este README é GERADO AUTOMATICAMENTE por scripts/build.mjs (GitHub Actions, todo dia às 03:00 de Salvador).
  Para mudar textos, projetos em destaque, links ou a stack, edite o config.json — não este arquivo.
-->

<div align="center">

<img src="./assets/hero.svg" width="100%" alt="${cfg.name} — ${cfg.roleHero}"/>

<a href="${L.linkedin}"><img src="./assets/btn-linkedin.svg" width="32%" alt="LinkedIn"/></a>
<a href="${L.instagram}"><img src="./assets/btn-instagram.svg" width="32%" alt="Instagram"/></a>
<a href="${L.email}"><img src="./assets/btn-email.svg" width="32%" alt="E-mail"/></a>

<br/><br/>

${h(0)}

<img src="./assets/terminal.svg" width="100%" alt="neofetch: ${cfg.name}, ${cfg.role} em ${cfg.location}"/>

<br/><br/>

${h(1)}

<img src="./assets/stack.svg" width="100%" alt="Stack: ${cfg.stack.map((g) => g.items.map((i) => i[1]).join(', ')).join(' · ')}"/>

<br/><br/>

${h(2)}

${repos.map(card).join('\n')}

<br/><br/>

${h(3)}

<img src="./assets/skyline.svg" width="100%" alt="Skyline 3D de contribuições do último ano"/>

<br/><br/>

${h(4)}

<img src="./assets/stats.svg" width="100%" alt="Estatísticas do GitHub"/>

<br/><br/>

${h(5)}

<img src="https://raw.githubusercontent.com/${u}/${u}/output/snake.svg" width="100%" alt="Cobrinha comendo o gráfico de contribuições"/>

<br/><br/>

<img src="./assets/footer.svg" width="100%" alt="Valeu pela visita! Salvador à noite."/>

<br/>

<img src="https://komarev.com/ghpvc/?username=${u}&style=flat-square&color=ff2e88&label=visitas" alt="visitas"/>

</div>
`;
}
