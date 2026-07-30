# AGENTS.md

## Project overview

This repository is the source for Csaba Ekart's personal site and blog at
`ekaktusz.github.io`. It is a small Jekyll/GitHub Pages site with a custom,
text-focused theme adapted from the design principles of
[JekyllBear](https://github.com/knhash/jekyllBear).

There is no application server or client-side application. The Ruby/Jekyll
environment is declared by `.ruby-version` and `Gemfile`.
`.github/workflows/site.yml` builds and validates changes, and GitHub Pages
publishes the `master` branch.

## How the site is assembled

Jekyll reads `_config.yml`, renders pages and posts through Liquid layouts,
expands includes, compiles `style.scss` to `style.css`, and copies static
assets.

- `index.html` uses `_layouts/default.html` and renders the short introduction
  and date/title post list.
- `projects.md` uses `_layouts/page.html` and remains a hand-maintained
  portfolio page.
- Published files in `_posts/` use `_layouts/post.html`.
- `404.md` uses the page layout and publishes at `/404.html`.
- `about.md` is intentionally unpublished with `published: false`.
- `_layouts/default.html` owns the document shell, metadata, text header and
  navigation, content region, and optional analytics.
- `_layouts/page.html` adds a page title around static-page content.
- `_layouts/post.html` adds the post title, publication date, previous/next
  navigation, and optional Disqus comments.
- `{% seo %}` in the default layout supplies description, canonical, social,
  and structured metadata.
- `_includes/analytics.html` and `_includes/disqus.html` render nothing while
  their corresponding `_config.yml` values are empty.

Posts are ordered newest first. The configured `/:title/` permalink means
renaming a published post title can change its URL.

## Important files

- `_config.yml`: site identity, canonical URL, social profiles, optional
  integrations, Markdown/highlighting settings, Sass output, and plugins.
- `style.scss`: the entire visual system. Its two-line YAML front matter is
  required for Jekyll compilation.
- `_layouts/default.html`: shared HTML shell and navigation.
- `_layouts/page.html`: static-page wrapper.
- `_layouts/post.html`: blog-post wrapper.
- `index.html`: homepage introduction and post list.
- `projects.md`: minimal text-first portfolio content at `/projects/`.
- `_posts/`: Markdown articles. Several intentionally use
  `published: false`; never publish them incidentally.
- `images/`: local post, project, profile, error, and social-preview images.
- `scripts/check_site.rb`: validates generated internal targets, image alt
  attributes, and document language.
- `_site/`: ignored generated output. Never hand-edit or commit it.

## Theme principles

Preserve these unless a task explicitly requests a different direction:

- The experience is deliberately minimal and text-first, inspired by the Bear
  Blog/JekyllBear aesthetic.
- The site follows Bear Blog's default 800px column with 20px page padding.
- Typography follows Bear Blog's default `Verdana, sans-serif` stack at a 16px
  base size. Code uses the native monospace stack. Do not add web-font requests
  without a clear need.
- Rouge code blocks use a compact GitHub-inspired token palette, with separate
  light/dark variables in `style.scss`. Keep token contrast, horizontal
  overflow, and the smaller code scale intact.
- Light/dark colors follow `prefers-color-scheme`; there is no theme toggle.
- Dark mode uses a neutral charcoal/gray palette rather than Bear's default
  teal, with subdued blue-gray links.
- Links use Bear Blog's blue/purple colors and gain an underline on hover.
  There is no JavaScript enhancement or animated decoration.
- The header uses the `龴ↀ◡ↀ龴` mark with the site title, description, Blog,
  and Projects. About and Archive are intentionally absent.
- There is no footer. Lowercase contact links live directly below the homepage
  introduction.
- The homepage is a short introduction and contact row followed by a compact
  date/title list.
- Projects use simple editorial sections: heading, muted metadata, description,
  and text links. Do not turn them into cards, badges, or structured data unless
  explicitly requested.
- Accessibility is part of the minimal design: semantic landmarks, a skip
  link, visible focus outlines, useful alt text, responsive overflow handling,
  and readable contrast.
- Analytics and comments are configuration-driven. Do not load them
  unconditionally.

## Content conventions

Every Jekyll-processed source begins with YAML front matter.

New posts use:

```yaml
---
layout: post
title: Descriptive Post Title
---
```

Name posts `_posts/YYYY-MM-DD-title.md`; use padded dates for new files. Add
`published: false` for drafts. Store local media in `images/`, add descriptive
alt text, and verify links.

Static pages normally use `layout: page`, `title`, and an explicit `permalink`.
The homepage is the exception because it uses `layout: default`.

Preserve the author's voice. Do not silently modernize old technical articles,
publish drafts, alter personal information, or rewrite project history beyond
the requested scope.

## Development and verification

Install and run through Bundler:

```sh
bundle install
bundle exec jekyll serve
```

Preview at `http://127.0.0.1:4000/`. Restart the server after `_config.yml`
changes.

Production verification:

```sh
JEKYLL_ENV=production bundle exec jekyll build
bundle exec ruby scripts/check_site.rb
```

- For content edits, check front matter, publication status, Markdown, images,
  and links.
- For layout/config edits, inspect the homepage, one post, `/projects/`, and
  `/404.html`.
- For CSS edits, inspect light and dark schemes, narrow/mobile widths, long
  code blocks, project banners/badges, and keyboard focus.
- Keep `style.scss` dependency-free and retain its front matter.
- Never commit generated `_site/` output.

## Change discipline

- Keep changes small and compatible with GitHub Pages.
- Use `site.baseurl` in shared templates; root-relative image paths are common
  in site-specific Markdown because `baseurl` is empty.
- Prefer semantic HTML and CSS over scripts or large dependencies.
- Preserve unrelated user changes and do not commit or push unless explicitly
  asked.
