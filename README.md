This is the source code to Joseph ALLYNDRÉE's public academic website: https://j-ally.github.io/Joseph_Allyndree/.
Forked from the following template repo : https://github.com/jonbarron/website

## Structure

GitHub Pages builds the site with Jekyll on every push to `master`.

- `_layouts/default.html`: the page skeleton shared by every page
- `_layouts/page.html`: the margins for pages written in Markdown (`layout: page`)
- `_includes/banner.html`, `_includes/nav.html`, `_includes/footer.html`: the banner (photo, name, links), the menu and the footer
- `_data/navigation.yml`: the menu entries
- `dither.js`: the animated dithering behind the banner (its colour, dot shape, size, density and opacity are set on the `<header>` in `_includes/banner.html`)
- `index.html`, `research.html`, `publications.html`: the content of each page
- `teaching.md`: the Teaching page, in Markdown (the commented-out sections at the bottom are templates for students and teaching material)

To add a page, copy `research.html` to a new file, change its `title` and content, and add it to `_data/navigation.yml`.

## Preview locally

Needs Ruby 3 (`brew install ruby`), then:

```
bundle install
bundle exec jekyll serve
```

and open http://localhost:4000/Joseph_Allyndree/.
