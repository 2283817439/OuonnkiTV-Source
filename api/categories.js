const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const dir = path.join(process.cwd(), 'tv_source', 'OuonnkiTV');
  const read = (name) => {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  };

  const full = read('full.json');
  const normal = read('full-noadult.json');
  const adult = read('adult.json');

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({
    updatedAt: new Date().toISOString(),
    total: full.length,
    normal: normal.length,
    adult: adult.length,
    categories: [
      { id: 'all', name: '全部', count: full.length },
      { id: 'normal', name: '普通', count: normal.length },
      { id: 'adult', name: '成人', count: adult.length },
    ],
  });
};
