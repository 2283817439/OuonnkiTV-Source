const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const file = path.join(process.cwd(), 'tv_source', 'LunaTV', 'LunaTV-check-result.json');
  let check = null;
  if (fs.existsSync(file)) {
    try { check = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  }

  const resultFile = path.join(process.cwd(), 'tv_source', 'OuonnkiTV', 'full.json');
  const sourceCount = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')).length : 0;

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({
    status: 'ok',
    sourceCount,
    lastRun: check ? {
      startDate: check.startDate,
      endDate: check.endDate,
      total: check.stats?.total ?? 0,
      available: check.stats?.available ?? 0,
      playSpeedTestEnabled: !!check.playSpeedTestEnabled,
    } : null,
  });
};
