const axios = require('axios');
const cheerio = require('cheerio');

const SOURCE_BASE = 'http://alkitab.mobi';

// Cache in-memory per instance function. Ini BUKAN cache utama —
// cuma bonus supaya kalau ada beberapa request beruntun kena instance
// (lambda) yang sama, tidak scrape ulang. Tidak persist antar cold start,
// jadi cache "sungguhan" tetap di HTTP layer (lihat Cache-Control di endpoint).
const memoryCache = new Map();
const MEMORY_CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam

function cacheKeyFor(version, book, chapter) {
  return `${version}:${book}:${chapter}`;
}

async function scrapeChapter(version, book, chapter) {
  const url = `${SOURCE_BASE}/${version}/${book}/${chapter}`;
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; bible-api/1.0; +https://vercel.com)',
    },
    timeout: 10000,
  });

  const $ = cheerio.load(data);
  const items = [];
  let lastVerse = 0;

  $('p').each((i, el) => {
    const node = $(el);
    let content = node.find('[data-begin]').first().text();
    const title = node.find('.paragraphtitle').first().text();
    const verseText = node.find('.reftext').children().first().text();

    let verse = verseText ? parseInt(verseText, 10) : 0;
    let type = null;

    if (!title && !content) {
      node.find('.reftext').remove();
      content = node.text();
    }

    if (title) {
      type = 'title';
      content = title;
      verse = lastVerse + 1;
    } else if (content) {
      type = 'content';
      lastVerse = verse;
    }

    if (node.attr('hidden') === 'hidden' || node.hasClass('loading') || node.hasClass('error')) {
      type = null;
    }

    if (type) {
      items.push({
        content: content.trim(),
        type,
        verse,
        book,
        chapter: Number(chapter),
        version,
        order: i,
      });
    }
  });

  return items;
}

/**
 * Ambil satu pasal (dengan cache in-memory ringan), lalu filter berdasarkan
 * verseRange kalau ada.
 */
async function getChapter(version, book, chapter, verseRange) {
  const key = cacheKeyFor(version, book, chapter);
  const cached = memoryCache.get(key);

  let items;
  if (cached && cached.expiresAt > Date.now()) {
    items = cached.items;
  } else {
    items = await scrapeChapter(version, book, chapter);
    memoryCache.set(key, { items, expiresAt: Date.now() + MEMORY_CACHE_TTL_MS });
  }

  let result = items;
  if (verseRange) {
    result = items.filter((item) => item.verse >= verseRange.from && item.verse <= verseRange.to);
  }

  return {
    verses: result,
    book,
    chapter: Number(chapter),
    version,
  };
}

module.exports = { getChapter };
