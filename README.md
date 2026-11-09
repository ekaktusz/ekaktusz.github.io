# ekaktusz.github.io

Source for Csaba Ekart's personal site and blog at
[ekaktusz.github.io](https://ekaktusz.github.io).

The site is built with Jekyll and published through GitHub Pages. Its
text-focused design is adapted from the minimal
[JekyllBear](https://github.com/knhash/jekyllBear) theme, closely following
Bear Blog's default Verdana typography, 800px reading column, automatic
light/dark colors, and an optional CRT screen effect.

## Local development

Use Ruby 3.3.4 and Bundler:

```sh
bundle install
bundle exec jekyll serve
```

Open <http://127.0.0.1:4000/>. Changes to `_config.yml` require restarting the
server.

To create a production-style build and run the same local-target checks used in
CI:

```sh
JEKYLL_ENV=production bundle exec jekyll build
bundle exec ruby scripts/check_site.rb
```

## CRT controls

Visitors can toggle the CRT effect on or off in the header. The default
settings follow the current light or dark theme.

Append `?crt=dev` to any page URL to reveal the full tuner, for example
`http://127.0.0.1:4000/?crt=dev`. Developer adjustments save separately for
light and dark mode in this browser and apply only while the URL has that
parameter. "Reset this mode" restores the current theme's site defaults.

## Repository guide

- `_config.yml` contains site identity, URL, social links, plugins, and Jekyll
  behavior.
- `_layouts/` contains the shared document, page, and post templates.
- `_includes/` contains optional analytics and comments fragments.
- `_posts/` contains articles. Add `published: false` to keep a post as a draft.
- `projects.md` contains the hand-maintained portfolio page.
- `style.scss` contains the complete minimal theme.
- `images/` contains local content and profile imagery.
- `scripts/check_site.rb` checks generated local links and basic image/document
  accessibility requirements.
- `AGENTS.md` contains detailed architecture and change guidance for coding
  agents.

Generated files under `_site/` are deliberately ignored and should not be
committed.

## Publishing content

Create posts as `_posts/YYYY-MM-DD-title.md`:

```yaml
---
layout: post
title: Descriptive Post Title
---
```

Published post URLs follow `/:title/`, so changing a title can change an
existing URL. Store local media in `images/` and give meaningful images useful
alt text.

The `master` branch is the GitHub Pages publishing source. The validation
workflow builds every pull request and every push to `master`; GitHub Pages
handles the actual publication.
