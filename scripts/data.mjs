// ─────────────────────────────────────────────────────────────
//  Coleta de dados do GitHub (GraphQL) → modelo normalizado
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs';

const API = process.env.GITHUB_GRAPHQL_URL || 'https://api.github.com/graphql';

async function gql(query, variables) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN não definido');
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-generator' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const Q_USER = `query($login:String!){
  user(login:$login){
    login name createdAt
    followers{totalCount} following{totalCount}
    contributionsCollection{ contributionYears
      totalCommitContributions totalPullRequestContributions totalIssueContributions
      totalPullRequestReviewContributions totalRepositoryContributions restrictedContributionsCount }
    pinnedItems(first:6, types:REPOSITORY){ nodes{ ... on Repository { name } } }
    repositories(first:100, ownerAffiliations:OWNER, orderBy:{field:PUSHED_AT, direction:DESC}){
      totalCount
      nodes{ name description url isFork isArchived stargazerCount forkCount pushedAt createdAt
        primaryLanguage{ name color }
        languages(first:12, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name color } } } }
    }
  }
}`;

const Q_CAL = `query($login:String!, $from:DateTime!, $to:DateTime!){
  user(login:$login){ contributionsCollection(from:$from, to:$to){
    contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } } } }
}`;

export async function fetchData(login) {
  const d = await gql(Q_USER, { login });
  const u = d.user;
  const now = new Date();
  const days = {};
  const years = [...u.contributionsCollection.contributionYears].sort();
  const createdYear = new Date(u.createdAt).getUTCFullYear();
  if (!years.includes(createdYear)) years.unshift(createdYear);
  for (const y of years) {
    const from = new Date(Date.UTC(y, 0, 1));
    let to = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
    if (to > now) to = now;
    if (from > now) continue;
    const c = await gql(Q_CAL, { login, from: from.toISOString(), to: to.toISOString() });
    for (const w of c.user.contributionsCollection.contributionCalendar.weeks)
      for (const day of w.contributionDays) days[day.date] = day.contributionCount;
  }
  // janela "último ano" usada pelo GitHub (rolling) para os totais
  const cc = u.contributionsCollection;
  return normalize({
    user: {
      login: u.login,
      name: u.name,
      createdAt: u.createdAt,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
    },
    days,
    totals: {
      commits: cc.totalCommitContributions,
      prs: cc.totalPullRequestContributions,
      issues: cc.totalIssueContributions,
      reviews: cc.totalPullRequestReviewContributions,
      reposCreated: cc.totalRepositoryContributions,
      private: cc.restrictedContributionsCount,
    },
    pinned: u.pinnedItems.nodes.map((n) => n.name),
    repos: u.repositories.nodes.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      fork: r.isFork,
      archived: r.isArchived,
      stars: r.stargazerCount,
      forks: r.forkCount,
      pushedAt: r.pushedAt,
      createdAt: r.createdAt,
      language: r.primaryLanguage?.name || null,
      languages: r.languages.edges.map((e) => ({ name: e.node.name, color: e.node.color, size: e.size })),
    })),
  });
}

export function loadFixture(file) {
  return normalize(JSON.parse(fs.readFileSync(file, 'utf8')));
}

function normalize(raw) {
  const dates = Object.keys(raw.days).sort();
  return { ...raw, calendar: dates.map((date) => ({ date, count: raw.days[date] })) };
}
