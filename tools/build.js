#!/usr/bin/env node
/* אורז את המשחק לקובץ HTML יחיד (dist/masa-hakelim.html) שאפשר לשלוח ולפתוח בלי שרת.
   שימוש: node tools/build.js [נתיב-לקובץ-פרגמנט]
   הפרגמנט (אופציונלי) הוא אותו עמוד בלי doctype/html/head/body, לפרסום בפלטפורמות שעוטפות את העמוד בעצמן. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const html = read('index.html');
const css = read('css/style.css');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => read(m[1])).join('\n');
const fontLink = (html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/) || [''])[0];
const title = (html.match(/<title>[^<]*<\/title>/) || ['<title>מסע הכלים</title>'])[0];
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script src="[^"]+"><\/script>\s*/g, '')
  .trim();
const inlineScript = '<script>\n' + scripts.replace(/<\/script/g, '<\\/script') + '\n</script>';

const single = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}
${fontLink}
<style>
${css}
</style>
</head>
<body>
${body}
${inlineScript}
</body>
</html>
`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/masa-hakelim.html'), single);
console.log('dist/masa-hakelim.html', (single.length / 1024).toFixed(1) + ' KB');

if (process.argv[2]) {
  const fragment = `${title}
<meta name="claude:viewport-fit-sides" content="cover">
${fontLink}
<style>
${css}
</style>
${body}
${inlineScript}
`;
  fs.mkdirSync(path.dirname(process.argv[2]), { recursive: true });
  fs.writeFileSync(process.argv[2], fragment);
  console.log(process.argv[2]);
}
