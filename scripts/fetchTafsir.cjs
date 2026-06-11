const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'data', 'tafsir', 'elmalili');
fs.mkdirSync(dir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Status: ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  for(let i=1; i<=114; i++) {
    const url = `https://raw.githubusercontent.com/kurancilar/json/main/tafseer/elmalili/${i}.md`;
    const dest = path.join(dir, `${i}.md`);
    try {
      await downloadFile(url, dest);
      console.log(`Downloaded ${i}.md`);
    } catch(err) {
      console.error(`Failed ${i}.md`, err.message);
    }
  }
})();
