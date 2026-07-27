const { VERSIONS } = require('../lib/versions');
const { setCacheHeaders } = require('../lib/cache-headers');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  setCacheHeaders(res, { maxAgeSeconds: 60 * 60 * 24 * 30 }); // 30 hari
  res.status(200).json({ versions: VERSIONS });
};
