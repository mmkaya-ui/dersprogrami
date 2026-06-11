import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { surah, ayah } = req.query;

  if (!surah || !ayah) {
    return res.status(400).json({ error: 'Missing surah or ayah parameters' });
  }

  try {
    const url = `https://kuran.diyanet.gov.tr/tefsir/suresi/${surah}/${ayah}-ayet-tefsiri`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Diyanet API responded with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract the tefsir text content
    const tefsirHtml = $('.tefsir-text').html();

    if (!tefsirHtml) {
      throw new Error('Tefsir text not found on the page.');
    }

    // Set caching headers so Vercel edge caches this for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    // Return HTML
    res.status(200).json({
      success: true,
      data: tefsirHtml
    });

  } catch (error) {
    console.error('Tafsir fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tafsir' });
  }
}
