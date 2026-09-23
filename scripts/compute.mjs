// ─────────────────────────────────────────────────────────────
//  Métricas derivadas: sequências, janela de 53 semanas, linguagens
// ─────────────────────────────────────────────────────────────
import { MONTHS_PT, WEEKDAYS_PT } from './theme.mjs';

const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const parse = (s) => new Date(s + 'T00:00:00Z');

export function todayIn(tz, now = new Date()) {
  // data local (YYYY-MM-DD) no fuso escolhido
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function fmtDate(s, { year = true } = {}) {
  const d = parse(s);
  return `${d.getUTCDate()} ${MONTHS_PT[d.getUTCMonth()]}${year ? ' ' + d.getUTCFullYear() : ''}`;
}

export function relTime(fromIso, now = new Date()) {
  const diff = Math.max(0, now - new Date(fromIso));
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (m < 60) return m <= 1 ? 'agora mesmo' : `há ${m} min`;
  if (h < 24) return h === 1 ? 'há 1 hora' : `há ${h} horas`;
  if (d < 30) return d === 1 ? 'ontem' : `há ${d} dias`;
  const mo = Math.floor(d / 30.44);
  if (mo < 12) return mo === 1 ? 'há 1 mês' : `há ${mo} meses`;
  const y = Math.floor(mo / 12);
  return y === 1 ? 'há 1 ano' : `há ${y} anos`;
}

export function uptime(fromIso, now = new Date()) {
  const a = new Date(fromIso);
  let months = (now.getUTCFullYear() - a.getUTCFullYear()) * 12 + (now.getUTCMonth() - a.getUTCMonth());
  if (now.getUTCDate() < a.getUTCDate()) months--;
  const y = Math.floor(months / 12), mo = months % 12;
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? 'ano' : 'anos'}`);
  if (mo) parts.push(`${mo} ${mo === 1 ? 'mês' : 'meses'}`);
  if (!parts.length) {
    const days = Math.floor((now - a) / DAY);
    parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
  }
  return parts.join(' e ');
}

export function compute(data, cfg, now = new Date()) {
  const today = todayIn(cfg.timezone || 'UTC', now);
  const map = new Map(data.calendar.map((c) => [c.date, c.count]));
  const count = (s) => map.get(s) || 0;

  // ── janela de 53 semanas (domingo → sábado), terminando hoje
  const t = parse(today);
  const start = new Date(t.getTime() - (52 * 7 + t.getUTCDay()) * DAY);
  const weeks = [];
  for (let d = new Date(start); d <= t; d = new Date(d.getTime() + DAY)) {
    const wi = Math.floor((d - start) / DAY / 7);
    (weeks[wi] ||= []).push({ date: iso(d), count: count(iso(d)), weekday: d.getUTCDay() });
  }
  const yearDays = weeks.flat();
  const lastYear = yearDays.reduce((s, d) => s + d.count, 0);

  // ── totais e sequências (todo o histórico até hoje)
  const allDays = data.calendar.filter((c) => c.date <= today);
  const allTime = allDays.reduce((s, d) => s + d.count, 0);
  let longest = { len: 0, from: null, to: null }, run = 0, runFrom = null;
  for (const d of allDays) {
    if (d.count > 0) {
      if (!run) runFrom = d.date;
      run++;
      if (run > longest.len) longest = { len: run, from: runFrom, to: d.date };
    } else run = 0;
  }
  // sequência atual: se hoje ainda está zerado, conta até ontem
  let cur = 0;
  let cursor = parse(today);
  if (!count(today)) cursor = new Date(cursor.getTime() - DAY);
  while (count(iso(cursor)) > 0) {
    cur++;
    cursor = new Date(cursor.getTime() - DAY);
  }

  let best = { date: null, count: 0 };
  for (const d of allDays) if (d.count > best.count) best = d;
  let bestYear = { date: null, count: 0 };
  for (const d of yearDays) if (d.count > bestYear.count) bestYear = d;

  const byWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (const d of allDays) byWeekday[parse(d.date).getUTCDay()] += d.count;
  const favWeekday = byWeekday.indexOf(Math.max(...byWeekday));

  const last7 = yearDays.slice(-7).reduce((s, d) => s + d.count, 0);
  const last30 = yearDays.slice(-30).reduce((s, d) => s + d.count, 0);
  const activeDays = allDays.filter((d) => d.count > 0).length;

  // ── repositórios e linguagens
  const excl = new Set(cfg.excludeRepos || []);
  const exclLang = new Set(cfg.excludeLanguages || []);
  const repos = data.repos.filter((r) => !r.fork);
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  const forks = repos.reduce((s, r) => s + r.forks, 0);
  const langBytes = {}, langShare = {}, langColor = {};
  for (const r of repos) {
    if (excl.has(r.name)) continue;
    const ls = r.languages.filter((l) => !exclLang.has(l.name));
    const tot = ls.reduce((s, l) => s + l.size, 0);
    for (const l of ls) {
      langBytes[l.name] = (langBytes[l.name] || 0) + l.size;
      langShare[l.name] = (langShare[l.name] || 0) + (tot ? l.size / tot : 0);
      langColor[l.name] = l.color;
    }
  }
  const sumB = Object.values(langBytes).reduce((a, b) => a + b, 0) || 1;
  const sumS = Object.values(langShare).reduce((a, b) => a + b, 0) || 1;
  // mistura 50/50: volume de código + presença em projetos (evita que um arquivo gigante domine)
  const languages = Object.keys(langBytes)
    .map((name) => ({ name, color: langColor[name], score: 0.5 * (langBytes[name] / sumB) + 0.5 * (langShare[name] / sumS) }))
    .sort((a, b) => b.score - a.score);
  const topLang = languages[0]?.name || '—';
  const langRepos = {};
  for (const r of repos) if (!excl.has(r.name)) for (const l of r.languages) if (!exclLang.has(l.name)) langRepos[l.name] = (langRepos[l.name] || 0) + 1;
  const byBytes = Object.entries(langBytes).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const bySpread = Object.entries(langRepos).sort((a, b) => b[1] - a[1])[0] || ['—', 0];

  const recent = data.repos
    .filter((r) => !excl.has(r.name) && !r.fork)
    .sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt))[0];

  return {
    now, today, weeks, yearDays, lastYear, allTime, activeDays,
    longest, current: cur, best, bestYear, favWeekday, favWeekdayName: WEEKDAYS_PT[favWeekday], byWeekday,
    last7, last30, repos, repoCount: repos.length, stars, forks, languages, topLang, byBytes, bySpread, recent,
    uptime: uptime(data.user.createdAt, now),
    since: data.user.createdAt.slice(0, 10),
  };
}
