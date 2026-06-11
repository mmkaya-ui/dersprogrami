const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="\.\/(assets\/index-[^\"]+\.css)">/);
if (cssMatch) {
    const cssPath = path.join(distPath, cssMatch[1]);
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    html = html.replace(cssMatch[0], `<style>${cssContent}</style>`);
    fs.writeFileSync(indexPath, html);
    console.log(`Inlined ${cssMatch[1]} successfully!`);
} else {
    console.log('No CSS found to inline.');
}
