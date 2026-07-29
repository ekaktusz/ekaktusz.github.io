# AGENTS.md

## Project overview

This repository is the source for Csaba Ekart's personal site and blog at
`ekaktusz.github.io`. It is a small Jekyll/GitHub Pages site based on Jekyll Now
v1.2.0, with project-specific styling and JavaScript layered onto the original
theme.

There is no application server. The Ruby/Jekyll environment is declared by
`.ruby-version` and `Gemfile`, while `.github/workflows/site.yml` builds and
validates changes. GitHub Pages publishes the site from the `master` branch.
Source files use Markdown, HTML/Liquid, Sass, YAML, and plain browser-side
JavaScript.

## How the site is assembled

Jekyll reads `_config.yml`, renders pages and posts through the layouts, expands
Liquid includes, compiles `style.scss` and the Sass partials into `style.css`,
and copies static assets such as `images/` and `link-underlines.js`.

The rendering path is:

- `index.html` uses `_layouts/default.html` directly. It contains a custom
  profile introduction and loops over `site.posts` to render the blog index.
- `projects.md` uses `_layouts/page.html`, which wraps its content with
  `_layouts/default.html`.
- Published files in `_posts/` use `_layouts/post.html`, which also wraps
  `_layouts/default.html`.
- `404.md` uses the page layout and has the fixed permalink `/404.html`.
- `about.md` is intentionally unpublished with `published: false`.
- `_layouts/default.html` owns the shared document shell: metadata, Google
  Fonts, header/navigation, content container, footer icons, analytics include,
  and the link-underline script.
- `_includes/meta.html` supplies viewport, description, author, and Open Graph
  metadata. `{% seo %}` in the default layout adds metadata from
  `jekyll-seo-tag`.
- `_includes/svg-icons.html` renders only the social links whose values are set
  under `footer-links` in `_config.yml`.
- `_includes/analytics.html` and `_includes/disqus.html` are conditional. They
  render nothing while `google_analytics` and `disqus` remain empty.

Posts are ordered by Jekyll's post date, newest first. With
`permalink: /:title/`, post URLs are based only on the title slug rather than
the date. The index uses Jekyll's generated `post.excerpt`; individual posts
show the date above and below their content.

## Important files and directories

- `_config.yml`: site identity, social usernames, feature flags, permalink
  behavior, Markdown/highlighting settings, Sass mode, and Jekyll plugins.
  Changing it normally requires restarting a local Jekyll server.
- `_layouts/default.html`: global HTML, header, navigation, footer, fonts, CSS,
  and JavaScript entry points.
- `_layouts/page.html`: generic static-page wrapper.
- `_layouts/post.html`: blog-post wrapper and optional Disqus integration.
- `_includes/`: reusable Liquid fragments for metadata, analytics, comments,
  and social links.
- `index.html`: custom homepage and post listing. Its page-specific profile
  styles are deliberately inline.
- `projects.md`: hand-maintained portfolio content at `/projects/`.
- `about.md`: unpublished legacy/about page.
- `404.md`: custom not-found page.
- `_posts/`: Markdown articles. Several are intentionally drafts represented by
  `published: false`; do not publish them incidentally.
- `style.scss`: main stylesheet and Sass entry point. Its two-line YAML front
  matter is required for Jekyll to process it.
- `_sass/_variables.scss`: colors, font stacks, and the `mobile` mixin
  (`max-width: 640px`).
- `_sass/_reset.scss`: browser reset and global `box-sizing`.
- `_sass/_highlights.scss`: light/dark Rouge syntax-highlighting theme,
  including JetBrains Mono for code.
- `_sass/_svg-icons.scss`: embedded base64 social-icon artwork. It is large;
  edit only when changing the footer icon system.
- `link-underlines.js`: progressive enhancement for animated, multiline text
  link underlines inside `#main`.
- `images/`: source images referenced by pages and posts. Prefer root-relative
  `/images/...` paths for this user site, or prepend `{{ site.baseurl }}` in
  Liquid templates. `images/og.png` is the default social-preview card.
- `README.md`: human-facing setup, structure, and publishing guide.
- `_site/`: ignored generated output. Treat source files as canonical and
  never hand-edit or commit it.
- `scripts/check_site.rb`: validates generated internal targets, image alt
  attributes, and document language after a build.

## Project-specific customizations

Preserve these behaviors unless a task explicitly changes them:

- The design uses Space Grotesk for body/headings, Helvetica Neue for
  navigation, and JetBrains Mono for highlighted code. Fonts are loaded from
  Google Fonts in the default layout.
- Light/dark appearance follows `prefers-color-scheme`; there is no manual
  theme toggle. Dark-mode rules exist in `style.scss`, the homepage's inline
  styles, and `_sass/_highlights.scss`.
- The content column is responsive and capped at 740px. Header elements float
  on wider screens and become centered at the 640px mobile breakpoint.
- The masthead displays the hedgehog emoji with the site name and links to the
  blog and projects pages.
- The homepage has a circular profile photo and introductory copy before the
  post list.
- Links are yellow and animate an underline on hover/focus. CSS provides the
  basic behavior; `link-underlines.js` replaces it for eligible links in
  `#main` with sequential per-line segments so wrapped links animate naturally.
  The script:
  - excludes `read-more`, media-only, form-control, and explicitly skipped
    links;
  - adds `link-underline-enhanced`, `link-underline-skip`, and generated
    `.link-underline-segment` spans;
  - recalculates geometry on `load` and on a 100ms-debounced `resize`;
  - assigns `aria-hidden="true"` to decorative spans.
  Keep the JavaScript class names and CSS selectors synchronized. Avoid putting
  meaningful content inside the generated spans or breaking the no-JavaScript
  CSS fallback.
- Social icons are CSS background images selected by class. Adding a new
  network requires coordinated changes to `_config.yml`,
  `_includes/svg-icons.html`, and `_sass/_svg-icons.scss`.
- Analytics and comments are configuration-driven integrations. Do not insert
  their scripts unconditionally.

## Content conventions

Every Jekyll-processed source begins with YAML front matter delimited by `---`.

For a new published post, use:

```yaml
---
layout: post
title: Descriptive Post Title
---
```

Name it `_posts/YYYY-MM-DD-title.md`. Existing older filenames sometimes use
non-zero-padded dates, but new files should use the conventional padded form.
Add `published: false` for work that must remain a draft. Store local media in
`images/`, use descriptive alt text, and verify all internal and external
links. Because the configured permalink omits dates, changing a published
title can change its URL and break incoming links.

Static pages normally use `layout: page`, a `title`, and an explicit
`permalink`. The homepage is the exception because it owns custom markup and
uses `layout: default`.

Preserve the author's voice when editing prose. Do not silently modernize old
technical articles, publish drafts, replace external project artwork, or alter
personal/profile information beyond the requested scope.

## Development and verification

The repository targets the Ruby version in `.ruby-version` and the GitHub Pages
dependency in `Gemfile`. Install dependencies and run:

```sh
bundle install
bundle exec jekyll serve
```

Then inspect `http://127.0.0.1:4000/`. For a production-style render without a
server, use:

```sh
JEKYLL_ENV=production bundle exec jekyll build
bundle exec ruby scripts/check_site.rb
```

Do not use a globally installed Jekyll executable when Bundler is available.

Verification should match the change:

- For content edits, check front matter, Markdown rendering, image paths,
  internal links, and whether publication status is correct.
- For layout/include/config edits, build when possible and inspect the homepage,
  a post, `/projects/`, and `/404.html`.
- For Sass edits, inspect both light and dark color schemes and a viewport at or
  below 640px. Confirm `style.scss` retains its front matter and imports
  `highlights` and `svg-icons`.
- For underline changes, test a one-line link, a wrapped link, a `read-more`
  link, an image/badge link, keyboard focus, resize behavior, and the
  JavaScript-disabled fallback.
- For footer changes, verify that only configured social links render and that
  their URLs and icons match.

Never commit generated `_site/` changes. GitHub Pages and CI build from source.

## Change discipline

- Keep changes small and consistent with the repository's dependency-free,
  static-site architecture.
- Use Liquid's `site.baseurl` in shared layouts/includes so the theme remains
  relocatable. Root-relative paths are already common in site-specific content
  because this is a GitHub user site with `baseurl: ""`.
- Do not edit minified/compiled CSS in `_site`; edit `style.scss` or `_sass/`.
- Do not add large frameworks for behavior that can be expressed with the
  existing Sass, Liquid, or plain JavaScript.
- Preserve accessibility: semantic headings, useful image alt text, visible
  keyboard focus/underline behavior, and decorative `aria-hidden` elements.
- Check `git status` before and after work. Preserve unrelated user changes and
  do not commit or push unless explicitly asked.
