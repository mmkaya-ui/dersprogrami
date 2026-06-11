const fs = require('fs');

function extractAyahTafsir(surahNo, ayahNo) {
    try {
        const md = fs.readFileSync(`public/data/tafsir/elmalili/${surahNo}.md`, 'utf8');
        // Elmalılı metninde Ayetler "X- " veya "X. " veya "X -" şeklinde başlar.
        // Genellikle bir sonraki ayet numarasına kadar olan kısmı almalıyız.
        // Bazen "1-5. Ayetler:" gibi gruplamalar da olur.

        // Basit bir yaklaşımla, aradığımız ayet numarasını bulalım
        // Örn: "2-" veya "2 - " veya "2. Ayet"
        const regexStr = `(?:^|\\n)\\s*(?:${ayahNo})\\s*[-.]\\s*(.*?)(?=(?:\\n\\s*[0-9]+\\s*[-.]\\s*)|$)`;
        const regex = new RegExp(regexStr, 's');
        const match = md.match(regex);

        if (match) {
            return match[1].trim();
        } else {
            // Gruplama kontrolü (Örn: 1-5 veya 2-4 gibi bir aralıkta mı?)
            // Regex ile tüm aralıkları bul: e.g. "1-5-" veya "1-5."
            const groupRegex = /(?:^|\n)\s*([0-9]+)\s*[-.]\s*([0-9]+)\s*[-.]\s*(.*?)(?=(?:\n\s*[0-9]+\s*[-.]\s*)|$)/gs;
            let groupMatch;
            while ((groupMatch = groupRegex.exec(md)) !== null) {
                const start = parseInt(groupMatch[1], 10);
                const end = parseInt(groupMatch[2], 10);
                if (ayahNo >= start && ayahNo <= end) {
                    return groupMatch[3].trim();
                }
            }
            return null; // Bulunamadı
        }
    } catch(e) {
        return null;
    }
}

console.log('Surah 1, Ayah 1:\n', extractAyahTafsir(1, 1)?.substring(0, 300));
console.log('\nSurah 2, Ayah 25:\n', extractAyahTafsir(2, 25)?.substring(0, 300));
console.log('\nSurah 1, Ayah 7:\n', extractAyahTafsir(1, 7)?.substring(0, 300));
