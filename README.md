This is the source code to Joseph ALLYNDRÉE's public academic website: https://j-ally.github.io/Joseph_Allyndree/.
Forked from the following template repo : https://github.com/jonbarron/website

## Structure

GitHub Pages builds the site with Jekyll on every push to `master`.

- `_layouts/default.html`: the page skeleton shared by every page
- `_includes/banner.html`, `_includes/footer.html`: the banner (photo, name, links, menu) and footer
- `_data/navigation.yml`: the menu entries
- `index.html`, `research.html`, `publications.html`: the content of each page

To add a page, copy `research.html` to a new file, change its `title` and content, and add it to `_data/navigation.yml`.

## Preview locally

Needs Ruby 3 (`brew install ruby`), then:

```
bundle install
bundle exec jekyll serve
```

and open http://localhost:4000/Joseph_Allyndree/.
