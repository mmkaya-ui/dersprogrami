import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SURAH_NAMES_TR = ["Fâtiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus", "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ", "Enbiyâ", "Hac", "Mü'minûn", "Nûr", "Furkân", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm", "Lokmân", "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min", "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf", "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine", "Saff", "Cum'a", "Münâfikûn", "Tegâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Meâric", "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Mürselât", "Nebe'", "Nâziât", "Abese", "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Burûc", "Târık", "A'lâ", "Ğâşiye", "Fecr", "Beled", "Şems", "Leyl", "Duhâ", "İnşirah", "Tîn", "Alak", "Kadir", "Beyyine", "Zilzâl", "Âdiyât", "Kâria", "Tekâsür", "Asr", "Hümeze", "Fîl", "Kureyş", "Mâûn", "Kevser", "Kâfirûn", "Nasr", "Tebbet", "İhlâs", "Felak", "Nâs"];

const AYAH_COUNTS = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];

const getGlobalAyahID = (surahNum, ayahNumInSurah) => {
    let count = 0;
    for (let i = 0; i < surahNum - 1; i++) count += AYAH_COUNTS[i];
    return count + ayahNumInSurah;
};

const getSlug = (surahNum) => {
    return SURAH_NAMES_TR[surahNum - 1].toLowerCase()
        .replace(/â/g,'a').replace(/î/g,'i').replace(/û/g,'u').replace(/ö/g,'o').replace(/ü/g,'u')
        .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i')
        .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
};

const OUTPUT_DIR = path.join(__dirname, '../public/data/tafsir/diyanet');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchTafsir(surahNum, ayahNum) {
    const slug = getSlug(surahNum);
    const globalId = getGlobalAyahID(surahNum, ayahNum);
    const url = `https://kuran.diyanet.gov.tr/tefsir/${slug}-suresi/${globalId}/${ayahNum}-ayet-tefsiri`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        const tefsirHtml = $('.tefsir-text').html();
        if (!tefsirHtml) throw new Error('No .tefsir-text found');
        return tefsirHtml;
    } catch (e) {
        console.error(`Error fetching Surah ${surahNum} Ayah ${ayahNum}: ${e.message}`);
        return null;
    }
}

async function run() {
    let totalScraped = 0;
    const CONCURRENCY_LIMIT = 20;

    for (let s = 1; s <= 114; s++) {
        const filePath = path.join(OUTPUT_DIR, `${s}.json`);
        let surahData = {};
        
        if (fs.existsSync(filePath)) {
            try {
                surahData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch(e){}
        }

        const ayahCount = AYAH_COUNTS[s - 1];
        console.log(`Starting Surah ${s} (${ayahCount} ayahs)...`);
        
        const ayahsToFetch = [];
        for (let a = 1; a <= ayahCount; a++) {
            if (!surahData[a]) {
                ayahsToFetch.push(a);
            }
        }

        for (let i = 0; i < ayahsToFetch.length; i += CONCURRENCY_LIMIT) {
            const chunk = ayahsToFetch.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.all(chunk.map(async (a) => {
                let html = null;
                let retries = 3;
                while (retries > 0 && !html) {
                    html = await fetchTafsir(s, a);
                    if (!html) {
                        retries--;
                        await delay(1000);
                    }
                }

                if (html) {
                    surahData[a] = html;
                    totalScraped++;
                } else {
                    console.log(`   FAILED S${s}:A${a} after 3 retries.`);
                    surahData[a] = "<p>Tefsir yüklenemedi.</p>";
                }
            }));

            // Save after every chunk
            fs.writeFileSync(filePath, JSON.stringify(surahData, null, 2));
            
            // Console progress
            console.log(`   Scraped S${s}: ${chunk[chunk.length-1]}/${ayahCount}`);
            
            // Polite delay between batches
            await delay(100);
        }
        
        console.log(`Surah ${s} complete.`);
    }
    console.log("All done!");
}

run();
