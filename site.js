// Shared banner, menu and footer, used by every page of the site.
//
// To add a new page:
//   1. Copy research.html to e.g. teaching.html and replace its content.
//   2. Add it to PAGES below. It then shows up in the menu on every page.
var PAGES = [
  { title: 'Home', href: 'index.html' },
  { title: 'Research', href: 'research.html' },
  { title: 'Publications', href: 'publications.html' }
];

(function () {
  // "" is the site root (served as index.html); GitHub Pages also serves pages without ".html".
  var current = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');

  var menu = PAGES.map(function (page) {
    var active = page.href.replace(/\.html$/, '') === current ? ' class="active" aria-current="page"' : '';
    return '<a href="' + page.href + '"' + active + '>' + page.title + '</a>';
  }).join('');

  document.currentScript.insertAdjacentHTML('beforebegin', `
    <header class="banner">
      <img src="https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=jqy3zjgAAAAJ&citpid=3"
        alt="profile photo">
      <div>
        <p class="name">Joseph ALLYNDRÉE</p>
        <p class="contact">
          <a href="mailto:joseph.allyndree@inrae.fr">Email</a> &nbsp;/&nbsp;
          <a href="data/Joseph_ALLYNDREE_CV.pdf">CV</a> &nbsp;/&nbsp;
          <a href="https://github.com/J-ally/">Github</a> &nbsp;/&nbsp;
          <a href="https://scholar.google.com/citations?user=jqy3zjgAAAAJ&hl=fr">Google Scholar</a> &nbsp;/&nbsp;
          <a href="https://hal.science/search/index/q/*/authIdHal_s/joseph-allyndree">HAL</a>
        </p>
      </div>
    </header>
    <nav class="site-nav">${menu}</nav>`);

  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertAdjacentHTML('beforeend', `
      <footer class="site-footer">
        Feel free to steal this website's <a href="https://github.com/jonbarron/jonbarron_website">source code</a> which I
        modified. Do not scrape the HTML from this page itself, as it includes analytics tags that you do not want on
        your own website &mdash;
        use the github code instead. Also, consider using <a href="https://leonidk.com/">Leonid Keselman</a>'s <a
          href="https://github.com/leonidk/new_website">Jekyll fork</a> of the original page. <br>
        Website icon from <a href="https://www.flaticon.com/authors/prashanth-rapolu">Prashanth Rapolu</a> <br><br>
        Last updated: <span id="last-updated"></span>
      </footer>`);

    var d = new Date(document.lastModified);
    document.getElementById('last-updated').textContent =
      d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  });
}());
