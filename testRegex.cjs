const fs = require('fs');
const text = fs.readFileSync('public/data/tafsir/elmalili/2.md', 'utf8');
function getAyahTafsir(md, ayahNo) {
    const regex = new RegExp(`(?:^|\\n)\\s*${ayahNo}\\s*[-.]\\s*(.*?)(?=(?:\\n\\s*[0-9]+\\s*[-.]\\s*)|$)`, 's');
    const match = md.match(regex);
    return match ? match[1].trim() : null;
}
console.log('Ayah 2:', getAyahTafsir(text, 2)?.substring(0, 500));
console.log('Ayah 25:', getAyahTafsir(text, 25)?.substring(0, 500));
console.log('Ayah 255:', getAyahTafsir(text, 255)?.substring(0, 500));
