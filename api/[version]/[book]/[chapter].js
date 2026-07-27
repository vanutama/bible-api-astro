const { getChapter } = require('../../../lib/scraper');
const { VERSIONS } = require('../../../lib/versions');
const { parseVerseRange } = require('../../../lib/verse-range');
const { setCacheHeaders } = require('../../../lib/cache-headers');

module.exports = async (req, res) => {
  // CORS - biar bisa dipanggil dari frontend manapun
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { version, book, chapter, verse } = req.query;

  if (!VERSIONS.includes(version)) {
    res.status(400).json({
      error: `Versi "${version}" tidak dikenali.`,
      hint: 'Cek GET /api/versions untuk daftar versi yang didukung.',
    });
    return;
  }

  const chapterNumber = parseInt(chapter, 10);
  if (!chapterNumber || chapterNumber < 1) {
    res.status(400).json({ error: `Parameter chapter "${chapter}" tidak valid.` });
    return;
  }

  const verseRange = parseVerseRange(verse);
  if (verseRange === false) {
    res.status(400).json({
      error: `Parameter verse "${verse}" tidak valid.`,
      hint: 'Gunakan angka tunggal (contoh: verse=16) atau rentang (contoh: verse=1-5).',
    });
    return;
  }

  try {
    const data = await getChapter(version, book, chapterNumber, verseRange);

    if (!data.verses.length) {
      res.status(404).json({
        error: 'Tidak ada ayat ditemukan.',
        hint: 'Cek kode buku/pasal/ayat, atau mungkin versi ini tidak punya buku tsb.',
        query: { version, book, chapter: chapterNumber, verse: verse || null },
      });
      return;
    }

    // Cache 7 hari di CDN Vercel - teks pasal ini praktis tidak pernah berubah
    setCacheHeaders(res, { maxAgeSeconds: 60 * 60 * 24 * 7 });
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({
      error: 'Gagal mengambil data dari alkitab.mobi',
      detail: err.message,
    });
  }
};
