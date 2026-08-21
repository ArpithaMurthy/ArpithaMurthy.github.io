import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const siteUrl = "https://arpithamurthy.github.io";
const articlesDirectory = path.resolve("src/articles");
const outputDirectory = path.resolve("dist");
const articleFiles = await readdir(articlesDirectory, { recursive: true });
const articleSlugs = articleFiles
  .filter((filename) => filename.endsWith(".md") && !path.basename(filename).startsWith("_"))
  .map((filename) => {
    const basename = path.basename(filename, ".md");
    const sourceName = basename === "index" ? path.basename(path.dirname(filename)) : basename;
    return sourceName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  });

for (const slug of articleSlugs) {
  const articleDirectory = path.join(outputDirectory, "articles", slug);
  await mkdir(articleDirectory, { recursive: true });
  await copyFile(path.join(outputDirectory, "index.html"), path.join(articleDirectory, "index.html"));
}

const urls = [siteUrl, ...articleSlugs.map((slug) => `${siteUrl}/articles/${slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);