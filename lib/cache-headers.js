/**
 * Set header Cache-Control supaya response di-cache di Edge Network / CDN
 * Vercel. Ini cache utama di project ini — gratis, otomatis aktif di Hobby
 * plan, tanpa perlu setup KV/Redis apapun.
 *
 * s-maxage       : berapa lama CDN boleh serve dari cache tanpa hit function.
 * stale-while-revalidate : selama window ini, CDN tetap serve versi lama
 *                   sambil diam-diam fetch ulang di background.
 *
 * Teks Alkitab praktis tidak pernah berubah, jadi TTL panjang aman dipakai.
 */
function setCacheHeaders(res, { maxAgeSeconds, staleSeconds = 86400 }) {
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleSeconds}`
  );
}

module.exports = { setCacheHeaders };
