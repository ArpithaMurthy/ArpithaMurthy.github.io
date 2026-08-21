# Article authoring

Each published article lives in its own folder. The folder name becomes the public URL slug.

```text
src/articles/
  technical-notes/
    exploring-example-system/
      index.md
      diagram.js          # Optional
  reflections/
    example-reflection/
      index.md
```

Templates remain at the category level and start with `_`, so the site does not publish them.

## Add an article

1. Create a lowercase, hyphenated folder under `technical-notes` or `reflections`.
2. Copy the category `_template.md` into that folder as `index.md`.
3. Use one `#` heading and make the first paragraph a useful homepage summary.
4. Run `npm run dev`. The article appears at `/articles/<folder-name>/`.

## Add generated diagrams

Add `diagram.js` beside `index.md`. The diagram `slug` controls the generated SVG filenames.

```js
export default {
  slug: "example-system",
  title: "Example system",
  concerns: "Security | accessibility | observability",
  reference: [
    ["Clients"],
    ["Identity and APIs"],
    ["Primary service", "Background workers"],
    ["Data and integrations"],
  ],
  implementation: [
    [["Web client", "React"]],
    [["Application API", "Node.js"]],
    [["Records", "PostgreSQL"], ["Jobs", "Worker queue"]],
  ],
};
```

Reference nodes are capability strings. Implementation nodes are `[capability, technology]` pairs. Omit `reference` or `implementation` when the article needs only one diagram.

Reference generated files from `index.md`:

```html
<div class="article-diagram">
  <img src="/images/diagrams/example-system-reference.svg" alt="Reference architecture for an example system">
</div>

<div class="article-diagram">
  <img src="/images/diagrams/example-system-implementation.svg" alt="One possible implementation of an example system">
</div>
```

Run `npm run diagrams` to regenerate SVGs, or use `npm run dev` or `npm run build`, which regenerate them automatically. Generated SVG files belong in `public/images/diagrams`; do not edit them by hand.
