// src/utils/markdownParser.js

export const parseMarkdown = (markdown) => {
  let html = markdown;
  const codeBlocks = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang: lang || "", code: code.trim() });
    return `___CODEBLOCK_${index}___`;
  });
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(code);
    return `___INLINECODE_${index}___`;
  });
  const lines = html.split("\n");
  const processedLines = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("|") &&
      lines[i + 1].includes("-")
    ) {
      let tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].includes("|")) {
        tableLines.push(lines[j]);
        j++;
      }
      if (tableLines.length >= 2) {
        let table = "<table>\n<thead>\n<tr>\n";
        const headers = tableLines[0]
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h);
        headers.forEach((header) => {
          table += `<th>${header}</th>\n`;
        });
        table += "</tr>\n</thead>\n<tbody>\n";
        for (let k = 2; k < tableLines.length; k++) {
          const cells = tableLines[k]
            .split("|")
            .map((c) => c.trim())
            .filter((c) => c);
          if (cells.length > 0) {
            table += "<tr>\n";
            cells.forEach((cell) => {
              table += `<td>${cell}</td>\n`;
            });
            table += "</tr>\n";
          }
        }
        table += "</tbody>\n</table>";
        processedLines.push(`<div class="table-wrapper">${table}</div>`);
        i = j;
        continue;
      }
    }
    processedLines.push(line);
    i++;
  }
  html = processedLines.join("\n");
  html = html
    .replace(/^#{6} (.*$)/gim, "<h6>$1</h6>")
    .replace(/^#{5} (.*$)/gim, "<h5>$1</h5>")
    .replace(/^#{4} (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^---$/gim, "<hr>")
    .replace(/^\s*\- (.*$)/gim, "<li>$1</li>")
    .replace(/^\s*\* (.*$)/gim, "<li>$1</li>")
    .replace(/^\s*\d+\. (.*$)/gim, "<li>$1</li>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/⇒/g, "→")
    .replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";
  html = html
    .replace(/<p>(<h[1-6]>)/g, "$1")
    .replace(/(<\/h[1-6]>)<\/p>/g, "$1");
  html = html
    .replace(/<p>(<blockquote>)/g, "$1")
    .replace(/(<\/blockquote>)<\/p>/g, "$1");
  html = html
    .replace(/<p>(<hr>)<\/p>/g, "$1")
    .replace(/<p>(<table)/g, "$1")
    .replace(/(<\/table>)<\/p>/g, "$1");
  html = html.replace(/<p><\/p>/g, "");
  html = html
    .replace(/<p>(<li>)/g, "<ul>$1")
    .replace(/(<\/li>)<\/p>/g, "$1</ul>");
  html = html.replace(/(<\/li>)<br>(<li>)/g, "$1$2").replace(/<\/ul><ul>/g, "");
  html = html.replace(/___CODEBLOCK_(\d+)___/g, (match, index) => {
    const { lang, code } = codeBlocks[parseInt(index)];
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    let codeClassName = lang ? `language-${lang}` : "language-plaintext";
    return `<pre><code class="${codeClassName}">${escapedCode}</code></pre>`;
  });
  html = html.replace(/___INLINECODE_(\d+)___/g, (match, index) => {
    const code = inlineCodes[parseInt(index)];
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return `<code>${escaped}</code>`;
  });
  return html;
};
