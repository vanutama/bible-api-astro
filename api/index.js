module.exports = (req, res) => {
  res.status(200).json({
    name: 'Bible API',
    source: 'alkitab.mobi (SABDA)',
    endpoints: {
      versions: '/api/versions',
      passage: '/api/{version}/{book}/{chapter}?verse={optional}',
      example: '/api/tb/mat/1',
    },
  });
};
