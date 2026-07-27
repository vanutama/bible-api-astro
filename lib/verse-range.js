/**
 * Parse parameter query `verse` jadi { from, to }.
 * Format yang didukung:
 *   "16"    -> { from: 16, to: 16 }
 *   "1-5"   -> { from: 1, to: 5 }
 * Return null kalau parameter kosong, dan `false` kalau formatnya invalid.
 */
function parseVerseRange(verseParam) {
  if (!verseParam) return null;

  const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(verseParam);
  if (rangeMatch) {
    const from = parseInt(rangeMatch[1], 10);
    const to = parseInt(rangeMatch[2], 10);
    if (from < 1 || to < 1 || from > to) return false;
    return { from, to };
  }

  const single = /^\d+$/.exec(verseParam);
  if (single) {
    const n = parseInt(verseParam, 10);
    if (n < 1) return false;
    return { from: n, to: n };
  }

  return false;
}

module.exports = { parseVerseRange };
