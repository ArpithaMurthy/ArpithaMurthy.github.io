import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Check, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import { siteConfig } from "./siteConfig";
import "./styles.css";

const navItems = ["About", "Notes"];
const featuredArticleSlugs = ["wellbeing"];
const articleFiles = import.meta.glob("./articles/**/*.md", { query: "?raw", import: "default", eager: true });

const articles = Object.entries(articleFiles)
  .filter(([path]) => !path.split("/").pop().startsWith("_"))
  .map(([path, content]) => {
    const pathParts = path.split("/");
    const filename = pathParts.pop().replace(".md", "");
    const sourceName = filename === "index" ? pathParts.pop() : filename;
    const category = path.includes("/technical-notes/") ? "technical" : "reflections";
    const datePrefix = sourceName.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    const tokens = marked.lexer(content);
    const heading = tokens.find((token) => token.type === "heading" && token.depth === 1);
    const paragraph = tokens.find((token) => token.type === "paragraph");

    return {
      slug: sourceName.replace(/^\d{4}-\d{2}-\d{2}-/, ""),
      category,
      title: heading?.text || sourceName,
      summary: paragraph?.text || "",
      date: datePrefix ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${datePrefix}T00:00:00`)) : "",
      content,
    };
  })
  .sort((first, second) => {
    const firstPriority = featuredArticleSlugs.indexOf(first.slug);
    const secondPriority = featuredArticleSlugs.indexOf(second.slug);
    if (firstPriority !== secondPriority) {
      if (firstPriority === -1) return 1;
      if (secondPriority === -1) return -1;
      return firstPriority - secondPriority;
    }
    return second.date.localeCompare(first.date);
  });

function getArticleSlug() {
  return window.location.pathname.match(/^\/articles\/([^/]+)\/?$/)?.[1] || null;
}

function renderArticle(content) {
  const tokens = marked.lexer(content);
  marked.walkTokens(tokens, (token) => {
    if (token.type === "image" && !/^(https?:)?\/\//.test(token.href)) {
      token.href = `${import.meta.env.BASE_URL}${token.href.replace(/^\//, "")}`;
    }
  });
  return marked.parser(tokens);
}

function useCloudflareAnalytics(token) {
  useEffect(() => {
    if (!token || document.querySelector("script[data-cf-beacon]")) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.dataset.cfBeacon = JSON.stringify({ token });
    document.body.appendChild(script);

    return () => script.remove();
  }, [token]);
}

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const [articleSlug] = useState(getArticleSlug);
  useCloudflareAnalytics(siteConfig.cloudflareAnalyticsToken);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const article = articles.find((item) => item.slug === articleSlug);
    document.title = article ? `${article.title} | ${siteConfig.name}` : `${siteConfig.name} | Learning in public`;
    const description = article?.summary || "Personal notes and learnings from software engineer Arpitha Murthy.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [articleSlug]);

  const selectedArticle = articles.find((article) => article.slug === articleSlug);
  const categoryArticles = selectedArticle ? articles.filter((article) => article.category === selectedArticle.category) : [];
  const selectedArticleIndex = categoryArticles.findIndex((article) => article.slug === articleSlug);
  const previousArticle = categoryArticles.length > 1 ? categoryArticles[(selectedArticleIndex - 1 + categoryArticles.length) % categoryArticles.length] : null;
  const nextArticle = categoryArticles.length > 1 ? categoryArticles[(selectedArticleIndex + 1) % categoryArticles.length] : null;
  const articleGroups = [
    {
      key: "technical",
      title: "Technical notes",
      description: "Things I learn while understanding and building software.",
      articles: articles.filter((article) => article.category === "technical"),
    },
    {
      key: "reflections",
      title: "Reflections",
      description: "Thoughts on people, emotions, philosophy, and growth.",
      articles: articles.filter((article) => article.category === "reflections"),
    },
  ];

  return <div className="site-shell">
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Arpitha Murthy home">AM<span>.</span></a>
      <nav aria-label="Main navigation">{navItems.map((item) => <a key={item} href={`/#${item.toLowerCase()}`}>{item}</a>)}</nav>
      <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle color theme">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
    </header>

    {selectedArticle ? <main id="top" className="article-page"><a className="back-link" href="/#notes">← All notes</a><article className="article-shell">{selectedArticle.date && <p className="article-date">{selectedArticle.date}</p>}<div className="article-body" dangerouslySetInnerHTML={{ __html: renderArticle(selectedArticle.content) }} /><nav className="article-pagination" aria-label="Article navigation">{previousArticle ? <a className="article-pagination-link article-pagination-previous" href={`/articles/${previousArticle.slug}/`} aria-label={`Previous article: ${previousArticle.title}`}><ChevronLeft size={18} aria-hidden="true" /><span><small>Previous</small>{previousArticle.title}</span></a> : <span />}<a className="article-pagination-all" href="/#notes">All notes</a>{nextArticle ? <a className="article-pagination-link article-pagination-next" href={`/articles/${nextArticle.slug}/`} aria-label={`Next article: ${nextArticle.title}`}><span><small>Next</small>{nextArticle.title}</span><ChevronRight size={18} aria-hidden="true" /></a> : <span />}</nav></article></main> : <main id="top">
      <section className="hero section-grid" aria-labelledby="hero-title">
        <div className="hero-copy"><h1 id="hero-title">Hello, I’m <em>Arpitha.</em></h1><p className="hero-intro">I’m a software engineer who enjoys understanding how things work, building along the way, and sharing what I learn.</p><div className="hero-actions"><a className="button button-primary" href={siteConfig.linkedin} target="_blank" rel="noreferrer">Let’s connect <ArrowUpRight size={17} /></a><a className="text-link" href="#notes">See what I’m learning <span>↓</span></a></div></div>
        <div className="hero-aside" aria-label="Personal principles"><div className="aside-index" aria-hidden="true">AM</div><div className="aside-card"><p className="card-label">I try to live by</p><ul className="card-values"><li>Stay curious.</li><li>Build with care.</li><li>Share what I learn.</li></ul></div></div>
      </section>

      <section id="about" className="about section-rule" aria-labelledby="about-title"><div className="about-content"><h2 id="about-title">I’m interested in the space between <span>people, ideas,</span> and <span>technology.</span></h2><div className="about-columns"><p>I like working through unclear problems until I can explain them simply and build something useful from them. Perpetually learning how to do it better.</p><p>Outside work, I’m usually reading a book, listening to a podcast, watching a series, or spending time with family. I also tend to notice the small details that make products easier to use.</p></div></div></section>

      <section id="notes" className="notes section-rule" aria-labelledby="notes-title"><div className="notes-content"><div className="notes-intro"><BookOpen size={21} /><h2 id="notes-title">Learnings</h2><p>I’m making room here for the things I’m figuring out. These are practical notes, useful rabbit holes, and lessons I’d like to remember.</p></div><div className="learning-groups">{articleGroups.map((group) => <section className="learning-group" key={group.key} aria-labelledby={`${group.key}-title`}><div className="group-heading"><h3 id={`${group.key}-title`}>{group.title}</h3><p>{group.description}</p></div><div className="learning-list">{group.articles.length > 0 ? group.articles.map((article) => <a className="learning-note" href={`/articles/${article.slug}/`} key={article.slug}><span>{article.title}</span><ArrowUpRight size={17} /></a>) : <div className="coming-soon"><span>Coming soon</span><Check size={16} /><p>The first note is taking shape.</p></div>}</div></section>)}</div></div></section>

      <section className="connect section-rule" aria-labelledby="connect-title"><p className="eyebrow">Have a thought to share?</p><h2 id="connect-title">Let’s learn something<br /><em>together.</em></h2><a className="button button-primary" href={siteConfig.linkedin} target="_blank" rel="noreferrer">Find me on LinkedIn <ArrowUpRight size={17} /></a></section>
    </main>}

    <footer><p className="footer-disclosure">I use AI tools to help explore, structure, and edit some notes.</p><div className="footer-links"><a href={siteConfig.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a><a href={siteConfig.x} target="_blank" rel="noreferrer">X <ArrowUpRight size={14} /></a></div></footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
