import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Check, Moon, Sun } from "lucide-react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import { siteConfig } from "./siteConfig";
import "./styles.css";

const navItems = ["About", "Approach", "Notes"];
const articleFiles = import.meta.glob("./articles/*.md", { query: "?raw", import: "default", eager: true });

const articles = Object.entries(articleFiles)
  .filter(([path]) => !path.split("/").pop().startsWith("_"))
  .map(([path, content]) => {
    const filename = path.split("/").pop().replace(".md", "");
    const datePrefix = filename.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    const tokens = marked.lexer(content);
    const heading = tokens.find((token) => token.type === "heading" && token.depth === 1);
    const paragraph = tokens.find((token) => token.type === "paragraph");

    return {
      slug: filename.replace(/^\d{4}-\d{2}-\d{2}-/, ""),
      title: heading?.text || filename,
      summary: paragraph?.text || "",
      date: datePrefix ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${datePrefix}T00:00:00`)) : "",
      content,
    };
  })
  .sort((first, second) => second.date.localeCompare(first.date));

function getArticleSlug() {
  return window.location.hash.match(/^#\/articles\/(.+)$/)?.[1] || null;
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
  const [articleSlug, setArticleSlug] = useState(getArticleSlug);
  useCloudflareAnalytics(siteConfig.cloudflareAnalyticsToken);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const handleRouteChange = () => setArticleSlug(getArticleSlug());
    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  const selectedArticle = articles.find((article) => article.slug === articleSlug);

  return <div className="site-shell">
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Arpitha Murthy home">AM<span>.</span></a>
      <nav aria-label="Main navigation">{navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>)}</nav>
      <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle color theme">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
    </header>

    {selectedArticle ? <main id="top" className="article-page"><a className="back-link" href="#notes">← All notes</a><article className="article-shell"><p className="article-date">{selectedArticle.date}</p><div className="article-body" dangerouslySetInnerHTML={{ __html: renderArticle(selectedArticle.content) }} /></article></main> : <main id="top">
      <section className="hero section-grid" aria-labelledby="hero-title">
        <div className="hero-copy"><h1 id="hero-title">Hello, I’m <em>Arpitha.</em><br />I’m learning to understand some topics and share a my view.</h1><p className="hero-intro">I’m a software engineer who enjoys continuous learning, writing down what helps, and sharing it with others.</p><div className="hero-actions"><a className="button button-primary" href={siteConfig.linkedin} target="_blank" rel="noreferrer">Let’s connect <ArrowUpRight size={17} /></a><a className="text-link" href="#notes">See what I’m learning <span>↓</span></a></div></div>
        <div className="hero-aside" aria-label="Personal principles"><div className="aside-index" aria-hidden="true">AM</div><div className="aside-card"><p className="card-label">I try to live by</p><ul className="card-values"><li>Stay curious.</li><li>Build with care.</li><li>Share what I learn.</li></ul></div><span className="side-caption">01 / INTRO</span></div>
      </section>

      <section id="about" className="about section-grid section-rule" aria-labelledby="about-title"><div className="section-kicker"><span>01</span><span>About</span></div><div className="about-content"><h2 id="about-title">I’m interested in the space between <span>people, ideas,</span> and technology.</h2><div className="about-columns"><p>I like working through unclear problems until I can explain them simply and build something useful from them. I’m still learning how to do that well.</p><p>Outside work, I’m usually reading a book, listening to a podcast, watching a series, or spending time with family. I also tend to notice the small details that make products easier to use.</p></div></div></section>

      <section id="approach" className="approach section-grid section-rule" aria-labelledby="approach-title"><div className="section-kicker"><span>02</span><span>Approach</span></div><div className="approach-content"><div className="approach-heading"><h2 id="approach-title">How I like to work</h2><p>Not a process carved in stone — more like a few principles I return to.</p></div><div className="principles"><article><span className="principle-number">01</span><h3>Start with why</h3><p>Good solutions begin with a clear understanding of the people and problem behind the brief.</p></article><article><span className="principle-number">02</span><h3>Make it tangible</h3><p>Small experiments and honest feedback beat long stretches of guessing what might work.</p></article><article><span className="principle-number">03</span><h3>Leave it better</h3><p>Whether it’s code, documentation, or a conversation, I try to make the next step easier.</p></article></div></div></section>

      <section id="notes" className="notes section-grid section-rule" aria-labelledby="notes-title"><div className="section-kicker"><span>03</span><span>Notes</span></div><div className="notes-content"><div className="notes-intro"><BookOpen size={21} /><h2 id="notes-title">Learning in public</h2><p>I’m making room here for the things I’m figuring out — practical notes, useful rabbit holes, and lessons I’d like to remember.</p></div><div className="learning-list">{articles.length > 0 ? articles.map((article) => <article className="learning-note" key={article.slug}><span>{article.date}</span><h3>{article.title}</h3><p>{article.summary}</p><a href={`#/articles/${article.slug}`}>Read note <ArrowUpRight size={15} /></a></article>) : <div className="coming-soon"><span>Coming soon</span><Check size={16} /><p>The first note is taking shape.</p></div>}</div></div></section>

      <section className="connect section-rule" aria-labelledby="connect-title"><p className="eyebrow">Have a thought to share?</p><h2 id="connect-title">Let’s learn something<br /><em>together.</em></h2><a className="button button-primary" href={siteConfig.linkedin} target="_blank" rel="noreferrer">Find me on LinkedIn <ArrowUpRight size={17} /></a></section>
    </main>}

    <footer><span className="footer-line" /><a href={siteConfig.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a></footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
