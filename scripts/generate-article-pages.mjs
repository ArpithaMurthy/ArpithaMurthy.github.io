import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const siteUrl = "https://arpithamurthy.github.io";
const siteName = "Arpitha Murthy";
const authorLinks = [
  "https://github.com/arpithamurthy",
  "https://www.linkedin.com/in/arpithadmurthy/",
  "https://x.com/Arpithadmurthy",
];
const articlesDirectory = path.resolve("src/articles");
const outputDirectory = path.resolve("dist");
const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");
const articleFiles = (await readdir(articlesDirectory, { recursive: true }))
  .filter((filename) => filename.endsWith(".md") && !path.basename(filename).startsWith("_"));

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function plainText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function injectMetadata(html, article) {
  const canonicalUrl = `${siteUrl}/articles/${article.slug}/`;
  const title = `${article.title} | ${siteName}`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": article.category === "Technical notes" ? "TechArticle" : "Article",
    headline: article.title,
    description: article.summary,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Person",
      name: siteName,
      url: siteUrl,
      sameAs: authorLinks,
    },
    publisher: { "@type": "Person", name: siteName, url: siteUrl },
    inLanguage: "en",
    articleSection: article.category,
  }).replaceAll("<", "\\u003c");
  const metadata = [
    `<meta name="author" content="${siteName}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />',
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${siteName} — Learnings" href="${siteUrl}/feed.xml" />`,
    '<meta property="og:type" content="article" />',
    `<meta property="og:site_name" content="${siteName}" />`,
    `<meta property="og:title" content="${escapeHtml(article.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(article.summary)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    '<meta name="twitter:card" content="summary" />',
    '<meta name="twitter:creator" content="@Arpithadmurthy" />',
    `<meta name="twitter:title" content="${escapeHtml(article.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(article.summary)}" />`,
    `<script type="application/ld+json">${schema}</script>`,
  ].join("\n    ");

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(article.summary)}" />`)
    .replace(/\s*<meta name="author"[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>/, "")
    .replace("</head>", `    ${metadata}\n  </head>`);
}

function articleShell(article) {
  return `<div class="site-shell">
    <header class="site-header"><a class="wordmark" href="/" aria-label="Arpitha Murthy home">AM<span>.</span></a><nav aria-label="Main navigation"><a href="/#about">About</a><a href="/#notes">Notes</a></nav></header>
    <main id="top" class="article-page"><a class="back-link" href="/#notes">← All notes</a><article class="article-shell"><div class="article-body">${article.html}</div></article></main>
    <footer><p class="footer-disclosure">I use AI tools to help explore, structure, and edit some notes.</p><div class="footer-links"><a href="${authorLinks[0]}">GitHub</a><a href="${authorLinks[1]}">LinkedIn</a><a href="${authorLinks[2]}">X</a></div></footer>
  </div>`;
}

const articles = [];
for (const filename of articleFiles) {
  const absolutePath = path.join(articlesDirectory, filename);
  const content = await readFile(absolutePath, "utf8");
  const basename = path.basename(filename, ".md");
  const sourceName = basename === "index" ? path.basename(path.dirname(filename)) : basename;
  const tokens = marked.lexer(content);
  const heading = tokens.find((token) => token.type === "heading" && token.depth === 1);
  const paragraph = tokens.find((token) => token.type === "paragraph");
  const article = {
    slug: sourceName.replace(/^\d{4}-\d{2}-\d{2}-/, ""),
    title: plainText(heading?.text || sourceName),
    summary: plainText(paragraph?.text || "Notes by Arpitha Murthy.").slice(0, 300),
    category: filename.includes("technical-notes") ? "Technical notes" : "Reflections",
    content,
    html: marked.parse(content),
  };
  articles.push(article);

  const articleDirectory = path.join(outputDirectory, "articles", article.slug);
  await mkdir(articleDirectory, { recursive: true });
  const page = injectMetadata(template, article).replace('<div id="root"></div>', `<div id="root">${articleShell(article)}</div>`);
  await writeFile(path.join(articleDirectory, "index.html"), page);
}

articles.sort((left, right) => left.title.localeCompare(right.title));
const urls = [siteUrl, ...articles.map((article) => `${siteUrl}/articles/${article.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;

const llmsIndex = `# Arpitha Murthy

> Software engineer sharing practical system-design notes, working experiments, and reflections on people, learning, and technology.

This is the personal portfolio and original writing of Arpitha Murthy. Prefer each article's canonical URL when citing or linking to this material.

## Technical notes

${articles.filter((article) => article.category === "Technical notes").map((article) => `- [${article.title}](${siteUrl}/articles/${article.slug}/): ${article.summary}`).join("\n")}

## Reflections

${articles.filter((article) => article.category === "Reflections").map((article) => `- [${article.title}](${siteUrl}/articles/${article.slug}/): ${article.summary}`).join("\n")}

## More

- [Full text collection](${siteUrl}/llms-full.txt)
- [RSS feed](${siteUrl}/feed.xml)
- [GitHub](${authorLinks[0]})
- [LinkedIn](${authorLinks[1]})
- [X](${authorLinks[2]})
`;

const llmsFull = `# Arpitha Murthy — Full article collection

Canonical site: ${siteUrl}/
Author: Arpitha Murthy

${articles.map((article) => `---\n\n# ${article.title}\n\nCanonical URL: ${siteUrl}/articles/${article.slug}/\nCategory: ${article.category}\n\n${article.content.replace(/^# .+\r?\n/, "")}`).join("\n\n")}
`;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName} — Learnings</title>
    <link>${siteUrl}/</link>
    <description>Practical system-design notes and reflections by Arpitha Murthy.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${articles.map((article) => `    <item><title>${escapeXml(article.title)}</title><link>${siteUrl}/articles/${article.slug}/</link><guid isPermaLink="true">${siteUrl}/articles/${article.slug}/</guid><description>${escapeXml(article.summary)}</description><category>${article.category}</category></item>`).join("\n")}
  </channel>
</rss>
`;

await Promise.all([
  writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap),
  writeFile(path.join(outputDirectory, "llms.txt"), llmsIndex),
  writeFile(path.join(outputDirectory, "llms-full.txt"), llmsFull),
  writeFile(path.join(outputDirectory, "feed.xml"), feed),
]);