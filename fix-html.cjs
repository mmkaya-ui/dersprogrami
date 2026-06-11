const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const fontsCss = fs.readFileSync('fonts-optional.css', 'utf8');
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, `<style>\n${fontsCss}\n</style>`);
html = html.replace(/<link rel="preload" href="https:\/\/cdnjs\.cloudflare\.com[^>]*font-awesome[^>]*>/, '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">');
html = html.replace(/<noscript><link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com[^>]*font-awesome[^>]*><\/noscript>/, '');
fs.writeFileSync('index.html', html);
console.log('Done!');
