const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'tv_source', 'OuonnkiTV');

function readJson(name) {
  const file = path.join(DATA_DIR, name);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const type = String(req.query?.type || 'full').toLowerCase();
  const files = {
    full: 'full.json',
    'full-noadult': 'full-noadult.json',
    adult: 'adult.json',
    lite: 'lite.json',
    raw: 'raw.json',
  };
  const file = files[type];
  if (!file) return res.status(400).json({ error: 'invalid type', allowed: Object.keys(files) });

  const data = readJson(file);
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json(data);
};
