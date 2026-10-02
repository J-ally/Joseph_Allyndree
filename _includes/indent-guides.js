// Indent guides in ```python code blocks (e.g. teaching/programming-databases/correction-td.md): a thin vertical bar
// at each indentation level, like in VS Code. Rouge has already coloured the code into <span>s, so each group of 4
// leading spaces is wrapped in a <span class="indent-guide"> (styled in stylesheet.css) whose left edge draws the bar;
// the spaces stay in the page, so copying the code is unchanged. A blank line gets empty guides up to the smaller
// level of the lines around it, so the bars run on through the blank lines inside a block.
(function () {
  const UNIT = 4;

  function guide(spaces) {
    const span = document.createElement('span');
    span.className = 'indent-guide';
    span.textContent = spaces;
    return span;
  }

  document.querySelectorAll('.language-python pre code').forEach(function (code) {
    // Number of leading spaces of each line (null for a blank line), and the number of guides of each blank line
    const indents = code.textContent.split('\n').map(function (line) {
      return /\S/.test(line) ? line.match(/^ */)[0].length : null;
    });
    const blankLevels = indents.map(function (indent, i) {
      if (indent !== null) return 0;
      let before = 0, after = 0;
      for (let j = i - 1; j >= 0; j--) if (indents[j] !== null) { before = Math.floor(indents[j] / UNIT); break; }
      for (let j = i + 1; j < indents.length; j++) if (indents[j] !== null) { after = Math.floor(indents[j] / UNIT); break; }
      return Math.min(before, after);
    });

    // A line's leading spaces are at the start of a text node: alone before a <span>, or inside a multi-line string.
    // A line can also start at the end of a text node (Rouge keeps a comment's line break inside its <span>).
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let line = 0, col = 0, atLineStart = true;
    nodes.forEach(function (node) {
      const frag = document.createDocumentFragment();
      node.data.split('\n').forEach(function (text, i) {
        if (i > 0) {
          frag.append('\n');
          line++;
          col = 0;
          atLineStart = true;
        }
        if (atLineStart && indents[line] === null) {
          for (let k = 0; k < blankLevels[line]; k++) frag.append(guide(''));
          atLineStart = false;
        } else if (atLineStart) {
          const spaces = text.match(/^ */)[0].length;
          const groups = col % UNIT === 0 ? Math.floor(spaces / UNIT) : 0;
          for (let k = 0; k < groups; k++) frag.append(guide(' '.repeat(UNIT)));
          if (spaces < text.length) atLineStart = false;
          col += spaces;
          text = text.slice(groups * UNIT);
        }
        if (text) frag.append(text);
      });
      node.replaceWith(frag);
    });
  });
})();
